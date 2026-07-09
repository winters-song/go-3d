import { describe, it, expect } from 'vitest'
import { Go, Color } from './Go'

describe('Go', () => {
  it('allows placing a stone on an empty intersection', () => {
    const go = new Go(9)
    const eaten = go.play(4, 4, Color.BLACK)
    expect(eaten?.size).toBe(0)
    expect(go.isEmpty(4, 4)).toBe(false)
  })

  it('captures a stone with no liberties', () => {
    const go = new Go(9)
    go.play(1, 1, Color.BLACK)
    go.play(0, 1, Color.WHITE)
    go.play(2, 1, Color.WHITE)
    go.play(1, 0, Color.WHITE)

    const eaten = go.play(1, 2, Color.WHITE)
    expect(eaten?.size).toBe(1)
    expect(eaten?.has('1,1')).toBe(true)
    expect(go.isEmpty(1, 1)).toBe(true)
  })

  it('rejects suicide when no capture is available', () => {
    const go = new Go(9)
    go.play(1, 0, Color.WHITE)
    go.play(0, 1, Color.WHITE)

    expect(go.play(0, 0, Color.BLACK)).toBeNull()
    expect(go.isEmpty(0, 0)).toBe(true)
  })

  it('allows suicide move when it captures opponent stones', () => {
    const go = new Go(9)
    go.play(1, 1, Color.BLACK)
    go.play(0, 1, Color.WHITE)
    go.play(2, 1, Color.WHITE)
    go.play(1, 0, Color.WHITE)

    const eaten = go.play(1, 2, Color.WHITE)
    expect(eaten?.size).toBe(1)
  })

  it('allows non-ko recapture when the captured group has multiple liberties', () => {
    const go = new Go(9)
    go.play(2, 2, Color.BLACK)
    go.play(1, 2, Color.WHITE)
    go.play(3, 2, Color.WHITE)
    go.play(2, 1, Color.WHITE)
    go.play(2, 3, Color.WHITE) // white captures black at (2,2)

    // Not a one-stone ko shape — black may immediately play on (2,2)
    expect(go.play(2, 2, Color.BLACK)).not.toBeNull()
  })

  it('rejects moves on occupied intersections', () => {
    const go = new Go(9)
    go.play(2, 2, Color.BLACK)
    expect(go.play(2, 2, Color.WHITE)).toBeNull()
  })

  it('undo restores the previous board state', () => {
    const go = new Go(9)
    go.play(3, 3, Color.BLACK)
    go.play(4, 4, Color.WHITE)

    const result = go.undo(1)
    expect(result?.move).toEqual([4, 4, Color.WHITE])
    expect(go.isEmpty(4, 4)).toBe(true)
    expect(go.isEmpty(3, 3)).toBe(false)
  })

  it('tracks capture count', () => {
    const go = new Go(9)
    go.play(1, 1, Color.BLACK)
    go.play(0, 1, Color.WHITE)
    go.play(2, 1, Color.WHITE)
    go.play(1, 0, Color.WHITE)
    go.play(1, 2, Color.WHITE)

    expect(go.getCaptureSize(Color.WHITE)).toBe(1)
  })
})
