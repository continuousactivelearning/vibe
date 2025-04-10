#!/usr/bin/env node
import { Command } from "commander";
import { runStart } from "./commands/start.ts";
import { runTest } from "./commands/test.ts";

const program = new Command();

program
  .name("vibe")
  .description("ViBe Project CLI")
  .version("1.0.0");

program
  .command("start")
  .description("Start frontend and backend")
  .action(runStart);

program
  .command("test")
  .description("Run backend tests and check for failures")
  .action(runTest);

program.parse(process.argv);
