import { describe, test, expect } from 'vitest'
import { getDockerfilePath } from '../src/utils'

describe('dude', () => {
  test('should get docker file path', async () => {
    expect(await getDockerfilePath()).toBe('.')
  })
})
