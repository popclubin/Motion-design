import { execFileSync } from 'node:child_process';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { expect, test } from '@playwright/test';

const FAKE_SESSION = {
  access_token: 'fake',
  refresh_token: 'fake',
  expires_in: 3600,
  expires_at: Math.floor(Date.now() / 1000) + 3600,
  token_type: 'bearer',
  user: {
    id: '00000000-0000-0000-0000-000000000001',
    email: 'playwright@example.com',
    app_metadata: {},
    user_metadata: { full_name: 'Playwright' },
    aud: 'authenticated',
    created_at: new Date().toISOString(),
  },
};

test('exports an animation that installs and builds standalone', async ({ page }) => {
  await page.addInitScript((session) => {
    localStorage.setItem('sb-placeholder-auth-token', JSON.stringify(session));
  }, FAKE_SESSION);

  await page.goto('/editor/card-cascade');
  await expect(page.getByRole('banner').getByText('Card Cascade')).toBeVisible();

  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export' }).click();
  const download = await downloadPromise;

  const workDir = mkdtempSync(join(tmpdir(), 'motion-export-'));
  const zipPath = join(workDir, 'card-cascade.zip');
  await download.saveAs(zipPath);

  const extractDir = join(workDir, 'extracted');
  execFileSync('unzip', ['-o', zipPath, '-d', extractDir]);

  execFileSync('npm', ['install'], { cwd: extractDir, stdio: 'pipe' });
  execFileSync('npm', ['run', 'build'], { cwd: extractDir, stdio: 'pipe' });
});
