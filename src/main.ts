import './style.css'
import { ClawGame } from './game/Game'
import { rarityLabel } from './game/prizes'
import { prizeIcon } from './game/render'
import type { BagPrize, OpenReward } from './game/types'

declare global {
  interface Window {
    __luckyClaw?: ClawGame
  }
}

const app = document.querySelector<HTMLDivElement>('#app')!

app.innerHTML = `
  <div class="parlor">
    <div class="parlor-glow parlor-glow-a" aria-hidden="true"></div>
    <div class="parlor-glow parlor-glow-b" aria-hidden="true"></div>
    <div class="floor-grid" aria-hidden="true"></div>

    <div class="shell">
      <header class="brand">
        <div class="marquee" aria-hidden="true">
          ${Array.from({ length: 14 }, (_, i) => `<span style="--i:${i}"></span>`).join('')}
        </div>
        <p class="eyebrow">Skill arcade · fair claw</p>
        <h1>Lucky Claw</h1>
        <p class="tagline">Drop the claw. Keep what you hit. Open real prizes.</p>
        <div class="stat-strip" id="stat-strip" aria-live="polite">
          <div class="stat"><span>Coins</span><strong id="stat-coins">0</strong></div>
          <div class="stat"><span>Score</span><strong id="stat-score">0</strong></div>
          <div class="stat"><span>Best</span><strong id="stat-best">0</strong></div>
          <div class="stat"><span>Sealed</span><strong id="stat-sealed">0</strong></div>
        </div>
      </header>

      <main class="stage">
        <div class="cabinet-frame">
          <div class="bulb-row" aria-hidden="true">
            ${Array.from({ length: 11 }, (_, i) => `<i style="--i:${i}"></i>`).join('')}
          </div>
          <canvas id="game" width="420" height="640" aria-label="Lucky Claw arcade cabinet"></canvas>
          <div class="cabinet-shadow" aria-hidden="true"></div>
        </div>

        <div class="controls" role="group" aria-label="Game controls">
          <button type="button" class="btn btn-ghost" id="btn-left" aria-label="Move claw left">←</button>
          <button type="button" class="btn btn-drop" id="btn-drop">DROP</button>
          <button type="button" class="btn btn-ghost" id="btn-right" aria-label="Move claw right">→</button>
          <button type="button" class="btn btn-play" id="btn-play">INSERT COIN</button>
        </div>

        <p class="hint">Aim with ← → · Space to drop · land on a prize and you keep it</p>

        <section class="howto" aria-label="How to play">
          <p><strong>01 Aim</strong> Slide over a prize</p>
          <p><strong>02 Drop</strong> Hit it fair — keep it</p>
          <p><strong>03 Open</strong> Crack capsules for coins</p>
        </section>

        <section class="bag-panel" aria-label="Prize bag">
          <div class="bag-head">
            <div>
              <h2>Prize Bag</h2>
              <p class="bag-sub" id="bag-sub">Win capsules, then open them for loot.</p>
            </div>
            <div class="bag-actions">
              <button type="button" class="btn btn-tiny" id="btn-open-all">Open All</button>
              <button type="button" class="btn btn-tiny btn-muted" id="btn-clear-opened">Clear Opened</button>
            </div>
          </div>
          <div class="bag-grid" id="bag-grid"></div>
          <div class="sticker-row" id="sticker-row"></div>
        </section>
      </main>
    </div>

    <div class="modal hidden" id="open-modal" role="dialog" aria-modal="true" aria-labelledby="open-title">
      <div class="modal-card">
        <div class="modal-burst" aria-hidden="true"></div>
        <p class="modal-kicker" id="open-kicker">Capsule cracked</p>
        <h3 id="open-title">Prize opened!</h3>
        <p id="open-detail"></p>
        <p class="modal-loot" id="open-loot"></p>
        <button type="button" class="btn btn-play" id="btn-close-modal">NICE</button>
      </div>
    </div>
  </div>
`

const canvas = document.querySelector<HTMLCanvasElement>('#game')!
const game = new ClawGame(canvas)
window.__luckyClaw = game

const playBtn = document.querySelector<HTMLButtonElement>('#btn-play')!
const dropBtn = document.querySelector<HTMLButtonElement>('#btn-drop')!
const leftBtn = document.querySelector<HTMLButtonElement>('#btn-left')!
const rightBtn = document.querySelector<HTMLButtonElement>('#btn-right')!
const bagGrid = document.querySelector<HTMLDivElement>('#bag-grid')!
const bagSub = document.querySelector<HTMLParagraphElement>('#bag-sub')!
const stickerRow = document.querySelector<HTMLDivElement>('#sticker-row')!
const openAllBtn = document.querySelector<HTMLButtonElement>('#btn-open-all')!
const clearOpenedBtn = document.querySelector<HTMLButtonElement>('#btn-clear-opened')!
const modal = document.querySelector<HTMLDivElement>('#open-modal')!
const openTitle = document.querySelector<HTMLHeadingElement>('#open-title')!
const openDetail = document.querySelector<HTMLParagraphElement>('#open-detail')!
const openLoot = document.querySelector<HTMLParagraphElement>('#open-loot')!
const openKicker = document.querySelector<HTMLParagraphElement>('#open-kicker')!
const closeModalBtn = document.querySelector<HTMLButtonElement>('#btn-close-modal')!
const statCoins = document.querySelector<HTMLElement>('#stat-coins')!
const statScore = document.querySelector<HTMLElement>('#stat-score')!
const statBest = document.querySelector<HTMLElement>('#stat-best')!
const statSealed = document.querySelector<HTMLElement>('#stat-sealed')!

