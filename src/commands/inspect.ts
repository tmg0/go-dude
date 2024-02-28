import { useContext } from '../context'

export default defineCommand({
  meta: { name: 'check', description: 'Check container status by ssh.' },
  args: {
    config: { type: 'string', alias: 'c', description: 'Declare dude config file.' }
  },
  async run () {
    const { options: config } = useContext()
    const name = config.name!
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
