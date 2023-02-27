import { exec } from 'node:child_process'
import { dirname, join } from 'pathe'
import consola from 'consola'
import fse from 'fs-extra'
import { NodeSSH } from 'node-ssh'
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
      consola.info(stdout)
      resolve(stdout)
    })
  })
}

export const existDockerfile = () => {
  return fse.pathExistsSync(join(process.cwd(), 'Dockerfile'))
}

export const sshConnect = (config: DudeConfig) => {
  const ssh = new NodeSSH()

  ssh.connect({ ...config.ssh })

  return ssh
}
