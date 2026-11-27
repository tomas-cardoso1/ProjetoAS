import { spawn, spawnSync, type ChildProcess } from 'node:child_process';
import { resolve } from 'node:path';
import { backendDirectory } from './support';

const frontendDirectory = resolve(backendDirectory, '../frontend');
const apiUrl = 'http://127.0.0.1:3001/api/health';
const frontendUrl = 'http://127.0.0.1:5174';

export default async function globalSetup(): Promise<() => Promise<void>> {
  const reset = spawnSync(process.execPath, ['dist/dbReset.js'], {
    cwd: backendDirectory,
    stdio: 'inherit',
    windowsHide: true,
  });
  if (reset.error) throw reset.error;
  if (reset.status !== 0) throw new Error('db:reset falhou antes dos testes E2E.');

  let api: ChildProcess | undefined;
  let frontend: ChildProcess | undefined;

  try {
    api = spawn(process.execPath, ['dist/server.js'], {
      cwd: backendDirectory,
      env: { ...process.env, PORT: '3001' },
      stdio: 'ignore',
      windowsHide: true,
    });
    await waitForUrl(apiUrl, api);

    frontend = spawn(
      process.execPath,
      ['node_modules/vite/bin/vite.js', '--host', '127.0.0.1', '--port', '5174', '--strictPort'],
      {
        cwd: frontendDirectory,
        env: { ...process.env, API_PROXY_TARGET: 'http://127.0.0.1:3001' },
        stdio: 'ignore',
        windowsHide: true,
      },
    );
    await waitForUrl(frontendUrl, frontend);
  } catch (error) {
    await stopProcess(frontend);
    await stopProcess(api);
    throw error;
  }

  return async () => {
    await stopProcess(frontend);
    await stopProcess(api);
  };
}

async function waitForUrl(url: string, child: ChildProcess): Promise<void> {
  const deadline = Date.now() + 30_000;

  while (Date.now() < deadline) {
    if (child.exitCode !== null) {
      throw new Error(`O servidor de teste terminou com o código ${child.exitCode}: ${url}`);
    }

    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(1000) });
      if (response.ok) return;
    } catch {
      // Os servidores ainda podem estar a iniciar.
    }

    await new Promise((resolveDelay) => setTimeout(resolveDelay, 200));
  }

  throw new Error(`Tempo limite ao iniciar o servidor de teste: ${url}`);
}

async function stopProcess(child: ChildProcess | undefined): Promise<void> {
  if (!child || child.exitCode !== null || child.signalCode !== null) return;

  const exited = new Promise<void>((resolveExit) => child.once('exit', () => resolveExit()));
  if (process.platform === 'win32' && child.pid) {
    spawnSync('taskkill', ['/PID', String(child.pid), '/T', '/F'], {
      stdio: 'ignore',
      windowsHide: true,
    });
  } else {
    child.kill('SIGTERM');
  }

  await Promise.race([
    exited,
    new Promise<void>((resolveTimeout) => setTimeout(resolveTimeout, 3000)),
  ]);
}
