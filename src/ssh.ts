import { NodeSSH } from 'node-ssh'

const ssh = new NodeSSH()

export const sshConnect = async (config: DudeConfig) => {
  await ssh.connect({ ...config.ssh })
  return ssh
}
