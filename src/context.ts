import { version } from '../package.json'
import { resolveConfig } from './config'
import { DudeOptions } from './types'

export interface DudeContext {
  version: string
  options: DudeOptions
}

export const ctx: DudeContext = { version, options: {} }

export const useContext = () => ctx

export const setupContext = async () => {
  const options = await resolveConfig()
  ctx.options = options
  return ctx
}
