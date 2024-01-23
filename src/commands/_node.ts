export default defineCommand({
  meta: { name: '_node', description: 'Node infomation check.' },
  args: {
    version: { type: 'string', alias: 'v', description: 'Node version.' }
  },
  async run ({ args }) {
    await checkVersion()
    if (args.version) {
      const data = await execAsync('node -v')
      consola.info(data)
    }
  }
})
