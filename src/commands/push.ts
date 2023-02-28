import consola from 'consola'
import { program } from 'commander'
import YAML from 'yaml'
import { version } from '../../package.json'
import { readConf, readName, getDockerComposeFilePath } from '../shared/common'
import { sshConnect } from '../shared/ssh'

program.command('push')
  .version(version)
  .description('Push image to docker-compose file by ssh.')
  .argument('<string>', 'Image URL')
  .option('-c --config <char>', 'Declare dude config file.')
  .action(async (str, option) => {
    const config = await readConf(option.config)
    const name = await readName(config)

    const ssh = await sshConnect(config)

    try {
      const { stdout: yml } = await ssh.execCommand(`cat ${config.dockerCompose.file}`)
      const json = YAML.parse(yml)
      const service = json.services[name]

      if (!service) { throw new Error(`Cannot find a service named: ${name}`) }

      await ssh.execCommand(`sed -i 's|${service.image}|${str}|g' ${config.dockerCompose.file}`)
      await ssh.execCommand(`cd ${getDockerComposeFilePath(config)} && docker-compose up -d ${name}`)
    } catch (error) {
      consola.error(error)
      throw error
    } finally {
      ssh.dispose()
    }
  })
