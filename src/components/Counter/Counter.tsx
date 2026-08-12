import type { CounterState } from '../../types'
import { SplitFlap } from '../SplitFlap/SplitFlap'
import { StatusWord } from '../StatusWord/StatusWord'

type CounterProps = CounterState & {
  displayNumber: number
  transferLocked: boolean
  booting?: boolean
  onLoad: (id: number) => void
  onRemove: (id: number) => void
}

export function Counter({ id, displayNumber, value, disabled, transferLocked, booting = false, onLoad, onRemove }: CounterProps) {
  const full = value >= 3
  const label = `FEEDER ${displayNumber}`
  const labelId = `feeder-${displayNumber}-label`

  return (
    <article className={`counter-card ${full ? 'counter-card--full' : ''}`} role="group" aria-labelledby={labelId}>
      <header className="counter-card__header">
        <h3 id={labelId}>{label}</h3>
        <span className="counter-card__capacity" aria-label={`${value} of 3 slots filled`}>
          {[0, 1, 2].map((slot) => <span className={slot < value ? 'is-filled' : ''} key={slot} aria-hidden="true" />)}
        </span>
      </header>
      <div className="counter-card__display">
        <output aria-label={`${label}, egg count`} data-value={value}>
          <SplitFlap value={String(value)} booting={booting} />
        </output>
        <StatusWord full={full} booting={booting} />
      </div>
      <button
        className="button button--primary"
        type="button"
        onClick={() => onLoad(id)}
        disabled={disabled || transferLocked}
        aria-label={`Load egg into feeder ${displayNumber}`}
      >
        LOAD EGG
      </button>
      <button
        className="button button--quiet"
        type="button"
        onClick={() => onRemove(id)}
        disabled={transferLocked}
        aria-label={`Remove feeder ${displayNumber}`}
      >
        REMOVE FEEDER
      </button>
    </article>
  )
}
