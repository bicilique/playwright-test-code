import fs from 'fs';
import { test } from '@playwright/test';
import { loginWithTwitter, commentOnCoin } from '../utils/pumpfunActions.js';
import { loadCSV } from '../utils/csvLoader.js';

// Set a global timeout for all tests (e.g., 180 seconds)
test.setTimeout(180000);

const rows = loadCSV('coins.csv');

// Collect failed accounts in memory
let failedAccounts = [];

for (const { username, email, password, coin, comment } of rows) {
  test(`user ${username} posts comment on coin`, async ({ page }) => {
    try {
      await page.goto('https://pump.fun/board');

      // Login with Twitter credentials from CSV
      await loginWithTwitter(page, username, email, password);

      // Wait for redirect to pump.fun/board after login
      await page.waitForURL('https://pump.fun/board', { timeout: 20000 });

      // Build full coin URL from coin ID in CSV
      const coinUrl = `https://pump.fun/coin/${coin}`;
      await page.goto(coinUrl);

      // Post comment
      await commentOnCoin(page, coin, comment);
    } catch (err) {
      // Collect failed account in memory
      failedAccounts.push({ username, email, password, coin, comment });
      console.error(`Failed for ${username}:`, err);
    }
  });
}

// After all tests, write failed accounts to CSV
// Playwright runs this after all tests complete
test.afterAll(async () => {
  const failedAccountsFile = 'failed_accounts.csv';
  const header = 'username,email,password,coin,comment\n';
  let content = header;
  for (const acc of failedAccounts) {
    content += `${acc.username},${acc.email},${acc.password},${acc.coin},${acc.comment}\n`;
  }
  fs.writeFileSync(failedAccountsFile, content);
});
