#!/usr/bin/env node

import { Command } from 'commander';

const program = new Command();

program
  .name('Eagle-Cooler')
  .description('Providing support for Eagle (WIP)')
  .version('1.0.0');

program.parse();
