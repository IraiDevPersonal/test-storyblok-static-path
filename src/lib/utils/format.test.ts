import { describe, it, expect } from 'vitest'
import { formatPrice } from './format'

describe('formatPrice', () => {
  it('formatea un número como precio en CLP', () => {
    expect(formatPrice(1500)).toBe('$1.500')
  })

  it('maneja el cero', () => {
    expect(formatPrice(0)).toBe('$0')
  })
})