import { CABINET, PRIZE_DEFS, FAIR_CLAW, type OpenReward, type Prize, type PrizeDef, type PrizeKind, type Rarity } from './types'

let nextId = 1

const WEIGHTS: Record<Rarity, number> = {
  common: 42,
  rare: 28,
  epic: 18,
  legend: 8,
}

function pickDef(): PrizeDef {
  const pool = PRIZE_DEFS.flatMap((d) => Array(WEIGHTS[d.rarity]).fill(d)) as PrizeDef[]
  return pool[Math.floor(Math.random() * pool.length)]
}

export function createPrizeFromDef(def: PrizeDef, x: number, y: number): Prize {
  return {
    id: nextId++,
    kind: def.kind,
    label: def.label,
    value: def.value,
    rarity: def.rarity,
    color: def.color,
    accent: def.accent,
    capsule: def.capsule,
    x,
    y,
    radius: def.radius,
    wobble: Math.random() * Math.PI * 2,
    grabbed: false,
  }
}

export function createPrizePile(count = 9): Prize[] {
  const prizes: Prize[] = []
  const left = CABINET.glassLeft + 30
  const right = CABINET.glassRight - 30
  const baseY = CABINET.floorY - 8

  for (let i = 0; i < count; i++) {
    const def = pickDef()
    const col = i % 4
    const row = Math.floor(i / 4)
    const x = left + ((right - left) / 3) * col + (Math.random() - 0.5) * 16
    const y = baseY - row * 44 - Math.random() * 8
    prizes.push(createPrizeFromDef(def, x, y))
  }

  return settlePrizes(prizes)
}

export function refillPrizes(existing: Prize[], minCount = 7): Prize[] {
  const live = existing.filter((p) => !p.grabbed)
  if (live.length >= minCount) return live
  const needed = minCount + Math.floor(Math.random() * 2) - live.length
  return settlePrizes([...live, ...createPrizePile(Math.max(needed, 2))])
}

export function settlePrizes(prizes: Prize[]): Prize[] {
  const left = CABINET.glassLeft + 24
  const right = CABINET.glassRight - 24
  const floor = CABINET.floorY

  for (let pass = 0; pass < 8; pass++) {
    for (const p of prizes) {
      if (p.grabbed) continue
      p.y = Math.min(p.y, floor - p.radius)
      p.x = Math.max(left + p.radius, Math.min(right - p.radius, p.x))
    }

    for (let i = 0; i < prizes.length; i++) {
      for (let j = i + 1; j < prizes.length; j++) {
        const a = prizes[i]
        const b = prizes[j]
        if (a.grabbed || b.grabbed) continue
        const dx = b.x - a.x
        const dy = b.y - a.y
        const dist = Math.hypot(dx, dy) || 1
        const min = a.radius + b.radius - 6
        if (dist < min) {
          const push = (min - dist) / 2
          const nx = dx / dist
          const ny = dy / dist
          a.x -= nx * push
          a.y -= ny * push * 0.4
          b.x += nx * push
          b.y += ny * push * 0.4
        }
      }
    }
  }

  return prizes
}

export interface GrabProbe {
  prize: Prize | null
  align: number
  hit: boolean
  perfect: boolean
}

/** Skill check only — no hidden fail chance. */
export function probeGrab(prizes: Prize[], clawX: number, clawY: number): GrabProbe {
  let best: Prize | null = null
  let bestAlign = 0
  let bestScore = -Infinity

  for (const p of prizes) {
    if (p.grabbed) continue
    const dx = Math.abs(p.x - clawX)
    const dy = p.y - clawY
    const maxDx = p.radius + FAIR_CLAW.hitPadding
    if (dx > maxDx) continue
    if (dy < -FAIR_CLAW.verticalReach || dy > p.radius + 24) continue

    const align = 1 - dx / maxDx
    const score = align * 2 - Math.abs(dy) * 0.01
    if (score > bestScore) {
      bestScore = score
      best = p
      bestAlign = align
    }
  }

  if (!best) return { prize: null, align: 0, hit: false, perfect: false }

  const perfect = Math.abs(best.x - clawX) <= best.radius * FAIR_CLAW.perfectAlign
  return { prize: best, align: bestAlign, hit: true, perfect }
}

export function openPrizeReward(kind: PrizeKind, rarity: Rarity, label: string): OpenReward {
  const roll = Math.random()

  if (kind === 'jackpot' || rarity === 'legend') {
    const coins = 8 + Math.floor(Math.random() * 5)
    const score = 20 + Math.floor(Math.random() * 15)
    return {
      title: 'JACKPOT!',
      detail: `${label} burst open with arcade gold`,
      coins,
      score,
      sticker: 'Legend Seal',
    }
  }

  if (rarity === 'epic') {
    if (roll < 0.35) {
      return {
        title: 'Epic haul',
        detail: `${label} held a fat coin stack`,
        coins: 5 + Math.floor(Math.random() * 3),
        score: 10,
        sticker: 'Tin Badge',
      }
    }
    return {
      title: 'Machine bonus',
      detail: `${label} paid out tickets`,
      coins: 4,
      score: 14 + Math.floor(Math.random() * 8),
      sticker: 'Arcade Ticket',
    }
  }

  if (rarity === 'rare') {
    return {
      title: 'Nice open!',
      detail: `${label} had a sweet surprise`,
      coins: 3 + Math.floor(Math.random() * 2),
      score: 6 + Math.floor(Math.random() * 5),
      sticker: roll < 0.5 ? 'Star Charm' : 'Candy Pin',
    }
  }

  // common — still generous so play stays fun
  return {
    title: 'Prize opened!',
    detail: `${label} spilled some coins`,
    coins: 2 + Math.floor(Math.random() * 2),
    score: 3 + Math.floor(Math.random() * 3),
    sticker: roll < 0.4 ? 'Duck Sticker' : undefined,
  }
}

export function rarityLabel(rarity: Rarity): string {
  switch (rarity) {
    case 'legend':
      return 'LEGEND'
    case 'epic':
      return 'EPIC'
    case 'rare':
      return 'RARE'
    default:
      return 'COMMON'
  }
}
