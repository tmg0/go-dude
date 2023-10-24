#! /usr/bin/env node

import { defineCommand, runMain } from 'citty'
import { name, version } from '../package.json'

const main = defineCommand({
  meta: { name, version, description: 'Dude CLI' },
  subCommands: {
    build: () => import('./commands/build').then(r => r.default),
    push: () => import('./commands/push').then(r => r.default),
    check: () => import('./commands/check').then(r => r.default)
  }
})

runMain(main)
