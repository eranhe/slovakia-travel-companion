import { describe, expect, it } from 'vitest'
import { appConfig } from '@/config/env'

describe('environment', () => {
  it('has a normalized base path', () => {
    expect(appConfig.basePath.endsWith('/')).toBe(true)
  })
})
