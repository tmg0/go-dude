import fse from 'fs-extra'
import { NodeSSH } from 'node-ssh'
import consola from 'consola'
import dayjs from 'dayjs'
import { resolvePath } from 'mlly'
import { join } from 'pathe'
import YAML from 'yaml'
import destr from 'destr'
import { backupDockerComposeFile, execAsync, getDockerComposeFileName, getDockerComposeFilePath } from './common'
import { getLatestCommitHash } from './git'
import { sshExecAsync } from './ssh'

const hasRepos = (config: DudeConfig) => config.repos && config.repos.length > 0

const repoTag = (repo: ImageRepo, name: string, tag: string) => `${repo.host}/${repo.project}/${name}:${tag}`

export const dockerBuild = async (name: string, tag: string) => {
  const img = `${name}:${tag}`

  const exist = fse.pathExistsSync(join(process.cwd(), 'Dockerfile'))

  const path = await resolvePath('../../Dockerfile', { url: import.meta.url })

  await execAsync(exist ? `docker build -t ${img} .` : `docker build -f ${path} -t ${img} .`)
  consola.success(`Docker build complete. Image: ${img}`)
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

export const dockerRemoveImage = async (config: DudeConfig, name: string, tag: string) => {
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
}

export const dockerLoadImage = (ssh: NodeSSH, _name: string, tag: string) => {
  return ssh.execCommand(`docker load -i /images/${tag}.tar`)
}

export const dockerImageTag = async () => {
  const date = dayjs().format('YYYYMMDD')
  const hash = await getLatestCommitHash()
  return `${date}-${hash}`
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

export const dockerComposeServiceImage = async (ssh: NodeSSH, config: DudeConfig, name: string) => {
  if (!config?.dockerCompose) { throw config }

  const { stdout: yml } = await ssh.execCommand(`cat ${config.dockerCompose.file}`)
  const json: DockerCompose = YAML.parse(yml)

  json.version = '\\"2.2\\"'

  const { image } = json?.services[name] || {}

  if (image) {
    consola.success(`Docker compose parse complete. Old image: ${image}`)
    return image
  }

  const confirmed = await consola.prompt(`Create a new docker-compose file and add a service named: ${name}?`, {
    type: 'confirm'
  })

  if (!confirmed) { throw consola.error(new Error(`Can not find the service named: ${name}`)) }

  const temp = await consola.prompt('Pick a service template.', {
    type: 'select',
    options: Object.keys(json?.services || {})
  }) as unknown as string

  const PLACEHOLDER = 'PLACEHOLDER'

  json.services[name] = { ...json.services[temp], image: PLACEHOLDER }

  await backupDockerComposeFile(ssh, config)

  await ssh.execCommand(`echo "${YAML.stringify(json)}" > ${config.dockerCompose.file}`)

  return PLACEHOLDER
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

export const serviceDockerVersion = async (ssh: NodeSSH) => {
  const stdout = await sshExecAsync(ssh, 'docker version --format \'{{json .}}\'')
  const { Server: { Version } } = destr<DockerVersion>(stdout)
  return Version
}

export const serviceDockerRun = async (ssh: NodeSSH, config: DudeConfig, name: string) => {
  if (!config?.dockerCompose) { return }

  const filename = getDockerComposeFileName(config)
  const filepath = getDockerComposeFilePath(config)

  const version = await serviceDockerVersion(ssh)

  const dockerComposeCommand = Number(version.split('.')[0]) > 23 ? 'docker compose' : 'docker-compose'

  const cmd = config?.dockerCompose?.command || `${dockerComposeCommand} -f ${filename} up -d ${name}`

  await sshExecAsync(ssh, `cd ${filepath} && ${cmd}`)
  consola.success(`From ${filepath} docker compose up: ${filename}`)
}

export const dockerPs = async (ssh: NodeSSH, name: string) => {
  const stdout = await sshExecAsync(ssh, 'docker ps --format \'{{json .}}\'', { console: false })
  return stdout.split('\n').map(item => destr<DockerPs>(item)).filter(({ Names }) => Names.includes(name))
}
