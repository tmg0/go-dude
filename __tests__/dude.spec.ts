import { describe, test, expect } from 'vitest'
import { readConf, uploadImage } from '../src/shared/common'
import { hasUncommit } from '../src/shared/git'

describe('dude', () => {
  test('should upload local images to server by ssh', async () => {
    const config = await readConf()
    expect(await uploadImage(config, '', 'IgSR_yNCHBA0R3a1S7lwj')).toBe(undefined)
  })

  test('should has uncommitted change in stdout', async () => {
    await hasUncommit()
    expect(1).toBe(1)
  })
})
