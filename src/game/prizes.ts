import {
  CABINET,
  getPrizeDef,
  type MachineDef,
  type MachineId,
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

/** Neon Night exclusive: Super Dooper Neon — only in the neon cabinet. */
function rollSuperDooperNeon(rarity: Rarity): boolean {
  const r = Math.random()
  if (rarity === 'og') return r < 0.28
  if (rarity === 'mythic') return r < 0.12
  if (rarity === 'legend') return r < 0.06
  if (rarity === 'epic') return r < 0.035
  return r < 0.018
}

/** Scarce Super OG forge — now and then on neon / storm. */
function rollSuperOg(rarity: Rarity, neonCabinet: boolean): boolean {
  const r = Math.random()
  const boost = neonCabinet ? 1.4 : 1
  if (rarity === 'og') return r < 0.12 * boost
  if (rarity === 'mythic') return r < 0.04 * boost
  if (rarity === 'legend') return r < 0.02 * boost
  return r < 0.008 * boost
}

/** Storm Bay: lightning / Super Electric strikes; a few forge into OG / Super OG. */
function rollStormMutation(rarity: Rarity): Mutation {
  if (rollSuperOg(rarity, false)) return 'superOg'
  const r = Math.random()
  const ogChance = rarity === 'legend' ? 0.07 : rarity === 'epic' ? 0.05 : 0.035
  const superChance = rarity === 'legend' ? 0.12 : rarity === 'epic' ? 0.1 : 0.08
  const boltChance = rarity === 'legend' ? 0.24 : rarity === 'epic' ? 0.2 : 0.18

  if (r < ogChance) return 'ogMut'
  if (r < ogChance + superChance) return 'superElectric'
  if (r < ogChance + superChance + boltChance) return 'lightning'
  return 'none'
}

/** Neon Night / neon kinds: volt ladder. Neon cabinets mutate more often. */
function rollNeonMutation(rarity: Rarity, neonCabinet: boolean): Mutation {
  // Super Dooper Neon only inside Neon Night
  if (neonCabinet && rollSuperDooperNeon(rarity)) return 'superDooperNeon'
  // Super OG now and then (higher chance in Neon Night)
  if (rollSuperOg(rarity, neonCabinet)) return 'superOg'

  const boost = neonCabinet ? 1.75 : 1
  const r = Math.random()
  const chance = (base: number) => Math.min(0.92, base * boost)

  if (rarity === 'og') {
    if (r < chance(0.4)) return 'ogMut'
    if (r < chance(0.4) + 0.2) return 'superElectric'
    if (r < chance(0.4) + 0.45) return 'mythicMut'
    if (r < chance(0.4) + 0.65) return 'overcharge'
    return 'volt'
  }

  if (rarity === 'mythic') {
    if (r < chance(0.1)) return 'ogMut'
    if (r < chance(0.1) + chance(0.1)) return 'superElectric'
    if (r < chance(0.1) + chance(0.1) + chance(0.24)) return 'mythicMut'
    if (r < chance(0.1) + chance(0.1) + chance(0.24) + 0.22) return 'overcharge'
    if (r < chance(0.1) + chance(0.1) + chance(0.24) + 0.45) return 'volt'
    return 'none'
  }

  if (rarity === 'legend') {
    if (r < chance(0.035)) return 'ogMut'
    if (r < chance(0.035) + chance(0.06)) return 'superElectric'
    if (r < chance(0.035) + chance(0.06) + chance(0.11)) return 'mythicMut'
    if (r < chance(0.035) + chance(0.06) + chance(0.11) + chance(0.16)) return 'overcharge'
    if (r < chance(0.035) + chance(0.06) + chance(0.11) + chance(0.16) + 0.2) return 'volt'
    return 'none'
  }

  if (rarity === 'epic') {
    if (r < chance(0.018)) return 'ogMut'
    if (r < chance(0.018) + chance(0.04)) return 'superElectric'
    if (r < chance(0.018) + chance(0.04) + chance(0.055)) return 'mythicMut'
    if (r < chance(0.018) + chance(0.04) + chance(0.055) + chance(0.13)) return 'overcharge'
    if (r < chance(0.018) + chance(0.04) + chance(0.055) + chance(0.13) + 0.18) return 'volt'
    return 'none'
  }

  if (r < chance(0.004)) return 'ogMut'
  if (r < chance(0.004) + chance(0.012)) return 'superElectric'
  if (r < chance(0.004) + chance(0.012) + chance(0.016)) return 'mythicMut'
  if (r < chance(0.004) + chance(0.012) + chance(0.016) + chance(0.07)) return 'overcharge'
  if (r < chance(0.004) + chance(0.012) + chance(0.016) + chance(0.07) + chance(0.16)) return 'volt'
  return 'none'
}

export function rollMutation(rarity: Rarity, kind: PrizeKind, machineId?: MachineId): Mutation {
  if (machineId === 'storm') return rollStormMutation(rarity)
  if (machineId === 'neon') return rollNeonMutation(rarity, true)
  if (NEON_KINDS.has(kind)) return rollNeonMutation(rarity, false)
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

  if (mutation === 'lightning') {
    return {
      label: `Bolt ${def.label}`,
      value: Math.round(def.value * 2.8),
      rarity: bumpRarity(def.rarity, 'mythic'),
      color: '#E8F4FF',
      accent: '#FFE29A',
      capsule: '#9BB8E0',
      radius: def.radius + 1,
    }
  }

  if (mutation === 'superElectric') {
    return {
      label: `Super Electric ${def.label}`,
      value: Math.round(def.value * 7),
      rarity: 'og',
      color: '#F7FCFF',
      accent: '#7EE0F0',
      capsule: '#B8D4F0',
      radius: def.radius + 2,
    }
  }

  if (mutation === 'superDooperNeon') {
    return {
      label: `Super Dooper Neon ${def.label}`,
      value: Math.round(def.value * 14),
      rarity: 'og',
      color: '#7EF0C8',
      accent: '#FF6B9A',
      capsule: '#B8FF4A',
      radius: def.radius + 4,
    }
  }

  if (mutation === 'superOg') {
    return {
      label: `Super OG ${def.label}`,
      value: Math.round(def.value * 20),
      rarity: 'og',
      color: '#FFE29A',
      accent: '#FF6B9A',
      capsule: '#FFD27A',
      radius: def.radius + 5,
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

  // ogMut — max OP (storm lightning forge uses cooler electric gold)
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

export function createPrizeFromDef(def: PrizeDef, x: number, y: number, machine?: MachineDef): Prize {
  const mutation = rollMutation(def.rarity, def.kind, machine?.id)
  const mutated = applyMutation(def, mutation)

  if (machine?.id === 'storm' && mutation === 'ogMut') {
    mutated.label = `Storm OG ${def.label}`
    mutated.color = '#F4F8FF'
    mutated.accent = '#FFE29A'
    mutated.capsule = '#7AA0D4'
  }

  if (machine?.id === 'neon' && mutation === 'superDooperNeon') {
    mutated.label = `Super Dooper Neon ${def.label}`
    mutated.color = '#7EF0C8'
    mutated.accent = '#FF6B9A'
    mutated.capsule = '#B8FF4A'
  }

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

  for (let i = 0; i < count; i++) {
    const def = pickDef(machine.prizeKinds)
    const col = i % cols
    const row = Math.floor(i / cols)
    const x = left + ((right - left) / (cols - 1)) * col + (Math.random() - 0.5) * 10
    const y = baseY - row * 38 - Math.random() * 6
    prizes.push(createPrizeFromDef(def, x, y, machine))
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
    case 'superOg':
      return 16
    case 'superDooperNeon':
      return 12
    case 'ogMut':
      return 8
    case 'superElectric':
      return 6.5
    case 'mythicMut':
      return 5
    case 'lightning':
      return 3.5
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
    case 'lightning':
      return { playsLeft: 5, hitBoost: 9, swayCut: 5, freePlays: 1, openMult: 1.6 }
    case 'overcharge':
      return { playsLeft: 4, hitBoost: 8, swayCut: 4, freePlays: 1, openMult: 1.5 }
    case 'mythicMut':
      return { playsLeft: 6, hitBoost: 12, swayCut: 6, freePlays: 2, openMult: 2 }
    case 'superElectric':
      return { playsLeft: 7, hitBoost: 14, swayCut: 8, freePlays: 2, openMult: 2.5 }
    case 'ogMut':
      return { playsLeft: 8, hitBoost: 16, swayCut: 10, freePlays: 3, openMult: 3 }
    case 'superDooperNeon':
      return { playsLeft: 10, hitBoost: 20, swayCut: 12, freePlays: 4, openMult: 4 }
    case 'superOg':
      return { playsLeft: 12, hitBoost: 24, swayCut: 14, freePlays: 5, openMult: 5 }
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
      mutation === 'superOg'
        ? `SUPER OG · ${reward.title}`
        : mutation === 'superDooperNeon'
          ? `SUPER DOOPER NEON · ${reward.title}`
          : mutation === 'ogMut'
            ? `OG MUT · ${reward.title}`
            : mutation === 'superElectric'
              ? `SUPER ELECTRIC · ${reward.title}`
              : mutation === 'mythicMut'
                ? `MYTHIC MUT · ${reward.title}`
                : mutation === 'lightning'
                  ? `BOLT · ${reward.title}`
                  : mutation === 'overcharge'
                    ? `X-MUT · ${reward.title}`
                    : mutation === 'volt'
                      ? `VOLT · ${reward.title}`
                      : reward.title,
  })

  if (mutation === 'superOg') {
    return withMut({
      title: 'SUPER OG DROP!!!',
      detail: `${label} — the ultimate original night-market haul`,
      coins: 55 + Math.floor(Math.random() * 40),
      score: 140 + Math.floor(Math.random() * 60),
      sticker: 'Super OG Crown',
    })
  }

  if (mutation === 'superDooperNeon') {
    return withMut({
      title: 'SUPER DOOPER NEON!!!',
      detail: `${label} melted the night market — max neon payout`,
      coins: 40 + Math.floor(Math.random() * 30),
      score: 100 + Math.floor(Math.random() * 50),
      sticker: 'Super Dooper Neon Crown',
    })
  }

  if (mutation === 'superElectric') {
    return withMut({
      title: 'SUPER ELECTRIC!',
      detail: `${label} overloaded the chute with pure volt loot`,
      coins: 20 + Math.floor(Math.random() * 14),
      score: 50 + Math.floor(Math.random() * 28),
      sticker: 'Super Electric Seal',
    })
  }

  if (mutation === 'lightning') {
    return withMut({
      title: 'LIGHTNING STRIKE!',
      detail: `${label} crackled open with storm credits`,
      coins: 12 + Math.floor(Math.random() * 8),
      score: 28 + Math.floor(Math.random() * 16),
      sticker: 'Storm Bolt Pin',
    })
  }

  if (
    kind === 'crystalShard' ||
    kind === 'crystalPrism' ||
    kind === 'crystalCluster' ||
    kind === 'crystalRelic'
  ) {
    if (kind === 'crystalRelic') {
      return withMut({
        title: 'CRYSTAL RELIC!!!',
        detail: `${label} shattered into a fortune of crystal credits`,
        coins: 35 + Math.floor(Math.random() * 25),
        score: 90 + Math.floor(Math.random() * 40),
        sticker: 'Crystal Relic Seal',
      })
    }
    if (kind === 'crystalCluster' || kind === 'crystalPrism') {
      return withMut({
        title: 'CRYSTAL BURST!',
        detail: `${label} lit the chute with prism loot`,
        coins: 18 + Math.floor(Math.random() * 14),
        score: 48 + Math.floor(Math.random() * 24),
        sticker: kind === 'crystalPrism' ? 'Prism Pin' : 'Cluster Crest',
      })
    }
    return withMut({
      title: 'Crystal score!',
      detail: `${label} paid out polished crystal coins`,
      coins: 12 + Math.floor(Math.random() * 8),
      score: 28 + Math.floor(Math.random() * 14),
      sticker: 'Crystal Shard Tag',
    })
  }

  if (kind === 'neonKing' || kind === 'neonOG' || rarity === 'og') {
    const stormOg = label.startsWith('Storm OG')
    return withMut({
      title: stormOg ? 'STORM OG FORGE!' : 'OG NEON DROP!',
      detail: stormOg
        ? `${label} — lightning forged this into an OG relic`
        : `${label} — original night-market core unlocked`,
      coins: 28 + Math.floor(Math.random() * 18),
      score: 70 + Math.floor(Math.random() * 40),
      sticker: stormOg
        ? 'Storm OG Seal'
        : kind === 'neonKing'
          ? 'OG Neon Crown'
          : 'OG Neon Seal',
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
    case 'superOg':
      return 'SUPER OG'
    case 'superDooperNeon':
      return 'DOOPER'
    case 'ogMut':
      return 'OG MUT'
    case 'superElectric':
      return 'SUPER ELEC'
    case 'mythicMut':
      return 'MYTHIC MUT'
    case 'lightning':
      return 'BOLT'
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
