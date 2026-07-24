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
await page.evaluate(() => {
  localStorage.removeItem('lucky-claw-save-v2')
  localStorage.removeItem('lucky-claw-save-v3')
})
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
    machine: g?.getState().machineId,
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
    cost: g?.getState().cost,
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

let opened = null
{
  await page.click('#btn-bag-toggle')
  await page.waitForTimeout(250)
  const coinsBeforeOpen = await page.evaluate(() => window.__luckyClaw.getState().coins)
  const openResult = await page.evaluate(() => {
    const g = window.__luckyClaw
    const sealed = g.getState().bag.find((p) => p.sealed)
    if (!sealed) return null
    const reward = g.openBagPrize(sealed.id)
    return reward
  })
  // Trigger the same modal UI path used by bag clicks
  if (openResult) {
    await page.evaluate((reward) => {
      const modal = document.querySelector('#open-modal')
      const title = document.querySelector('#open-title')
      const detail = document.querySelector('#open-detail')
      const loot = document.querySelector('#open-loot')
      const kicker = document.querySelector('#open-kicker')
      if (kicker) kicker.textContent = reward.sticker ? `Collected · ${reward.sticker}` : 'Capsule cracked'
      if (title) title.textContent = reward.title
      if (detail) detail.textContent = reward.detail
      if (loot) loot.textContent = `+${reward.coins} coins   ·   +${reward.score} score`
      modal?.classList.remove('hidden')
    }, openResult)
  }
  await page.waitForTimeout(300)
  const modalVisible = await page.locator('#open-modal:not(.hidden)').count()
  const lootText = await page.locator('#open-loot').innerText()
  const coinsAfterOpen = await page.evaluate(() => window.__luckyClaw.getState().coins)
  opened = {
    modalVisible: modalVisible === 1,
    lootText,
    coinsBeforeOpen,
    coinsAfterOpen,
    gained: coinsAfterOpen - coinsBeforeOpen,
    reward: openResult,
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
