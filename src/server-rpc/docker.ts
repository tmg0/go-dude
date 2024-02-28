import { execa } from 'execa'
import type { NodeSSH } from 'node-ssh'

export type DockerCommandType = 'build' | 'buildx' | 'push' | 'login' | 'image'

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

export interface DockerRemoveOptions {
  force?: boolean
  link?: string
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

  const dockerImageRm = (container: string | string[], options: DockerRemoveOptions = {}) => {
    return runDockerCommand('image', ['rm', container, options.force ? '-f' : ''].flat())
  }

  return {
    getDockerCommand,
    getDockerComposeCommand,
    runDockerCommand,

    dockerBuild,
    dockerBuildx,
    dockerImageRm
  }
}
