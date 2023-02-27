
import { program } from 'commander'
import { nanoid } from 'nanoid'
import { version } from '../../package.json'
import { execAsync, dockerBuild, dockerSaveImage, readConf, readName, dockerRemoveImage, uploadImage } from '../utils'

program.command('build')
  .version(version)
  .description('build project')
  .option('-c --config <char>', 'Declare dude config file.')
  .action(async (_, option) => {
    const config = await readConf(option.config)
    const name = await readName(config)

    await execAsync(config.build.script)

    const tag = nanoid()

    await dockerBuild(name, tag)
    await dockerSaveImage(name, tag)
    await dockerRemoveImage(name, tag)
    await uploadImage(config, name, tag)
  })