function showOpenModal(reward: OpenReward) {
  openKicker.textContent = reward.sticker ? `Collected · ${reward.sticker}` : 'Capsule cracked'
  openTitle.textContent = reward.title
  openDetail.textContent = reward.detail
  openLoot.textContent = `+${reward.coins} coins   ·   +${reward.score} score`
  modal.classList.remove('hidden')
}

function hideOpenModal() {
  modal.classList.add('hidden')
}

function renderBag(bag: BagPrize[], stickers: string[], sealedCount: number) {
  bagSub.textContent =
    sealedCount > 0
      ? `${sealedCount} sealed capsule${sealedCount === 1 ? '' : 's'} ready — every open pays coins.`
      : 'Empty bag. Grab a prize, then open the capsule here.'

  openAllBtn.disabled = sealedCount === 0
  clearOpenedBtn.disabled = !bag.some((p) => !p.sealed)

  if (bag.length === 0) {
    bagGrid.innerHTML = `<p class="bag-empty">No prizes yet — insert a coin and drop the claw.</p>`
  } else {
    bagGrid.innerHTML = bag
      .map((item) => {
        const rare = rarityLabel(item.rarity)
        if (item.sealed) {
          return `
            <button type="button" class="capsule sealed rarity-${item.rarity}" data-open="${item.id}" style="--cap:${item.capsule}">
              <span class="cap-shine"></span>
              <span class="cap-icon">${prizeIcon(item.kind)}</span>
              <span class="cap-name">${item.label}</span>
              <span class="cap-rare">${rare}</span>
              <span class="cap-cta">OPEN</span>
            </button>
          `
        }
        const loot = item.openedReward
        return `
          <div class="capsule opened rarity-${item.rarity}" style="--cap:${item.capsule}">
            <span class="cap-icon">${prizeIcon(item.kind)}</span>
            <span class="cap-name">${item.label}</span>
            <span class="cap-rare">OPENED</span>
            <span class="cap-cta">${loot ? `+${loot.coins}c` : 'done'}</span>
          </div>
        `
      })
      .join('')
  }

  stickerRow.innerHTML =
    stickers.length === 0
      ? ''
      : `<p class="sticker-label">Collection</p>` +
        stickers.map((s) => `<span class="sticker">${s}</span>`).join('')
}

function syncUi() {
  const state = game.getState()
  playBtn.disabled = !state.canPlay
  dropBtn.disabled = !state.canDrop
  leftBtn.disabled = !state.canMove
  rightBtn.disabled = !state.canMove
  playBtn.textContent =
    state.coins < 1 ? 'NEED COINS' : state.phase === 'attract' ? 'INSERT COIN' : 'PLAY AGAIN'
  statCoins.textContent = String(state.coins)
  statScore.textContent = String(state.score)
  statBest.textContent = String(state.highScore)
  statSealed.textContent = String(state.sealedCount)
  renderBag(state.bag, state.stickers, state.sealedCount)
}

game.setStateListener(syncUi)
syncUi()
game.start()

window.addEventListener('keydown', game.onKeyDown)
window.addEventListener('keyup', game.onKeyUp)
window.addEventListener('resize', () => game.resize())

playBtn.addEventListener('click', () => game.queuePlay())
dropBtn.addEventListener('click', () => game.queueDrop())
closeModalBtn.addEventListener('click', hideOpenModal)
modal.addEventListener('click', (e) => {
  if (e.target === modal) hideOpenModal()
})

bagGrid.addEventListener('click', (e) => {
  const target = (e.target as HTMLElement).closest<HTMLElement>('[data-open]')
  if (!target) return
  const id = target.dataset.open
  if (!id) return
  const reward = game.openBagPrize(id)
  if (reward) showOpenModal(reward)
})

openAllBtn.addEventListener('click', () => {
  const rewards = game.openAllSealed()
  if (rewards.length === 0) return
  const totalCoins = rewards.reduce((s, r) => s + r.coins, 0)
  const totalScore = rewards.reduce((s, r) => s + r.score, 0)
  showOpenModal({
    title: rewards.length === 1 ? rewards[0].title : `Opened ${rewards.length} prizes!`,
    detail: rewards.length === 1 ? rewards[0].detail : 'Every capsule paid out — no blanks.',
    coins: totalCoins,
    score: totalScore,
    sticker: rewards.map((r) => r.sticker).filter(Boolean).slice(-1)[0],
  })
})

clearOpenedBtn.addEventListener('click', () => game.clearOpenedBag())

const bindHold = (btn: HTMLButtonElement, dir: number) => {
  const start = (e: Event) => {
    e.preventDefault()
    game.setMove(dir)
  }
  const end = (e: Event) => {
    e.preventDefault()
    game.setMove(0)
  }
  btn.addEventListener('pointerdown', start)
  btn.addEventListener('pointerup', end)
  btn.addEventListener('pointerleave', end)
  btn.addEventListener('pointercancel', end)
}

bindHold(leftBtn, -1)
bindHold(rightBtn, 1)
