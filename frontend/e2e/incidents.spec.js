import { test, expect } from '@playwright/test';
import { resetDatabase, createIncident, clearAllIncidents, getAllIncidents } from './helpers/api.js';

// Reset database before all tests
test.beforeAll(async () => {
  await resetDatabase();
});

// ============================================
// 1. READ TESTS - Display Incidents Table
// ============================================
test.describe('1. READ - Display Incidents Table', () => {
  
  test('1.1 Table loads on page', async ({ page }) => {
    await page.goto('/');
    
    // Wait for table to be visible
    await expect(page.locator('table')).toBeVisible();
    
    // Verify at least one row exists
    const rows = page.locator('tbody tr');
    await expect(rows.first()).toBeVisible();
  });

  test('1.2 All fields visible in table headers', async ({ page }) => {
    await page.goto('/');
    
    // Check all column headers exist
    await expect(page.locator('th', { hasText: 'ID' })).toBeVisible();
    await expect(page.locator('th', { hasText: 'Timestamp' })).toBeVisible();
    await expect(page.locator('th', { hasText: 'Source IP' })).toBeVisible();
    await expect(page.locator('th', { hasText: 'Severity' })).toBeVisible();
    await expect(page.locator('th', { hasText: 'Type' })).toBeVisible();
    await expect(page.locator('th', { hasText: 'Status' })).toBeVisible();
    await expect(page.locator('th', { hasText: 'Description' })).toBeVisible();
    await expect(page.locator('th', { hasText: 'Actions' })).toBeVisible();
  });

  test('1.3 Loading state displays', async ({ page }) => {
    // Intercept API to delay response
    await page.route('**/api/incidents', async route => {
      // Wait for 500ms
      await new Promise(resolve => setTimeout(resolve, 500));
      await route.continue();
    });
    
    // Go to the main page, which will load the incident table and trigger the above route intercept
    await page.goto('/');
    
    // Check loading text appears (may be brief)
    await expect(page.locator('text=Loading incidents')).toBeVisible({ timeout: 1000 });
  });

  test('1.4 Empty state when no incidents', async ({ page }) => {
    // Clear all incidents
    await clearAllIncidents();
    
    await page.goto('/');
    
    // Check empty state message
    await expect(page.locator('text=No incidents found')).toBeVisible();
    
    // Restore test data
    await resetDatabase();
  });

  test('1.5 Error state when backend unavailable', async ({ page }) => {
    // Intercept API to return error
    await page.route('**/api/incidents', route => {
      route.fulfill({ 
        status: 500, 
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Server error' }) 
      });
    });
    
    await page.goto('/');
    
    // Check error message appears
    await expect(page.locator('text=Error')).toBeVisible();
    await expect(page.locator('text=Try again')).toBeVisible();
  });
});

// ============================================
// 2. CREATE TESTS - Add New Incident
// ============================================
test.describe('2. CREATE - Add New Incident', () => {
  
  test.beforeEach(async () => {
    await resetDatabase();
  });

  test('2.1 Open form modal', async ({ page }) => {
    await page.goto('/');
    
    // Click add button
    await page.click('button:has-text("Add Incident")');
    
    // Verify modal opens
    await expect(page.locator('h2', { hasText: 'New Incident' })).toBeVisible();
  });

  test('2.2 Required fields validation - empty form', async ({ page }) => {
    await page.goto('/');
    await page.click('button:has-text("Add Incident")');
    
    // Submit empty form
    await page.click('button:has-text("Create Incident")');
    
    // Check validation errors
    await expect(page.locator('text=Timestamp is required')).toBeVisible();
    await expect(page.locator('text=Source IP is required')).toBeVisible();
  });

  test('2.3 IP validation - invalid format', async ({ page }) => {
    await page.goto('/');
    await page.click('button:has-text("Add Incident")');
    
    // Fill timestamp first
    await page.fill('input[name="timestamp"]', '2026-02-12T10:00');
    
    // Enter invalid IP
    await page.fill('input[name="source_ip"]', '999.999.999.999');
    await page.click('button:has-text("Create Incident")');
    
    // Check IP error
    await expect(page.locator('text=Invalid IP address format')).toBeVisible();
  });

  test('2.4 IP validation - valid format accepted', async ({ page }) => {
    await page.goto('/');
    await page.click('button:has-text("Add Incident")');
    
    // Enter valid IP
    await page.fill('input[name="source_ip"]', '192.168.1.100');
    
    // No error should appear for source_ip after filling
    await expect(page.locator('text=Invalid IP address format')).not.toBeVisible();
  });

  test('2.5 Create incident successfully', async ({ page }) => {
    await page.goto('/');
    
    // Count initial rows
    await page.waitForSelector('tbody tr');
    const initialCount = await page.locator('tbody tr').count();
    
    // Open form and fill
    await page.click('button:has-text("Add Incident")');
    await page.fill('input[name="timestamp"]', '2026-02-12T10:00');
    await page.fill('input[name="source_ip"]', '10.0.0.99');
    await page.selectOption('select[name="severity"]', 'high');
    await page.selectOption('select[name="type"]', 'malware');
    await page.fill('textarea[name="description"]', 'Test incident from E2E');
    
    // Submit
    await page.click('button:has-text("Create Incident")');
    
    // Wait for modal to close
    await expect(page.locator('h2', { hasText: 'New Incident' })).not.toBeVisible();
    
    // Verify row count increased
    await expect(page.locator('tbody tr')).toHaveCount(initialCount + 1);
  });

  test('2.6 Default status is open', async ({ page }) => {
    await page.goto('/');
    await page.click('button:has-text("Add Incident")');
    
    // Check default status value
    const statusSelect = page.locator('select[name="status"]');
    await expect(statusSelect).toHaveValue('open');
  });

  test('2.7 Cancel button closes form without saving', async ({ page }) => {
    await page.goto('/');
    
    // Count initial rows
    await page.waitForSelector('tbody tr');
    const initialCount = await page.locator('tbody tr').count();
    
    // Open form and fill some data
    await page.click('button:has-text("Add Incident")');
    await page.fill('input[name="source_ip"]', '10.0.0.88');
    
    // Cancel
    await page.click('button:has-text("Cancel")');
    
    // Verify modal closed
    await expect(page.locator('h2', { hasText: 'New Incident' })).not.toBeVisible();
    
    // Verify no new row added
    await expect(page.locator('tbody tr')).toHaveCount(initialCount);
  });
});

