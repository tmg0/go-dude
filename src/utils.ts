import { exec } from 'node:child_process'
import { dirname, join } from 'pathe'
import consola from 'consola'
import fse from 'fs-extra'
import { Client } from 'node-scp'
import { CONFIG_FILENAME } from './consts'

export const readName = async (config: DudeConfig): Promise<string> => {
  if (config.name) { return config.name }
  const path = join(process.cwd(), 'package.json')

  try {
    const name = (await fse.readJson(path))?.name
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
    return fse.readJson(path)
  } catch (error) {
    consola.error(error)
    throw error
  }
}

export const execAsync = (cmd: string) => {
  return new Promise((resolve, reject) => {
    exec(cmd, (error, stdout) => {
      if (error) {
        reject(error)
        return
      }
      resolve(stdout)
    })
  })
}

export const upload = async (config: DudeConfig, from: string, to: string) => {
  const client = await Client({ ...config.ssh })
  const dir = dirname(to)
  const exist = await client.exists(dir)

  if (!exist) { await client.mkdir(dir) }

  await client.uploadFile(from, to)
  return client.close()
}

export const uploadImage = (config: DudeConfig, _name: string, tag: string) => {
  const filename = `${tag}.tar`
  const from = join(process.cwd(), '.images', filename)
  return upload(config, from, `/images/${filename}`)
}

export const execBuildScript = async (config: DudeConfig) => {
  await execAsync(config.build.script)
  consola.success(`Build script complete. The ${config.build.output} directory is ready to be deployed.`)
}
