export const run = async (str: any, option: any) => {
  const config = await readConf(option.config)
  const name = await readName(config)

  const ssh = await sshConnect(config)

  if (config.dockerCompose) {
    const image = await dockerComposeServiceImage(ssh, config, name)
    if (option.tag) { str = image.replace(/:.*/, `:${str}`) }
    await replaceImage(ssh, config, name, image, str)
  }

  if (config.k8s) {
    // todo: push image to k8s container
    const deploySelectors = await deploymentLabelSelectors(ssh, config)
    // const [pod] = await kubeGetPo(config, deploySelectors)(ssh)
    const [container] = await kubeGetContainers(config, deploySelectors)(ssh)
    await kubeSetImage(ssh, config, container, str)
  }

  ssh.dispose()
}

export default defineCommand({
  meta: { name: 'push', description: 'Push image to docker-compose file by ssh.' },
  args: {
    name: { type: 'positional', description: 'Image URL / Image tag', required: true },
    config: { type: 'string', alias: 'c', description: 'Declare dude config file.' },
    tag: { type: 'boolean', alias: 't', description: 'Only replace image tag.' }
  },
  async run ({ args }) {
    await checkVersion()
    run(args.name, args)
  }
})
