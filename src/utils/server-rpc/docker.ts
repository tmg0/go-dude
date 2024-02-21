import { execa } from 'execa'
import type { NodeSSH } from 'node-ssh'

export type DockerCommandType = 'build'

export const setupDockerRPC = () => {
  const getDockerCommand = (command: DockerCommandType, args: string[]): string[] => {
    return [
      'docker',
      command,
      ...args
    ].filter(Boolean)
  }

  const getDockerComposeCommand = () => {

  }

  const runDockerCommand = (command: DockerCommandType, args: string[], options: { ssh?: NodeSSH } = {}) => {
    if (options.ssh) { return }
    const script = getDockerCommand(command, args)
    execa(script.join(' '), { stdio: 'inherit' })
  }

  return {
    getDockerCommand,
    getDockerComposeCommand,
    runDockerCommand
  }
}
