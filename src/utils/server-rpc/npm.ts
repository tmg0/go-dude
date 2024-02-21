import type { PackageManager } from 'nypm'
import { detectPackageManager } from 'nypm'

export interface NpmCommandOptions {
  dev?: boolean
  global?: boolean
}

export type NpmCommandType = 'view' | 'install' | 'update' | 'uninstall'

export const setupNpmRPC = () => {
  let detectPromise: Promise<PackageManager | undefined> | undefined

  const getPackageManager = () => {
    detectPromise ||= detectPackageManager(process.cwd())
    return detectPromise
  }

  const getNpmCommand = async (command: NpmCommandType, packageName: string, options: NpmCommandOptions = {}) => {
    const { dev = true, global = false } = options
    const agent = await getPackageManager()

    const name = agent?.name || 'npm'

    if (command === 'view') {
      return [
        name,
        'view',
        packageName,
        '--json'
      ].filter(Boolean)
    }

    // TODO: smartly detect dev/global installs as default
    if (command === 'install' || command === 'update') {
      return [
        name,
        name === 'npm' ? 'install' : 'add',
        `${packageName}@latest`,
        dev ? '-D' : '',
        global ? '-g' : '',
        // In yarn berry, `--ignore-scripts` is removed
        (name === 'yarn' && !agent?.version?.startsWith('1.')) ? '' : '--ignore-scripts'
      ].filter(Boolean)
    }

    if (command === 'uninstall') {
      return [
        name,
        name === 'npm' ? 'uninstall' : 'remove',
        packageName,
        global ? '-g' : ''
      ].filter(Boolean)
    }
  }

  const runNpmCommand = async (command: NpmCommandType, packageName: string, options: NpmCommandOptions = {}) => {
    const args = await getNpmCommand(command, packageName, options)

    if (!args) { return }

    const processId = `npm:${command}:${packageName}`

    return {
      processId
    }
  }

  return {
    getNpmCommand,
    runNpmCommand
  }
}
