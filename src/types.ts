export type CounterState = {
  id: number
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
