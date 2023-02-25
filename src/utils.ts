import path from 'path'
import consola from 'consola'
import fse, { readJSONSync } from 'fs-extra'

export const filename = 'dude.config.json'

export const configFilePath = () => path.join(process.cwd(), filename)

export const existConfigSync = () => fse.existsSync(configFilePath())

export const getProjectName = (config: DudeConfig) => config.name || readJSONSync(path.join(process.cwd(), 'package.json')).name

export const getDockerComposeFilePath = (config: DudeConfig) => path.dirname(config.dockerCompose.file)

export const parseJson = async () => {
  return await readJSONSync(configFilePath())
}

export const throwError = (error: any) => {
  consola.error(new Error(error))
  process.exit()
}
