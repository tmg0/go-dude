import { execa } from 'execa'
import type { NodeSSH } from 'node-ssh'

export type DockerCommandType = 'build' | 'buildx' | 'push' | 'login'

export const setupDockerRPC = () => {
  const getDockerCommand = (command: DockerCommandType, args: string[]): string[] => {
    return [
      command,
      ...args
    ].filter(Boolean)
  }

  const getDockerComposeCommand = () => {

  }

  const runDockerCommand = (command: DockerCommandType, args: string[], options: { ssh?: NodeSSH } = {}) => {
    if (options.ssh) { return }
    return execa('docker', getDockerCommand(command, args), { stdio: 'inherit' })
  }

  return {
    getDockerCommand,
    getDockerComposeCommand,
    runDockerCommand
  }
}
