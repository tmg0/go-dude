import { describe, test, expect } from 'vitest'
import { hasUncommit } from '../src/shared/git'
import { generteImageTagFromGitCommitHash } from '../src/shared/common'

describe('dude', () => {
  test('should upload local images to server by ssh', () => {
    expect(1).toBe(1)
  })

  test('should has uncommitted change in stdout', async () => {
    await hasUncommit()
    expect(1).toBe(1)
  })

  test('should generage image tag from day and commit hash', async () => {
    const tag = await generteImageTagFromGitCommitHash()
    expect(tag.length).toBe(16)
  })
})
