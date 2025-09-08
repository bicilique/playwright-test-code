import { chromium, test } from '@playwright/test';
import fs from 'fs';
import { loadCSV } from '../utils/csvLoader.js';
import proxyManager from '../utils/proxyManager.js';
import { commentOnCoin, loginWithTwitter } from '../utils/pumpfunActions.js';

// Set a global timeout for all tests (e.g., 180 seconds)
test.setTimeout(240000);

const rows = loadCSV('coins.csv');

// Collect failed accounts in memory
let failedAccounts = [];

// Initialize proxy manager once before all tests
test.beforeAll(async () => {
  test.setTimeout(240000);
  console.log('🚀 Initializing proxy manager...');
  await proxyManager.initialize();
  console.log(`✅ Ready with ${proxyManager.getProxyCount()} working proxies`);
});

for (const { username, email, password, coin, comment } of rows) {
  test(`user ${username} posts comment on coin`, async () => {
    let browser;
    let page;

    try {
      // Get current proxy (rotates every 5 requests automatically)
      const proxy = proxyManager.getCurrentProxy();
      console.log(`🌐 Using proxy: ${proxy.proxy.ip}:${proxy.proxy.port} (IP: ${proxy.ip})`);
      console.log(`📊 Request ${proxyManager.getCurrentRequestCount() + 1}/${proxyManager.getRotationInterval()}`);

      // TLDR; 
      // Launch browser on this context to initialize proxy on request (need to research if pw can inject proxy without this.)

      browser = await chromium.launch({
        proxy: {
          server: `http://${proxy.proxy.ip}:${proxy.proxy.port}`,
          username: proxy.proxy.username,
          password: proxy.proxy.password,
        },
        headless: true,
      });

      const context = await browser.newContext();
      page = await context.newPage();

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

      console.log(`✅ Successfully completed for ${username}`);

      // Rotate proxy after successful request
      proxyManager.rotateProxy();

    } catch (err) {
      // Collect failed account in memory
      failedAccounts.push({ username, email, password, coin, comment });
      console.error(`❌ Failed for ${username}:`, err.message);

      // Rotate proxy on failure, in case account failure is caused by proxy.
      proxyManager.rotateProxy();
    } finally {
      // Clean up browser
      if (browser) {
        await browser.close();
      }
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
