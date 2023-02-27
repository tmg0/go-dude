import { describe, test, expect } from 'vitest'
import { readConf, uploadImage } from '../src/utils'

describe('dude', () => {
  test('should upload local images to server by ssh', async () => {
    const config = await readConf()
    expect(await uploadImage(config, '', 'IgSR_yNCHBA0R3a1S7lwj')).toBe(undefined)
  })
})
