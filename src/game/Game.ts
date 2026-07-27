import {
  applyMutation,
  createPrizePile,
  emptyBuff,
  mergeBuff,
  openPrizeReward,
  probeGrab,
  refillPrizes,
  settlePrizes,
} from './prizes'
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
  MACHINES,
  getMachine,
  getPrizeDef,
  type BagPrize,
  type ClawState,
  type GamePhase,
  type MachineDef,
  type MachineId,
  type NeonBuff,
  type OpenReward,
  type Particle,
  type Prize,
  type PrizeKind,
} from './types'

const SAVE_KEY = 'lucky-claw-save-v6'
const START_COINS = 60
const CREDIT_PACK = 10
const OG_PRIZE_COOLDOWN_DAYS = 2
const SUPER_OG_COOLDOWN_DAYS = 3

interface SaveData {
  coins: number
  score: number
  highScore: number
  bag: BagPrize[]
  stickers: string[]
  wins: number
  machineId: MachineId
  /** Local calendar day (YYYY-MM-DD) when daily credits were last claimed */
  lastDailyCreditDay?: string
  /** Local calendar day when the bi-daily OG prize was last claimed */
  lastOgPrizeDay?: string
  /** Local calendar day when Super OG was last claimed (undefined = claimable now) */
  lastSuperOgDay?: string
  buff?: NeonBuff
}

function todayKey(d = new Date()) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function parseDayKey(key: string): number {
  const [y, m, d] = key.split('-').map(Number)
  return Date.UTC(y, m - 1, d)
}

/** Whole local calendar days from `fromKey` to `toKey` (can be negative). */
function calendarDaysBetween(fromKey: string, toKey: string): number {
  return Math.floor((parseDayKey(toKey) - parseDayKey(fromKey)) / 86_400_000)
}

function loadSave(): SaveData {
  try {
    const raw =
      localStorage.getItem(SAVE_KEY) ||
      localStorage.getItem('lucky-claw-save-v5') ||
      localStorage.getItem('lucky-claw-save-v4') ||
      localStorage.getItem('lucky-claw-save-v3')
    if (!raw) return defaultSave()
    const data = JSON.parse(raw) as SaveData
    const machineId = MACHINES.some((m) => m.id === data.machineId) ? data.machineId : 'toybox'
    const wins = Number(data.wins) || 0
    const unlocked = getMachine(machineId).unlockWins <= wins ? machineId : 'toybox'
    const bag = Array.isArray(data.bag)
      ? data.bag.map((item) => ({
          ...item,
          mutation: item.mutation ?? 'none',
        }))
      : []
    return {
      coins: Number(data.coins) || START_COINS,
      score: Number(data.score) || 0,
      highScore: Number(data.highScore) || 0,
      bag,
      stickers: Array.isArray(data.stickers) ? data.stickers : [],
      wins,
      machineId: unlocked,
      lastDailyCreditDay: typeof data.lastDailyCreditDay === 'string' ? data.lastDailyCreditDay : undefined,
      lastOgPrizeDay: typeof data.lastOgPrizeDay === 'string' ? data.lastOgPrizeDay : undefined,
      lastSuperOgDay: typeof data.lastSuperOgDay === 'string' ? data.lastSuperOgDay : undefined,
      buff: data.buff ? { ...emptyBuff(), ...data.buff } : emptyBuff(),
    }
  } catch {
    return defaultSave()
  }
}

function defaultSave(): SaveData {
  return {
    coins: START_COINS,
    score: 0,
    highScore: 0,
    bag: [],
    stickers: [],
    wins: 0,
    machineId: 'toybox',
    lastDailyCreditDay: undefined,
    lastOgPrizeDay: undefined,
    lastSuperOgDay: undefined,
    buff: emptyBuff(),
  }
}

