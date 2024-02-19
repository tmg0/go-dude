import { defineCommand, runMain as _runMain } from 'citty'
import { description, name, version } from '../package.json'

const main = defineCommand({
  meta: { name, version, description },
  subCommands: {
    build: import('./commands/build').then(r => r.default),
    check: import('./commands/check').then(r => r.default),
    load: import('./commands/load').then(r => r.default),
    push: import('./commands/push').then(r => r.default)
  }
})

export const runMain = () => _runMain(main)
