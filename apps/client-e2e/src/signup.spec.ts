import { test, expect } from '@playwright/test';

test.describe('Signup Page', () => {

  test.beforeEach(async ({ page }) => {
    
    await page.goto('/signup');
  });

  test('renders the signup form', async ({ page }) => {

    await expect(page.getByRole('heading', { name: 'Create an account' })).toBeVisible();
    await expect(page.locator('input#username')).toBeVisible();
    await expect(page.locator('input#password')).toBeVisible();
    await expect(page.locator('input#confirmPassword')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Create account' })).toBeVisible();
  });

  test('validates password confirmation mismatch', async ({ page }) => {

    await page.fill('input#username', 'newuser');
    await page.fill('input#password', 'Password123');
    await page.fill('input#confirmPassword', 'DifferentPassword');


    await page.click('button[type="submit"]');


    await expect(page.locator('text=Passwords don\'t match')).toBeVisible();
  });

  test('submits the form successfully with matching passwords', async ({ page }) => {

    await page.fill('input#username', 'newuser');
    await page.fill('input#password', 'Password123');
    await page.fill('input#confirmPassword', 'Password123');


    await page.route('**/users', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ token: 'fake_token' }),
      });
    });


    await page.click('button[type="submit"]');


    await expect(page).toHaveURL('/posts');
  });

  test('displays error on failed signup request', async ({ page }) => {

  await page.fill('input#username', 'existinguser');
  await page.fill('input#password', 'Password123');
  await page.fill('input#confirmPassword', 'Password123');


  await page.route('**/users', async (route) => {
    await route.fulfill({
      status: 400,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'User already exists' }),
    });
  });


  page.on('response', async (response) => {
    console.log('Response status:', response.status(), 'Response body:', await response.json());
  });

  await page.click('button[type="submit"]');


  await expect(page.locator('text=User already exists')).toBeVisible({ timeout: 10000 });
});

});
