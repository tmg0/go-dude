# Go Dude

[![NPM version](https://img.shields.io/npm/v/go-dude)](https://www.npmjs.com/package/go-dude)

A local cd tool for docker. Easy way to push image and replace docker-compose file by ssh.

## Installation

```
npm install go-dude -g
```

## Configuration

Define a config file named `dude.config.json` in root dir of your project.

It looks like:

```
// dude.config.json

{
  "name": "PROJECT_NAME",
  "ssh": {
    "username": "root",
    "host": "",
    "password": "",
    "port": 22
  },
  "dockerCompose": {
    "file": "/docker-compose.yml"
  }
}
```

Dude will use project name in package.json `name` field as default, but you can also define another name in config file.

## Usage

This command will connect your ip address by ssh and replace the target project image url in docker-compose file.

```
dude push IMAGE_URL

Arguments:
  string         Image URL

Options:
  -V, --version  output the version number
  -h, --help     display help for command
```

## License
[MIT](./LICENSE)
