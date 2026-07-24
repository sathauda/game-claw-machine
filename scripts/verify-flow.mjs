import { chromium } from 'playwright'
import fs from 'fs'

const out = '/opt/cursor/artifacts/screenshots'
fs.mkdirSync(out, { recursive: true })

const browser = await chromium.launch({
  headless: true,
  executablePath: '/usr/local/bin/google-chrome',
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
})

const page = await browser.newPage({ viewport: { width: 920, height: 1600 } })
const errors = []
page.on('pageerror', (e) => errors.push(`pageerror: ${e}`))
page.on('console', (msg) => {
  if (msg.type() === 'error') errors.push(`console: ${msg.text()}`)
})

await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' })
await page.waitForSelector('#game')
await page.waitForTimeout(700)

// Clear save for clean verify
await page.evaluate(() => localStorage.removeItem('lucky-claw-save-v2'))
await page.reload({ waitUntil: 'networkidle' })
await page.waitForSelector('#game')
await page.waitForTimeout(500)

await page.screenshot({ path: `${out}/01-landing.png`, fullPage: true })

const landing = await page.evaluate(() => {
  const g = window.__luckyClaw
  return {
    brand: document.querySelector('h1')?.textContent,
    play: document.querySelector('#btn-play')?.textContent,
    coins: g?.getState().coins,
    bag: g?.getState().bag.length,
    sealed: g?.getState().sealedCount,
  }
})

// Insert coin via UI
await page.click('#btn-play')
await page.waitForTimeout(350)
const playing = await page.evaluate(() => {
  const g = window.__luckyClaw
  return {
    phase: g?.getState().phase,
    dropEnabled: !document.querySelector('#btn-drop')?.disabled,
    coins: g?.getState().coins,
  }
})

// Fair win path
const won = await page.evaluate(() => {
  const g = window.__luckyClaw
  const beforeCoins = g.getState().coins
  const beforeBag = g.getState().bag.length
  const item = g.forceFairWin()
  const after = g.getState()
  return {
    item: item ? { label: item.label, sealed: item.sealed, id: item.id } : null,
    beforeCoins,
    beforeBag,
    afterCoins: after.coins,
    afterBag: after.bag.length,
    sealed: after.sealedCount,
    phase: after.phase,
  }
})

await page.waitForTimeout(300)
await page.screenshot({ path: `${out}/02-after-win.png`, fullPage: true })

const sealedButton = page.locator('[data-open]').first()
const hasSealedUi = (await sealedButton.count()) > 0
let opened = null
if (hasSealedUi) {
  const coinsBeforeOpen = await page.evaluate(() => window.__luckyClaw.getState().coins)
  await sealedButton.click({ force: true })
  await page.waitForTimeout(400)
  const modalVisible = await page.locator('#open-modal:not(.hidden)').count()
  const lootText = await page.locator('#open-loot').innerText()
  const coinsAfterOpen = await page.evaluate(() => window.__luckyClaw.getState().coins)
  opened = {
    modalVisible: modalVisible === 1,
    lootText,
    coinsBeforeOpen,
    coinsAfterOpen,
    gained: coinsAfterOpen - coinsBeforeOpen,
  }
  await page.screenshot({ path: `${out}/03-opened-prize.png`, fullPage: true })
  await page.click('#btn-close-modal', { force: true })
}

const report = {
  story: 'Insert coin → fair grab → sealed bag prize → open capsule → coins increase',
  landing,
  playing,
  won,
  opened,
  errors,
  screenshots: [
    `${out}/01-landing.png`,
    `${out}/02-after-win.png`,
    `${out}/03-opened-prize.png`,
  ],
}

const ok =
  landing.brand === 'Lucky Claw' &&
  playing.phase === 'moving' &&
  won.item?.sealed === true &&
  won.afterBag === won.beforeBag + 1 &&
  opened?.modalVisible === true &&
  opened?.gained > 0 &&
  errors.length === 0

console.log(JSON.stringify({ ok, report }, null, 2))
await browser.close()
process.exit(ok ? 0 : 1)
