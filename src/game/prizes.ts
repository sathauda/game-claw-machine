import { CABINET, PRIZE_DEFS, type Prize } from './types'

let nextId = 1

export function createPrizePile(count = 8): Prize[] {
  const prizes: Prize[] = []
  const left = CABINET.glassLeft + 30
  const right = CABINET.glassRight - 30
  const baseY = CABINET.floorY - 8

  for (let i = 0; i < count; i++) {
    const def = PRIZE_DEFS[Math.floor(Math.random() * PRIZE_DEFS.length)]
    const col = i % 4
    const row = Math.floor(i / 4)
    const x = left + ((right - left) / 3) * col + (Math.random() - 0.5) * 18
    const y = baseY - row * 42 - Math.random() * 10

    prizes.push({
      id: nextId++,
      kind: def.kind,
      label: def.label,
      value: def.value,
      color: def.color,
      accent: def.accent,
      x,
      y,
      radius: def.radius,
      wobble: Math.random() * Math.PI * 2,
      grabbed: false,
    })
  }

  return settlePrizes(prizes)
}

export function refillPrizes(existing: Prize[], minCount = 6): Prize[] {
  if (existing.length >= minCount) return existing
  const needed = minCount + Math.floor(Math.random() * 3) - existing.length
  return [...existing, ...createPrizePile(Math.max(needed, 2))]
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

export function findGrabTarget(prizes: Prize[], clawX: number, clawY: number): Prize | null {
  let best: Prize | null = null
  let bestDist = Infinity

  for (const p of prizes) {
    if (p.grabbed) continue
    const dx = p.x - clawX
    const dy = p.y - clawY
    const dist = Math.hypot(dx, dy)
    if (dist < p.radius + 18 && dist < bestDist) {
      best = p
      bestDist = dist
    }
  }

  return best
}
