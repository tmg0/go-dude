import { dirname, join } from 'pathe'
import consola from 'consola'
import { readJSONSync } from 'fs-extra'
import { CONFIG_FILENAME } from './consts'

export const getProjectName = (config: DudeConfig) => config.name || readJSONSync(join(process.cwd(), 'package.json')).name

export const getDockerComposeFilePath = (config: DudeConfig) => dirname(config.dockerCompose.file)

export const readConf = (path = '.'): Promise<DudeConfig> => {
  path = join(process.cwd(), path, CONFIG_FILENAME)
  return readJSONSync(path)
}

export const throwError = (error: any) => {
  consola.error(new Error(error))
  process.exit()
}
