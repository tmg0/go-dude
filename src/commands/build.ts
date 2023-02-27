
import { program } from 'commander'
import { version } from '../../package.json'
import { execAsync, getDockerfilePath, readConf, readName } from '../utils'

program.command('build')
  .version(version)
  .description('build project')
  .option('-c --config <char>', 'Declare dude config file.')
  .action(async (_, option) => {
    const config = await readConf(option.config)
    const name = await readName(config)

    await execAsync(config.build.script)

    await execAsync(`docker build -t ${name} ${await getDockerfilePath()}`)
  })
