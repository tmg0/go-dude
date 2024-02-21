import { defineCommand, runMain as _runMain } from 'citty'
import { description, version } from '../package.json'
import { checkVersion } from './utils/npm'

const main = defineCommand({
  meta: { name: 'dude', version, description },
  subCommands: {
    build: import('./commands/build').then(r => r.default),
    check: import('./commands/check').then(r => r.default),
    load: import('./commands/load').then(r => r.default),
    push: import('./commands/push').then(r => r.default)
  },
  async setup () {
    await checkVersion()
  }
})

export const runMain = () => _runMain(main)
