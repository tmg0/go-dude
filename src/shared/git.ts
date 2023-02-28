import consola from 'consola'
import { execAsync } from './common'

export const hasUncommit = async () => {
  return !!(await execAsync('git diff HEAD'))
}

export const getLatestCommitHash = async () => {
  if (await hasUncommit()) { consola.error('Has uncommitted change.') }

  return execAsync('git log --pretty=format:"%h" -n 1')
}
