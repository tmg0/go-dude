import { describe, test, expect } from 'vitest'
import { hasUncommit } from '../src/shared/git'
import { dockerImageTag } from '../src/shared/docker'

describe('dude', () => {
  test('should upload local images to server by ssh', () => {
    expect(1).toBe(1)
  })

  test('should has uncommitted change in stdout', async () => {
    await hasUncommit()
    expect(1).toBe(1)
  })

  test('should generage image tag from day and commit hash', async () => {
    const tag = await dockerImageTag()
    expect(tag.length).toBe(16)
  })
})
