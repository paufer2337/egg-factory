import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import App, { THRESHOLD_HOLD_MS, TRANSFER_PHASE_MS } from './App'

function counterCard(label: string) {
  return screen.getByRole('group', { name: label })
}

function load(label: string, times = 1) {
  const id = label.split(' ')[1]
  const button = within(counterCard(label)).getByRole('button', { name: `Load egg into feeder ${id}` })
  for (let index = 0; index < times; index += 1) {
    fireEvent.click(button)
  }
}

function counterValue(label: string) {
  return within(counterCard(label)).getByLabelText(`${label}, egg count`)
}

describe('Egg Factory', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('starts with four counters at zero', () => {
    render(<App />)

    expect(screen.getAllByRole('group', { name: /FEEDER \d+/ })).toHaveLength(4)
    for (let id = 1; id <= 4; id += 1) {
      expect(counterValue(`FEEDER ${id}`)).toHaveAttribute('data-value', '0')
      expect(within(counterCard(`FEEDER ${id}`)).getByRole('button', { name: `Load egg into feeder ${id}` })).toBeEnabled()
    }
  })

  it('increments only the selected counter', () => {
    render(<App />)
    load('FEEDER 2')

    expect(counterValue('FEEDER 1')).toHaveAttribute('data-value', '0')
    expect(counterValue('FEEDER 2')).toHaveAttribute('data-value', '1')
  })

  it('stops a counter at three, shows FULL, and disables LOAD EGG', () => {
    render(<App />)
    load('FEEDER 1', 3)

    const card = counterCard('FEEDER 1')
    expect(counterValue('FEEDER 1')).toHaveAttribute('data-value', '3')
    expect(within(card).getByText('FULL')).toBeInTheDocument()
    expect(within(card).getByRole('button', { name: 'Load egg into feeder 1' })).toBeDisabled()
    fireEvent.click(within(card).getByRole('button', { name: 'Load egg into feeder 1' }))
    expect(counterValue('FEEDER 1')).toHaveAttribute('data-value', '3')
  })

  it('derives and recalculates the shared total', () => {
    render(<App />)
    load('FEEDER 1', 2)
    load('FEEDER 3')
    expect(screen.getByLabelText('Current load')).toHaveAttribute('data-value', '3')

    fireEvent.click(within(counterCard('FEEDER 1')).getByRole('button', { name: 'Remove feeder 1' }))
    expect(screen.getByLabelText('Current load')).toHaveAttribute('data-value', '1')
  })

  it('preserves stable IDs through removal and assigns a new unused ID', () => {
    render(<App />)
    fireEvent.click(within(counterCard('FEEDER 2')).getByRole('button', { name: 'Remove feeder 2' }))

    expect(screen.queryByRole('group', { name: 'FEEDER 2' })).not.toBeInTheDocument()
    expect(counterCard('FEEDER 3')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Add feeder' }))
    expect(counterValue('FEEDER 5')).toHaveAttribute('data-value', '0')
    expect(within(counterCard('FEEDER 5')).getByRole('button', { name: 'Load egg into feeder 5' })).toBeEnabled()
  })

  it('keeps additional counters out of the four physical machine lanes', () => {
    const { container } = render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Add feeder' }))
    load('FEEDER 5', 3)

    expect(container.querySelectorAll('.feeder-lane')).toHaveLength(4)
    expect(container.querySelectorAll('.feeder-lane__eggs img')).toHaveLength(0)
  })

  it('MASTER RESET preserves the roster and resets counters, disabled state, and collector', () => {
    vi.useFakeTimers()
    render(<App />)
    load('FEEDER 1', 3)
    load('FEEDER 2', 3)
    load('FEEDER 3', 3)
    load('FEEDER 4')
    expect(screen.getByLabelText('Current load')).toHaveAttribute('data-value', '10')

    fireEvent.click(screen.getByRole('button', { name: 'Master reset' }))
    act(() => vi.runAllTimers())

    expect(screen.getAllByRole('group', { name: /FEEDER \d+/ })).toHaveLength(4)
    for (let id = 1; id <= 4; id += 1) {
      expect(counterValue(`FEEDER ${id}`)).toHaveAttribute('data-value', '0')
      expect(within(counterCard(`FEEDER ${id}`)).getByRole('button', { name: `Load egg into feeder ${id}` })).toBeEnabled()
    }
    expect(screen.getByLabelText('Packed eggs')).toHaveAttribute('data-value', '0')
  })

  it('shows the exact below-capacity explanation for three counters', () => {
    render(<App />)
    fireEvent.click(within(counterCard('FEEDER 4')).getByRole('button', { name: 'Remove feeder 4' }))
    expect(screen.getByText('Capacity is 9. Add a feeder to reach 10.')).toBeInTheDocument()
  })

  it('keeps the shell, total, collector, and add action in the empty state', () => {
    render(<App />)
    for (let id = 1; id <= 4; id += 1) {
      fireEvent.click(within(counterCard(`FEEDER ${id}`)).getByRole('button', { name: `Remove feeder ${id}` }))
    }

    expect(screen.getByText('Machine rack is empty.')).toBeInTheDocument()
    expect(screen.getByLabelText('Current load')).toBeInTheDocument()
    expect(screen.getByLabelText('Packed eggs')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Add feeder' })).toBeInTheDocument()
  })

  it('holds 10/10 before the timed transfer, then packs ten and resets counters', async () => {
    vi.useFakeTimers()
    render(<App />)
    load('FEEDER 1', 3)
    load('FEEDER 2', 3)
    load('FEEDER 3', 3)
    load('FEEDER 4')

    expect(screen.getByLabelText('Current load')).toHaveAttribute('data-value', '10')
    expect(screen.getByText('10/10')).toBeInTheDocument()
    expect(within(counterCard('FEEDER 4')).getByRole('button', { name: 'Load egg into feeder 4' })).toBeDisabled()

    await act(async () => { await vi.advanceTimersByTimeAsync(THRESHOLD_HOLD_MS) })
    for (let phase = 0; phase < 4; phase += 1) {
      await act(async () => { await vi.advanceTimersByTimeAsync(TRANSFER_PHASE_MS) })
    }

    expect(screen.getByLabelText('Packed eggs')).toHaveAttribute('data-value', '10')
    expect(screen.getByLabelText('Current load')).toHaveAttribute('data-value', '0')
    for (let id = 1; id <= 4; id += 1) {
      expect(counterValue(`FEEDER ${id}`)).toHaveAttribute('data-value', '0')
      expect(within(counterCard(`FEEDER ${id}`)).getByRole('button', { name: `Load egg into feeder ${id}` })).toBeEnabled()
    }
  })
})
