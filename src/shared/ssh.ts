import { NodeSSH } from 'node-ssh'
import consola from 'consola'

const ssh = new NodeSSH()

export const sshConnect = async (config: DudeConfig) => {
  await ssh.connect({ ...config.ssh })
  consola.success(`SSH connect complete. Host: ${config.ssh.host}`)
  return ssh
}