// ============================================
// 3. UPDATE TESTS - Edit Existing Incident
// ============================================
test.describe('3. UPDATE - Edit Existing Incident', () => {
  
  test.beforeEach(async () => {
    await resetDatabase();
  });

  test('3.1 Open edit form', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('tbody tr');
    
    // Click edit on first row
    await page.click('tbody tr:first-child button:has-text("Edit")');
    
    // Verify modal opens in edit mode
    await expect(page.locator('h2', { hasText: 'Edit Incident' })).toBeVisible();
  });

  test('3.2 Data populated correctly in edit form', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('tbody tr');
    
    // Get data from first row
    const firstRowIp = await page.locator('tbody tr:first-child td:nth-child(3)').textContent();
    
    // Open edit form
    await page.click('tbody tr:first-child button:has-text("Edit")');
    
    // Verify IP is populated
    const ipInput = page.locator('input[name="source_ip"]');
    await expect(ipInput).toHaveValue(firstRowIp.trim());
  });

  test('3.3 Timestamp displays correctly (timezone test)', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('tbody tr');
    
    // Open edit form
    await page.click('tbody tr:first-child button:has-text("Edit")');
    
    // Timestamp input should have a value (not empty)
    const timestampInput = page.locator('input[name="timestamp"]');
    const value = await timestampInput.inputValue();
    expect(value).toBeTruthy();
    expect(value).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/);
  });

  test('3.4 Update single field - status', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('tbody tr');
    
    // Open edit form for first row
    await page.click('tbody tr:first-child button:has-text("Edit")');
    
    // Change status to resolved
    await page.selectOption('select[name="status"]', 'resolved');
    
    // Submit
    await page.click('button:has-text("Update Incident")');
    
    // Wait for modal to close
    await expect(page.locator('h2', { hasText: 'Edit Incident' })).not.toBeVisible();
    
    // Verify status updated in table
    await expect(page.locator('tbody tr:first-child')).toContainText('resolved');
  });

  test('3.5 Update multiple fields', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('tbody tr');
    
    // Open edit form
    await page.click('tbody tr:first-child button:has-text("Edit")');
    
    // Change severity and description
    await page.selectOption('select[name="severity"]', 'low');
    await page.fill('textarea[name="description"]', 'Updated description from E2E test');
    
    // Submit
    await page.click('button:has-text("Update Incident")');
    
    // Wait for modal to close
    await expect(page.locator('h2', { hasText: 'Edit Incident' })).not.toBeVisible();
    
    // Verify changes in table
    await expect(page.locator('tbody tr:first-child')).toContainText('low');
    await expect(page.locator('tbody tr:first-child')).toContainText('Updated description');
  });

  test('3.6 Cancel edit without saving', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('tbody tr');
    
    // Get original status
    const originalStatus = await page.locator('tbody tr:first-child td:nth-child(6)').textContent();
    
    // Open edit form
    await page.click('tbody tr:first-child button:has-text("Edit")');
    
    // Change status
    await page.selectOption('select[name="status"]', 'closed');
    
    // Cancel
    await page.click('button:has-text("Cancel")');
    
    // Verify original status unchanged
    await expect(page.locator('tbody tr:first-child td:nth-child(6)')).toContainText(originalStatus.trim());
  });

  test('3.7 Validation on edit - clear required field', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('tbody tr');
    
    // Open edit form
    await page.click('tbody tr:first-child button:has-text("Edit")');
    
    // Clear source_ip
    await page.fill('input[name="source_ip"]', '');
    
    // Submit
    await page.click('button:has-text("Update Incident")');
    
    // Check validation error
    await expect(page.locator('text=Source IP is required')).toBeVisible();
  });
});

