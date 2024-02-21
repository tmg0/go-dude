import { run as push } from './push'

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
  if (!sshExist(config)) { return }
  const confirmed = await consola.prompt(`Push ${image} to ${config.ssh.host}?`, {
    type: 'confirm'
  })
  if (confirmed) { await push(image, { ...option, tag: undefined }) }
}

export default defineCommand({
  meta: { name: 'build', description: 'Build project as a docker image or tar file.' },
  args: {
    config: { type: 'string', alias: 'c', description: 'Declare dude config file.' },
    platform: { type: 'string', alias: 'p', description: 'Declare target image build platform.' },
    tag: { type: 'string', alias: 't', description: 'Named image tag without git hash.' }
  },
  async run ({ args: option }) {
    await isDockerRunning()
    const config = await readConf(option.config)
    const name = await readName(config)

    if (config.build?.script) { await execBuildScript(config) }

    let tag = option?.tag

    if (!tag) {
      tag = await generteImageTagFromGitCommitHash()
    }

    let image: string | undefined = await dockerBuild(name, tag, option?.platform)

    if (config.repos && config.repos.length > 0) {
      await dockerTag(config, name, tag)
      await dockerLogin(config)
      const images = await dockerPush(config, name, tag)
      await dockerRemoveImage(config, name, tag)()

      image = await selectImage(config, images)
      await pushImage(config, image, option)

      return
    }

    await dockerSaveImage(name, tag)
    await dockerRemoveImage(config, name, tag)()

    await pushImage(config, image, option)
  }
})
