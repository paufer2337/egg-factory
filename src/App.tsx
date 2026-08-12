import { useCallback, useEffect, useRef, useState } from 'react'
import { Collector } from './components/Collector/Collector'
import { Counter } from './components/Counter/Counter'
import { MachineVisual } from './components/MachineVisual/MachineVisual'
import { SystemMessage } from './components/SystemMessage/SystemMessage'
import { TotalMeter } from './components/TotalMeter/TotalMeter'
import type { CounterState, TransferPhase } from './types'
import './App.css'

export const THRESHOLD_HOLD_MS = 300
export const TRANSFER_PHASE_MS = 220
export const BOOT_DURATION_MS = 360

const initialCounters: CounterState[] = [
  { id: 1, label: 'FEEDER 1', value: 0, disabled: false },
  { id: 2, label: 'FEEDER 2', value: 0, disabled: false },
  { id: 3, label: 'FEEDER 3', value: 0, disabled: false },
  { id: 4, label: 'FEEDER 4', value: 0, disabled: false },
]

function App() {
  const [counters, setCounters] = useState<CounterState[]>(initialCounters)
  const [collector, setCollector] = useState(0)
  const [phase, setPhase] = useState<TransferPhase>('idle')
  const [booting, setBooting] = useState(true)
  const nextCounterId = useRef(5)
  const timers = useRef(new Set<number>())

  const clearTimers = useCallback(() => {
    timers.current.forEach((timer) => window.clearTimeout(timer))
    timers.current.clear()
  }, [])

  const schedule = useCallback((action: () => void, delay: number) => {
    const timer = window.setTimeout(() => {
      timers.current.delete(timer)
      action()
    }, delay)
    timers.current.add(timer)
    return timer
  }, [])

  useEffect(() => {
    const activeTimers = timers.current
    const timer = schedule(() => setBooting(false), BOOT_DURATION_MS)
    return () => {
      window.clearTimeout(timer)
      activeTimers.delete(timer)
    }
  }, [schedule])

  useEffect(() => () => clearTimers(), [clearTimers])

  useEffect(() => {
    if (phase === 'idle') return
    const activeTimers = timers.current

    const next = () => {
      if (phase === 'threshold') setPhase('closing')
      if (phase === 'closing') setPhase('exiting')
      if (phase === 'exiting') setPhase('inserting')
      if (phase === 'inserting') {
        setCollector((value) => value + 10)
        setCounters((current) => current.map((counter) => ({ ...counter, value: 0, disabled: false })))
        setPhase('resetting')
      }
      if (phase === 'resetting') setPhase('idle')
    }

    const timer = schedule(next, phase === 'threshold' ? THRESHOLD_HOLD_MS : TRANSFER_PHASE_MS)
    return () => {
      window.clearTimeout(timer)
      activeTimers.delete(timer)
    }
  }, [phase, schedule])

  const total = counters.reduce((sum, counter) => sum + counter.value, 0)
  const capacity = counters.length * 3
  const controlsDisabled = phase !== 'idle'

  const handleLoad = (id: number) => {
    if (controlsDisabled) return
    const selected = counters.find((counter) => counter.id === id)
    if (!selected || selected.disabled) return

    const updated = counters.map((counter) => (
      counter.id === id
        ? { ...counter, value: counter.value + 1, disabled: counter.value + 1 === 3 }
        : counter
    ))
    setCounters(updated)
    if (updated.reduce((sum, counter) => sum + counter.value, 0) === 10) {
      setPhase('threshold')
    }
  }

  const handleRemove = (id: number) => {
    if (controlsDisabled) return
    setCounters((current) => current.filter((counter) => counter.id !== id))
  }

  const handleAdd = () => {
    if (controlsDisabled) return
    const id = nextCounterId.current
    nextCounterId.current += 1
    setCounters((current) => [...current, { id, label: `FEEDER ${id}`, value: 0, disabled: false }])
  }

  const handleReset = () => {
    clearTimers()
    setCounters((current) => current.map((counter) => ({ ...counter, value: 0, disabled: false })))
    setCollector(0)
    setBooting(false)
    setPhase('idle')
  }

  const capacityMessage = capacity < 10
    ? capacity === 9
      ? 'Capacity is 9. Add a feeder to reach 10.'
      : `Capacity is ${capacity}. Add ${Math.ceil((10 - capacity) / 3)} feeders to reach 10.`
    : null

  return (
    <main className={`app-shell phase-${phase} ${booting ? 'is-booting' : ''}`} aria-label="Egg Factory">
      <header className="app-header">
        <div className="app-header__identity">
          <span className="brand-mark" aria-hidden="true"><span /></span>
          <div>
            <div className="eyebrow">AUTOMATED EGG HANDLING / LINE 01</div>
            <h1>EGG FACTORY</h1>
          </div>
        </div>
        <SystemMessage phase={phase} />
      </header>

      <MachineVisual counters={counters} total={total} phase={phase} />

      <section className="control-console" aria-labelledby="dashboard-heading">
        <div className="control-console__bevel" aria-hidden="true" />
        <header className="control-console__header">
          <div>
            <div className="section-kicker">CONTROL SYSTEM</div>
            <h2 id="dashboard-heading">OPERATOR PANEL</h2>
          </div>
          <div className="console-state"><span aria-hidden="true" /> {phase === 'idle' ? 'SYSTEM READY' : 'TRANSFER IN PROGRESS'}</div>
        </header>

        <div className="readout-grid">
          <TotalMeter total={total} capacity={capacity} booting={booting} />
          <Collector value={collector} booting={booting} />
        </div>

        {capacityMessage && <p className="capacity-message" role="status">{capacityMessage}</p>}

        {counters.length > 0 ? (
          <div className="counter-grid">
            {counters.map((counter) => (
              <Counter
                {...counter}
                transferLocked={controlsDisabled}
                booting={booting}
                onLoad={handleLoad}
                onRemove={handleRemove}
                key={counter.id}
              />
            ))}
          </div>
        ) : (
          <div className="empty-control-state">
            <div>
              <strong>NO FEEDERS CONNECTED</strong>
              <span>Add a feeder to begin loading.</span>
            </div>
            <button className="button button--primary button--add" type="button" onClick={handleAdd} disabled={controlsDisabled} aria-label="Add feeder">
              + ADD FEEDER
            </button>
          </div>
        )}

        <footer className="utility-controls">
          {counters.length > 0 && (
            <button className="button button--primary button--add" type="button" onClick={handleAdd} disabled={controlsDisabled} aria-label="Add feeder">
              + ADD FEEDER
            </button>
          )}
          <button className="button button--danger" type="button" onClick={handleReset} aria-label="Master reset">
            MASTER RESET
          </button>
        </footer>
      </section>

      <footer className="app-footer">
        <span>EGG FACTORY / OPERATOR PANEL</span>
        <span>MAXIMUM LOAD: 10 EGGS PER CYCLE</span>
      </footer>
    </main>
  )
}

export default App
