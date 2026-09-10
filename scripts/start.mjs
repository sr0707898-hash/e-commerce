import { spawn } from "node:child_process";
import { existsSync } from "node:fs";

const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
const serverScript = existsSync(".env") ? "server" : "server:no-env";
const spawnOptions = { stdio: "inherit", shell: process.platform === "win32" };
const server = spawn(npmCommand, ["run", serverScript], spawnOptions);
const frontend = spawn(npmCommand, ["run", "dev", "--", "--open"], spawnOptions);

const stopChildren = () => {
  if (!server.killed) server.kill();
  if (!frontend.killed) frontend.kill();
};

process.on("SIGINT", stopChildren);
process.on("SIGTERM", stopChildren);

server.on("exit", (code) => {
  if (code && !frontend.killed) frontend.kill();
});

frontend.on("exit", (code) => {
  if (code && !server.killed) server.kill();
});