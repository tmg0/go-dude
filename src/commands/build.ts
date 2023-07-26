import { program } from 'commander'
import consola from 'consola'
import { version } from '../../package.json'
import { execBuildScript, readConf, readName, uploadImage } from '../shared/common'
import { dockerBuild, dockerSaveImage, dockerRemoveImage, dockerLoadImage, dockerRemoveImageTar, dockerImageTag, dockerLogin, dockerPush, dockerTag } from '../shared/docker'
import { sshConnect } from '../shared/ssh'
import push from './push'

const selectImage = async (config: DudeConfig, images?: string[]) => {
  if (!config?.ssh?.host) { return }
  if (!images?.length) { return }

  let [image] = images

  if (images.length > 1) {
    image = await consola.prompt('Pick a service template.', {
      type: 'select',
      options: images
    }) as unknown as string
  }

  return image
}

const pushImage = async (config: DudeConfig, image: string | undefined, option: any) => {
  if (!image) { return }
  const confirmed = await consola.prompt(`Push ${image} to ${config.ssh.host}?`, {
    type: 'confirm'
  })
  if (confirmed) { push(image, { ...option, tag: undefined }) }
}

program.command('build')
  .version(version)
  .description('build project')
  .option('-c --config <char>', 'Declare dude config file.')
  .option('-t --tag <char>', 'Named image tag without git hash.')
  .action(async (option) => {
    const config = await readConf(option.config)
    const name = await readName(config)

    if (config.build.script) { await execBuildScript(config) }

    let tag = option?.tag

    if (!tag) {
      tag = await dockerImageTag()
    }

    await dockerBuild(name, tag)

    if (config.repos && config.repos.length > 0) {
      await dockerTag(config, name, tag)
      await dockerLogin(config)
      const images = await dockerPush(config, name, tag)
      await dockerRemoveImage(config, name, tag)

      const image = await selectImage(config, images)
      await pushImage(config, image, option)

      return
    }

    await dockerSaveImage(name, tag)
    await dockerRemoveImage(config, name, tag)
    await uploadImage(config, name, tag)
    await dockerRemoveImageTar(name, tag)

    const ssh = await sshConnect(config)

    await dockerLoadImage(ssh, name, tag)
    ssh.dispose()
  })
