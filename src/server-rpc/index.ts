import { setupDockerRPC } from './docker'
import { setupNpmRPC } from './npm'

export type ServerFunctions = ReturnType<typeof setupDockerRPC> & ReturnType<typeof setupNpmRPC>

export const rpc: Partial<ServerFunctions> = {}

export const setupRPC = () => {
  Object.assign(rpc, {
    ...setupDockerRPC(),
    ...setupNpmRPC()
  })
}
