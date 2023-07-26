# Go Dude

[![NPM version](https://img.shields.io/npm/v/go-dude)](https://www.npmjs.com/package/go-dude)

A local cicd tool for docker. Easy way to push image and replace docker-compose service or k8s pod by ssh.

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
  },
  "k8s": {
    "namespace": "",
    "deployment": ""
  }
}
```

Dude will use project name in package.json `name` field as default, but you can also define another name in config file.

## Usage

### dude push

This command will connect your ip address by ssh,
If use `-t` or `--tag` option，this command will only replace image tag.

**docker**

Replace the target project image url in docker-compose file.

**k8s**

Set deployment pod container image ( If only have one container in pod ).

```bash
Usage: index push [options] <string>

Push image to docker-compose file by ssh.

Arguments:
  string              Image URL / Image tag

Options:
  -V, --version       output the version number
  -t --tag            Only replace image tag.
  -c --config <char>  Declare dude config file.
  -h, --help          display help for command
```

### dude build

This command will run configured build script and make it to a docker image.

If you have a image repo like `harbor`, provide `repos` in `dude.config.json` file, this command will build image and upload image repo under defined prject.

If do not have image repos, `dude` will create a dir named `.image` and generate docker image to a tar file. Auto upload this tar file to server by `scp` and run `docker load`

After build a docker image, `dude` will ask you if you need to push this image to a docker or k8s server.

```bash
Usage: index build [options]

build project

Options:
  -V, --version       output the version number
  -c --config <char>  Declare dude config file.
  -h, --help          display help for command
```

### dude check

A easy way to check if the service / pod running successfully without use a ssh tool.

This command will output name | image | state | status fields as a table on console.

## Config

### `DudeConfig`

```ts
interface DudeConfig {
  name?: string
  dockerCompose?: false | {
    file: string
    command?: string
  }
  k8s: {
    deployment: string
    pod?: string
    container?: string
    namespace?: string
  }
  ssh: {
    host: string
    username: string
    password: string
    port: number
  }
  build: {
    script?: string
    output: string
  }
  repos?: ImageRepo[]
}
```

### `ImageRepo`

```ts
interface ImageRepo {
  host: string
  username: string
  password: string
  project: string
}
```

## License
[MIT](./LICENSE)