export class ClawGame {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private phase: GamePhase = 'attract'
  private machine: MachineDef
  private claw: ClawState = {
    x: CABINET.width / 2,
    cableY: CABINET.clawRestY,
    open: 1,
    targetX: CABINET.width / 2,
    grip: 1,
  }
  private prizes: Prize[]
  private held: Prize | null = null
  private particles: Particle[] = []
  private coins: number
  private score: number
  private highScore: number
  private bag: BagPrize[]
  private stickers: string[]
  private wins: number
  private lastDailyCreditDay: string | undefined
  private lastOgPrizeDay: string | undefined
  private lastSuperOgDay: string | undefined
  private buff: NeonBuff = emptyBuff()
  private streak = 0
  private message = 'Pick a machine · aim tight · keep what you hit'
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
  private swayPhase = 0
  private displaySway = 0
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
    this.lastDailyCreditDay = save.lastDailyCreditDay
    this.lastOgPrizeDay = save.lastOgPrizeDay
    this.lastSuperOgDay = save.lastSuperOgDay
    this.buff = save.buff ? { ...emptyBuff(), ...save.buff } : emptyBuff()
    this.machine = getMachine(save.machineId)
    this.prizes = createPrizePile(this.machine, 11)
    this.resize()
  }

  private ogPrizeStatus() {
    const today = todayKey()
    if (!this.lastOgPrizeDay) {
      return { canClaim: true, daysLeft: 0, today }
    }
    const elapsed = calendarDaysBetween(this.lastOgPrizeDay, today)
    const daysLeft = Math.max(0, OG_PRIZE_COOLDOWN_DAYS - elapsed)
    return { canClaim: daysLeft === 0, daysLeft, today }
  }

  private superOgStatus() {
    const today = todayKey()
    if (!this.lastSuperOgDay) {
      return { canClaim: true, daysLeft: 0, today }
    }
    const elapsed = calendarDaysBetween(this.lastSuperOgDay, today)
    const daysLeft = Math.max(0, SUPER_OG_COOLDOWN_DAYS - elapsed)
    return { canClaim: daysLeft === 0, daysLeft, today }
  }

  setStateListener(cb: () => void) {
    this.onState = cb
  }

  getState() {
    const sealedCount = this.bag.filter((p) => p.sealed).length
    const cost = this.machine.cost
    const unlockedIds = MACHINES.filter((m) => this.wins >= m.unlockWins).map((m) => m.id)
    const nextLock = MACHINES.find((m) => this.wins < m.unlockWins)
    const ogStatus = this.ogPrizeStatus()
    const superOgStatus = this.superOgStatus()
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
      machineId: this.machine.id,
      machine: this.machine,
      machines: MACHINES,
      unlockedIds,
      nextUnlock: nextLock
        ? { level: nextLock.level, name: nextLock.name, need: nextLock.unlockWins - this.wins }
        : null,
      cost,
      dailyCreditAmount: CREDIT_PACK,
      canClaimDaily: this.lastDailyCreditDay !== todayKey(),
      canClaimOgPrize: ogStatus.canClaim,
      ogPrizeDaysLeft: ogStatus.daysLeft,
      ogPrizeCooldownDays: OG_PRIZE_COOLDOWN_DAYS,
      canClaimSuperOg: superOgStatus.canClaim,
      superOgDaysLeft: superOgStatus.daysLeft,
      superOgCooldownDays: SUPER_OG_COOLDOWN_DAYS,
      buff: this.buff,
      canPlay:
        (this.coins >= cost || this.buff.freePlays > 0) &&
        (this.phase === 'attract' || this.phase === 'ready' || this.phase === 'result'),
      canMove: this.phase === 'moving',
      canDrop: this.phase === 'moving',
      canSwitchMachine: this.phase === 'attract' || this.phase === 'ready' || this.phase === 'result',
    }
  }

  private effectiveHitPadding() {
    return this.machine.hitPadding + this.buff.hitBoost
  }

  private effectiveSway() {
    return Math.max(0, this.machine.sway - this.buff.swayCut)
  }

  isUnlocked(id: MachineId) {
    const machine = getMachine(id)
    return this.wins >= machine.unlockWins
  }

  setMachine(id: MachineId) {
    if (!(this.phase === 'attract' || this.phase === 'ready' || this.phase === 'result')) return
    if (this.machine.id === id) return
    if (!this.isUnlocked(id)) {
      const m = getMachine(id)
      this.message = `Lvl ${m.level} locked — win ${m.unlockWins - this.wins} more prizes`
      this.notify()
      return
    }
    this.machine = getMachine(id)
    this.prizes = createPrizePile(this.machine, 11)
    this.held = null
    this.streak = 0
    this.claw = {
      x: CABINET.width / 2,
      cableY: CABINET.clawRestY,
      open: 1,
      targetX: CABINET.width / 2,
      grip: 1,
    }
    this.phase = 'attract'
    this.message = `Lvl ${this.machine.level} ${this.machine.name} · ${this.machine.cost}c · ${this.machine.difficulty}`
    this.persist()
    this.notify()
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

  /** Claim +10 arcade credits once per local calendar day. */
  claimDailyCredits(): boolean {
    const today = todayKey()
    if (this.lastDailyCreditDay === today) {
      this.message = 'Daily credits already claimed — come back tomorrow'
      this.notify()
      return false
    }
    this.coins += CREDIT_PACK
    this.lastDailyCreditDay = today
    this.message = `+${CREDIT_PACK} daily credits claimed`
    this.persist()
    this.notify()
    return true
  }

  /** Claim a sealed OG neon prize once every 2 local calendar days. */
  claimOgPrize(): BagPrize | null {
    const status = this.ogPrizeStatus()
    if (!status.canClaim) {
      this.message =
        status.daysLeft === 1
          ? 'OG prize ready tomorrow — check back then'
          : `OG prize on cooldown — ${status.daysLeft} days left`
      this.notify()
      return null
    }

    const kind: PrizeKind = Math.random() < 0.3 ? 'neonKing' : 'neonOG'
    const def = getPrizeDef(kind)
    const mutated = applyMutation(def, 'none')
    const bagItem: BagPrize = {
      id: `og-gift-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      kind,
      label: kind === 'neonKing' ? 'Bi-Daily OG King' : 'Bi-Daily OG Core',
      rarity: 'og',
      color: mutated.color,
      accent: mutated.accent,
      capsule: mutated.capsule,
      value: mutated.value,
      sealed: true,
      mutation: 'none',
    }
    this.bag.unshift(bagItem)
    this.lastOgPrizeDay = status.today
    this.message = `${bagItem.label} sealed — open it in your bag!`
    this.persist()
    this.notify()
    return bagItem
  }

  /** Claim a sealed Super OG prize now (first time), then every 3 days. */
  claimSuperOgPrize(): BagPrize | null {
    const status = this.superOgStatus()
    if (!status.canClaim) {
      this.message =
        status.daysLeft === 1
          ? 'Super OG ready tomorrow — check back then'
          : `Super OG on cooldown — ${status.daysLeft} days left`
      this.notify()
      return null
    }

    const kind: PrizeKind = Math.random() < 0.45 ? 'neonKing' : 'neonOG'
    const def = getPrizeDef(kind)
    const mutated = applyMutation(def, 'superOg')
    const bagItem: BagPrize = {
      id: `super-og-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      kind,
      label: mutated.label.startsWith('Super OG')
        ? mutated.label
        : `Super OG ${def.label}`,
      rarity: 'og',
      color: mutated.color,
      accent: mutated.accent,
      capsule: mutated.capsule,
      value: mutated.value,
      sealed: true,
      mutation: 'superOg',
    }
    this.bag.unshift(bagItem)
    this.lastSuperOgDay = status.today
    this.message = `${bagItem.label} sealed — SUPER OG ready to open!`
    this.persist()
    this.notify()
    return bagItem
  }

  /** @deprecated use claimDailyCredits — kept for older hooks */
  addCredits(_amount = CREDIT_PACK) {
    return this.claimDailyCredits()
  }

  openBagPrize(id: string): OpenReward | null {
    const item = this.bag.find((p) => p.id === id && p.sealed)
    if (!item) return null

    const reward = openPrizeReward(item.kind, item.rarity, item.label, item.mutation ?? 'none')
    const openMult = this.buff.openMult > 1 ? this.buff.openMult : 1
    reward.coins = Math.round(reward.coins * openMult)
    reward.score = Math.round(reward.score * openMult)
    item.sealed = false
    item.openedReward = reward
    this.coins += reward.coins
    this.score += reward.score
    if (reward.sticker && !this.stickers.includes(reward.sticker)) {
      this.stickers.push(reward.sticker)
    }
    if (reward.buff) {
      this.buff = mergeBuff(this.buff, reward.buff)
      reward.detail = `${reward.detail} · claw buff ${this.buff.playsLeft}p / ${this.buff.freePlays} free`
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

  forceFairWin(): BagPrize | null {
    if (this.phase === 'attract' || this.phase === 'ready' || this.phase === 'result') {
      if (this.coins < this.machine.cost) this.coins = Math.max(this.coins, this.machine.cost + 5)
      this.tryStartRound()
    }

    const target = this.prizes.find((p) => !p.grabbed)
    if (!target) return null

    this.claw.x = target.x
    this.claw.cableY = target.y - target.radius
    this.claw.open = 0.1
    this.held = null
    this.winPrize(target)
    this.prizes = this.prizes.filter((p) => p.id !== target.id)
    this.phase = 'result'
    this.claw.cableY = CABINET.clawRestY
    this.claw.open = 1
    this.persist()
    this.notify()
    return this.bag[0] ?? null
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
    if (key >= '1' && key <= '9') {
      const machine = MACHINES[Number(key) - 1]
      if (machine) this.setMachine(machine.id)
    }
    if (key === '0') {
      const machine = MACHINES[9]
      if (machine) this.setMachine(machine.id)
    }
    if (key === '[' || key === ']') {
      const idx = MACHINES.findIndex((m) => m.id === this.machine.id)
      const next = key === ']' ? idx + 1 : idx - 1
      if (next >= 0 && next < MACHINES.length) this.setMachine(MACHINES[next].id)
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
      machineId: this.machine.id,
      lastDailyCreditDay: this.lastDailyCreditDay,
      lastOgPrizeDay: this.lastOgPrizeDay,
      lastSuperOgDay: this.lastSuperOgDay,
      buff: this.buff,
    }
    localStorage.setItem(SAVE_KEY, JSON.stringify(data))
  }

  private grabX() {
    return this.claw.x + this.displaySway
  }

  private update(dt: number) {
    this.updateParticles(dt)
    const sway = this.effectiveSway()
    this.swayPhase += dt * (2.2 + sway * 0.08)
    this.displaySway =
      this.phase === 'moving' || this.phase === 'dropping'
        ? Math.sin(this.swayPhase) * sway
        : this.displaySway * 0.9

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
        this.claw.x = clamp(
          this.claw.x + dir * this.machine.clawSpeed * dt,
          CABINET.clawMinX,
          CABINET.clawMaxX,
        )
        this.claw.open = 1
        if (this.dropQueued) {
          this.dropQueued = false
          this.phase = 'dropping'
          this.message =
            this.buff.hitBoost > 0 ? 'Hold steady… MUTATION CLAW HOT' : 'Hold steady…'
          this.notify()
        }
        break
      }
      case 'dropping': {
        this.claw.cableY += this.machine.dropSpeed * dt
        this.claw.open = 1
        const probe = probeGrab(
          this.prizes,
          this.grabX(),
          this.claw.cableY + 28,
          this.effectiveHitPadding(),
          this.machine.perfectAlign,
        )
        const reachedFloor = this.claw.cableY >= CABINET.clawMaxY
        const reachedPrize =
          probe.hit &&
          probe.prize &&
          this.claw.cableY + 28 >= probe.prize.y - probe.prize.radius * 0.12
        if (reachedFloor || reachedPrize) {
          this.phase = 'grabbing'
          this.grabTimer = 0.34
          this.message = probe.hit ? 'Locking…' : 'Missed the pocket'
          this.notify()
        }
        break
      }
      case 'grabbing': {
        this.grabTimer -= dt
        this.claw.open = Math.max(0.08, this.grabTimer / 0.34)
        if (this.grabTimer <= 0) this.resolveGrab()
        break
      }
      case 'lifting': {
        this.claw.cableY -= 240 * dt
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
        const step = Math.sign(dx) * Math.min(Math.abs(dx), 230 * dt)
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
    const cost = this.machine.cost
    const free = this.buff.freePlays > 0
    if (!free && this.coins < cost) {
      this.message = `Need ${cost} coins — open prizes or pick a cheaper machine`
      this.notify()
      return
    }

    if (free) {
      this.buff.freePlays -= 1
    } else {
      this.coins -= cost
    }

    if (this.buff.playsLeft > 0) {
      this.buff.playsLeft -= 1
      if (this.buff.playsLeft <= 0) {
        this.buff.hitBoost = 0
        this.buff.swayCut = 0
        this.buff.openMult = 1
        this.buff.playsLeft = 0
      }
    }

    this.prizes = refillPrizes(this.machine, this.prizes, 9)
    this.held = null
    this.lastOpen = null
    this.displaySway = 0
    this.swayPhase = Math.random() * Math.PI * 2
    this.claw = {
      x: CABINET.width / 2,
      cableY: CABINET.clawRestY,
      open: 1,
      targetX: CABINET.width / 2,
      grip: 1,
    }
    this.phase = 'moving'
    const buffHint =
      this.buff.hitBoost > 0
        ? ` · MUT +${this.buff.hitBoost} grab / -${this.buff.swayCut} sway`
        : ''
    this.message = free
      ? `${this.machine.name}: FREE MUTATION PLAY${buffHint}`
      : `${this.machine.name}: center the claw — sway is real${buffHint}`
    this.lastResult = ''
    this.persist()
    this.notify()
  }

  private resolveGrab() {
    const probe = probeGrab(
      this.prizes,
      this.grabX(),
      this.claw.cableY + 28,
      this.effectiveHitPadding(),
      this.machine.perfectAlign,
    )

    if (!probe.hit || !probe.prize) {
      this.claw.grip = 0
      this.held = null
      this.phase = 'lifting'
      this.message = 'Missed — tighter center next time'
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
    this.message = probe.perfect ? 'Perfect grab!' : 'Got it — fair lock'
    this.phase = 'lifting'
    this.notify()
  }

  private winPrize(prize: Prize) {
    this.streak += 1
    this.wins += 1
    const streakBonus = this.streak > 1 ? this.streak * 2 : 0
    const machineBonus = Math.max(0, this.machine.cost - 1)
    this.score += prize.value + streakBonus + machineBonus

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
      mutation: prize.mutation ?? 'none',
    }
    this.bag.unshift(bagItem)

    if (this.score > this.highScore) this.highScore = this.score
    this.spawnBurst(CABINET.chuteX, CABINET.glassBottom - 20, prize.color)

    const newlyUnlocked = MACHINES.find((m) => m.unlockWins === this.wins)
    const mutTag =
      prize.mutation && prize.mutation !== 'none'
        ? ` · ${
            prize.mutation === 'superDooperNeon'
              ? 'DOOPER'
              : prize.mutation === 'superOg'
                ? 'SUPER OG'
                : prize.mutation === 'ogMut'
                  ? 'OG MUT'
                  : prize.mutation === 'superElectric'
                    ? 'SUPER ELEC'
                    : prize.mutation === 'mythicMut'
                      ? 'MYTHIC MUT'
                      : prize.mutation === 'lightning'
                        ? 'BOLT'
                        : prize.mutation === 'overcharge'
                          ? 'X-MUT'
                          : 'VOLT'
          }`
        : ''
    this.lastResult = newlyUnlocked
      ? `${prize.label} sealed${mutTag} · Unlocked Lvl ${newlyUnlocked.level}!`
      : `${prize.label} sealed${mutTag} — open it!`
    this.message = this.lastResult
    this.persist()
  }

  private finishRound() {
    this.claw.cableY = CABINET.clawRestY
    this.claw.open = 1
    this.phase = 'result'
    if (!this.lastResult) {
      this.message =
        this.coins >= this.machine.cost
          ? 'Challenge miss — try again'
          : 'Low coins — open bags or switch machine'
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
    const { ctx } = this
    ctx.clearRect(0, 0, CABINET.width, CABINET.height)
    drawCabinetBackground(ctx, CABINET.width, CABINET.height, time)
    drawCabinet(ctx, time, this.machine)
    drawPrizes(ctx, this.prizes, time)
    drawClaw(ctx, this.claw, this.held, time, this.displaySway)
    drawParticles(ctx, this.particles)
    drawHud(
      ctx,
      this.coins,
      this.score,
      this.highScore,
      this.message,
      this.phase,
      this.streak,
      this.machine.cost,
    )

    if (this.phase === 'attract') {
      drawOverlayMessage(ctx, this.machine.name.toUpperCase(), `${this.machine.blurb} · fair skill claw`)
    }
  }
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n))
}
