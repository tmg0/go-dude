#! /usr/bin/env node

import { program } from 'commander'

import './src/commands/push'

program.parse(process.argv)
