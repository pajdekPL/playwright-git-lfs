import { test, expect } from '@playwright/test';

test.describe('Visual regression testing example', {tag: "@visual-regression"}, () => {
  test('should match the homepage screenshot', async ({ page }) => {
    const screenshot = 'homepage.png';

    await page.goto('/');

    // Take a screenshot of the entire page
    await expect(page).toHaveScreenshot(screenshot, {
      fullPage: true,
      // Increase the threshold to account for small rendering differences
      maxDiffPixelRatio: 0.1
    });
  });

  test('should match specific element screenshot', async ({ page }) => {
    const screenshot = 'header.png';
    const header = page.locator('h1').first();

    await page.goto('/');
    
    await expect(header).toBeVisible();
    await expect(header).toHaveScreenshot(screenshot);
  });
});
