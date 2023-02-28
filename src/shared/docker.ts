import { join } from 'path'
import fse from 'fs-extra'
import { NodeSSH } from 'node-ssh'
import consola from 'consola'
import dayjs from 'dayjs'
import { resolve } from 'pathe'
import { execAsync } from './common'
import { getLatestCommitHash } from './git'

const hasRepos = (config: DudeConfig) => config.repos && config.repos.length > 0

export const dockerBuild = async (name: string, tag: string) => {
  const img = `${name}:${tag}`
  const cwd = process.cwd()
  const exist = fse.pathExistsSync(join(process.cwd(), 'Dockerfile'))
  await execAsync(`docker build -f ${exist ? cwd : resolve('.')}/Dockerfile -t ${img} .`)
  consola.success(`Docker build complete. Image: ${img}`)
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

export const dockerRemoveImage = (name: string, tag: string) => {
  return execAsync(`docker image rm ${name}:${tag}`)
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
