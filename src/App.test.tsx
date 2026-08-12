import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import App, { THRESHOLD_HOLD_MS, TRANSFER_PHASE_MS } from './App'
import { Counter } from './components/Counter/Counter'
import { createCounter, initialCounters } from './counters'

function counterCard(label: string) {
  return screen.getByRole('article', { name: label })
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

function physicalLaneValues(container: HTMLElement) {
  return [...container.querySelectorAll('.feeder-lane')].map((lane) => lane.querySelectorAll('.feeder-lane__eggs img').length)
}

describe('Egg Factory', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('starts with four counters at zero', () => {
    render(<App />)

    expect(screen.getAllByRole('article', { name: /FEEDER \d+/ })).toHaveLength(4)
    expect(counterCard('FEEDER 1')).not.toHaveAttribute('role')
    expect(counterCard('FEEDER 1').querySelector('.counter-card__capacity')).toHaveAttribute('aria-hidden', 'true')
    expect(counterCard('FEEDER 1').querySelector('.counter-card__capacity')).not.toHaveAttribute('aria-label')
    for (let id = 1; id <= 4; id += 1) {
      expect(counterValue(`FEEDER ${id}`)).toHaveAttribute('data-value', '0')
      expect(within(counterCard(`FEEDER ${id}`)).getByRole('button', { name: `Load egg into feeder ${id}` })).toBeEnabled()
    }
  })

  it('renders verified credits as secure external links', () => {
    render(<App />)

    expect(screen.getByText('AUTOMATED EGG COUNTER')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'CREDITS' })).toBeInTheDocument()

    const nouriLink = screen.getByRole('link', { name: 'Nouri Atchabao' })
    expect(nouriLink).toHaveAttribute('href', 'https://www.vecteezy.com/vector-art/96804-free-countdown-timer-vector')
    expect(nouriLink).toHaveAttribute('target', '_blank')
    expect(nouriLink).toHaveAttribute('rel', 'noopener noreferrer')

    const laszloLink = screen.getByRole('link', { name: 'László Prekop' })
    expect(laszloLink).toHaveAttribute('href', 'https://github.com/laszloprekop')
    expect(laszloLink).toHaveAttribute('target', '_blank')
    expect(laszloLink).toHaveAttribute('rel', 'noopener noreferrer')
    expect(laszloLink.closest('strong')).toBeInTheDocument()
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

  it('displays six counters with contiguous feeder numbers', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Add feeder' }))
    fireEvent.click(screen.getByRole('button', { name: 'Add feeder' }))

    expect(screen.getAllByRole('article', { name: /FEEDER \d+/ })).toHaveLength(6)
    for (let displayNumber = 1; displayNumber <= 6; displayNumber += 1) {
      expect(counterCard(`FEEDER ${displayNumber}`)).toBeInTheDocument()
    }
  })

  it('renumbers visible feeders while preserving values and disabled state', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Add feeder' }))
    fireEvent.click(screen.getByRole('button', { name: 'Add feeder' }))
    load('FEEDER 3', 3)

    fireEvent.click(within(counterCard('FEEDER 1')).getByRole('button', { name: 'Remove feeder 1' }))
    fireEvent.click(within(counterCard('FEEDER 1')).getByRole('button', { name: 'Remove feeder 1' }))

    expect(screen.getAllByRole('article', { name: /FEEDER \d+/ })).toHaveLength(4)
    for (let displayNumber = 1; displayNumber <= 4; displayNumber += 1) {
      expect(counterCard(`FEEDER ${displayNumber}`)).toBeInTheDocument()
    }
    expect(counterValue('FEEDER 1')).toHaveAttribute('data-value', '3')
    expect(within(counterCard('FEEDER 1')).getByText('FULL')).toBeInTheDocument()
    expect(within(counterCard('FEEDER 1')).getByRole('button', { name: 'Load egg into feeder 1' })).toBeDisabled()

    fireEvent.click(screen.getByRole('button', { name: 'Add feeder' }))
    expect(counterCard('FEEDER 5')).toBeInTheDocument()
  })

  it('keeps stable internal IDs separate from visible numbering and callbacks', () => {
    const onLoad = vi.fn()
    const onRemove = vi.fn()
    const survivors = initialCounters.filter((counter) => counter.id > 2)
    const roster = [...survivors, createCounter(5), createCounter(6)]

    expect(roster.map((counter) => counter.id)).toEqual([3, 4, 5, 6])
    expect(new Set(roster.map((counter) => counter.id)).size).toBe(roster.length)

    render(
      <Counter
        {...createCounter(13)}
        displayNumber={1}
        transferLocked={false}
        onLoad={onLoad}
        onRemove={onRemove}
      />,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Load egg into feeder 1' }))
    fireEvent.click(screen.getByRole('button', { name: 'Remove feeder 1' }))

    expect(onLoad).toHaveBeenCalledWith(13)
    expect(onRemove).toHaveBeenCalledWith(13)
    expect(screen.queryByText(/13/)).not.toBeInTheDocument()
  })

  it('keeps counters after the first four out of photographic lanes', () => {
    const { container } = render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Add feeder' }))
    load('FEEDER 5', 3)

    expect(physicalLaneValues(container)).toEqual([0, 0, 0, 0])
  })

  it('projects the first four current counters into physical slots regardless of internal IDs', () => {
    const { container } = render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Add feeder' }))
    fireEvent.click(screen.getByRole('button', { name: 'Add feeder' }))
    load('FEEDER 5', 2)

    fireEvent.click(within(counterCard('FEEDER 1')).getByRole('button', { name: 'Remove feeder 1' }))
    fireEvent.click(within(counterCard('FEEDER 1')).getByRole('button', { name: 'Remove feeder 1' }))

    expect(physicalLaneValues(container)).toEqual([0, 0, 2, 0])
  })

  it('shifts later occupancy into earlier physical slots after removal', () => {
    const { container } = render(<App />)
    load('FEEDER 2')
    load('FEEDER 3', 2)
    expect(physicalLaneValues(container)).toEqual([0, 1, 2, 0])

    fireEvent.click(within(counterCard('FEEDER 1')).getByRole('button', { name: 'Remove feeder 1' }))

    expect(physicalLaneValues(container)).toEqual([1, 2, 0, 0])
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

    expect(screen.getAllByRole('article', { name: /FEEDER \d+/ })).toHaveLength(4)
    for (let id = 1; id <= 4; id += 1) {
      expect(counterValue(`FEEDER ${id}`)).toHaveAttribute('data-value', '0')
      expect(within(counterCard(`FEEDER ${id}`)).getByRole('button', { name: `Load egg into feeder ${id}` })).toBeEnabled()
    }
    expect(screen.getByLabelText('Packed eggs')).toHaveAttribute('data-value', '0')
  })

  it('explains maximum capacity for three, two, and one remaining feeder', () => {
    render(<App />)
    fireEvent.click(within(counterCard('FEEDER 4')).getByRole('button', { name: 'Remove feeder 4' }))
    expect(screen.getByText('Maximum with 3 feeders: 9 eggs. Add 1 feeder to enable a 10-egg carton transfer.')).toBeInTheDocument()

    fireEvent.click(within(counterCard('FEEDER 3')).getByRole('button', { name: 'Remove feeder 3' }))
    expect(screen.getByText('Maximum with 2 feeders: 6 eggs. Add 2 feeders to enable a 10-egg carton transfer.')).toBeInTheDocument()

    fireEvent.click(within(counterCard('FEEDER 2')).getByRole('button', { name: 'Remove feeder 2' }))
    expect(screen.getByText('Maximum with 1 feeder: 3 eggs. Add 3 feeders to enable a 10-egg carton transfer.')).toBeInTheDocument()
  })

  it('keeps the shell, total, collector, and add action in the empty state', () => {
    render(<App />)
    for (let remaining = 4; remaining > 0; remaining -= 1) {
      fireEvent.click(within(counterCard('FEEDER 1')).getByRole('button', { name: 'Remove feeder 1' }))
    }

    expect(screen.getByText('Machine rack is empty.')).toBeInTheDocument()
    expect(screen.queryByText(/Maximum with/)).not.toBeInTheDocument()
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
