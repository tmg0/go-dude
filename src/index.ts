#!/usr/bin/env node
import { defineCommand, runMain } from 'citty'
import { description, name, version } from '../package.json'

const main = defineCommand({
  meta: { name, version, description },
  subCommands: {
    build: import('./commands/build').then(r => r.default),
    check: import('./commands/check').then(r => r.default),
    load: import('./commands/load').then(r => r.default),
    node: import('./commands/node').then(r => r.default),
    push: import('./commands/push').then(r => r.default)
  }
})

runMain(main)
