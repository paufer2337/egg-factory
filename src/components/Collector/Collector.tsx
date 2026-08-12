import { SplitFlap } from '../SplitFlap/SplitFlap'

type CollectorProps = {
  value: number
  booting?: boolean
}

export function Collector({ value, booting = false }: CollectorProps) {
  const displayValue = String(value).padStart(3, '0')
  return (
    <section className="readout-panel" aria-labelledby="collector-heading">
      <div className="readout-panel__label" id="collector-heading">PACKED EGGS</div>
      <output aria-label="Packed eggs" data-value={value}>
        <SplitFlap value={displayValue} stagger booting={booting} />
      </output>
    </section>
  )
}
