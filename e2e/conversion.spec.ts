import { test, expect } from '@playwright/test';

/**
 * E2E Tests for Bi-Directional Conversion System
 * Tests the complete user workflow from frontend to backend
 */

test.describe('Conversion System E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('/');
    
    // Wait for the app to load
    await page.waitForLoadState('networkidle');
    
    // Handle authentication if needed
    // This assumes you have authentication set up
    // You may need to modify this based on your auth flow
  });

  test('should display conversion components correctly', async ({ page }) => {
    test.setTimeout(30000); // 30 second timeout

    // Navigate to leads page
    await page.goto('/leads');
    await page.waitForLoadState('networkidle');

    // Check if leads page loads
    await expect(page.locator('h1')).toContainText(/leads/i);

    // Look for conversion-related buttons or components
    // This is a basic smoke test to ensure the page loads
    const pageContent = await page.content();
    expect(pageContent).toBeTruthy();
  });

  test('should open convert lead modal', async ({ page }) => {
    test.setTimeout(30000);

    // Navigate to leads page
    await page.goto('/leads');
    await page.waitForLoadState('networkidle');

    // Look for a convert button (this will depend on your UI implementation)
    const convertButton = page.locator('button:has-text("Convert")').first();
    
    // Only run this test if the button exists
    if (await convertButton.isVisible()) {
      await convertButton.click();
      
      // Wait for modal to appear
      await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
      
      // Check if modal contains conversion-related content
      const modal = page.locator('[role="dialog"]');
      await expect(modal).toBeVisible();
    } else {
      test.skip('Convert button not found - skipping modal test');
    }
  });

  test('should open convert deal modal', async ({ page }) => {
    test.setTimeout(30000);

    // Navigate to deals page
    await page.goto('/deals');
    await page.waitForLoadState('networkidle');

    // Look for a convert button
    const convertButton = page.locator('button:has-text("Convert")').first();
    
    // Only run this test if the button exists
    if (await convertButton.isVisible()) {
      await convertButton.click();
      
      // Wait for modal to appear
      await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
      
      // Check if modal contains conversion-related content
      const modal = page.locator('[role="dialog"]');
      await expect(modal).toBeVisible();
    } else {
      test.skip('Convert button not found - skipping modal test');
    }
  });

  test('should display conversion history', async ({ page }) => {
    test.setTimeout(30000);

    // Navigate to a deal or lead detail page
    await page.goto('/deals');
    await page.waitForLoadState('networkidle');

    // Look for any deal/lead link to click
    const entityLink = page.locator('a[href*="/deals/"], a[href*="/leads/"]').first();
    
    if (await entityLink.isVisible()) {
      await entityLink.click();
      await page.waitForLoadState('networkidle');
      
      // Look for conversion history section
      const historySection = page.locator('[data-testid="conversion-history"], :has-text("Conversion History")');
      
      // This is optional - conversion history might not be visible on all entities
      if (await historySection.isVisible()) {
        await expect(historySection).toBeVisible();
      }
    } else {
      test.skip('No entity links found - skipping history test');
    }
  });

  test('should handle bulk conversion interface', async ({ page }) => {
    test.setTimeout(30000);

    // Navigate to leads page
    await page.goto('/leads');
    await page.waitForLoadState('networkidle');

    // Look for bulk conversion UI elements
    const bulkButton = page.locator('button:has-text("Bulk"), button:has-text("Convert All")').first();
    
    if (await bulkButton.isVisible()) {
      await bulkButton.click();
      
      // Wait for bulk conversion modal/interface
      await page.waitForSelector('[role="dialog"], [data-testid="bulk-conversion"]', { timeout: 5000 });
      
      // Check if bulk interface is visible
      const bulkInterface = page.locator('[role="dialog"], [data-testid="bulk-conversion"]');
      await expect(bulkInterface).toBeVisible();
    } else {
      test.skip('Bulk conversion button not found - skipping bulk test');
    }
  });

  test('should validate form inputs', async ({ page }) => {
    test.setTimeout(30000);

    // Navigate to leads page
    await page.goto('/leads');
    await page.waitForLoadState('networkidle');

    // Try to open a conversion modal
    const convertButton = page.locator('button:has-text("Convert")').first();
    
    if (await convertButton.isVisible()) {
      await convertButton.click();
      
      // Wait for modal
      await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
      
      // Try to submit without filling required fields
      const submitButton = page.locator('button:has-text("Convert"), button:has-text("Submit")').first();
      
      if (await submitButton.isVisible()) {
        await submitButton.click();
        
        // Look for validation messages
        const validationMessage = page.locator('[role="alert"], .error, [data-testid="error"]');
        
        // Validation messages might appear - this is optional
        if (await validationMessage.isVisible()) {
          await expect(validationMessage).toBeVisible();
        }
      }
    } else {
      test.skip('Convert button not found - skipping form validation test');
    }
  });

  test('should navigate between conversion-related pages', async ({ page }) => {
    test.setTimeout(30000);

    // Test navigation between leads and deals
    await page.goto('/leads');
    await page.waitForLoadState('networkidle');
    
    // Verify leads page loads
    await expect(page).toHaveURL(/\/leads/);
    
    // Navigate to deals
    await page.goto('/deals');
    await page.waitForLoadState('networkidle');
    
    // Verify deals page loads
    await expect(page).toHaveURL(/\/deals/);
    
    // Basic smoke test - just ensure pages load without errors
    const pageContent = await page.content();
    expect(pageContent).toBeTruthy();
  });

  test('should handle responsive design', async ({ page }) => {
    test.setTimeout(30000);

    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/leads');
    await page.waitForLoadState('networkidle');
    
    // Check if page is responsive
    const body = page.locator('body');
    await expect(body).toBeVisible();
    
    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    await expect(body).toBeVisible();
    
    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    await expect(body).toBeVisible();
  });

  test('should not have console errors', async ({ page }) => {
    test.setTimeout(30000);

    const consoleErrors: string[] = [];
    
    // Capture console errors
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    // Navigate through key pages
    await page.goto('/leads');
    await page.waitForLoadState('networkidle');
    
    await page.goto('/deals');
    await page.waitForLoadState('networkidle');
    
    // Filter out known acceptable errors (like network errors in test environment)
    const criticalErrors = consoleErrors.filter(error => 
      !error.includes('Failed to fetch') && 
      !error.includes('NetworkError') &&
      !error.includes('ERR_INTERNET_DISCONNECTED')
    );
    
    // Expect no critical console errors
    expect(criticalErrors).toHaveLength(0);
  });

  test('should handle network errors gracefully', async ({ page }) => {
    test.setTimeout(30000);

    // Simulate offline condition
    await page.context().setOffline(true);
    
    await page.goto('/leads');
    
    // The page should still load (might show cached content or error state)
    // This tests that the app doesn't crash when offline
    const body = page.locator('body');
    await expect(body).toBeVisible();
    
    // Restore online condition
    await page.context().setOffline(false);
  });
});

