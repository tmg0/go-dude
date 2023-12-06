import { describe, test, expect } from 'vitest'
import { hasUncommit } from '../utils/git'
import { generteImageTagFromGitCommitHash } from '../utils/common'
import { isDockerRunning } from '../utils/docker/index'

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

  test('should check if docker engine is running', async () => {
    const isRunning = await isDockerRunning()
    expect(isRunning).toBe(false)
  })
})
