import { NodeSSH } from 'node-ssh'

/**
 * Check if have repo in dude config file.
 *
 * @param {DudeConfig} config - dude config
 * @returns {boolean}
 */
const hasRepos = (config: DudeConfig) => config.repos && config.repos.length > 0

/**
 * Generate repo tag like habor.
 *
 * @param repo - repo config in dude config file
 * @param name - service name
 * @param tag - docker image tag
 * @returns {string}
 */
const repoTag = (repo: ImageRepo, name: string, tag: string) => `${repo.host}/${repo.project}/${name}:${tag}`

export const dockerBuild = async (name: string, tag: string, platform?: string) => {
  const img = `${name}:${tag}`

  const exist = fse.pathExistsSync(join(process.cwd(), 'Dockerfile'))

  const path = await resolvePath('../../Dockerfile', { url: import.meta.url })

  let cmd = 'docker'
  let platformOption = ''

  if (platform) {
    const version = await dockerVersion()
    const isSupportBuildx = semver.gt(version, '19.3.0')

    if (!isSupportBuildx) { throw new Error('Local docker version do not support buildx.')}

    consola.info(`build docker image for ${platform}`)

    cmd = 'docker buildx'
    platformOption = `--platform ${platform}`
  }

  let exec = exist ? `${cmd} build -t ${img} . ${platformOption}` : `${cmd} build -f ${path} -t ${img} . ${platformOption}`

  exec += '--no-cache'

  consola.info(exec)
  consola.info('building...')

  await execAsync(exec)
  consola.success(`Docker build complete. Image: ${img}`)
  return img
}

export const dockerTag = async (config: DudeConfig, name: string, tag: string) => {
  if (!hasRepos(config)) { return }

  const t = async (repo: ImageRepo) => {
    const target = repoTag(repo, name, tag)
    await execAsync(`docker tag ${name}:${tag} ${target}`)
    consola.success(`Docker tag complete. Tag: ${target}`)
  }

  await Promise.all((config.repos as ImageRepo[]).map(t))
}

export const dockerSaveImage = async (name: string, tag: string) => {
  const img = `${name}:${tag}`
  const dir = join(process.cwd(), '.images')
  if (!fse.pathExistsSync(dir)) { fse.mkdir(dir) }
  await execAsync(`docker save ${img} -o ${join(dir, `${tag}.tar`)}`)
  consola.success(`Save docker image as tar. Filename: ${tag}.tar`)
}

export const dockerRemoveImageTar = (_name: string, tag: string) => {
  const path = join(process.cwd(), '.images', `${tag}.tar`)
  return fse.remove(path)
}

export const dockerRemoveImage = (config: DudeConfig, name: string, tag: string) => async (ssh?: NodeSSH) => {
  if (!ssh) {
    try {
      await Promise.all([
        execAsync(`docker image rm ${name}:${tag}`),
        (() => {
          if (!hasRepos(config)) { return [] }
          return (config.repos as ImageRepo[]).map((repo) => {
            return execAsync(`docker image rm ${repoTag(repo, name, tag)}`)
          })
        })()
      ])
      consola.success(`Local docker image remove complete. Image: ${name}:${tag}`)
    } catch (error) {
      consola.warn(error)
    }
  }
}

export const dockerLoadImage = (_name: string, tag: string) => (ssh?: NodeSSH) => {
  if (!ssh) { return }
  return ssh.execCommand(`docker load -i images/${tag}.tar`)
}

export const dockerLogin = async (config: DudeConfig) => {
  if (!hasRepos(config)) { return }

  const login = async (repo: ImageRepo) => {
    await execAsync(`docker login -u ${repo.username} -p ${repo.password} ${repo.host}`)
    consola.success(`Docker login complete. Host: ${repo.host}`)
  }

  await Promise.all((config.repos as ImageRepo[]).map(login))
}

export const dockerPush = async (config: DudeConfig, name: string, tag: string) => {
  if (!hasRepos(config)) { return }

  const images: string[] = []

  const push = async (repo: ImageRepo) => {
    const path = join(repo.host, repo.project, `${name}:${tag}`)
    await execAsync(`docker push ${path}`)
    images.push(path)
    consola.success(`Docker push complete. Repo: ${path}`)
  }

  await Promise.all((config.repos as ImageRepo[]).map(push))
  return images
}

