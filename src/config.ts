import fse from 'fs-extra'
import { DEFAULT_DUDE_OPTIONS } from './constants'
import { DudeOptions } from './types'
import { isNode } from './utils'

export const defineConfig = <T extends DudeOptions>(options: T) => options

export const resolveConfig = async (path = process.cwd()) => {
  const { config } = await loadConfig<DudeOptions>({ name: CONFIG_FILENAME, cwd: path, defaults: DEFAULT_DUDE_OPTIONS })
  if (!config) { throw new Error('Can not find dude config file.') }

  let name
  if (config.name) { name = config.name }
  if (await isNode()) {
    const _p = join(path, 'package.json')
    const _n = (await fse.readJson(_p))?.name
    if (_n) { name = _n }
  }
  if (!name) {
    throw new Error('Please declare the name in dude config file or package.json.')
  }

  return { name, ...config }
}
