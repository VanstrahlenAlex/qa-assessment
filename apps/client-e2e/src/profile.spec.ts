import { test, expect } from '@playwright/test';

test.describe('UserProfile Page', () => {

  
  test.beforeEach(async ({ context }) => {
    await context.addInitScript(() => {
      window.localStorage.setItem('session', JSON.stringify({ userId: 'user123' }));
    });
  });

  test('renders user profile information', async ({ page }) => {
    await page.route('**/users/*', async (route) => {
      console.log("Interceptando petición:", route.request().url());
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'user123',
          username: 'testuser',
          favoriteBook: {
            title: 'Moby Dick',
            author_name: ['Herman Melville'],
          },
        }),
      });
    });

    await page.goto('/profile');
    await page.waitForTimeout(1000);

    const profileText = page.locator('text=Moby Dick by Herman Melville');
    await expect(profileText).toBeVisible();
  });

  test('handles error in loading user profile', async ({ page }) => {
    await page.route('**/users/*', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Internal server error' }),
      });
    });

    await page.goto('/profile');
    await page.waitForTimeout(1000);

    const errorMessage = page.locator('text=Error loading profile');
    await expect(errorMessage).toBeVisible();
  });

  test('allows editing favorite book', async ({ page }) => {
  await page.route('**/users/*', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: 'user123',
        username: 'testuser',
        favoriteBook: null,
      }),
    });
  });

  await page.goto('/profile');
  await page.waitForTimeout(1000);

  const noFavoriteText = page.locator('text=No favorite book selected');
  await expect(noFavoriteText).toBeVisible();


  const editButton = page.locator('[data-testid="edit-button-favorite-book"]');
  await editButton.click();

  await page.route('**/books/search*', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([{ key: 'book123', title: 'The Waves', author_name: ['Virginia Woolf'] }]),
    });
  });


  const bookOption = page.locator('[data-testid="edit-button-favorite-book"]');
  await bookOption.click();

  await page.waitForTimeout(1000);


  const selectedBookText = page.locator('[data-testid="favorite-book-author"]');
  await expect(selectedBookText).toBeVisible();



  });

});
