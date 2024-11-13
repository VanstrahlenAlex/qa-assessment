import { test, expect } from '@playwright/test';

test.describe('Login Page E2E Tests', () => {

  test.beforeEach(async ({ page }) => {

    await page.goto('/login');
  });

  test('renders login form with all necessary fields and elements', async ({ page }) => {

    await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible();
    await expect(page.getByPlaceholder('Username')).toBeVisible();
    await expect(page.getByPlaceholder('Password')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();
  });

  test('shows error message on invalid login', async ({ page }) => {

    await page.getByPlaceholder('Username').fill('invalidUser');
    await page.getByPlaceholder('Password').fill('wrongPassword');
    await page.getByRole('button', { name: 'Sign in' }).click();


    await expect(page.getByText('Invalid credentials')).toBeVisible();
  });

  test('successfully logs in with correct credentials', async ({ page }) => {
    // Rellena campos con datos válidos
    await page.getByPlaceholder('Username').fill('testuser');
    await page.getByPlaceholder('Password').fill('testpassword');
    await page.getByRole('button', { name: 'Sign in' }).click();


    await expect(page).toHaveURL('/posts');
  });

  test('navigates to signup page when "Create one" link is clicked', async ({ page }) => {

    await page.getByRole('link', { name: 'Create one' }).click();

    
    await expect(page).toHaveURL('/signup');
  });
});
