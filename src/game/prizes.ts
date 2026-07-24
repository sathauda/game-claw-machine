import {
  CABINET,
  getPrizeDef,
  type MachineDef,
  type Mutation,
  type NeonBuff,
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
  common: 40,
  rare: 26,
  epic: 16,
  legend: 10,
  mythic: 5,
  og: 2,
}

const RARITY_RANK: Record<Rarity, number> = {
  common: 0,
  rare: 1,
  epic: 2,
  legend: 3,
  mythic: 4,
  og: 5,
}

const NEON_KINDS = new Set<PrizeKind>([
  'neonStick',
  'neonCat',
  'neonSkate',
  'neonPhone',
  'neonWolf',
  'neonPulse',
  'neonBlade',
  'neonFox',
  'neonHydra',
  'neonOG',
  'neonKing',
])

function pickDef(pool: PrizeKind[]): PrizeDef {
  const defs = pool.map(getPrizeDef)
  const weighted = defs.flatMap((d) => Array(WEIGHTS[d.rarity]).fill(d)) as PrizeDef[]
  return weighted[Math.floor(Math.random() * weighted.length)]
}

function bumpRarity(current: Rarity, min: Rarity): Rarity {
  return RARITY_RANK[current] >= RARITY_RANK[min] ? current : min
}

/** Roll a neon mutation. Neon Night cabinets mutate much more often. */
export function rollMutation(rarity: Rarity, neonCabinet: boolean, kind: PrizeKind): Mutation {
  if (!NEON_KINDS.has(kind)) return 'none'

  const boost = neonCabinet ? 1.75 : 1
  const r = Math.random()

  const chance = (base: number) => Math.min(0.92, base * boost)

  if (rarity === 'og') {
    if (r < chance(0.45)) return 'ogMut'
    if (r < chance(0.45) + 0.3) return 'mythicMut'
    if (r < chance(0.45) + 0.55) return 'overcharge'
    return 'volt'
  }

  if (rarity === 'mythic') {
    if (r < chance(0.12)) return 'ogMut'
    if (r < chance(0.12) + chance(0.28)) return 'mythicMut'
    if (r < chance(0.12) + chance(0.28) + 0.25) return 'overcharge'
    if (r < chance(0.12) + chance(0.28) + 0.5) return 'volt'
    return 'none'
  }

  if (rarity === 'legend') {
    if (r < chance(0.04)) return 'ogMut'
    if (r < chance(0.04) + chance(0.12)) return 'mythicMut'
    if (r < chance(0.04) + chance(0.12) + chance(0.18)) return 'overcharge'
    if (r < chance(0.04) + chance(0.12) + chance(0.18) + 0.22) return 'volt'
    return 'none'
  }

  if (rarity === 'epic') {
    if (r < chance(0.02)) return 'ogMut'
    if (r < chance(0.02) + chance(0.06)) return 'mythicMut'
    if (r < chance(0.02) + chance(0.06) + chance(0.14)) return 'overcharge'
    if (r < chance(0.02) + chance(0.06) + chance(0.14) + 0.2) return 'volt'
    return 'none'
  }

  // common / rare neon
  if (r < chance(0.008)) return 'ogMut'
  if (r < chance(0.008) + chance(0.03)) return 'mythicMut'
  if (r < chance(0.008) + chance(0.03) + chance(0.1)) return 'overcharge'
  if (r < chance(0.008) + chance(0.03) + chance(0.1) + chance(0.22)) return 'volt'
  return 'none'
}

export function applyMutation(
  def: PrizeDef,
  mutation: Mutation,
): Pick<Prize, 'label' | 'value' | 'rarity' | 'color' | 'accent' | 'capsule' | 'radius'> {
  if (mutation === 'none') {
    return {
      label: def.label,
      value: def.value,
      rarity: def.rarity,
      color: def.color,
      accent: def.accent,
      capsule: def.capsule,
      radius: def.radius,
    }
  }

  if (mutation === 'volt') {
    return {
      label: `Volt ${def.label}`,
      value: Math.round(def.value * 1.8),
      rarity: bumpRarity(def.rarity, 'rare'),
      color: def.color,
      accent: '#B8FF4A',
      capsule: def.capsule,
      radius: def.radius,
    }
  }

  if (mutation === 'overcharge') {
    return {
      label: `X-${def.label}`,
      value: Math.round(def.value * 3.2),
      rarity: bumpRarity(def.rarity, 'legend'),
      color: '#7EF0C8',
      accent: '#FF6B9A',
      capsule: '#5FE0B8',
      radius: def.radius + 1,
    }
  }

  if (mutation === 'mythicMut') {
    return {
      label: `Mythic ${def.label}`,
      value: Math.round(def.value * 5.5),
      rarity: 'mythic',
      color: '#FF8A5A',
      accent: '#7EE0F0',
      capsule: '#F07040',
      radius: def.radius + 2,
    }
  }

  // ogMut — max OP
  return {
    label: `OG ${def.label}`,
    value: Math.round(def.value * 10),
    rarity: 'og',
    color: '#B8FF4A',
    accent: '#7EE0F0',
    capsule: '#9AE83A',
    radius: def.radius + 3,
  }
}

