import { defineConfig } from 'tsup'
import Unimport from 'unimport/unplugin'

const IMPORTS = [
  { name: 'default', as: 'consola', from: 'consola' },
  { name: 'default', as: 'dayjs', from: 'dayjs' },
  { name: 'default', as: 'fse', from: 'fs-extra' },
  { name: 'default', as: 'semver', from: 'semver' },
  { name: 'default', as: 'YAML', from: 'yaml' }
]

const PRESETS = [
  { from: 'pathe', imports: ['dirname', 'join', 'resolve'] },
  { from: 'pathe/utils', imports: ['filename'] },
  { from: 'consola/utils', imports: ['colors'] },
  { from: 'c12', imports: ['loadConfig'] },
  { from: 'mlly', imports: ['resolvePath'] },
  { from: 'destr', imports: ['destr'] },
  { from: 'destr', imports: ['destr'] },
  { from: 'nanoid', imports: ['nanoid'] },
  { from: 'citty', imports: ['defineCommand', 'runMain'] }
]

export default defineConfig(options => ({
  entry: ['./src'],
  format: ['esm'],
  minify: !options.watch,
  esbuildPlugins: [
    Unimport.esbuild({
      dts: true,
      imports: [...IMPORTS],
      presets: [...PRESETS],
      dirs: ['./src/**/*']
    })
  ]
}))
