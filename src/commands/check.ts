import { program } from 'commander'
import { version } from '../../package.json'
import { checkVersion, readConf, readName } from '../shared/common'
import { sshConnect } from '../shared/ssh'
import { deploymentLabelSelectors, kubeGetPo } from '../shared/k8s'
import { dockerPs } from '../shared/docker'

program.command('check')
  .version(version)
  .description('build project')
  .option('-c --config <char>', 'Declare dude config file.')
  .action(async (option) => {
    await checkVersion()
    const config = await readConf(option.config)
    const name = await readName(config)
    const ssh = await sshConnect(config)

    if (config.dockerCompose) {
      const stdout = await dockerPs(ssh, name)
      console.table(stdout.map(({ Names, Image, State, Status }) => ({ Names, Image, State, Status })))
    }

    if (config.k8s) {
      // TODO: Check k8s pod status
      const deploySelectors = await deploymentLabelSelectors(ssh, config)
      const stdout = await kubeGetPo(ssh, config, deploySelectors)
      console.table(stdout.map(({ name: Names, image: Image, state }) => {
        const [State] = Object.keys(state)
        const Status = Object.entries(state[State]).map(([key, value]) => `${key}: ${value}`).join(',')

        return {
          Names,
          Image,
          State,
          Status
        }
      }))
    }

    ssh.dispose()
  })
