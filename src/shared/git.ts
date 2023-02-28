import consola from 'consola'
import { execAsync } from './common'

export const gitCmd = (cmd: string) => `git -C ${process.cwd()} ${cmd}`

export const hasUncommit = async () => {
  const cmd = gitCmd('diff HEAD')
  const res = await execAsync(cmd)
  return !!res
}

export const getLatestCommitHash = async () => {
  const valid = !(await hasUncommit())

  if (valid) { return execAsync(gitCmd('log --pretty=format:"%h" -n 1')) }

  const message = 'Has uncommitted change.'
  consola.error(message)
  throw new Error(message)
}
