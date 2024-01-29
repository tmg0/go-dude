import { exec } from 'node:child_process'
import { basename } from 'node:path'
import { Client } from 'node-scp'
import { NodeSSH } from 'node-ssh'
import { name, version } from '../../package.json'

export const isString = (value: any): value is string => typeof value === 'string'

export const readName = async (config: DudeConfig): Promise<string> => {
  if (config.name) { return config.name }
  if (await isNodeProject()) {
    const path = join(process.cwd(), 'package.json')
    const name = (await fse.readJson(path))?.name
    if (name) { return name }
  }

  throw new Error('Please declare a project name in config file or package.json.')
}

export const getDockerComposeFilePath = (config: DudeConfig) => {
  if (config.dockerCompose && config.dockerCompose.file) { return dirname(config.dockerCompose.file) }
  throw new Error('Please declare the docker compose file path.')
}

export const getDockerComposeFileName = (config: DudeConfig) => {
  if (config.dockerCompose && config.dockerCompose.file) { return filename(config.dockerCompose.file) }
  throw new Error('Please declare the docker compose file name.')
}

export const readConf = async (path = process.cwd()) => {
  const { config } = await loadConfig<DudeConfig>({ name: CONFIG_FILENAME, cwd: path })
  if (!config) { throw new Error('Can not find dude config file.') }
  return config
}

export const execAsync = (cmd: string, options: { output?: boolean } = { output: true }): Promise<string> => {
  return new Promise((resolve, reject) => {
    const p = exec(cmd, (error, stdout) => {
      if (error) {
        reject(error)
        return
      }
      resolve(stdout)
    })

    if (options.output) {
      p.stdout?.pipe(process.stdout)
    }
  })
}

export const upload = async (config: DudeConfig, from: string, to: string) => {
  const client = await Client({ ...config.ssh })
  const dir = dirname(to)
  const exist = await client.exists(dir)

  if (!exist) { await client.mkdir(dir) }

  consola.info('uploading...')
  await client.uploadFile(from, to)
  consola.success('Image tar upload complete.')
  return client.close()
}

export const uploadImage = (config: DudeConfig, _name: string, tag: string) => {
  const filename = `${tag}.tar`
  const from = join(process.cwd(), '.images', filename)
  return upload(config, from, `images/${filename}`)
}

export const execBuildScript = async (config: DudeConfig) => {
  if (!config.build.script) { return }
  let _script = config.build.script
  if (await isNodeProject() && await hasVolta() && await hasDeclaredVoltaNodeVersion()) {
    const v = await getNodeVersion()
    _script = `volta run --node ${v} ${_script}`
  }
  await execAsync(_script)
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
    execAsync(`npm view ${name} --json`, { output: false }).then((stdout) => {
      const json = destr<NpmView>(stdout)

      if (version !== json.version) {
        const oldVersion = colors.red(version)
        const newVersion = colors.green(json.version)
        const upgradeCommand = colors.magenta(`npm install -g ${json._id}`)

        consola.box(`Update available! ${oldVersion} → ${newVersion}.\nRun "${upgradeCommand}" to update.`)
      }
    }).catch(() => {
      consola.warn('Npm connect error.')
    }).finally(() => {
      resolve()
    })
  })
}

export const generteImageTagFromGitCommitHash = async () => {
  const { hash, time } = await getLatestCommit()
  const date = time.format('YYYYMMDD')
  return `${date}-${hash}`
}

export const isFileExist = (path: string) => async (ssh?: NodeSSH) => {
  if (!ssh) {
    const file = join(process.cwd(), filename(path))
    return fse.pathExistsSync(file)
  }

  const stdout = await sshExecAsync(ssh, `[ -e "${path}" ] && echo "true" || echo "false"`)
  return destr(stdout) || false
}

export const ensureFile = (path: string) => async (ssh?: NodeSSH) => {
  if (!ssh) { return }
  const exist = await isFileExist(path)(ssh)
  if (!exist) {
    await sshExecAsync(ssh, `touch ${path}`)
  }
}

export const isNodeProject = (): Promise<boolean> => {
  return fse.pathExists(join(process.cwd(), 'package.json'))
}

export const getNodeVersion = async () => {
  if (!await hasVolta()) { return execAsync('node -v') }

  const stdout = await execAsync('volta which node', { output: false })
  const path = resolve(stdout)
  return basename(dirname(path))
}

export const hasVolta = async () => {
  return !!await execAsync('volta --version', { output: false })
}

export const hasDeclaredVoltaNodeVersion = async () => {
  const path = join(process.cwd(), 'package.json')
  return (await fse.readJson(path))?.volta
}
