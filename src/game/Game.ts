import { createPrizePile, openPrizeReward, probeGrab, refillPrizes, settlePrizes } from './prizes'
import {
  drawCabinet,
  drawCabinetBackground,
  drawClaw,
  drawHud,
  drawOverlayMessage,
  drawParticles,
  drawPrizes,
} from './render'
import {
  CABINET,
  type BagPrize,
  type ClawState,
  type GamePhase,
  type OpenReward,
  type Particle,
  type Prize,
} from './types'

const SAVE_KEY = 'lucky-claw-save-v2'
const START_COINS = 15
const PLAY_COST = 1

interface SaveData {
  coins: number
  score: number
  highScore: number
  bag: BagPrize[]
  stickers: string[]
  wins: number
}

function loadSave(): SaveData {
  try {
    const raw = localStorage.getItem(SAVE_KEY)
    if (!raw) return defaultSave()
    const data = JSON.parse(raw) as SaveData
    return {
      coins: Number(data.coins) || START_COINS,
      score: Number(data.score) || 0,
      highScore: Number(data.highScore) || 0,
      bag: Array.isArray(data.bag) ? data.bag : [],
      stickers: Array.isArray(data.stickers) ? data.stickers : [],
      wins: Number(data.wins) || 0,
    }
  } catch {
    return defaultSave()
  }
}

function defaultSave(): SaveData {
  return { coins: START_COINS, score: 0, highScore: 0, bag: [], stickers: [], wins: 0 }
}

