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
    
    await page.goto('/');
    
    // Remove the gradient-text class from the span
    await page.evaluate(() => {
      const element = document.querySelector('span.gradient-text');
      if (element) {
        element.classList.remove('gradient-text');
      }
    });

    const header = page.locator('h1:has-text("QA Playground")');
    await expect(header).toBeVisible();
    await expect(header).toHaveScreenshot(screenshot);
  });
});
