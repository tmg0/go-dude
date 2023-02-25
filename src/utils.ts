import path from 'path'
import consola from 'consola'
import fse, { readJSONSync } from 'fs-extra'
import { CONFIG_FILEPATH } from './consts'

export const existConfigSync = () => fse.existsSync(CONFIG_FILEPATH)

export const getProjectName = (config: DudeConfig) => config.name || readJSONSync(path.join(process.cwd(), 'package.json')).name

export const getDockerComposeFilePath = (config: DudeConfig) => path.dirname(config.dockerCompose.file)

export const parseConf = (): Promise<DudeConfig> => {
  return readJSONSync(CONFIG_FILEPATH)
}

export const throwError = (error: any) => {
  consola.error(new Error(error))
  process.exit()
}
