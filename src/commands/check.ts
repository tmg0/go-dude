import { program } from 'commander'
import { version } from '../../package.json'
import { readConf, readName } from '../shared/common'
import { sshConnect } from '../shared/ssh'
import { dockerPs } from 'src/shared/docker'

program.command('check')
  .version(version)
  .description('build project')
  .option('-c --config <char>', 'Declare dude config file.')
  .action(async (option) => {
    const config = await readConf(option.config)
    const name = await readName(config)
    const ssh = await sshConnect(config)

    if (config.dockerCompose) {
      const stdout = await dockerPs(ssh, name)
      console.table(stdout.map(({ Names, Image, State, Status }) => ({ Names, Image, State, Status })))
    }

    if (config.k8s) {
      // TODO: Check k8s pod status
    }

    ssh.dispose()
  })
