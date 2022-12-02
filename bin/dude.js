#! /usr/bin/env node

const { NodeSSH } = require('node-ssh')
const { program } = require('commander')
const YAML = require('yaml')
const { version } = require('../package.json')
const { ConfigType } = require('./enums')
const { existConfigSync, parseJson, loadProjectName } = require('./utils')

program.command('push')
  .version(version)
  .description('Push image to docker-compose file by ssh.')
  .argument('<string>', 'Image URL')
  .action(async (str, options) => {
    let config

    if (existConfigSync(ConfigType.JSON)) {
      config = parseJson()
    }

    const name = loadProjectName(config)

    const ssh = new NodeSSH()

    try {
      await ssh.connect({ ...config.ssh })
      const { stdout: yml } = await ssh.execCommand(`cat ${config.dockerCompose.path}/${config.dockerCompose.fileName}`)
      const json = YAML.parse(yml)
      const { image } = json.services[name]
      await ssh.execCommand(`sed -i 's|${image}|${str}|g' ${config.dockerCompose.path}/${config.dockerCompose.fileName}`)
      await ssh.execCommand(`cd ${config.dockerCompose.path} && docker-compose up -d ${name}`)
      ssh.dispose()
    } catch (error) {
      throw new Error(error)
    }
  })

program.parse()
