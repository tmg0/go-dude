import { execa } from 'execa'
import type { NodeSSH } from 'node-ssh'

export type DockerCommandType = 'build' | 'buildx' | 'push' | 'login'

export interface DockerBuildOptions {
  file?: string
  tag?: string
  noCache?: boolean
}

export interface DockerBuildxOptions {
  file?: string
  tag?: string
  platform?: string
  noCache?: boolean
}

export const setupDockerRPC = () => {
  const getDockerCommand = (command: DockerCommandType, args: (string | undefined)[]): string[] => {
    return [
      command,
      ...args
    ].filter(Boolean) as string[]
  }

  const getDockerComposeCommand = () => {

  }

  const runDockerCommand = (command: DockerCommandType, args: (string | undefined)[], options: { ssh?: NodeSSH } = {}) => {
    if (options.ssh) { return }
    return execa('docker', getDockerCommand(command, args), { stdio: 'inherit' })
  }

  const dockerBuild = (options: DockerBuildOptions = {}) => {
    return runDockerCommand('build', ['-f', options.file, '-t', options.tag, options.noCache ? '--no-cache' : ''])
  }

  const dockerBuildx = (options: DockerBuildxOptions) => {
    return runDockerCommand('buildx', ['build', '-f', options.file, '-t', options.tag, '--platform', options.platform, options.noCache ? '--no-cache' : ''])
  }

  return {
    getDockerCommand,
    getDockerComposeCommand,
    runDockerCommand,

    dockerBuild,
    dockerBuildx
  }
}
