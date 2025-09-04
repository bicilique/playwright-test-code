import { expect } from '@playwright/test';

// Login with Twitter using provided credentials
export async function loginWithTwitter(page, username, email, password) {
  await page.locator('[data-test-id="how-it-works-button"]').click();
  await page.getByRole('button', { name: 'Log in' }).click();
  await page.getByRole('button', { name: 'login with email or socials' }).click();
  await page.getByRole('button', { name: 'Twitter' }).click();
  await page.locator('label div').nth(3).click();
  await page.getByRole('textbox', { name: 'Phone, email, or username' }).click();
  await page.getByRole('textbox', { name: 'Phone, email, or username' }).fill(username);
  await page.getByRole('button', { name: 'Next' }).click();

  // Detect email field after username (testId only)
  const emailField = page.getByTestId('ocfEnterTextTextInput');
  if (await emailField.waitFor({ state: 'visible', timeout: 5000 }).then(() => true).catch(() => false)) {
    await page.waitForTimeout(300); // Short delay for UI stability
    await emailField.click();
    await emailField.fill(email);
    await page.getByTestId('ocfEnterTextNextButton').click();
  }

  await page.getByRole('textbox', { name: 'Password Reveal password' }).click();
  await page.getByRole('textbox', { name: 'Password Reveal password' }).fill(password);
  await page.getByTestId('LoginForm_Login_Button').click();
  await page.getByTestId('OAuth_Consent_Button').click();
}

// Search for coin
export async function searchCoin(page, coinName) {
  await page.getByRole('textbox', { name: 'Search...' }).click();
  await page.getByRole('textbox', { name: 'Search...' }).fill(coinName);
  await page.getByRole('button', { name: 'Search' }).click();
  // Accept cookies if present
  const acceptBtn = page.getByRole('button', { name: 'Accept All' });
  if (await acceptBtn.isVisible()) {
    await acceptBtn.click();
  }
  // Wait for search results to load
  await page.waitForTimeout(3000); // Wait 3 seconds for results
}

// Comment on coin
export async function commentOnCoin(page, coinName, commentText) {
  console.log('Clicking Add a comment... textbox...');
  await page.getByRole('textbox', { name: 'Add a comment...' }).click();
  await page.waitForTimeout(1000 + Math.floor(Math.random() * 1000)); // 1-2s delay

  console.log('Clicking comment textbox...');
  await page.getByRole('textbox', { name: 'comment' }).click();
  await page.waitForTimeout(800 + Math.floor(Math.random() * 700)); // 0.8-1.5s delay

  console.log('Typing comment...');
  const commentBox = page.getByRole('textbox', { name: 'comment' });
  for (const char of commentText) {
    await commentBox.type(char);
    await page.waitForTimeout(80 + Math.floor(Math.random() * 120)); // 80-200ms per char
  }
  await page.waitForTimeout(1000 + Math.floor(Math.random() * 1000)); // 1-2s delay

  console.log('Clicking Post reply button...');
  await page.getByRole('button', { name: 'Post reply' }).click();
  await page.waitForTimeout(2000 + Math.floor(Math.random() * 2000)); // 2-4s delay

  console.log('Comment posted, checking visibility...');
  await page.waitForTimeout(10000);  // Wait for comment to appear
}
