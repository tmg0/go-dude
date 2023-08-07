#! /usr/bin/env node

import { program } from 'commander'

import './src/commands/push'
import './src/commands/build'
import './src/commands/check'

program.parse(process.argv)
