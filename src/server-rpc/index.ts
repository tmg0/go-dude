import { type ExecaChildProcess } from 'execa'
import { type DockerCommandType, setupDockerRPC } from './docker'
import { setupNpmRPC } from './npm'

export interface ServerFunctions {
  getDockerCommand?: (command: DockerCommandType, args: string[]) => string[]
  runDockerCommand?: (command: DockerCommandType, args: string[]) => ExecaChildProcess<string>
}

export const rpc: ServerFunctions = {}

export const setupRPC = () => {
  Object.assign(rpc, {
    ...setupDockerRPC(),
    ...setupNpmRPC()
  })
}