export function createPrizeFromDef(def: PrizeDef, x: number, y: number, neonCabinet = false): Prize {
  const mutation = rollMutation(def.rarity, neonCabinet, def.kind)
  const mutated = applyMutation(def, mutation)
  return {
    id: nextId++,
    kind: def.kind,
    ...mutated,
    x,
    y,
    wobble: Math.random() * Math.PI * 2,
    grabbed: false,
    mutation,
  }
}

export function createPrizePile(machine: MachineDef, count = 10): Prize[] {
  const prizes: Prize[] = []
  const left = CABINET.glassLeft + 28
  const right = CABINET.glassRight - 28
  const baseY = CABINET.floorY - 6
  const cols = 5
  const neonCabinet = machine.id === 'neon'

  for (let i = 0; i < count; i++) {
    const def = pickDef(machine.prizeKinds)
    const col = i % cols
    const row = Math.floor(i / cols)
    const x = left + ((right - left) / (cols - 1)) * col + (Math.random() - 0.5) * 10
    const y = baseY - row * 38 - Math.random() * 6
    prizes.push(createPrizeFromDef(def, x, y, neonCabinet || NEON_KINDS.has(def.kind)))
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

function mutationPayoutMult(mutation: Mutation): number {
  switch (mutation) {
    case 'ogMut':
      return 8
    case 'mythicMut':
      return 5
    case 'overcharge':
      return 3
    case 'volt':
      return 2
    default:
      return 1
  }
}

function mutationBuff(mutation: Mutation): NeonBuff | undefined {
  switch (mutation) {
    case 'volt':
      return { playsLeft: 3, hitBoost: 5, swayCut: 2, freePlays: 0, openMult: 1.25 }
    case 'overcharge':
      return { playsLeft: 4, hitBoost: 8, swayCut: 4, freePlays: 1, openMult: 1.5 }
    case 'mythicMut':
      return { playsLeft: 6, hitBoost: 12, swayCut: 6, freePlays: 2, openMult: 2 }
    case 'ogMut':
      return { playsLeft: 8, hitBoost: 16, swayCut: 10, freePlays: 3, openMult: 3 }
    default:
      return undefined
  }
}

export function emptyBuff(): NeonBuff {
  return { playsLeft: 0, hitBoost: 0, swayCut: 0, freePlays: 0, openMult: 1 }
}

export function mergeBuff(current: NeonBuff, next: NeonBuff): NeonBuff {
  return {
    playsLeft: Math.max(current.playsLeft, next.playsLeft),
    hitBoost: Math.max(current.hitBoost, next.hitBoost),
    swayCut: Math.max(current.swayCut, next.swayCut),
    freePlays: current.freePlays + next.freePlays,
    openMult: Math.max(current.openMult, next.openMult),
  }
}

export function openPrizeReward(
  kind: PrizeKind,
  rarity: Rarity,
  label: string,
  mutation: Mutation = 'none',
): OpenReward {
  const roll = Math.random()
  const mutMult = mutationPayoutMult(mutation)
  const buff = mutationBuff(mutation)

  const scale = (coins: number, score: number): Pick<OpenReward, 'coins' | 'score'> => ({
    coins: Math.round(coins * mutMult),
    score: Math.round(score * mutMult),
  })

  const withMut = (reward: OpenReward): OpenReward => ({
    ...reward,
    ...scale(reward.coins, reward.score),
    mutation,
    buff,
    detail:
      mutation !== 'none'
        ? `${reward.detail} · ${mutationLabel(mutation)} MUTATION ONLINE`
        : reward.detail,
    title:
      mutation === 'ogMut'
        ? `OG MUT · ${reward.title}`
        : mutation === 'mythicMut'
          ? `MYTHIC MUT · ${reward.title}`
          : mutation === 'overcharge'
            ? `X-MUT · ${reward.title}`
            : mutation === 'volt'
              ? `VOLT · ${reward.title}`
              : reward.title,
  })

  if (kind === 'neonKing' || kind === 'neonOG' || rarity === 'og') {
    return withMut({
      title: 'OG NEON DROP!',
      detail: `${label} — original night-market core unlocked`,
      coins: 28 + Math.floor(Math.random() * 18),
      score: 70 + Math.floor(Math.random() * 40),
      sticker: kind === 'neonKing' ? 'OG Neon Crown' : 'OG Neon Seal',
    })
  }

  if (kind === 'neonBlade' || kind === 'neonFox' || kind === 'neonHydra' || rarity === 'mythic') {
    return withMut({
      title: 'MYTHIC NEON!',
      detail: `${label} flooded the cabinet with volt credits`,
      coins: 16 + Math.floor(Math.random() * 12),
      score: 44 + Math.floor(Math.random() * 24),
      sticker:
        kind === 'neonFox'
          ? 'Mythic Fox Tag'
          : kind === 'neonHydra'
            ? 'Volt Hydra Crest'
            : 'Arc Blade Patch',
    })
  }

  if (NEON_KINDS.has(kind)) {
    if (rarity === 'legend') {
      return withMut({
        title: 'Neon pulse!',
        detail: `${label} lit up the prize chute`,
        coins: 10 + Math.floor(Math.random() * 6),
        score: 24 + Math.floor(Math.random() * 14),
        sticker: 'Pulse Orb Pin',
      })
    }
    if (rarity === 'epic') {
      return withMut({
        title: 'Volt score!',
        detail: `${label} paid neon credits`,
        coins: 7 + Math.floor(Math.random() * 5),
        score: 16 + Math.floor(Math.random() * 10),
        sticker: kind === 'neonPhone' ? 'Cyber Flip Badge' : 'Volt Wolf Pin',
      })
    }
    return withMut({
      title: 'Glow open!',
      detail: `${label} spilled electric coins`,
      coins: 4 + Math.floor(Math.random() * 4),
      score: 8 + Math.floor(Math.random() * 8),
      sticker: kind === 'neonCat' ? 'Neon Kitty Pin' : kind === 'neonSkate' ? 'Glow Skate Tag' : 'Volt Stick',
    })
  }

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
    return withMut({
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
    })
  }

  const gadgets = new Set<PrizeKind>(['watch', 'headphones', 'drone', 'camera', 'console', 'speaker', 'ring'])
  if (gadgets.has(kind)) {
    return withMut({
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
    })
  }

  const toys = new Set<PrizeKind>(['car', 'doll', 'dino', 'unicorn', 'sneakers', 'cat', 'penguin', 'soccer'])
  if (toys.has(kind) || rarity === 'epic') {
    return withMut({
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
    })
  }

  if (rarity === 'rare') {
    return withMut({
      title: 'Nice open!',
      detail: `${label} had a sweet surprise`,
      coins: 3 + Math.floor(Math.random() * 2),
      score: 5 + Math.floor(Math.random() * 4),
      sticker: roll < 0.5 ? 'Star Charm' : 'Candy Pin',
    })
  }

  return withMut({
    title: 'Prize opened!',
    detail: `${label} spilled some coins`,
    coins: 2 + Math.floor(Math.random() * 2),
    score: 3 + Math.floor(Math.random() * 3),
    sticker: roll < 0.35 ? 'Duck Sticker' : undefined,
  })
}

export function rarityLabel(rarity: Rarity): string {
  switch (rarity) {
    case 'og':
      return 'OG'
    case 'mythic':
      return 'MYTHIC'
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

export function mutationLabel(mutation: Mutation): string {
  switch (mutation) {
    case 'ogMut':
      return 'OG MUT'
    case 'mythicMut':
      return 'MYTHIC MUT'
    case 'overcharge':
      return 'X-MUT'
    case 'volt':
      return 'VOLT'
    default:
      return ''
  }
}

export function isNeonKind(kind: PrizeKind): boolean {
  return NEON_KINDS.has(kind)
}
