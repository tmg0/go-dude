
import pacote from 'pacote'
import packageJson from '../../package.json'

export const checkForUpdateOf = async (name: string, current?: string) => {
  if (!current) { current = packageJson.version }

  let needsUpdate = false
  let latest = current

  try {
    const manifest = await pacote.packument(name)
    latest = manifest['dist-tags'].latest
    needsUpdate = latest !== current && semver.lt(current, latest)
  } catch {
    consola.warn(`Cannot fetch the version of ${name} by npm.`)
  }

  return {
    name,
    current,
    latest,
    needsUpdate
  }
}

export const checkUpdates = async () => {
  const { name, current, latest, needsUpdate } = await checkForUpdateOf(packageJson.name)
  if (needsUpdate) {
    consola.box(`Update available! ${colors.red(current)} → ${colors.green(latest)}.\nRun "${colors.magenta(`npm install -g ${name}`)}" to update.`)
  }
}
