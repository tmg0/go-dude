export default defineCommand({
  meta: { name: 'load', description: 'Load locale image tar at service by ssh.' },
  args: {
    config: { type: 'string', alias: 'c', description: 'Declare dude config file.' },
    tag: { type: 'string', alias: 't', description: 'Target image tag.' }
  },
  async run ({ args }) {
    const config = await readConf(args.config)
    const name = await readName(config)
    const ssh = await sshConnect(config)

    const tag = args.tag

    await uploadImage(config, name, tag)
    await dockerRemoveImageTar(name, tag)

    await dockerLoadImage(name, tag)(ssh)

    ssh.dispose()
  }
})
