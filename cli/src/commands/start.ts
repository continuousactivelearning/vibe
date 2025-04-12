import { spawn } from "child_process";
import os from "os";
import path from "path";
import { cwd, chdir } from "process";

function findProjectRoot(): string | null {
  const currentPath = cwd();
  const segments = currentPath.split(path.sep);
  const vibeIndex = segments.lastIndexOf("vibe");

  if (vibeIndex === -1) {
    return null;
  }

  // Reconstruct path up to /vibe
  const rootPath = segments.slice(0, vibeIndex + 1).join(path.sep);
  return rootPath;
}

function runProcess(name: string, cwd: string) {
  return new Promise((resolve, reject) => {
    console.log(`⏳ Starting ${name} in ${cwd}...`);

    const isWindows = os.platform() === "win32";
    const proc = spawn("pnpm", ["run", "dev"], {
      cwd,
      stdio: "inherit",
      shell: isWindows // shell: true required for Windows
    });

    proc.on("exit", (code) => {
      if (code === 0) {
        console.log(`✅ ${name} exited cleanly.`);
        resolve(true);
      } else {
        console.error(`❌ ${name} exited with code ${code}`);
        reject(new Error(`${name} failed`));
      }
    });
  });
}

export async function runStart() {
  console.log("🚀 Launching backend and frontend...");

  const root = findProjectRoot();

  if (!root) {
    console.error("❌ Please run this command from within the vibe project directory.");
    process.exit(1);
  }

  const backendDir = path.join(root, "backend");
  const frontendDir = path.join(root, "frontend");

  try {
    await Promise.all([
      runProcess("Backend", backendDir),
      runProcess("Frontend", frontendDir)
    ]);
  } catch (err) {
    console.error("❌ One or more services failed to start.");
    process.exit(1);
  }
}
