import { defineCommand, runMain as _runMain } from 'citty'
import { description, version } from '../package.json'
import { checkUpdates } from './utils/npm'
import { setupRPC } from './server-rpc'

const main = defineCommand({
  meta: { name: 'dude', version, description },
  subCommands: {
    build: import('./commands/build').then(r => r.default),
    push: import('./commands/push').then(r => r.default),
    inspect: import('./commands/inspect').then(r => r.default)
  },
  async setup () {
    await checkUpdates()
    setupRPC()
  }
})

export const runMain = () => _runMain(main)
