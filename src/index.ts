#!/usr/bin/env node
import { defineCommand, runMain } from 'citty'
import { description, name, version } from '../package.json'

const main = defineCommand({
  meta: { name, version, description },
  subCommands: {
    build: import('./commands/build.ts').then(r => r.default),
    check: import('./commands/check.ts').then(r => r.default),
    load: import('./commands/load.ts').then(r => r.default),
    node: import('./commands/node.ts').then(r => r.default),
    push: import('./commands/push.ts').then(r => r.default)
  }
})

runMain(main)
