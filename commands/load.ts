import { defineCommand } from 'citty'
import { checkVersion, readConf, readName, uploadImage } from '../utils/common'
import { sshConnect } from '../utils/ssh'
import { dockerLoadImage, dockerRemoveImageTar } from '../utils/docker'

export default defineCommand({
  meta: { name: 'load', description: 'Load locale image tar at service by ssh.' },
  args: {
    config: { type: 'string', alias: 'c', description: 'Declare dude config file.' },
    tag: { type: 'string', alias: 't', description: 'Target image tag.' }
  },
  async run ({ args }) {
    await checkVersion()
    const config = await readConf(args.config)
    const name = await readName(config)
    const ssh = await sshConnect(config)

    const tag = args.tag

    await uploadImage(config, name, tag)
    await dockerRemoveImageTar(name, tag)

    await dockerLoadImage(name, tag)(ssh)

    ssh.dispose()
  }
})
