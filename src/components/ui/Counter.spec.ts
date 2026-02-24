import { test, expect } from '@playwright/test'

test('el contador inicia en 0', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('#count')).toHaveText('0')
})

test('incrementa al hacer click en +', async ({ page }) => {
  await page.goto('/')
  await page.click('#btn-inc')
  await expect(page.locator('#count')).toHaveText('1')
})

test('decrementa al hacer click en -', async ({ page }) => {
  await page.goto('/')
  await page.click('#btn-dec')
  await expect(page.locator('#count')).toHaveText('-1')
})