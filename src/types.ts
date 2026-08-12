export type CounterState = {
  id: number
  label: string
  value: number
  disabled: boolean
}

export type TransferPhase =
  | 'threshold'
  | 'closing'
  | 'exiting'
  | 'inserting'
  | 'resetting'
  | 'idle'