export const parseDockerCompose = (yml: string) => {
  const VERSION = '\\"2.2\\"'
  let json: DockerCompose = {
    version: VERSION,
    services: {}
  }

  try {
    json = YAML.parse(yml)
    json.version = VERSION
    return json
  } catch {
    return json
  }
}

export const dockerComposeServiceImage = async (ssh: NodeSSH, config: DudeConfig, name: string) => {
  if (!config?.dockerCompose) { throw config }

  await ensureDockerComposeFile(config)(ssh)

  const { stdout: yml } = await ssh.execCommand(`cat ${config.dockerCompose.file}`)
  const json: DockerCompose = parseDockerCompose(yml)

  const { image } = json?.services[name] || {}

  if (image) {
    consola.success(`Docker compose parse complete. Old image: ${image}`)
    return image
  }

  const confirmed = await consola.prompt(`Create a new docker-compose file and add a service named: ${name}?`, {
    type: 'confirm'
  })

  if (confirmed) {
    const services = Object.keys(json?.services || {})
    const PLACEHOLDER = nanoid()

    if (services.length) {
      const temp = await consola.prompt('Pick a service template.', {
        type: 'select',
        options: services
      }) as unknown as string

      json.services[name] = { ...json.services[temp], image: PLACEHOLDER }
    }

    if (!services.length) {
      json.services[name] = { network_mode: 'host', image: PLACEHOLDER }
    }

    await backupDockerComposeFile(ssh, config)

    await ssh.execCommand(`echo "${YAML.stringify(json)}" > ${config.dockerCompose.file}`)

    return PLACEHOLDER
  }

  throw new Error(`Can not find the service named: ${name}`)
}

export const replaceImage = async (ssh: NodeSSH, config: DudeConfig, name: string, oldValue: string, newValue: string) => {
  if (!config?.dockerCompose) { return }

  if (oldValue === newValue) {
    consola.success('Provide same image name, skip current step.')
    return
  }

  await ssh.execCommand(`sed -i 's|${oldValue}|${newValue}|g' ${config.dockerCompose.file}`)
  consola.success(`Replace image from ${oldValue} to ${newValue}`)

  await serviceDockerRun(ssh, config, name)
}

export const dockerVersion = async () => {
  const stdout = await execAsync('docker version --format \'{{json .}}\'', { console: false })
  const { Server: { Version } } = destr<DockerVersion>(stdout)
  return Version
}

export const serviceDockerVersion = async (ssh: NodeSSH) => {
  const stdout = await sshExecAsync(ssh, 'docker version --format \'{{json .}}\'', { console: false })
  const { Server: { Version } } = destr<DockerVersion>(stdout)
  return Version
}

export const serviceDockerRun = async (ssh: NodeSSH, config: DudeConfig, name: string) => {
  if (!config?.dockerCompose) { return }

  let cmd = config?.dockerCompose?.command

  const filename = getDockerComposeFileName(config)
  const filepath = getDockerComposeFilePath(config)

  if (!cmd) {
    const version = await serviceDockerVersion(ssh)
    const dockerComposeCommand = semver.gt(version, '24.0.0') ? 'docker compose' : 'docker-compose'
    cmd = `${dockerComposeCommand} -f ${filename} up -d ${name}`
  }

  await sshExecAsync(ssh, `cd ${filepath} && ${cmd}`)
  consola.success(`From ${filepath} docker compose up: ${filename}`)
}

export const dockerPs = (name: string) => async (ssh?: NodeSSH) => {
  if (!ssh) { return [] }
  const stdout = await sshExecAsync(ssh, 'docker ps --format \'{{json .}}\'', { console: false })
  return stdout.split('\n').map(item => destr<DockerPs>(item)).filter(Boolean).filter(({ Names }) => Names?.includes(name)) || []
}

export const ensureDockerComposeFile = (config: DudeConfig) => async (ssh?: NodeSSH) => {
  if (!ssh) { return }
  if (!config?.dockerCompose) { throw config }
  const [remoteExist, templateExist] = await Promise.all([isFileExist(config.dockerCompose.file)(ssh), isFileExist(getDockerComposeFileName(config))()])
  if (!remoteExist && templateExist) {
    const confirmed = await consola.prompt(`Do not exist docker compose file under ${getDockerComposeFilePath(config)}, create a new file from template?`, {
      type: 'confirm'
    })

    if (confirmed) {
      await sshExecAsync(ssh, `touch ${config.dockerCompose.file}`)
      return
    }

    throw new Error(`Can not find the docker compose file: ${config.dockerCompose.file}`)
  }
}
