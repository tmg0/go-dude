
import { program } from 'commander'
import { nanoid } from 'nanoid'
import { join } from 'pathe'
import { version } from '../../package.json'
import { execAsync, existDockerfile, readConf, readName } from '../utils'

program.command('build')
  .version(version)
  .description('build project')
  .option('-c --config <char>', 'Declare dude config file.')
  .action(async (_, option) => {
    const config = await readConf(option.config)
    const name = await readName(config)

    await execAsync(config.build.script)

    const tag = nanoid()
    const img = `${name}:${tag}`

    const cwd = process.cwd()

    await execAsync(existDockerfile() ? `docker build -f ${cwd}/Dockerfile -t ${img} .` : `docker build -t ${img} .`)

    await execAsync(`docker save -o ${join(process.cwd(), 'images', `${img}.tar`)} ${img}`)
  })
