import fse from 'fs-extra'

export const isNode = (): Promise<boolean> => {
  return fse.pathExists(join(process.cwd(), 'package.json'))
}
