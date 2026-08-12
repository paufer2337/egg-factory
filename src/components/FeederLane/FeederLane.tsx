import eggAsset from '../../assets/figma/egg.svg'
import type { CounterState } from '../../types'

type FeederLaneProps = {
  counter?: CounterState
}

export function FeederLane({ counter }: FeederLaneProps) {
  const value = counter?.value ?? 0

  return (
    <div className={`feeder-lane ${value === 3 ? 'feeder-lane--full' : ''}`}>
      <div className="feeder-lane__eggs">
        {Array.from({ length: value }, (_, index) => (
          <img src={eggAsset} width="34" height="52" alt="" key={index} />
        ))}
      </div>
      <span className="feeder-lane__gate" />
    </div>
  )
}