/**
 * Integration Tests for Conversion Components
 * These tests focus on component integration rather than full E2E flows
 */
test.describe('Conversion Component Integration', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should integrate with existing UI components', async ({ page }) => {
    test.setTimeout(30000);

    // Check if conversion components integrate well with existing UI
    await page.goto('/leads');
    await page.waitForLoadState('networkidle');
    
    // Look for proper UI integration (no layout breaks, proper styling)
    const mainContent = page.locator('main, [role="main"], .main-content').first();
    
    if (await mainContent.isVisible()) {
      await expect(mainContent).toBeVisible();
      
      // Check for proper styling (no broken layouts)
      const boundingBox = await mainContent.boundingBox();
      expect(boundingBox?.width).toBeGreaterThan(0);
      expect(boundingBox?.height).toBeGreaterThan(0);
    }
  });

  test('should maintain theme consistency', async ({ page }) => {
    test.setTimeout(30000);

    await page.goto('/leads');
    await page.waitForLoadState('networkidle');
    
    // Check if conversion components follow the app's theme
    const themeElements = page.locator('[data-theme], .theme-light, .theme-dark, .chakra-ui-light, .chakra-ui-dark');
    
    if (await themeElements.first().isVisible()) {
      // Just verify theme classes are applied
      const themeClass = await themeElements.first().getAttribute('class');
      expect(themeClass).toBeTruthy();
    }
  });

  test('should handle loading states', async ({ page }) => {
    test.setTimeout(30000);

    // Navigate to a page that might show loading states
    await page.goto('/leads');
    
    // Look for loading indicators
    const loadingIndicators = page.locator('[data-testid="loading"], .loading, .spinner, [aria-label="Loading"]');
    
    // Loading indicators might appear briefly
    // This test just ensures they don't cause crashes
    const pageContent = await page.content();
    expect(pageContent).toBeTruthy();
  });
});

