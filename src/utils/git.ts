export const gitCmd = (cmd: string) => `git -C ${process.cwd()} ${cmd}`

export const hasUncommit = async () => {
  const cmd = gitCmd('diff HEAD')
  const res = await execAsync(cmd)
  return !!res
}

export const getLatestCommit = async () => {
  const valid = !(await hasUncommit())

  if (valid) {
    const output = await execAsync(gitCmd('log --pretty=format:"%h %ci" -n 1'), { output: false })
    const [hash, ...args] = output.split(' ')
    return { hash, time: dayjs(args.join(' ')) }
  }

  throw new Error('Has uncommitted change.')
}
