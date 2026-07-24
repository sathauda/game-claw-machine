import './style.css'
import { ClawGame } from './game/Game'
import { rarityLabel } from './game/prizes'
import { prizeIcon } from './game/render'
import type { BagPrize, MachineDef, MachineId, OpenReward } from './game/types'

declare global {
  interface Window {
    __luckyClaw?: ClawGame
  }
}

const app = document.querySelector<HTMLDivElement>('#app')!

app.innerHTML = `
  <div class="arcade" id="arcade">
    <header class="topbar">
      <div class="brand-inline">
        <p class="eyebrow">Lucky Claw Arcade</p>
        <h1>Lucky Claw</h1>
      </div>
      <div class="stat-strip" aria-live="polite">
        <div class="stat"><span>Credits</span><strong id="stat-coins">0</strong></div>
        <div class="stat"><span>Score</span><strong id="stat-score">0</strong></div>
        <div class="stat"><span>Best</span><strong id="stat-best">0</strong></div>
        <div class="stat"><span>Sealed</span><strong id="stat-sealed">0</strong></div>
      </div>
      <div class="top-actions">
        <button type="button" class="btn btn-tiny btn-credits" id="btn-credits">+10 CREDITS</button>
        <button type="button" class="btn btn-tiny" id="btn-bag-toggle">BAG</button>
      </div>
    </header>

    <section class="machine-rail" id="machine-rail" aria-label="Choose a claw machine"></section>

    <main class="playfield">
      <div class="cabinet-frame">
        <canvas id="game" width="420" height="640" aria-label="Lucky Claw arcade cabinet"></canvas>
      </div>

      <div class="dock">
        <p class="machine-blurb" id="machine-blurb"></p>
        <div class="controls" role="group" aria-label="Game controls">
          <button type="button" class="btn btn-ghost" id="btn-left" aria-label="Move claw left">←</button>
          <button type="button" class="btn btn-drop" id="btn-drop">DROP</button>
          <button type="button" class="btn btn-ghost" id="btn-right" aria-label="Move claw right">→</button>
          <button type="button" class="btn btn-play" id="btn-play">INSERT COIN</button>
        </div>
        <p class="hint">1-0 quick-pick L1-10 · [ ] cycle all 20 levels · ← → aim · Space drop</p>
      </div>
    </main>

    <aside class="bag-drawer" id="bag-drawer" aria-label="Prize bag">
      <div class="bag-head">
        <div>
          <h2>Prize Bag</h2>
          <p class="bag-sub" id="bag-sub">Open sealed prizes for coins.</p>
        </div>
        <button type="button" class="btn btn-tiny btn-muted" id="btn-bag-close">CLOSE</button>
      </div>
      <div class="bag-actions">
        <button type="button" class="btn btn-tiny" id="btn-open-all">Open All</button>
        <button type="button" class="btn btn-tiny btn-muted" id="btn-clear-opened">Clear Opened</button>
      </div>
      <div class="bag-grid" id="bag-grid"></div>
      <div class="sticker-row" id="sticker-row"></div>
    </aside>

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
const machineRail = document.querySelector<HTMLElement>('#machine-rail')!
const machineBlurb = document.querySelector<HTMLElement>('#machine-blurb')!
const bagDrawer = document.querySelector<HTMLElement>('#bag-drawer')!
const bagToggle = document.querySelector<HTMLButtonElement>('#btn-bag-toggle')!
const bagClose = document.querySelector<HTMLButtonElement>('#btn-bag-close')!
const creditsBtn = document.querySelector<HTMLButtonElement>('#btn-credits')!
const cabinetFrame = document.querySelector<HTMLElement>('.cabinet-frame')!

function fitCanvas() {
  const frame = cabinetFrame.getBoundingClientRect()
  const pad = 8
  const maxW = Math.max(220, frame.width - pad)
  const maxH = Math.max(280, frame.height - pad)
  const scale = Math.min(maxW / 420, maxH / 640)
  const w = Math.floor(420 * scale)
  const h = Math.floor(640 * scale)
  canvas.style.width = `${w}px`
  canvas.style.height = `${h}px`
  game.resize()
}

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

function renderMachines(
  machines: MachineDef[],
  activeId: string,
  canSwitch: boolean,
  coins: number,
  unlockedIds: string[],
  wins: number,
) {
  machineRail.innerHTML = machines
    .map((m) => {
      const unlocked = unlockedIds.includes(m.id)
      const locked = !unlocked
      const pricey = unlocked && coins < m.cost && activeId !== m.id
      const need = Math.max(0, m.unlockWins - wins)
      return `
        <button type="button"
          class="machine-chip ${m.id === activeId ? 'active' : ''} ${locked ? 'locked' : ''} ${pricey ? 'pricey' : ''}"
          data-machine="${m.id}"
          ${!canSwitch || locked ? 'disabled' : ''}
          title="${locked ? `Win ${need} more prizes to unlock` : m.blurb}"
          style="--chip:${m.body[0]}">
          <span class="chip-name">${m.short}</span>
          <span class="chip-cost">${locked ? `NEED ${need}` : `${m.cost}c`}</span>
          <span class="chip-diff">${locked ? 'locked' : m.difficulty}</span>
        </button>
      `
    })
    .join('')
}

function renderBag(bag: BagPrize[], stickers: string[], sealedCount: number) {
  bagSub.textContent =
    sealedCount > 0
      ? `${sealedCount} sealed · every open pays coins`
      : 'Empty bag. Win phones, watches, toys… then open them.'

  openAllBtn.disabled = sealedCount === 0
  clearOpenedBtn.disabled = !bag.some((p) => !p.sealed)
  bagToggle.textContent = sealedCount > 0 ? `BAG (${sealedCount})` : 'BAG'

  if (bag.length === 0) {
    bagGrid.innerHTML = `<p class="bag-empty">No prizes yet — pick a machine and drop.</p>`
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
    state.coins < state.cost
      ? 'NEED COINS'
      : state.phase === 'attract'
        ? `PLAY · ${state.cost}c`
        : `AGAIN · ${state.cost}c`
  statCoins.textContent = String(state.coins)
  statScore.textContent = String(state.score)
  statBest.textContent = String(state.highScore)
  statSealed.textContent = String(state.sealedCount)
  machineBlurb.textContent = state.nextUnlock
    ? `${state.machine.name} (Lvl ${state.machine.level}) — ${state.machine.blurb} · Next unlock in ${state.nextUnlock.need} wins`
    : `${state.machine.name} (Lvl ${state.machine.level}) — ${state.machine.blurb} · All levels unlocked`
  renderMachines(
    state.machines,
    state.machineId,
    state.canSwitchMachine,
    state.coins,
    state.unlockedIds,
    state.wins,
  )
  renderBag(state.bag, state.stickers, state.sealedCount)
}

game.setStateListener(syncUi)
syncUi()
fitCanvas()
game.start()

window.addEventListener('keydown', game.onKeyDown)
window.addEventListener('keyup', game.onKeyUp)
window.addEventListener('resize', fitCanvas)

playBtn.addEventListener('click', () => game.queuePlay())
dropBtn.addEventListener('click', () => game.queueDrop())
closeModalBtn.addEventListener('click', hideOpenModal)
modal.addEventListener('click', (e) => {
  if (e.target === modal) hideOpenModal()
})

machineRail.addEventListener('click', (e) => {
  const btn = (e.target as HTMLElement).closest<HTMLElement>('[data-machine]')
  if (!btn?.dataset.machine) return
  game.setMachine(btn.dataset.machine as MachineId)
})

bagToggle.addEventListener('click', () => bagDrawer.classList.add('open'))
bagClose.addEventListener('click', () => bagDrawer.classList.remove('open'))
creditsBtn.addEventListener('click', () => game.addCredits(10))

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
