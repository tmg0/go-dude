import { defineCommand } from 'citty'
import { checkVersion, readConf, readName } from '../shared/common'
import { sshConnect } from '../shared/ssh'
import { deploymentLabelSelectors, kubeGetPo } from '../shared/k8s'
import { dockerPs } from '../shared/docker'

export default defineCommand({
  meta: { name: 'check', description: 'Check container status by ssh.' },
  args: {
    config: { type: 'string', alias: 'c', description: 'Declare dude config file.' }
  },
  async run ({ args }) {
    await checkVersion()
    const config = await readConf(args.config)
    const name = await readName(config)
    const ssh = await sshConnect(config)

    if (config.dockerCompose) {
      const stdout = await dockerPs(name)(ssh)
      console.table(stdout.map(({ Names, Image, State, Status }) => ({ Names, Image, State, Status })))
    }

    if (config.k8s) {
      // TODO: Check k8s pod status
      const deploySelectors = await deploymentLabelSelectors(ssh, config)
      const stdout = await kubeGetPo(config, deploySelectors)(ssh)
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
  }
})
