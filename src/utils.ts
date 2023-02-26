import { dirname, join } from 'pathe'
import consola from 'consola'
import { readJson } from 'fs-extra'
import { CONFIG_FILENAME } from './consts'

export const readName = async (config: DudeConfig): Promise<string> => {
  if (config.name) { return config.name }
  const path = join(process.cwd(), 'package.json')

  try {
    const name = (await readJson(path))?.name
    if (name) { return name }

    const message = 'Please declare a project name in config file or package.json.'
    consola.error(message)
    throw new Error(message)
  } catch (error) {
    consola.error(error)
    throw error
  }
}

export const getDockerComposeFilePath = (config: DudeConfig) => {
  if (config.dockerCompose.file) { return dirname(config.dockerCompose.file) }

  const message = 'Please declare the docker compose file path.'
  consola.error(message)
  throw new Error(message)
}

export const readConf = (path = '.'): Promise<DudeConfig> => {
  try {
    path = join(process.cwd(), path, CONFIG_FILENAME)
    return readJson(path)
  } catch (error) {
    consola.error(error)
    throw error
  }
}
