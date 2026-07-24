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

export type PrizeKind =
  | 'bear'
  | 'star'
  | 'duck'
  | 'heart'
  | 'robot'
  | 'jackpot'
  | 'car'
  | 'doll'
  | 'phone'
  | 'watch'
  | 'headphones'
  | 'tablet'

export type Rarity = 'common' | 'rare' | 'epic' | 'legend'

export type MachineId = 'toybox' | 'plush' | 'gadget' | 'vip'

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

export interface MachineDef {
  id: MachineId
  name: string
  short: string
  blurb: string
  cost: number
  difficulty: 'normal' | 'hard' | 'expert' | 'legend'
  /** Smaller = harder aim (still fair: hit = win) */
  hitPadding: number
  perfectAlign: number
  clawSpeed: number
  dropSpeed: number
  sway: number
  body: [string, string, string]
  glass: [string, string, string]
  marquee: string
  prizeKinds: PrizeKind[]
}

export const PRIZE_DEFS: PrizeDef[] = [
  { kind: 'duck', label: 'Bath Duck', value: 2, rarity: 'common', color: '#FFE566', accent: '#F0A500', radius: 24, capsule: '#F6D860' },
  { kind: 'bear', label: 'Honey Bear', value: 3, rarity: 'common', color: '#D4A574', accent: '#8B5A2B', radius: 26, capsule: '#C9956A' },
  { kind: 'car', label: 'Race Car', value: 4, rarity: 'common', color: '#E85D4C', accent: '#7A1510', radius: 22, capsule: '#F07167' },
  { kind: 'doll', label: 'Ribbon Doll', value: 5, rarity: 'rare', color: '#FFB4C8', accent: '#D45A7A', radius: 24, capsule: '#FF9BB3' },
  { kind: 'heart', label: 'Candy Heart', value: 4, rarity: 'rare', color: '#FF6B8A', accent: '#E63956', radius: 22, capsule: '#FF7A98' },
  { kind: 'star', label: 'Lucky Star', value: 5, rarity: 'rare', color: '#F4C15D', accent: '#E8952A', radius: 20, capsule: '#FFC94A' },
  { kind: 'robot', label: 'Tin Bot', value: 6, rarity: 'epic', color: '#7EC8C8', accent: '#2A8A8A', radius: 24, capsule: '#5FB8B8' },
  { kind: 'headphones', label: 'Beat Cans', value: 8, rarity: 'epic', color: '#4A4A55', accent: '#F4C15D', radius: 22, capsule: '#6B6B78' },
  { kind: 'watch', label: 'Chrono Watch', value: 12, rarity: 'epic', color: '#C9CED6', accent: '#2B2B2B', radius: 18, capsule: '#A8B0BC' },
  { kind: 'phone', label: 'Glow Phone', value: 16, rarity: 'legend', color: '#1C1C22', accent: '#7EC8C8', radius: 17, capsule: '#3A3A44' },
  { kind: 'tablet', label: 'Pocket Tab', value: 20, rarity: 'legend', color: '#22222A', accent: '#F4C15D', radius: 20, capsule: '#3F3F4A' },
  { kind: 'jackpot', label: 'Gold Brick', value: 25, rarity: 'legend', color: '#FFE29A', accent: '#FF8A3D', radius: 18, capsule: '#FFB347' },
]

export const MACHINES: MachineDef[] = [
  {
    id: 'toybox',
    name: 'Toy Box',
    short: 'TOYS',
    blurb: 'Cars, ducks & bears · starter spend',
    cost: 2,
    difficulty: 'normal',
    hitPadding: 8,
    perfectAlign: 0.4,
    clawSpeed: 150,
    dropSpeed: 300,
    sway: 4,
    body: ['#C62828', '#A11818', '#7A0F12'],
    glass: ['#9AD7D4', '#7EC8C8', '#5BA8A8'],
    marquee: '#C62828',
    prizeKinds: ['duck', 'bear', 'car', 'star', 'heart'],
  },
  {
    id: 'plush',
    name: 'Plush Palace',
    short: 'PLUSH',
    blurb: 'Dolls & bots · tighter aim',
    cost: 4,
    difficulty: 'hard',
    hitPadding: 4,
    perfectAlign: 0.32,
    clawSpeed: 175,
    dropSpeed: 320,
    sway: 7,
    body: ['#B33B5A', '#8E2E46', '#6A2033'],
    glass: ['#F2C4D0', '#E3A0B2', '#C97E93'],
    marquee: '#B33B5A',
    prizeKinds: ['bear', 'doll', 'robot', 'heart', 'duck', 'car'],
  },
  {
    id: 'gadget',
    name: 'Gadget Grab',
    short: 'TECH',
    blurb: 'Phones, watches, headphones',
    cost: 7,
    difficulty: 'expert',
    hitPadding: 2,
    perfectAlign: 0.28,
    clawSpeed: 195,
    dropSpeed: 340,
    sway: 10,
    body: ['#1F4E5F', '#163A46', '#0F2830'],
    glass: ['#8FD3E8', '#5FB4CF', '#3A8FA8'],
    marquee: '#1F4E5F',
    prizeKinds: ['phone', 'watch', 'headphones', 'robot', 'star'],
  },
  {
    id: 'vip',
    name: 'VIP Vault',
    short: 'VIP',
    blurb: 'Tablets & gold · expert claw',
    cost: 12,
    difficulty: 'legend',
    hitPadding: 0,
    perfectAlign: 0.22,
    clawSpeed: 210,
    dropSpeed: 360,
    sway: 14,
    body: ['#8A6A1F', '#6B5216', '#4A390F'],
    glass: ['#FFE29A', '#E8C56A', '#C9A445'],
    marquee: '#8A6A1F',
    prizeKinds: ['phone', 'watch', 'tablet', 'jackpot', 'headphones'],
  },
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

export function getPrizeDef(kind: PrizeKind): PrizeDef {
  return PRIZE_DEFS.find((d) => d.kind === kind) ?? PRIZE_DEFS[0]
}

export function getMachine(id: MachineId): MachineDef {
  return MACHINES.find((m) => m.id === id) ?? MACHINES[0]
}