export class ClawGame {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private phase: GamePhase = 'attract'
  private claw: ClawState = {
    x: CABINET.width / 2,
    cableY: CABINET.clawRestY,
    open: 1,
    targetX: CABINET.width / 2,
    grip: 1,
  }
  private prizes: Prize[] = createPrizePile(9)
  private held: Prize | null = null
  private particles: Particle[] = []
  private coins: number
  private score: number
  private highScore: number
  private bag: BagPrize[]
  private stickers: string[]
  private wins: number
  private streak = 0
  private message = 'Arcade claw — aim true, keep your prize'
  private lastResult = ''
  private lastOpen: OpenReward | null = null
  private keys = new Set<string>()
  private moveDir = 0
  private dropQueued = false
  private playQueued = false
  private anim = 0
  private grabTimer = 0
  private releaseTimer = 0
  private lastTs = 0
  private running = false
  private onState?: () => void

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Canvas 2D unavailable')
    this.ctx = ctx
    const save = loadSave()
    this.coins = save.coins
    this.score = save.score
    this.highScore = save.highScore
    this.bag = save.bag
    this.stickers = save.stickers
    this.wins = save.wins
    this.resize()
  }

  setStateListener(cb: () => void) {
    this.onState = cb
  }

  getState() {
    const sealedCount = this.bag.filter((p) => p.sealed).length
    return {
      phase: this.phase,
      coins: this.coins,
      score: this.score,
      highScore: this.highScore,
      message: this.message,
      streak: this.streak,
      wins: this.wins,
      bag: this.bag,
      stickers: this.stickers,
      sealedCount,
      lastOpen: this.lastOpen,
      canPlay:
        this.coins >= PLAY_COST &&
        (this.phase === 'attract' || this.phase === 'ready' || this.phase === 'result'),
      canMove: this.phase === 'moving',
      canDrop: this.phase === 'moving',
    }
  }

  start() {
    if (this.running) return
    this.running = true
    this.lastTs = performance.now()
    const loop = (ts: number) => {
      if (!this.running) return
      const dt = Math.min(0.033, (ts - this.lastTs) / 1000)
      this.lastTs = ts
      this.update(dt)
      this.draw(ts / 1000)
      this.anim = requestAnimationFrame(loop)
    }
    this.anim = requestAnimationFrame(loop)
  }

  stop() {
    this.running = false
    cancelAnimationFrame(this.anim)
  }

  resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    this.canvas.width = CABINET.width * dpr
    this.canvas.height = CABINET.height * dpr
    this.canvas.style.width = `${CABINET.width}px`
    this.canvas.style.height = `${CABINET.height}px`
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  }

  setMove(dir: number) {
    this.moveDir = Math.max(-1, Math.min(1, dir))
  }

  queueDrop() {
    if (this.phase === 'moving') this.dropQueued = true
  }

  queuePlay() {
    this.playQueued = true
  }

  /** Open a sealed bag prize — real rewards, no empty scam. */
  openBagPrize(id: string): OpenReward | null {
    const item = this.bag.find((p) => p.id === id && p.sealed)
    if (!item) return null

    const reward = openPrizeReward(item.kind, item.rarity, item.label)
    item.sealed = false
    item.openedReward = reward
    this.coins += reward.coins
    this.score += reward.score
    if (reward.sticker && !this.stickers.includes(reward.sticker)) {
      this.stickers.push(reward.sticker)
    }
    if (this.score > this.highScore) this.highScore = this.score
    this.lastOpen = reward
    this.message = `${reward.title} · +${reward.coins} coins`
    this.persist()
    this.notify()
    return reward
  }

  openAllSealed(): OpenReward[] {
    const ids = this.bag.filter((p) => p.sealed).map((p) => p.id)
    return ids.map((id) => this.openBagPrize(id)).filter(Boolean) as OpenReward[]
  }

  clearOpenedBag() {
    this.bag = this.bag.filter((p) => p.sealed)
    this.persist()
    this.notify()
  }

  onKeyDown = (e: KeyboardEvent) => {
    const key = e.key.toLowerCase()
    if (['arrowleft', 'arrowright', 'a', 'd', ' ', 'enter'].includes(key) || e.code === 'Space') {
      e.preventDefault()
    }
    this.keys.add(key)
    if (key === ' ' || key === 'enter' || e.code === 'Space') {
      if (this.phase === 'moving') this.queueDrop()
      else this.queuePlay()
    }
  }

  onKeyUp = (e: KeyboardEvent) => {
    this.keys.delete(e.key.toLowerCase())
  }

  private notify() {
    this.onState?.()
  }

  private persist() {
    const data: SaveData = {
      coins: this.coins,
      score: this.score,
      highScore: this.highScore,
      bag: this.bag,
      stickers: this.stickers,
      wins: this.wins,
    }
    localStorage.setItem(SAVE_KEY, JSON.stringify(data))
  }

  private update(dt: number) {
    this.updateParticles(dt)

    if (this.playQueued) {
      this.playQueued = false
      this.tryStartRound()
    }

    let dir = this.moveDir
    if (this.keys.has('arrowleft') || this.keys.has('a')) dir = -1
    if (this.keys.has('arrowright') || this.keys.has('d')) dir = 1
    if ((this.keys.has('arrowleft') || this.keys.has('a')) && (this.keys.has('arrowright') || this.keys.has('d'))) {
      dir = 0
    }

    switch (this.phase) {
      case 'attract':
        this.claw.x += Math.sin(performance.now() / 900) * 0.35
        this.claw.x = clamp(this.claw.x, CABINET.clawMinX, CABINET.clawMaxX)
        break
      case 'moving': {
        this.claw.x = clamp(this.claw.x + dir * 190 * dt, CABINET.clawMinX, CABINET.clawMaxX)
        this.claw.open = 1
        if (this.dropQueued) {
          this.dropQueued = false
          this.phase = 'dropping'
          this.message = 'Claw dropping…'
          this.notify()
        }
        break
      }
      case 'dropping': {
        this.claw.cableY += 280 * dt
        this.claw.open = 1
        const probe = probeGrab(this.prizes, this.claw.x, this.claw.cableY + 28)
        const reachedFloor = this.claw.cableY >= CABINET.clawMaxY
        const reachedPrize =
          probe.hit &&
          probe.prize &&
          this.claw.cableY + 28 >= probe.prize.y - probe.prize.radius * 0.15
        if (reachedFloor || reachedPrize) {
          this.phase = 'grabbing'
          this.grabTimer = 0.38
          this.message = probe.hit ? 'Locking on…' : 'No prize under claw'
          this.notify()
        }
        break
      }
      case 'grabbing': {
        this.grabTimer -= dt
        this.claw.open = Math.max(0.08, this.grabTimer / 0.38)
        if (this.grabTimer <= 0) this.resolveGrab()
        break
      }
      case 'lifting': {
        // Fair claw: once grabbed, it stays grabbed. No mid-lift scam slip.
        this.claw.cableY -= 230 * dt
        if (this.claw.cableY <= CABINET.clawRestY) {
          this.claw.cableY = CABINET.clawRestY
          this.phase = 'carrying'
          this.claw.targetX = CABINET.chuteX
          this.message = this.held ? 'Prize secured!' : 'Empty claw'
          this.notify()
        }
        break
      }
      case 'carrying': {
        const dx = this.claw.targetX - this.claw.x
        const step = Math.sign(dx) * Math.min(Math.abs(dx), 220 * dt)
        this.claw.x += step
        if (Math.abs(this.claw.x - this.claw.targetX) < 2) {
          this.claw.x = this.claw.targetX
          this.phase = 'releasing'
          this.releaseTimer = 0.4
          this.claw.open = 0.15
        }
        break
      }
      case 'releasing': {
        this.releaseTimer -= dt
        this.claw.open = Math.min(1, this.claw.open + dt * 3)
        if (this.releaseTimer <= 0) {
          if (this.held) {
            this.winPrize(this.held)
            this.held = null
          } else {
            this.streak = 0
          }
          this.finishRound()
        }
        break
      }
      default:
        break
    }

    this.prizes = settlePrizes(this.prizes)
  }

  private tryStartRound() {
    if (!(this.phase === 'attract' || this.phase === 'ready' || this.phase === 'result')) return
    if (this.coins < PLAY_COST) {
      this.message = 'Out of coins — open prizes for more!'
      this.notify()
      return
    }

    this.coins -= PLAY_COST
    this.prizes = refillPrizes(this.prizes, 7)
    this.held = null
    this.lastOpen = null
    this.claw = {
      x: CABINET.width / 2,
      cableY: CABINET.clawRestY,
      open: 1,
      targetX: CABINET.width / 2,
      grip: 1,
    }
    this.phase = 'moving'
    this.message = 'Line up · DROP · you keep what you hit'
    this.lastResult = ''
    this.persist()
    this.notify()
  }

  private resolveGrab() {
    const probe = probeGrab(this.prizes, this.claw.x, this.claw.cableY + 28)

    // Skill only: if the claw is on a prize, you get it. Always.
    if (!probe.hit || !probe.prize) {
      this.claw.grip = 0
      this.held = null
      this.phase = 'lifting'
      this.message = 'Missed — try a tighter aim'
      this.notify()
      return
    }

    const target = probe.prize
    target.grabbed = true
    this.held = target
    this.prizes = this.prizes.filter((p) => p.id !== target.id)
    this.claw.grip = 1
    this.claw.open = 0.1
    this.spawnBurst(target.x, target.y, target.color)
    this.message = probe.perfect ? 'Perfect grab!' : 'Got it — fair and square'
    this.phase = 'lifting'
    this.notify()
  }

  private winPrize(prize: Prize) {
    this.streak += 1
    this.wins += 1
    const streakBonus = this.streak > 1 ? this.streak : 0
    this.score += prize.value + streakBonus

    const bagItem: BagPrize = {
      id: `${prize.kind}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      kind: prize.kind,
      label: prize.label,
      rarity: prize.rarity,
      color: prize.color,
      accent: prize.accent,
      capsule: prize.capsule,
      value: prize.value,
      sealed: true,
    }
    this.bag.unshift(bagItem)

    if (this.score > this.highScore) this.highScore = this.score
    this.spawnBurst(CABINET.chuteX, CABINET.glassBottom - 20, prize.color)
    this.lastResult = streakBonus
      ? `${prize.label} sealed! Streak x${this.streak}`
      : `${prize.label} sealed — open it!`
    this.message = this.lastResult
    this.persist()
  }

  private finishRound() {
    this.claw.cableY = CABINET.clawRestY
    this.claw.open = 1
    this.phase = 'result'
    if (!this.lastResult) {
      this.message =
        this.coins > 0
          ? 'Missed that one — skill retry ready'
          : 'No coins left — open sealed prizes'
    }
    this.persist()
    this.notify()
  }

  private spawnBurst(x: number, y: number, color: string) {
    for (let i = 0; i < 22; i++) {
      const angle = (Math.PI * 2 * i) / 22 + Math.random() * 0.2
      const speed = 50 + Math.random() * 130
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 40,
        life: 0.55 + Math.random() * 0.4,
        maxLife: 0.95,
        color,
        size: 2 + Math.random() * 3.5,
      })
    }
  }

  private updateParticles(dt: number) {
    for (const p of this.particles) {
      p.x += p.vx * dt
      p.y += p.vy * dt
      p.vy += 180 * dt
      p.life -= dt
    }
    this.particles = this.particles.filter((p) => p.life > 0)
  }

  private draw(time: number) {
    const { ctx, canvas } = this
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    drawCabinetBackground(ctx, CABINET.width, CABINET.height, time)
    drawCabinet(ctx, time)
    drawPrizes(ctx, this.prizes, time)
    drawClaw(ctx, this.claw, this.held, time)
    drawParticles(ctx, this.particles)
    drawHud(ctx, this.coins, this.score, this.highScore, this.message, this.phase, this.streak)

    if (this.phase === 'attract') {
      drawOverlayMessage(ctx, 'LUCKY CLAW', 'Fair arcade claw · open real prizes')
    }
  }
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n))
}
