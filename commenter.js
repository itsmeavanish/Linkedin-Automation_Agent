const { chromium } = require('playwright');

async function commentOnPost(postUrl, commentText) {
  const browser = await chromium.launch({
    headless: false,
    slowMo: 120,
  });

  const context = await browser.newContext({
    storageState: 'linkedin-session.json', // Ensure this file is valid
  });

  const page = await context.newPage();

  try {
    // 1) Open post
    await page.goto(postUrl, {
      waitUntil: 'domcontentloaded',
      timeout: 60000,
    });

    await page.waitForTimeout(4000 + Math.random() * 4000);

    // 2) Scroll to post
    await page.mouse.wheel(0, 600);
    await page.waitForTimeout(1500);

    // 3) Click "Comment" action (The button under the post to open the box)
    const commentAction = page.locator('button[aria-label*="Comment"]').first();
    await commentAction.waitFor({ timeout: 20000 });
    await commentAction.click();

    // 4) Wait for editor
    const editor = page.locator('div[role="textbox"]');
    await editor.waitFor({ timeout: 20000 });
    await editor.click();

    // 5) Type comment
    for (const char of commentText) {
      await page.keyboard.type(char, {
        delay: 40 + Math.random() * 80,
      });
    }

    // Wait for the UI to register the text input (crucial for enabling the button)
    await page.waitForTimeout(2000 + Math.random() * 2000);

    // 6) Click enabled blue "Comment/Post" submit button
    // FIX: Target the Primary (Blue) button specifically
    const submitButton = page.locator('button.artdeco-button--primary').filter({ 
      hasText: /Post|Comment/ 
    });

    // Wait for it to be actionable
    await submitButton.waitFor({ state: 'visible', timeout: 15000 });
    
    // Double check it isn't disabled
    if (await submitButton.isDisabled()) {
        console.log("Submit button is disabled. Retrying input...");
        await editor.press('Space'); // Trigger a change event
        await page.waitForTimeout(1000);
    }

    await submitButton.click();
    console.log("Comment submitted successfully.");

    // 7) Confirm / Wait for network request to finish
    await page.waitForTimeout(4000);

  } catch (error) {
    console.error("Error posting comment:", error);
  } finally {
    await browser.close();
  }
}

module.exports = { commentOnPost };