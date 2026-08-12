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
  return (
    <section className="machine-section" aria-labelledby="machine-heading">
      <div className="section-kicker">MACHINE OVERVIEW</div>
      <h2 id="machine-heading" className="sr-only">Machine overview</h2>
      <div className="machine-visual" aria-hidden="true">
        <img className="machine-visual__chassis" src={chassis} width="1536" height="1024" alt="" />
        <div className="machine-visual__lanes" style={{ gridTemplateColumns: `repeat(${Math.max(counters.length, 1)}, 1fr)` }}>
          {counters.map((counter) => <FeederLane counter={counter} key={counter.id} />)}
        </div>
        <Carton occupancy={total} phase={phase} />
        {counters.length === 0 && <div className="machine-visual__empty">EMPTY MACHINE RACK</div>}
      </div>
      {counters.length === 0 && <p className="empty-rack-message">Machine rack is empty.</p>}
    </section>
  )
}
