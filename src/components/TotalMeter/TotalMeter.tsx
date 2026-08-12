import { SplitFlap } from '../SplitFlap/SplitFlap'

type TotalMeterProps = {
  total: number
  capacity: number
  booting?: boolean
}

export function TotalMeter({ total, capacity, booting = false }: TotalMeterProps) {
  const displayValue = String(total).padStart(2, '0')
  return (
    <section className="readout-panel readout-panel--total" aria-labelledby="total-heading">
      <div className="readout-panel__label" id="total-heading">CURRENT LOAD</div>
      <div className="total-meter__line">
        <output aria-label="Current load" data-value={total}>
          <SplitFlap value={displayValue} stagger booting={booting} />
        </output>
        <span className="total-meter__limit" aria-hidden="true">/10</span>
        <span className="sr-only">{total}/10</span>
      </div>
      <div className="total-meter__segments" aria-hidden="true">
        {Array.from({ length: 10 }, (_, index) => (
          <span
            className={`${index < total ? 'is-active' : ''} ${index >= capacity ? 'is-dead-zone' : ''}`}
            key={index}
          />
        ))}
      </div>
    </section>
  )
}
