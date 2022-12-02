const path = require('path')
const fs = require('fs-extra')
const { ConfigType } = require('./enums')
const { ConfigFile } = require('./consts')

const configFilePath = (type = ConfigType.JSON) => path.join(process.cwd(), ConfigFile[type])

const existConfigSync = (type = ConfigType.JSON) => fs.existsSync(configFilePath(type))

const loadProjectName = config => config.name || fs.readJSONSync(path.join(process.cwd(), 'package.json')).name

const parseJson = () => {
  return fs.readJSONSync(configFilePath(ConfigType.JSON))
}

module.exports = {
  loadProjectName,
  existConfigSync,
  parseJson
}
