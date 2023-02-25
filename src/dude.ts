#! /usr/bin/env node

import { NodeSSH } from 'node-ssh'
import { program } from 'commander'
import YAML from 'yaml'
import { version } from '../package.json'
import { parseConf, getProjectName, getDockerComposeFilePath, throwError } from './utils'

program.command('push')
  .version(version)
  .description('Push image to docker-compose file by ssh.')
  .argument('<string>', 'Image URL')
  .option('-D --docker', 'Push docker image.')
  .option('-C --config <char>', 'Declare dude config file.')
  .action(async (str, option) => {
    const config = await parseConf()

    if (!config) { throwError('Do not exist available config file.') }

    const name = getProjectName(config)

    if (!name) { throwError('Please declare a project name in config file or package.json.') }

    const ssh = new NodeSSH()

    try {
      await ssh.connect({ ...config.ssh })

      if (option.docker) {
        const { stdout: yml } = await ssh.execCommand(`cat ${config.dockerCompose.file}`)
        const json = YAML.parse(yml)
        const { image } = json.services[name]
        await ssh.execCommand(`sed -i 's|${image}|${str}|g' ${config.dockerCompose.file}`)
        await ssh.execCommand(`cd ${getDockerComposeFilePath(config)} && docker-compose up -d ${name}`)
      }
    } catch (error) {
      throwError(error)
    } finally {
      ssh.dispose()
    }
  })

program.parse(process.argv)
