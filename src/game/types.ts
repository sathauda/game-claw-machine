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

export type PrizeKind = 'bear' | 'star' | 'duck' | 'heart' | 'robot'

export interface PrizeDef {
  kind: PrizeKind
  label: string
  value: number
  color: string
  accent: string
  radius: number
}

export interface Prize {
  id: number
  kind: PrizeKind
  label: string
  value: number
  color: string
  accent: string
  x: number
  y: number
  radius: number
  wobble: number
  grabbed: boolean
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
  { kind: 'bear', label: 'Honey Bear', value: 3, color: '#D4A574', accent: '#8B5A2B', radius: 28 },
  { kind: 'star', label: 'Lucky Star', value: 5, color: '#F4C15D', accent: '#E8952A', radius: 24 },
  { kind: 'duck', label: 'Bath Duck', value: 2, color: '#FFE566', accent: '#F0A500', radius: 26 },
  { kind: 'heart', label: 'Candy Heart', value: 4, color: '#FF6B8A', accent: '#E63956', radius: 25 },
  { kind: 'robot', label: 'Tin Bot', value: 6, color: '#7EC8C8', accent: '#2A8A8A', radius: 27 },
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
