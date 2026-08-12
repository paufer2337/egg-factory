import { SplitFlap } from '../SplitFlap/SplitFlap'

type StatusWordProps = {
  full: boolean
  booting?: boolean
}

export function StatusWord({ full, booting = false }: StatusWordProps) {
  const word = full ? 'FULL' : 'LOAD'
  return (
    <span className={`status-word ${full ? 'status-word--full' : ''}`}>
      <SplitFlap value={word} stagger booting={booting} />
    </span>
  )
}
