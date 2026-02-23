import { describe, it, expect } from 'vitest'
import { increment, decrement } from './counter'

describe('counter logic', () => {
  it('incrementa en 1', () => {
    expect(increment(0)).toBe(1)
    expect(increment(5)).toBe(6)
  })

  it('decrementa en 1', () => {
    expect(decrement(5)).toBe(4)
  })
})