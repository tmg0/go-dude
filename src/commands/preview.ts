import buildCommand from './build'

export default defineCommand({
  meta: { name: 'build', description: 'Build project as a docker image or tar file.' },
  args: {
    config: { type: 'string', alias: 'c', description: 'Declare dude config file.' },
    platform: { type: 'string', alias: 'p', description: 'Declare target image build platform.' },
    clear: { type: 'boolean', description: 'Remove the images after build completed.' },
    tag: { type: 'string', alias: 't', description: 'Named image tag without git hash.' }
  },
  async run ({}) {
  }
})
