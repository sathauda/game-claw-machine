import {
  CABINET,
  getPrizeDef,
  type MachineDef,
  type OpenReward,
  type Prize,
  type PrizeDef,
  type PrizeKind,
  type Rarity,
} from './types'

const FAIR_CLAW_BASE = {
  verticalReach: 16,
} as const

let nextId = 1

const WEIGHTS: Record<Rarity, number> = {
  common: 38,
  rare: 28,
  epic: 20,
  legend: 10,
}

function pickDef(pool: PrizeKind[]): PrizeDef {
  const defs = pool.map(getPrizeDef)
  const weighted = defs.flatMap((d) => Array(WEIGHTS[d.rarity]).fill(d)) as PrizeDef[]
  return weighted[Math.floor(Math.random() * weighted.length)]
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

export function createPrizePile(machine: MachineDef, count = 10): Prize[] {
  const prizes: Prize[] = []
  const left = CABINET.glassLeft + 28
  const right = CABINET.glassRight - 28
  const baseY = CABINET.floorY - 6
  const cols = 5

  for (let i = 0; i < count; i++) {
    const def = pickDef(machine.prizeKinds)
    const col = i % cols
    const row = Math.floor(i / cols)
    const x = left + ((right - left) / (cols - 1)) * col + (Math.random() - 0.5) * 10
    const y = baseY - row * 38 - Math.random() * 6
    prizes.push(createPrizeFromDef(def, x, y))
  }

  return settlePrizes(prizes)
}

export function refillPrizes(machine: MachineDef, existing: Prize[], minCount = 8): Prize[] {
  const live = existing.filter((p) => !p.grabbed)
  if (live.length >= minCount) return live
  const needed = minCount + Math.floor(Math.random() * 2) - live.length
  return settlePrizes([...live, ...createPrizePile(machine, Math.max(needed, 2))])
}

export function settlePrizes(prizes: Prize[]): Prize[] {
  const left = CABINET.glassLeft + 22
  const right = CABINET.glassRight - 22
  const floor = CABINET.floorY

  for (let pass = 0; pass < 10; pass++) {
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
        const min = a.radius + b.radius - 4
        if (dist < min) {
          const push = (min - dist) / 2
          const nx = dx / dist
          const ny = dy / dist
          a.x -= nx * push
          a.y -= ny * push * 0.45
          b.x += nx * push
          b.y += ny * push * 0.45
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

/** Skill check only — hit the smaller zone and you keep it. No fake fails. */
export function probeGrab(
  prizes: Prize[],
  clawX: number,
  clawY: number,
  hitPadding: number,
  perfectAlign: number,
): GrabProbe {
  let best: Prize | null = null
  let bestAlign = 0
  let bestScore = -Infinity

  for (const p of prizes) {
    if (p.grabbed) continue
    const dx = Math.abs(p.x - clawX)
    const dy = p.y - clawY
    const maxDx = Math.max(6, p.radius * 0.72 + hitPadding)
    if (dx > maxDx) continue
    if (dy < -FAIR_CLAW_BASE.verticalReach || dy > p.radius + 20) continue

    const align = 1 - dx / maxDx
    const score = align * 2 - Math.abs(dy) * 0.012
    if (score > bestScore) {
      bestScore = score
      best = p
      bestAlign = align
    }
  }

  if (!best) return { prize: null, align: 0, hit: false, perfect: false }

  const perfect = Math.abs(best.x - clawX) <= best.radius * perfectAlign
  return { prize: best, align: bestAlign, hit: true, perfect }
}

export function openPrizeReward(kind: PrizeKind, rarity: Rarity, label: string): OpenReward {
  const roll = Math.random()

  const legendTech = new Set<PrizeKind>(['phone', 'tablet', 'laptop', 'jackpot', 'gem', 'trophy', 'rocket', 'crown'])
  if (legendTech.has(kind)) {
    const coins = 10 + Math.floor(Math.random() * 10)
    const titles: Partial<Record<PrizeKind, string>> = {
      jackpot: 'GOLD HAUL!',
      gem: 'GEM BURST!',
      trophy: 'CHAMP LOOT!',
      rocket: 'BLAST PAYOUT!',
      crown: 'ROYAL DROP!',
      laptop: 'NOTEBOOK WIN!',
    }
    return {
      title: titles[kind] ?? 'TECH UNLOCKED!',
      detail: `${label} cracked open with premium loot`,
      coins,
      score: 22 + Math.floor(Math.random() * 22),
      sticker:
        kind === 'phone'
          ? 'Phone Badge'
          : kind === 'tablet'
            ? 'Tablet Seal'
            : kind === 'laptop'
              ? 'Note Seal'
              : kind === 'gem'
                ? 'Aqua Gem Pin'
                : kind === 'trophy'
                  ? 'Trophy Crest'
                  : kind === 'rocket'
                    ? 'Rocket Patch'
                    : kind === 'crown'
                      ? 'Crown Seal'
                      : 'Gold Brick Seal',
    }
  }

  const gadgets = new Set<PrizeKind>(['watch', 'headphones', 'drone', 'camera', 'console', 'speaker', 'ring'])
  if (gadgets.has(kind)) {
    return {
      title: 'Gadget score!',
      detail: `${label} paid out arcade credits`,
      coins: 6 + Math.floor(Math.random() * 5),
      score: 12 + Math.floor(Math.random() * 12),
      sticker:
        kind === 'watch'
          ? 'Chrono Pin'
          : kind === 'headphones'
            ? 'Beat Badge'
            : kind === 'drone'
              ? 'Drone Wing'
              : kind === 'camera'
                ? 'Snap Pin'
                : kind === 'console'
                  ? 'Play Badge'
                  : kind === 'speaker'
                    ? 'Boom Badge'
                    : 'Lucky Ring',
    }
  }

  const toys = new Set<PrizeKind>(['car', 'doll', 'dino', 'unicorn', 'sneakers', 'cat', 'penguin', 'soccer'])
  if (toys.has(kind) || rarity === 'epic') {
    return {
      title: 'Toy chest!',
      detail: `${label} spilled a fun pile of coins`,
      coins: 4 + Math.floor(Math.random() * 3),
      score: 8 + Math.floor(Math.random() * 7),
      sticker:
        kind === 'car'
          ? 'Race Sticker'
          : kind === 'doll'
            ? 'Doll Charm'
            : kind === 'dino'
              ? 'Dino Stamp'
              : kind === 'unicorn'
                ? 'Unicorn Charm'
                : kind === 'sneakers'
                  ? 'Kick Tag'
                  : kind === 'cat'
                    ? 'Kitty Pin'
                    : kind === 'penguin'
                      ? 'Penguin Pin'
                      : kind === 'soccer'
                        ? 'Goal Sticker'
                        : 'Epic Token',
    }
  }

  if (rarity === 'rare') {
    return {
      title: 'Nice open!',
      detail: `${label} had a sweet surprise`,
      coins: 3 + Math.floor(Math.random() * 2),
      score: 5 + Math.floor(Math.random() * 4),
      sticker: roll < 0.5 ? 'Star Charm' : 'Candy Pin',
    }
  }

  return {
    title: 'Prize opened!',
    detail: `${label} spilled some coins`,
    coins: 2 + Math.floor(Math.random() * 2),
    score: 3 + Math.floor(Math.random() * 3),
    sticker: roll < 0.35 ? 'Duck Sticker' : undefined,
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
