import './style.css'
import { ClawGame } from './game/Game'

const app = document.querySelector<HTMLDivElement>('#app')!

app.innerHTML = `
  <div class="shell">
    <header class="brand">
      <p class="eyebrow">Arcade cabinet · browser edition</p>
      <h1>Lucky Claw</h1>
      <p class="tagline">Steer the claw, drop with guts, walk away with plush glory.</p>
    </header>

    <main class="stage">
      <canvas id="game" width="420" height="640" aria-label="Lucky Claw game canvas"></canvas>

      <div class="controls" role="group" aria-label="Game controls">
        <button type="button" class="btn btn-ghost" id="btn-left" aria-label="Move claw left">←</button>
        <button type="button" class="btn btn-drop" id="btn-drop">DROP</button>
        <button type="button" class="btn btn-ghost" id="btn-right" aria-label="Move claw right">→</button>
        <button type="button" class="btn btn-play" id="btn-play">PLAY</button>
      </div>

      <p class="hint">Keyboard: <kbd>←</kbd> <kbd>→</kbd> move · <kbd>Space</kbd> drop / play</p>
    </main>
  </div>
`

const canvas = document.querySelector<HTMLCanvasElement>('#game')!
const game = new ClawGame(canvas)
const playBtn = document.querySelector<HTMLButtonElement>('#btn-play')!
const dropBtn = document.querySelector<HTMLButtonElement>('#btn-drop')!
const leftBtn = document.querySelector<HTMLButtonElement>('#btn-left')!
const rightBtn = document.querySelector<HTMLButtonElement>('#btn-right')!

function syncUi() {
  const state = game.getState()
  playBtn.disabled = !state.canPlay
  dropBtn.disabled = !state.canDrop
  leftBtn.disabled = !state.canMove
  rightBtn.disabled = !state.canMove
  playBtn.textContent = state.coins < 1 ? 'NO COINS' : state.phase === 'attract' ? 'INSERT COIN' : 'PLAY AGAIN'
}

game.setStateListener(syncUi)
syncUi()
game.start()

window.addEventListener('keydown', game.onKeyDown)
window.addEventListener('keyup', game.onKeyUp)
window.addEventListener('resize', () => game.resize())

playBtn.addEventListener('click', () => game.queuePlay())
dropBtn.addEventListener('click', () => game.queueDrop())

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
