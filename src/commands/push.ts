import { program } from 'commander'
import { version } from '../../package.json'
import { checkVersion, readConf, readName } from '../shared/common'
import { sshConnect } from '../shared/ssh'
import { dockerComposeServiceImage, replaceImage } from '../shared/docker'
import { deploymentLabelSelectors, kubeGetContainers, kubeSetImage } from '../shared/k8s'

const run = async (str: any, option: any) => {
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

program.command('push')
  .version(version)
  .description('Push image to docker-compose file by ssh.')
  .argument('<string>', 'Image URL / Image tag')
  .option('-t --tag', 'Only replace image tag.')
  .option('-c --config <char>', 'Declare dude config file.')
  .action(async (str, option) => {
    await checkVersion()
    run(str, option)
  })

export default run
