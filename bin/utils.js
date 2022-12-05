const path = require('path')
const consola = require('consola')
const fs = require('fs-extra')
const { ConfigType } = require('./enums')
const { ConfigFile } = require('./consts')

const configFilePath = (type = ConfigType.JSON) => path.join(process.cwd(), ConfigFile[type])

const existConfigSync = (type = ConfigType.JSON) => fs.existsSync(configFilePath(type))

const getProjectName = config => config.name || fs.readJSONSync(path.join(process.cwd(), 'package.json')).name

const getDockerComposeFilePath = config => path.dirname(config.dockerCompose.file)

const parseJson = async () => {
  return await fs.readJSONSync(configFilePath(ConfigType.JSON))
}

const throwError = (error) => {
  // @ts-ignore
  consola.error(new Error(error))
  process.exit()
}

module.exports = {
  getProjectName,
  getDockerComposeFilePath,
  existConfigSync,
  parseJson,
  throwError
}