// ============================================
// 4. DELETE TESTS - Remove Incident
// ============================================
test.describe('4. DELETE - Remove Incident', () => {
  
  test.beforeEach(async () => {
    await resetDatabase();
  });

  test('4.1 Delete shows confirmation dialog', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('tbody tr');
    
    // Set up dialog listener
    let dialogMessage = '';
    page.on('dialog', async dialog => {
      dialogMessage = dialog.message();
      await dialog.dismiss();
    });
    
    // Click delete
    await page.click('tbody tr:first-child button:has-text("Delete")');
    
    // Verify dialog appeared
    expect(dialogMessage).toContain('sure');
  });

  test('4.2 Cancel delete keeps incident', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('tbody tr');
    
    const initialCount = await page.locator('tbody tr').count();
    
    // Set up dialog to dismiss (cancel)
    page.on('dialog', dialog => dialog.dismiss());
    
    // Click delete
    await page.click('tbody tr:first-child button:has-text("Delete")');
    
    // Wait a moment for any potential deletion
    await page.waitForTimeout(500);
    
    // Verify count unchanged
    await expect(page.locator('tbody tr')).toHaveCount(initialCount);
  });

  test('4.3 Confirm delete removes incident', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('tbody tr');
    
    const initialCount = await page.locator('tbody tr').count();
    
    // Set up dialog to accept (confirm)
    page.on('dialog', dialog => dialog.accept());
    
    // Click delete
    await page.click('tbody tr:first-child button:has-text("Delete")');
    
    // Verify row count decreased
    await expect(page.locator('tbody tr')).toHaveCount(initialCount - 1);
  });

  test('4.4 Deleted incident does not reappear after refresh', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('tbody tr');
    
    // Get ID of first incident
    const firstId = await page.locator('tbody tr:first-child td:first-child').textContent();
    
    // Set up dialog to accept
    page.on('dialog', dialog => dialog.accept());
    
    // Delete first incident
    await page.click('tbody tr:first-child button:has-text("Delete")');
    
    // Wait for deletion
    await page.waitForTimeout(500);
    
    // Refresh page
    await page.reload();
    await page.waitForSelector('tbody tr');
    
    // Verify deleted ID is not in table
    const allIds = await page.locator('tbody tr td:first-child').allTextContents();
    expect(allIds).not.toContain(firstId.trim());
  });
});

// ============================================
// 5. SEVERITY COLOR-CODING TESTS
// ============================================
test.describe('5. UI - Severity Color-Coding', () => {
  
  test.beforeAll(async () => {
    await resetDatabase();
  });

  test('5.1 Critical severity has red styling', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('tbody tr');
    
    // Find critical badge
    const criticalBadge = page.locator('span:has-text("critical")').first();
    
    // Check it has red background class
    await expect(criticalBadge).toHaveClass(/bg-red/);
  });

  test('5.2 High severity has orange styling', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('tbody tr');
    
    const highBadge = page.locator('span:has-text("high")').first();
    await expect(highBadge).toHaveClass(/bg-orange/);
  });

  test('5.3 Medium severity has yellow styling', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('tbody tr');
    
    const mediumBadge = page.locator('span:has-text("medium")').first();
    await expect(mediumBadge).toHaveClass(/bg-yellow/);
  });

  test('5.4 Low severity has green styling', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('tbody tr');
    
    const lowBadge = page.locator('span:has-text("low")').first();
    await expect(lowBadge).toHaveClass(/bg-green/);
  });
});

