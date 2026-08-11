import { test, expect, type Page } from '@playwright/test'

async function unlock(page: Page) {
  await page.goto('/#/unlock')
  await page.locator('#password').fill('hersko')
  await page.getByRole('button', { name: /Enter|כניסה/ }).click()
  await expect(page).toHaveURL(/#\/today/)
}

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

test('opens wallet PDFs and shows the fixed arrival timeline', async ({ page }) => {
  await unlock(page)

  await page.goto('/#/wallet')
  const sourceLink = page.getByRole('link', { name: /Full original document|מסמך מקור מלא/ }).first()
  const href = await sourceLink.getAttribute('href')
  expect(href).toMatch(/\/docs\/originals\/flights-booking\.pdf$/)
  const response = await page.request.get(href!)
  expect(response.status()).toBe(200)
  expect(response.headers()['content-type']).toContain('application/pdf')

  await page.goto('/#/trip')
  await expect(page.getByText(/Bacówka Chyżne/).first()).toBeVisible()
  await expect(page.getByText(/Tesco Liptov|טסקו ליפטוב/).first()).toBeVisible()
  await expect(page.getByText(/Bernard Pub Maladinovo|Bernard Pub מלאדינובו/).first()).toBeVisible()
  await expect(page.getByRole('button', { name: /Move up|הזז למעלה/ })).toHaveCount(0)
  await expect(page.getByRole('button', { name: /Move down|הזז למטה/ })).toHaveCount(0)
})
