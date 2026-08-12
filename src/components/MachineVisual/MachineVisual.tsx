import chassis from '../../assets/figma/chassis.png'
import type { CounterState, TransferPhase } from '../../types'
import { Carton } from '../Carton/Carton'
import { FeederLane } from '../FeederLane/FeederLane'

type MachineVisualProps = {
  counters: CounterState[]
  total: number
  phase: TransferPhase
}

export function MachineVisual({ counters, total, phase }: MachineVisualProps) {
  const physicalCounters = counters.slice(0, 4)

  return (
    <section className="machine-section" aria-labelledby="machine-heading">
      <h2 id="machine-heading" className="sr-only">Machine overview</h2>
      <div className="machine-visual" aria-hidden="true">
        <img className="machine-visual__chassis" src={chassis} width="1536" height="1024" alt="" />
        <div className="machine-visual__lanes">
          {Array.from({ length: 4 }, (_, index) => (
            <FeederLane counter={physicalCounters[index]} key={index} />
          ))}
        </div>
        <div className="carton-positioner">
          <Carton occupancy={total} phase={phase} />
        </div>
        {counters.length === 0 && <div className="machine-visual__empty">EMPTY MACHINE RACK</div>}
      </div>
      {counters.length === 0 && <p className="empty-rack-message">Machine rack is empty.</p>}
    </section>
  )
}
