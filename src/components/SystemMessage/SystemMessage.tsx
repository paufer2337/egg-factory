import type { TransferPhase } from '../../types'

const messages: Record<TransferPhase, string> = {
  idle: 'System ready.',
  threshold: '10 of 10. Transfer starting.',
  closing: 'Carton closing.',
  exiting: 'Full carton exiting.',
  inserting: 'New carton entering.',
  resetting: 'Feeders resetting.',
}

export function SystemMessage({ phase }: { phase: TransferPhase }) {
  return (
    <div className={`system-message system-message--${phase}`}>
      <span className="system-message__lamp" aria-hidden="true" />
      <span aria-live="polite" aria-atomic="true">{messages[phase]}</span>
    </div>
  )
}
