import consola from 'consola'
import { execAsync } from './common'

export const gitCmd = (cmd: string) => `git -C ${process.cwd()} ${cmd}`

export const hasUncommit = async () => {
  const cmd = gitCmd('diff HEAD')
  return !!(await execAsync(cmd))
}

export const getLatestCommitHash = async () => {
  if (await hasUncommit()) { consola.error('Has uncommitted change.') }

  const cmd = gitCmd('log --pretty=format:"%h" -n 1')

  return execAsync(cmd)
}
