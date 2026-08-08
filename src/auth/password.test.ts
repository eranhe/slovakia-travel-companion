import { describe, expect, it } from 'vitest'
import { verifyPassword } from '@/auth/password'

describe('simple password check', () => {
  it('accepts the configured password', () => {
    expect(verifyPassword('hersko')).toBe(true)
  })

  it('rejects other values', () => {
    expect(verifyPassword('wrong')).toBe(false)
    expect(verifyPassword('')).toBe(false)
  })
})
