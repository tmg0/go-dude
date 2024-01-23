import type { NodeSSH } from 'node-ssh'

export const ensureDockerComposeFile = (config: DudeConfig) => async (ssh?: NodeSSH) => {
  if (!ssh) { return }
  if (!config?.dockerCompose) { throw config }
  const [remoteExist, templateExist] = await Promise.all([isFileExist(config.dockerCompose.file)(ssh), isFileExist(getDockerComposeFileName(config))()])
  if (!remoteExist && templateExist) {
    const confirmed = await consola.prompt(`Do not exist docker compose file under ${getDockerComposeFilePath(config)}, create a new file from template?`, {
      type: 'confirm'
    })

    if (confirmed) {
      await sshExecAsync(ssh, `touch ${config.dockerCompose.file}`)
      return
    }

    throw new Error(`Can not find the docker compose file: ${config.dockerCompose.file}`)
  }
}
