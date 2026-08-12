import type { CounterState } from './types'

export const createCounter = (id: number): CounterState => ({ id, value: 0, disabled: false })

export const initialCounters: CounterState[] = [
  createCounter(1),
  createCounter(2),
  createCounter(3),
  createCounter(4),
]
