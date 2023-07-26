import { exec } from 'node:child_process'
import { dirname, join } from 'pathe'
import { filename } from 'pathe/utils'
import consola from 'consola'
import { loadConfig } from 'c12'
import fse from 'fs-extra'
import { Client } from 'node-scp'
import { NodeSSH } from 'node-ssh'
import dayjs from 'dayjs'
import destr from 'destr'
import { CONFIG_FILENAME } from '../consts'
import { name, version } from '../../package.json'

export const isString = (value: any): value is string => typeof value === 'string'

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
  if (config.dockerCompose && config.dockerCompose.file) { return dirname(config.dockerCompose.file) }

  const message = 'Please declare the docker compose file path.'
  consola.error(message)
  throw new Error(message)
}

export const getDockerComposeFileName = (config: DudeConfig) => {
  if (config.dockerCompose && config.dockerCompose.file) { return filename(config.dockerCompose.file) }

  const message = 'Please declare the docker compose file name.'
  consola.error(message)
  throw new Error(message)
}

export const readConf = async (path = process.cwd()) => {
  const { config } = await loadConfig<DudeConfig>({ name: CONFIG_FILENAME, cwd: path })
  if (!config) {
    const error = new Error('Can not find dude config file.')
    consola.error(error)
    throw error
  }
  return config
}

export const execAsync = (cmd: string, options: { console?: boolean } = { console: true }) => {
  return new Promise((resolve, reject) => {
    const p = exec(cmd, (error, stdout) => {
      if (error) {
        reject(error)
        return
      }
      resolve(stdout)
    })

    if (options.console) {
      p.stdout?.pipe(process.stdout)
    }
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
  if (!config.build.script) { return }
  await execAsync(config.build.script)
  consola.success(`Build script complete. The ${config.build.output} directory is ready to be deployed.`)
}

export const renameSshFile = async (ssh: NodeSSH, from: string, to: string) => {
  await ssh.execCommand(`mv ${from} ${to}`)
}

export const backupDockerComposeFile = async (ssh: NodeSSH, config: DudeConfig) => {
  const { dockerCompose } = config
  if (!dockerCompose || !dockerCompose.file) { return }
  const filepath = getDockerComposeFilePath(config)
  const filename = getDockerComposeFileName(config)
  const target = `docker-compose.${dayjs().format('YYYYMMDD_HHMM')}.yml`
  await renameSshFile(ssh, dockerCompose.file, join(filepath, target))
  consola.success(`Rename old docker compose file from ${filename} to ${target}`)
}

export const checkVersion = (): Promise<void> => {
  return new Promise((resolve) => {
    execAsync(`npm view ${name} --json`, { console: false }).then((stdout) => {
      const json = destr<NpmView>(stdout)

      if (version !== json.version) {
        consola.box(`Update available: ${version} => ${json.version}`, `\nRun "npm install -g ${json._id}" to update`)
      }
    }).catch(() => {
      consola.warn('Npm connect error.')
    }).finally(() => {
      resolve()
    })
  })
}
