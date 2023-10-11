import { program } from 'commander'
import { version } from '../../package.json'
import { checkVersion, readConf, readName, uploadImage } from '../shared/common'
import { sshConnect } from '../shared/ssh'
import { dockerLoadImage, dockerRemoveImageTar } from '../shared/docker'

program.command('check')
  .version(version)
  .description('load locale image tar')
  .option('-t --tag', 'Only replace image tag.')
  .option('-c --config <char>', 'Declare dude config file.')
  .action(async (option) => {
    await checkVersion()
    const config = await readConf(option.config)
    const name = await readName(config)
    const ssh = await sshConnect(config)

    const tag = option.tag

    await uploadImage(config, name, tag)
    await dockerRemoveImageTar(name, tag)

    await dockerLoadImage(name, tag)(ssh)

    ssh.dispose()
  })
