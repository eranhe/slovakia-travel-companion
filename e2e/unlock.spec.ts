import { test, expect } from '@playwright/test'

test('checks the hardcoded password and opens the trip', async ({ page }) => {
  await page.goto('/#/unlock')
  await expect(
    page.getByRole('heading', { name: /Our family trip|הטיול המשפחתי שלנו/ }),
  ).toBeVisible()
  await expect(page.locator('#password')).toBeVisible()
  await expect(page.getByText(/Demo mode|מצב הדגמה/)).toHaveCount(0)
  await expect(page.getByText(/Import backup|ייבוא גיבוי/)).toHaveCount(0)

  await page.locator('#password').fill('wrong')
  await page.getByRole('button', { name: /Enter|כניסה/ }).click()
  await expect(page.getByRole('alert')).toBeVisible()

  await page.locator('#password').fill('hersko')
  await page.getByRole('button', { name: /Enter|כניסה/ }).click()
  await expect(page).toHaveURL(/#\/today/)
  await expect(page.getByRole('heading', { level: 1, name: /Today|היום/ })).toBeVisible()
})
