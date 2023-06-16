import { program } from 'commander'
import consola from 'consola'
import { version } from '../../package.json'
import { readConf } from '../shared/common'
import { sshConnect } from '../shared/ssh'
import { kubeExecAsync } from 'src/shared/k8s'

program.command('kubectl')
  .version(version)
  .description('kubectl proxy')
  .argument('<string...>', 'k8s cmd')
  .option('-c --config <char>', 'Declare dude config file.')
  .action(async (str, option) => {
    const config = await readConf(option.config)

    const ssh = await sshConnect(config)

    consola.info(await kubeExecAsync(ssh, config, str.join(' ')))

    ssh.dispose()
  })
