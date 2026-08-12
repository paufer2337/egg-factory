import chassis from '../../assets/figma/chassis.png'
import chassisAvif768 from '../../assets/figma/chassis-768.avif'
import chassisAvif1536 from '../../assets/figma/chassis-1536.avif'
import chassisWebp768 from '../../assets/figma/chassis-768.webp'
import chassisWebp1536 from '../../assets/figma/chassis-1536.webp'
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
        <picture className="machine-visual__picture">
          <source
            type="image/avif"
            srcSet={`${chassisAvif768} 768w, ${chassisAvif1536} 1536w`}
            sizes="(max-width: 900px) 100vw, min(calc(100vw - 1rem), 1200px, calc((100vh - 4rem) * 1.5))"
          />
          <source
            type="image/webp"
            srcSet={`${chassisWebp768} 768w, ${chassisWebp1536} 1536w`}
            sizes="(max-width: 900px) 100vw, min(calc(100vw - 1rem), 1200px, calc((100vh - 4rem) * 1.5))"
          />
          <img
            className="machine-visual__chassis"
            src={chassis}
            width="1536"
            height="1024"
            fetchPriority="high"
            loading="eager"
            alt=""
          />
        </picture>
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
