import { NodeSSH } from 'node-ssh'

const ssh = new NodeSSH()

export const sshConnect = async (config: DudeConfig) => {
  await ssh.connect({ ...config.ssh })
  consola.success(`SSH connect complete. Host: ${config.ssh.host}`)
  return ssh
}

export const sshExecAsync = async (ssh: NodeSSH, cmd: string, options: { console?: boolean } = { console: true }) => {
  const { stdout } = await ssh.execCommand(cmd)
  if (options.console) { console.log(stdout) }
  return stdout
}

export const sshExist = (config: DudeConfig) => config.ssh && config.ssh.host && config.ssh.password
