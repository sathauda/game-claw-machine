import { createPrizePile, findGrabTarget, refillPrizes, settlePrizes } from './prizes'
import {
  drawCabinet,
  drawCabinetBackground,
  drawClaw,
  drawHud,
  drawOverlayMessage,
  drawParticles,
  drawPrizes,
} from './render'
import { CABINET, type ClawState, type GamePhase, type Particle, type Prize } from './types'

const HIGH_SCORE_KEY = 'lucky-claw-high-score'
const START_COINS = 12
const PLAY_COST = 1

export class ClawGame {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private phase: GamePhase = 'attract'
  private claw: ClawState = {
    x: CABINET.width / 2,
    cableY: CABINET.clawRestY,
    open: 1,
    targetX: CABINET.width / 2,
    grip: 0,
  }
  private prizes: Prize[] = createPrizePile(9)
  private held: Prize | null = null
  private particles: Particle[] = []
  private coins = START_COINS
  private score = 0
  private highScore = Number(localStorage.getItem(HIGH_SCORE_KEY) || 0)
  private message = 'Welcome to the arcade'
  private lastResult = ''
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
    this.resize()
  }

  setStateListener(cb: () => void) {
    this.onState = cb
  }

  getState() {
    return {
      phase: this.phase,
      coins: this.coins,
      score: this.score,
      highScore: this.highScore,
      message: this.message,
      canPlay: this.coins >= PLAY_COST && (this.phase === 'attract' || this.phase === 'ready' || this.phase === 'result'),
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
        const speed = 180
        this.claw.x = clamp(this.claw.x + dir * speed * dt, CABINET.clawMinX, CABINET.clawMaxX)
        this.claw.open = 1
        if (this.dropQueued) {
          this.dropQueued = false
          this.phase = 'dropping'
          this.message = 'Going down…'
          this.notify()
        }
        break
      }
      case 'dropping': {
        this.claw.cableY += 260 * dt
        this.claw.open = 1
        const target = findGrabTarget(this.prizes, this.claw.x, this.claw.cableY + 30)
        if (this.claw.cableY >= CABINET.clawMaxY || (target && this.claw.cableY + 28 >= target.y - target.radius * 0.2)) {
          this.phase = 'grabbing'
          this.grabTimer = 0.45
          this.message = 'Gotcha…?'
          this.notify()
        }
        break
      }
      case 'grabbing': {
        this.grabTimer -= dt
        this.claw.open = Math.max(0.05, this.grabTimer / 0.45)
        if (this.grabTimer <= 0) {
          this.resolveGrab()
        }
        break
      }
      case 'lifting': {
        this.claw.cableY -= 220 * dt
        if (this.held) {
          // Chance to slip while lifting based on grip
          if (Math.random() < (1 - this.claw.grip) * 0.35 * dt) {
            this.dropHeldPrize(false)
            this.phase = 'releasing'
            this.releaseTimer = 0.2
            this.message = 'It slipped!'
            this.lastResult = 'slip'
            this.notify()
            break
          }
        }
        if (this.claw.cableY <= CABINET.clawRestY) {
          this.claw.cableY = CABINET.clawRestY
          this.phase = 'carrying'
          this.claw.targetX = CABINET.chuteX
          this.message = this.held ? 'To the chute!' : 'Empty claw'
          this.notify()
        }
        break
      }
      case 'carrying': {
        const dx = this.claw.targetX - this.claw.x
        const step = Math.sign(dx) * Math.min(Math.abs(dx), 200 * dt)
        this.claw.x += step
        if (Math.abs(this.claw.x - this.claw.targetX) < 2) {
          this.claw.x = this.claw.targetX
          this.phase = 'releasing'
          this.releaseTimer = 0.35
          this.claw.open = 0.2
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
      this.message = 'Out of coins — refresh for more'
      this.notify()
      return
    }

    this.coins -= PLAY_COST
    this.prizes = refillPrizes(this.prizes.filter((p) => !p.grabbed), 7)
    this.held = null
    this.claw = {
      x: CABINET.width / 2,
      cableY: CABINET.clawRestY,
      open: 1,
      targetX: CABINET.width / 2,
      grip: 0,
    }
    this.phase = 'moving'
    this.message = 'Aim with ← → then DROP'
    this.lastResult = ''
    this.notify()
  }

  private resolveGrab() {
    const target = findGrabTarget(this.prizes, this.claw.x, this.claw.cableY + 30)
    if (!target) {
      this.claw.grip = 0
      this.held = null
      this.phase = 'lifting'
      this.message = 'Missed!'
      this.notify()
      return
    }

    // Grip chance: center alignment + slight luck + value tradeoff
    const align = 1 - Math.min(1, Math.abs(target.x - this.claw.x) / (target.radius + 8))
    const luck = Math.random()
    const difficulty = Math.min(0.35, target.value * 0.04)
    const grip = clamp(align * 0.7 + luck * 0.45 - difficulty, 0.08, 0.98)
    this.claw.grip = grip

    if (grip > 0.42) {
      target.grabbed = true
      this.held = target
      this.prizes = this.prizes.filter((p) => p.id !== target.id)
      this.spawnBurst(target.x, target.y, target.color)
      this.message = grip > 0.75 ? 'Solid grip!' : 'Holding on…'
      this.phase = 'lifting'
    } else {
      this.held = null
      this.spawnBurst(target.x, target.y - 10, '#FFFFFF')
      this.message = 'Almost — slipped away'
      this.phase = 'lifting'
    }
    this.claw.open = 0.12
    this.notify()
  }

  private dropHeldPrize(intoChute: boolean) {
    if (!this.held) return
    const prize = this.held
    prize.grabbed = false
    prize.x = this.claw.x + (Math.random() - 0.5) * 20
    prize.y = intoChute ? CABINET.floorY - prize.radius : this.claw.cableY + 40
    this.prizes.push(prize)
    this.held = null
    this.prizes = settlePrizes(this.prizes)
  }

  private winPrize(prize: Prize) {
    this.score += prize.value
    this.coins += Math.max(1, Math.floor(prize.value / 2))
    if (this.score > this.highScore) {
      this.highScore = this.score
      localStorage.setItem(HIGH_SCORE_KEY, String(this.highScore))
    }
    this.spawnBurst(CABINET.chuteX, CABINET.glassBottom - 20, prize.color)
    this.lastResult = `Won ${prize.label}! +${prize.value}`
    this.message = this.lastResult
  }

  private finishRound() {
    this.claw.cableY = CABINET.clawRestY
    this.claw.open = 1
    this.phase = this.coins > 0 ? 'result' : 'result'
    if (!this.lastResult) {
      this.message = this.coins > 0 ? 'Try again?' : 'No coins left'
    }
    this.notify()
  }

  private spawnBurst(x: number, y: number, color: string) {
    for (let i = 0; i < 18; i++) {
      const angle = (Math.PI * 2 * i) / 18 + Math.random() * 0.2
      const speed = 40 + Math.random() * 120
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 30,
        life: 0.5 + Math.random() * 0.4,
        maxLife: 0.9,
        color,
        size: 2 + Math.random() * 3,
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
    drawHud(ctx, this.coins, this.score, this.highScore, this.message, this.phase)

    if (this.phase === 'attract') {
      drawOverlayMessage(ctx, 'LUCKY CLAW', 'Drop a coin. Grab a prize.')
    }
  }
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n))
}
