import { program } from 'commander'
import { version } from '../../package.json'
import { readConf, readName } from '../shared/common'
import { sshConnect } from '../shared/ssh'
import { dockerComposeServiceImage, replaceImage } from '../shared/docker'

program.command('push')
  .version(version)
  .description('Push image to docker-compose file by ssh.')
  .argument('<string>', 'Image URL / Image tag')
  .option('-t --tag', 'Only replace image tag.')
  .option('-c --config <char>', 'Declare dude config file.')
  .action(async (str, option) => {
    const config = await readConf(option.config)
    const name = await readName(config)

    const ssh = await sshConnect(config)

    const image = await dockerComposeServiceImage(ssh, config, name)

    if (option.tag) { str = image.replace(/:.*/, `:${str}`) }

    await replaceImage(ssh, config, name, image, str)
    ssh.dispose()
  })
