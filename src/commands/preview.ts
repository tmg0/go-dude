export default defineCommand({
  meta: { name: 'build', description: 'Build project as a docker image or tar file.' },
  args: {
    config: { type: 'string', alias: 'c', description: 'Declare dude config file.' }
  },
  async run () {
  }
})
