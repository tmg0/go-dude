#! /usr/bin/env node

import { program } from 'commander'

import './src/commands/push'
import './src/commands/build'

program.parse(process.argv)
