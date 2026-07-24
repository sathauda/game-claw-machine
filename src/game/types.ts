export type GamePhase =
  | 'attract'
  | 'ready'
  | 'moving'
  | 'dropping'
  | 'grabbing'
  | 'lifting'
  | 'carrying'
  | 'releasing'
  | 'result'

export type PrizeKind = 'bear' | 'star' | 'duck' | 'heart' | 'robot' | 'jackpot'

export type Rarity = 'common' | 'rare' | 'epic' | 'legend'

export interface PrizeDef {
  kind: PrizeKind
  label: string
  value: number
  rarity: Rarity
  color: string
  accent: string
  radius: number
  capsule: string
}

export interface Prize {
  id: number
  kind: PrizeKind
  label: string
  value: number
  rarity: Rarity
  color: string
  accent: string
  capsule: string
  x: number
  y: number
  radius: number
  wobble: number
  grabbed: boolean
}

/** Sealed prize sitting in the player's bag, waiting to be opened. */
export interface BagPrize {
  id: string
  kind: PrizeKind
  label: string
  rarity: Rarity
  color: string
  accent: string
  capsule: string
  value: number
  sealed: boolean
  openedReward?: OpenReward
}

export interface OpenReward {
  title: string
  detail: string
  coins: number
  score: number
  sticker?: string
}

export interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  color: string
  size: number
}

export interface ClawState {
  x: number
  cableY: number
  open: number
  targetX: number
  grip: number
}

export const PRIZE_DEFS: PrizeDef[] = [
  { kind: 'duck', label: 'Bath Duck', value: 2, rarity: 'common', color: '#FFE566', accent: '#F0A500', radius: 26, capsule: '#F6D860' },
  { kind: 'bear', label: 'Honey Bear', value: 3, rarity: 'common', color: '#D4A574', accent: '#8B5A2B', radius: 28, capsule: '#C9956A' },
  { kind: 'heart', label: 'Candy Heart', value: 4, rarity: 'rare', color: '#FF6B8A', accent: '#E63956', radius: 25, capsule: '#FF7A98' },
  { kind: 'star', label: 'Lucky Star', value: 5, rarity: 'rare', color: '#F4C15D', accent: '#E8952A', radius: 24, capsule: '#FFC94A' },
  { kind: 'robot', label: 'Tin Bot', value: 6, rarity: 'epic', color: '#7EC8C8', accent: '#2A8A8A', radius: 27, capsule: '#5FB8B8' },
  { kind: 'jackpot', label: 'Jackpot Orb', value: 10, rarity: 'legend', color: '#FFE29A', accent: '#FF8A3D', radius: 22, capsule: '#FFB347' },
]

export const CABINET = {
  width: 420,
  height: 640,
  glassTop: 110,
  glassBottom: 470,
  glassLeft: 36,
  glassRight: 384,
  chuteX: 210,
  floorY: 455,
  clawMinX: 70,
  clawMaxX: 350,
  clawRestY: 130,
  clawMaxY: 430,
} as const

/** Fair claw: land on the prize and you keep it. No fake slips. */
export const FAIR_CLAW = {
  /** Horizontal offset within this fraction of radius = perfect lock */
  perfectAlign: 0.55,
  /** Max horizontal miss still counting as a hit */
  hitPadding: 14,
  /** Vertical grab reach past prize top */
  verticalReach: 20,
} as const
