import fse from 'fs-extra'
import { NodeSSH } from 'node-ssh'
import consola from 'consola'
import dayjs from 'dayjs'
import { resolvePath } from 'mlly'
import { join } from 'pathe'
import YAML from 'yaml'
import { execAsync, getDockerComposeFileName, getDockerComposeFilePath } from './common'
import { getLatestCommitHash } from './git'

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

  const push = async (repo: ImageRepo) => {
    const path = join(repo.host, repo.project, `${name}:${tag}`)
    await execAsync(`docker push ${path}`)
    consola.success(`Docker push complete. Repo: ${path}`)
  }

  await Promise.all((config.repos as ImageRepo[]).map(push))
}

export const dockerComposeServiceImage = async (ssh: NodeSSH, config: DudeConfig, name: string, str = '') => {
  if (!config?.dockerCompose) { throw config }

  const { stdout: yml } = await ssh.execCommand(`cat ${config.dockerCompose.file}`)
  const json: DockerCompose = YAML.parse(yml)

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

  json.services[name] = { ...json.services[temp], image: '' }

  const dockerComposeFileName = `docker-compose.${str}.yml`

  await ssh.execCommand(`echo "${YAML.stringify(json)}" > ${join(getDockerComposeFilePath(config), dockerComposeFileName)}`)

  config.dockerCompose.file = dockerComposeFileName

  return ''
}

export const replaceImage = async (ssh: NodeSSH, config: DudeConfig, name: string, oldValue: string, newValue: string) => {
  if (!config?.dockerCompose) { return }

  if (oldValue === newValue) {
    consola.success('Provide same image name, skip current step.')
    return
  }

  await ssh.execCommand(`sed -i 's|${oldValue}|${newValue}|g' ${config.dockerCompose.file}`)
  consola.success(`Replace image from ${oldValue} to ${newValue}`)

  const cmd = config.dockerCompose.command || 'docker-compose'
  await ssh.execCommand(`cd ${getDockerComposeFilePath(config)} && ${cmd} -f ${getDockerComposeFileName(config)} up -d ${name}`)
  consola.success('Docker compose up complete')
}