// ============================================
// 6. TABLE DISPLAY TESTS
// ============================================
test.describe('6. UI - Table Display', () => {
  
  test.beforeAll(async () => {
    await resetDatabase();
  });

  test('6.1 Incidents sorted by ID ascending', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('tbody tr');
    
    // Get all IDs
    const ids = await page.locator('tbody tr td:first-child').allTextContents();
    const numericIds = ids.map(id => parseInt(id.trim()));
    
    // Verify sorted ascending
    const sorted = [...numericIds].sort((a, b) => a - b);
    expect(numericIds).toEqual(sorted);
  });

  test('6.2 Timestamp is human-readable', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('tbody tr');
    
    // Get first timestamp
    const timestamp = await page.locator('tbody tr:first-child td:nth-child(2)').textContent();
    
    // Should not be raw ISO format (should have spaces, slashes, or readable format)
    expect(timestamp).not.toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    // Should contain numbers (date/time parts)
    expect(timestamp).toMatch(/\d/);
  });

  test('6.3 Long description is truncated', async ({ page }) => {
    // Create incident with very long description
    await createIncident({
      timestamp: '2026-02-01 12:00:00',
      source_ip: '10.10.10.10',
      severity: 'low',
      type: 'malware',
      status: 'open',
      description: 'This is a very long description that should be truncated in the table view because it exceeds the maximum width allowed for the description column',
    });
    
    await page.goto('/');
    await page.waitForSelector('tbody tr');
    
    // Find the description cell with truncate class
    const descCell = page.locator('td.truncate').first();
    await expect(descCell).toBeVisible();
  });

  test('6.4 Row hover effect works', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('tbody tr');
    
    // Hover over first row
    const firstRow = page.locator('tbody tr:first-child');
    await firstRow.hover();
    
    // Check hover class is applied (bg-slate-50)
    await expect(firstRow).toHaveClass(/hover:bg-slate-50/);
  });

  test('6.5 Table has horizontal scroll on overflow', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('table');
    
    // Check table container has overflow-x-auto class
    const tableContainer = page.locator('.overflow-x-auto');
    await expect(tableContainer).toBeVisible();
  });
});

// ============================================
// 7. ERROR HANDLING TESTS
// ============================================
test.describe('7. Error Handling', () => {
  
  test.beforeEach(async () => {
    await resetDatabase();
  });

  test('7.1 Backend down on create shows error', async ({ page }) => {
    await page.goto('/');
    
    // Open form
    await page.click('button:has-text("Add Incident")');
    
    // Fill form
    await page.fill('input[name="timestamp"]', '2026-02-12T10:00');
    await page.fill('input[name="source_ip"]', '10.0.0.99');
    
    // Block POST request
    await page.route('**/api/incidents', route => {
      if (route.request().method() === 'POST') {
        route.fulfill({ 
          status: 500, 
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Server error' }) 
        });
      } else {
        route.continue();
      }
    });
    
    // Submit
    await page.click('button:has-text("Create Incident")');
    
    // Check error in form
    await expect(page.locator('text=Failed to create incident')).toBeVisible();
  });

  test('7.2 Backend down on update shows error', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('tbody tr');
    
    // Open edit form
    await page.click('tbody tr:first-child button:has-text("Edit")');
    
    // Block PUT request
    await page.route('**/api/incidents/*', route => {
      if (route.request().method() === 'PUT') {
        route.fulfill({ 
          status: 500, 
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Server error' }) 
        });
      } else {
        route.continue();
      }
    });
    
    // Change something and submit
    await page.selectOption('select[name="status"]', 'closed');
    await page.click('button:has-text("Update Incident")');
    
    // Check error in form
    await expect(page.locator('text=Failed to update incident')).toBeVisible();
  });

  test('7.3 Backend down on delete shows alert', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('tbody tr');
    
    // Block DELETE request
    await page.route('**/api/incidents/*', route => {
      if (route.request().method() === 'DELETE') {
        route.fulfill({ 
          status: 500, 
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Server error' }) 
        });
      } else {
        route.continue();
      }
    });
    
    // Set up dialog handlers
    let alertMessage = '';
    page.on('dialog', async dialog => {
      if (dialog.type() === 'confirm') {
        await dialog.accept();
      } else if (dialog.type() === 'alert') {
        alertMessage = dialog.message();
        await dialog.dismiss();
      }
    });
    
    // Click delete
    await page.click('tbody tr:first-child button:has-text("Delete")');
    
    // Wait for alert
    await page.waitForTimeout(1000);
    
    // Verify alert shown (or error handling occurred)
    // Note: Current implementation uses alert() for delete errors
    expect(alertMessage).toContain('Failed');
  });

  test('7.4 Try again button reloads data', async ({ page }) => {
    // First, make the request fail
    await page.route('**/api/incidents', route => {
      route.fulfill({ 
        status: 500, 
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Server error' }) 
      });
    });
    
    await page.goto('/');
    
    // Wait for error state
    await expect(page.locator('text=Try again')).toBeVisible();
    
    // Remove the route interception to allow next request to succeed
    await page.unroute('**/api/incidents');
    
    // Click try again
    await page.click('text=Try again');
    
    // Should now show data
    await expect(page.locator('table')).toBeVisible();
    await expect(page.locator('tbody tr').first()).toBeVisible();
  });
});

