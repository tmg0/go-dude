#! /usr/bin/env node

import { defineCommand, runMain } from 'citty'
import { name, version } from '../package.json'

import './src/commands/push'
import './src/commands/build'
import './src/commands/check'

const main = defineCommand({
  meta: { name, version, description: 'Dude CLI' },
  subCommands: {
    push: () => import('./commands/push').then(r => r.default),
    build: () => import('./commands/build').then(r => r.default),
    check: () => import('./commands/check').then(r => r.default)
  }
})

runMain(main)
