import { program } from 'commander'
import { version } from '../../package.json'
import { execBuildScript, readConf, readName, uploadImage } from '../shared/common'
import { dockerBuild, dockerSaveImage, dockerRemoveImage, dockerLoadImage, dockerRemoveImageTar, dockerImageTag, dockerLogin } from '../shared/docker'
import { sshConnect } from '../shared/ssh'

program.command('build')
  .version(version)
  .description('build project')
  .option('-c --config <char>', 'Declare dude config file.')
  .action(async (_, option) => {
    const config = await readConf(option.config)
    const name = await readName(config)

    await execBuildScript(config)

    const tag = await dockerImageTag()

    if (config.repos && config.repos.length > 0) {
      await Promise.all(config.repos.map(dockerLogin))

      return
    }

    await dockerBuild(name, tag)
    await dockerSaveImage(name, tag)
    await dockerRemoveImage(name, tag)
    await uploadImage(config, name, tag)
    await dockerRemoveImageTar(name, tag)

    const ssh = await sshConnect(config)

    await dockerLoadImage(ssh, name, tag)
    ssh.dispose()
  })
