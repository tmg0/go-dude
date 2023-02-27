import { join } from 'path'
import fse from 'fs-extra'
import { NodeSSH } from 'node-ssh'
import consola from 'consola'
import { execAsync } from './utils'

export const dockerBuild = async (name: string, tag: string) => {
  const img = `${name}:${tag}`
  const cwd = process.cwd()
  const exist = fse.pathExistsSync(join(process.cwd(), 'Dockerfile'))
  await execAsync(exist ? `docker build -f ${cwd}/Dockerfile -t ${img} .` : `docker build -t ${img} .`)
  consola.success(`Docker build complete, named: ${img}`)
}

export const dockerSaveImage = (name: string, tag: string) => {
  const img = `${name}:${tag}`
  const dir = join(process.cwd(), '.images')
  if (!fse.pathExistsSync(dir)) { fse.mkdir(dir) }
  return execAsync(`docker save ${img} -o ${join(dir, `${tag}.tar`)}`)
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