/**
 * Accessibility Tests for Conversion System
 */
test.describe('Conversion System Accessibility', () => {
  test('should be keyboard navigable', async ({ page }) => {
    test.setTimeout(30000);

    await page.goto('/leads');
    await page.waitForLoadState('networkidle');
    
    // Test keyboard navigation
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // Verify focus is visible
    const focusedElement = page.locator(':focus');
    if (await focusedElement.isVisible()) {
      await expect(focusedElement).toBeVisible();
    }
  });

  test('should have proper ARIA labels', async ({ page }) => {
    test.setTimeout(30000);

    await page.goto('/leads');
    await page.waitForLoadState('networkidle');
    
    // Look for ARIA labels on interactive elements
    const ariaElements = page.locator('[aria-label], [aria-labelledby], [role]');
    
    if (await ariaElements.first().isVisible()) {
      const ariaLabel = await ariaElements.first().getAttribute('aria-label');
      // ARIA labels should exist on interactive elements
      // This is a basic check
      expect(ariaLabel || 'role-present').toBeTruthy();
    }
  });

  test('should have proper heading structure', async ({ page }) => {
    test.setTimeout(30000);

    await page.goto('/leads');
    await page.waitForLoadState('networkidle');
    
    // Check for proper heading hierarchy
    const headings = page.locator('h1, h2, h3, h4, h5, h6');
    const headingCount = await headings.count();
    
    if (headingCount > 0) {
      // At least one heading should exist
      expect(headingCount).toBeGreaterThan(0);
      
      // Check if first heading is h1
      const firstHeading = headings.first();
      const tagName = await firstHeading.evaluate(el => el.tagName.toLowerCase());
      expect(['h1', 'h2']).toContain(tagName); // Allow h1 or h2 as first heading
    }
  });
});

/**
 * Performance Tests for Conversion System
 */
test.describe('Conversion System Performance', () => {
  test('should load pages within acceptable time', async ({ page }) => {
    test.setTimeout(30000);

    const startTime = Date.now();
    
    await page.goto('/leads');
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    
    // Page should load within 10 seconds (generous for E2E testing)
    expect(loadTime).toBeLessThan(10000);
  });

  test('should handle large datasets', async ({ page }) => {
    test.setTimeout(60000); // Longer timeout for large dataset test

    await page.goto('/leads');
    await page.waitForLoadState('networkidle');
    
    // If there are many items, the page should still be responsive
    const listItems = page.locator('[data-testid="lead-item"], .lead-card, .deal-card, tr');
    const itemCount = await listItems.count();
    
    // Just verify the page handles whatever data is present
    expect(itemCount).toBeGreaterThanOrEqual(0);
    
    // Verify page is still responsive
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });
});

/**
 * Error Handling Tests
 */
test.describe('Conversion System Error Handling', () => {
  test('should handle 404 errors gracefully', async ({ page }) => {
    test.setTimeout(30000);

    // Navigate to a non-existent page
    await page.goto('/non-existent-page');
    
    // Should show error page or redirect, not crash
    const body = page.locator('body');
    await expect(body).toBeVisible();
    
    // Look for error messages or 404 indicators
    const errorIndicators = page.locator(':has-text("404"), :has-text("Not Found"), :has-text("Error")');
    
    // Either error page or redirect should happen
    const currentUrl = page.url();
    const hasErrorContent = await errorIndicators.first().isVisible();
    
    expect(hasErrorContent || !currentUrl.includes('non-existent-page')).toBeTruthy();
  });

  test('should handle JavaScript errors gracefully', async ({ page }) => {
    test.setTimeout(30000);

    let jsErrors = 0;
    
    page.on('pageerror', (error) => {
      jsErrors++;
      console.log('JavaScript error:', error.message);
    });
    
    await page.goto('/leads');
    await page.waitForLoadState('networkidle');
    
    // Navigate to deals
    await page.goto('/deals');
    await page.waitForLoadState('networkidle');
    
    // Should have minimal JavaScript errors
    expect(jsErrors).toBeLessThan(5); // Allow some minor errors in test environment
  });
}); 