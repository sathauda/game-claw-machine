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
  | 'cat'
  | 'dino'
  | 'unicorn'
  | 'penguin'
  | 'soccer'
  | 'drone'
  | 'camera'
  | 'console'
  | 'speaker'
  | 'laptop'
  | 'ring'
  | 'sneakers'
  | 'gem'
  | 'trophy'
  | 'rocket'
  | 'crown'
  | 'crystalShard'
  | 'crystalPrism'
  | 'crystalCluster'
  | 'crystalRelic'
  | 'neonStick'
  | 'neonCat'
  | 'neonSkate'
  | 'neonPhone'
  | 'neonWolf'
  | 'neonPulse'
  | 'neonBlade'
  | 'neonFox'
  | 'neonHydra'
  | 'neonOG'
  | 'neonKing'

export type Rarity = 'common' | 'rare' | 'epic' | 'legend' | 'mythic' | 'og'

/** Prize mutations — neon / storm lightning tiers; top tiers go OP / OG */
export type Mutation =
  | 'none'
  | 'volt'
  | 'overcharge'
  | 'mythicMut'
  | 'ogMut'
  | 'lightning'
  | 'superElectric'
  | 'superDooperNeon'
  | 'superOg'
  | 'shadow'
  | 'umbra'

export interface NeonBuff {
  playsLeft: number
  hitBoost: number
  swayCut: number
  freePlays: number
  openMult: number
}

export type Difficulty = 'easy' | 'normal' | 'hard' | 'expert' | 'legend' | 'mythic' | 'nightmare' | 'apex'

export type MachineId =
  | 'toybox'
  | 'candy'
  | 'plush'
  | 'race'
  | 'botbay'
  | 'gadget'
  | 'chrono'
  | 'vip'
  | 'forge'
  | 'mythic'
  | 'neon'
  | 'storm'
  | 'crystal'
  | 'shadow'
  | 'titan'
  | 'nova'
  | 'ember'
  | 'frost'
  | 'omega'
  | 'apex'

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
  mutation: Mutation
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
  mutation: Mutation
  openedReward?: OpenReward
}

export interface OpenReward {
  title: string
  detail: string
  coins: number
  score: number
  sticker?: string
  mutation?: Mutation
  buff?: NeonBuff
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
  level: number
  name: string
  short: string
  blurb: string
  cost: number
  /** Wins needed to unlock this level (0 = open) */
  unlockWins: number
  difficulty: Difficulty
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
  { kind: 'cat', label: 'Kitty Plush', value: 3, rarity: 'common', color: '#F0C89A', accent: '#C48A4A', radius: 24, capsule: '#E8B87A' },
  { kind: 'penguin', label: 'Chill Penguin', value: 3, rarity: 'common', color: '#2B2B2B', accent: '#F7E8C8', radius: 23, capsule: '#5A5A5A' },
  { kind: 'soccer', label: 'Goal Ball', value: 3, rarity: 'common', color: '#F7F7F7', accent: '#2B2B2B', radius: 22, capsule: '#D8D8D8' },
  { kind: 'doll', label: 'Ribbon Doll', value: 5, rarity: 'rare', color: '#FFB4C8', accent: '#D45A7A', radius: 24, capsule: '#FF9BB3' },
  { kind: 'heart', label: 'Candy Heart', value: 4, rarity: 'rare', color: '#FF6B8A', accent: '#E63956', radius: 22, capsule: '#FF7A98' },
  { kind: 'star', label: 'Lucky Star', value: 5, rarity: 'rare', color: '#F4C15D', accent: '#E8952A', radius: 20, capsule: '#FFC94A' },
  { kind: 'dino', label: 'Pixel Dino', value: 6, rarity: 'rare', color: '#5FBF6A', accent: '#2E7A38', radius: 25, capsule: '#7AD184' },
  { kind: 'unicorn', label: 'Sparkle Unicorn', value: 7, rarity: 'rare', color: '#FFE8F2', accent: '#E890B8', radius: 25, capsule: '#FFD0E0' },
  { kind: 'sneakers', label: 'Kick Kicks', value: 7, rarity: 'rare', color: '#F4C15D', accent: '#C62828', radius: 22, capsule: '#E8B04A' },
  { kind: 'robot', label: 'Tin Bot', value: 6, rarity: 'epic', color: '#7EC8C8', accent: '#2A8A8A', radius: 24, capsule: '#5FB8B8' },
  { kind: 'headphones', label: 'Beat Cans', value: 8, rarity: 'epic', color: '#4A4A55', accent: '#F4C15D', radius: 22, capsule: '#6B6B78' },
  { kind: 'speaker', label: 'Boom Box', value: 9, rarity: 'epic', color: '#3A3A44', accent: '#7EC8C8', radius: 23, capsule: '#555560' },
  { kind: 'camera', label: 'Snap Cam', value: 10, rarity: 'epic', color: '#2B2B2B', accent: '#F4C15D', radius: 21, capsule: '#4A4A4A' },
  { kind: 'console', label: 'Play Brick', value: 11, rarity: 'epic', color: '#1F4E5F', accent: '#7EC8C8', radius: 22, capsule: '#2A6A7A' },
  { kind: 'watch', label: 'Chrono Watch', value: 12, rarity: 'epic', color: '#C9CED6', accent: '#2B2B2B', radius: 18, capsule: '#A8B0BC' },
  { kind: 'drone', label: 'Sky Drone', value: 13, rarity: 'epic', color: '#5A6A78', accent: '#F4C15D', radius: 22, capsule: '#7A8A98' },
  { kind: 'ring', label: 'Lucky Ring', value: 14, rarity: 'epic', color: '#FFE29A', accent: '#E8A030', radius: 17, capsule: '#FFD27A' },
  { kind: 'phone', label: 'Glow Phone', value: 16, rarity: 'legend', color: '#1C1C22', accent: '#7EC8C8', radius: 17, capsule: '#3A3A44' },
  { kind: 'laptop', label: 'Slim Note', value: 18, rarity: 'legend', color: '#2A2A32', accent: '#C9CED6', radius: 22, capsule: '#454550' },
  { kind: 'tablet', label: 'Pocket Tab', value: 20, rarity: 'legend', color: '#22222A', accent: '#F4C15D', radius: 20, capsule: '#3F3F4A' },
  { kind: 'gem', label: 'Aqua Gem', value: 22, rarity: 'legend', color: '#4FD0E0', accent: '#1A8A98', radius: 18, capsule: '#6FE0F0' },
  { kind: 'trophy', label: 'Gold Trophy', value: 24, rarity: 'legend', color: '#F4C15D', accent: '#B88420', radius: 22, capsule: '#FFD27A' },
  { kind: 'rocket', label: 'Mini Rocket', value: 26, rarity: 'legend', color: '#E85D4C', accent: '#F7E8C8', radius: 23, capsule: '#F07167' },
  { kind: 'crown', label: 'Arcade Crown', value: 28, rarity: 'legend', color: '#FFE29A', accent: '#E8A030', radius: 22, capsule: '#FFD27A' },
  { kind: 'jackpot', label: 'Gold Brick', value: 30, rarity: 'legend', color: '#FFE29A', accent: '#FF8A3D', radius: 18, capsule: '#FFB347' },
  // Crystal Case exclusives — worth a lot
  { kind: 'crystalShard', label: 'Crystal Shard', value: 32, rarity: 'legend', color: '#C8F0FF', accent: '#7EE0F0', radius: 18, capsule: '#A8E0F5' },
  { kind: 'crystalPrism', label: 'Prism Crystal', value: 48, rarity: 'mythic', color: '#E8D0FF', accent: '#B48AFF', radius: 20, capsule: '#D0B8F0' },
  { kind: 'crystalCluster', label: 'Crystal Cluster', value: 58, rarity: 'mythic', color: '#B8FFE8', accent: '#4FD0C8', radius: 24, capsule: '#90E8D8' },
  { kind: 'crystalRelic', label: 'Crystal Relic', value: 85, rarity: 'og', color: '#F4F8FF', accent: '#FFE29A', radius: 22, capsule: '#D8EEF5' },
  // Neon Night exclusives
  { kind: 'neonStick', label: 'Volt Stick', value: 8, rarity: 'common', color: '#7EF0C8', accent: '#1AD4A0', radius: 20, capsule: '#5FE0B8' },
  { kind: 'neonCat', label: 'Neon Kitty', value: 12, rarity: 'rare', color: '#7EE0F0', accent: '#FF6B9A', radius: 23, capsule: '#5FD0E0' },
  { kind: 'neonSkate', label: 'Glow Skates', value: 14, rarity: 'rare', color: '#B8FF4A', accent: '#7EE0F0', radius: 22, capsule: '#9AE83A' },
  { kind: 'neonPhone', label: 'Cyber Flip', value: 18, rarity: 'epic', color: '#0A1A22', accent: '#7EF0C8', radius: 17, capsule: '#1A3A44' },
  { kind: 'neonWolf', label: 'Volt Wolf', value: 20, rarity: 'epic', color: '#1A2A3A', accent: '#7EE0F0', radius: 24, capsule: '#2A4050' },
  { kind: 'neonPulse', label: 'Pulse Orb', value: 26, rarity: 'legend', color: '#7EE0F0', accent: '#FF6B9A', radius: 19, capsule: '#5FD0E0' },
  { kind: 'neonBlade', label: 'Arc Blade', value: 34, rarity: 'mythic', color: '#7EF0C8', accent: '#F4C15D', radius: 21, capsule: '#5FE0B8' },
  { kind: 'neonFox', label: 'Mythic Fox', value: 38, rarity: 'mythic', color: '#FF8A5A', accent: '#7EE0F0', radius: 23, capsule: '#F07040' },
  { kind: 'neonHydra', label: 'Volt Hydra', value: 42, rarity: 'mythic', color: '#B8FF4A', accent: '#FF6B9A', radius: 24, capsule: '#9AE83A' },
  { kind: 'neonOG', label: 'OG Neon Core', value: 55, rarity: 'og', color: '#7EE0F0', accent: '#B8FF4A', radius: 20, capsule: '#4FC4D8' },
  { kind: 'neonKing', label: 'OG Neon King', value: 70, rarity: 'og', color: '#FFE29A', accent: '#7EE0F0', radius: 22, capsule: '#FFD27A' },
]

export const MACHINES: MachineDef[] = [
  {
    id: 'toybox',
    level: 1,
    name: 'Toy Box',
    short: 'L1 TOYS',
    blurb: 'Starter toys · warm-up aim',
    cost: 2,
    unlockWins: 0,
    difficulty: 'easy',
    hitPadding: 10,
    perfectAlign: 0.45,
    clawSpeed: 145,
    dropSpeed: 290,
    sway: 3,
    body: ['#C62828', '#A11818', '#7A0F12'],
    glass: ['#9AD7D4', '#7EC8C8', '#5BA8A8'],
    marquee: '#C62828',
    prizeKinds: ['duck', 'bear', 'car', 'cat', 'penguin', 'soccer', 'star'],
  },
  {
    id: 'candy',
    level: 2,
    name: 'Candy Corner',
    short: 'L2 SWEET',
    blurb: 'Hearts & stars · a bit tighter',
    cost: 3,
    unlockWins: 2,
    difficulty: 'normal',
    hitPadding: 7,
    perfectAlign: 0.4,
    clawSpeed: 155,
    dropSpeed: 300,
    sway: 5,
    body: ['#D94F6D', '#B33B55', '#8A2C41'],
    glass: ['#FFD0DA', '#F5A9B8', '#E0879A'],
    marquee: '#D94F6D',
    prizeKinds: ['heart', 'star', 'duck', 'doll', 'bear', 'unicorn', 'cat'],
  },
  {
    id: 'plush',
    level: 3,
    name: 'Plush Palace',
    short: 'L3 PLUSH',
    blurb: 'Dolls & softies · harder pocket',
    cost: 4,
    unlockWins: 4,
    difficulty: 'normal',
    hitPadding: 5,
    perfectAlign: 0.36,
    clawSpeed: 165,
    dropSpeed: 310,
    sway: 6,
    body: ['#B33B5A', '#8E2E46', '#6A2033'],
    glass: ['#F2C4D0', '#E3A0B2', '#C97E93'],
    marquee: '#B33B5A',
    prizeKinds: ['bear', 'doll', 'robot', 'heart', 'duck', 'cat', 'dino', 'penguin'],
  },
  {
    id: 'race',
    level: 4,
    name: 'Race Track',
    short: 'L4 RACE',
    blurb: 'Cars fly by · quicker claw',
    cost: 5,
    unlockWins: 6,
    difficulty: 'hard',
    hitPadding: 4,
    perfectAlign: 0.33,
    clawSpeed: 185,
    dropSpeed: 330,
    sway: 8,
    body: ['#D35400', '#A84200', '#7A3000'],
    glass: ['#F5C79A', '#E3A56A', '#C98445'],
    marquee: '#D35400',
    prizeKinds: ['car', 'star', 'robot', 'headphones', 'soccer', 'sneakers', 'dino'],
  },
  {
    id: 'botbay',
    level: 5,
    name: 'Bot Bay',
    short: 'L5 BOTS',
    blurb: 'Tin bots & audio · steady hands',
    cost: 6,
    unlockWins: 9,
    difficulty: 'hard',
    hitPadding: 3,
    perfectAlign: 0.3,
    clawSpeed: 190,
    dropSpeed: 335,
    sway: 9,
    body: ['#2E6B5A', '#215045', '#16382F'],
    glass: ['#A8E0D0', '#7EC8B8', '#5AA898'],
    marquee: '#2E6B5A',
    prizeKinds: ['robot', 'headphones', 'car', 'watch', 'speaker', 'console', 'drone'],
  },
  {
    id: 'gadget',
    level: 6,
    name: 'Gadget Grab',
    short: 'L6 TECH',
    blurb: 'Phones & watches enter the mix',
    cost: 8,
    unlockWins: 12,
    difficulty: 'expert',
    hitPadding: 2,
    perfectAlign: 0.28,
    clawSpeed: 198,
    dropSpeed: 345,
    sway: 11,
    body: ['#1F4E5F', '#163A46', '#0F2830'],
    glass: ['#8FD3E8', '#5FB4CF', '#3A8FA8'],
    marquee: '#1F4E5F',
    prizeKinds: ['phone', 'watch', 'headphones', 'camera', 'console', 'speaker', 'drone'],
  },
  {
    id: 'chrono',
    level: 7,
    name: 'Chrono Hall',
    short: 'L7 TIME',
    blurb: 'Watch vault · tiny targets',
    cost: 10,
    unlockWins: 16,
    difficulty: 'expert',
    hitPadding: 1,
    perfectAlign: 0.25,
    clawSpeed: 205,
    dropSpeed: 350,
    sway: 12,
    body: ['#3D4A5C', '#2C3644', '#1C232D'],
    glass: ['#C9D4E0', '#A8B8C8', '#8798AA'],
    marquee: '#3D4A5C',
    prizeKinds: ['watch', 'phone', 'headphones', 'tablet', 'ring', 'camera', 'drone'],
  },
  {
    id: 'vip',
    level: 8,
    name: 'VIP Vault',
    short: 'L8 VIP',
    blurb: 'Tablets & phones · pro claw',
    cost: 14,
    unlockWins: 20,
    difficulty: 'legend',
    hitPadding: 0,
    perfectAlign: 0.22,
    clawSpeed: 215,
    dropSpeed: 360,
    sway: 14,
    body: ['#8A6A1F', '#6B5216', '#4A390F'],
    glass: ['#FFE29A', '#E8C56A', '#C9A445'],
    marquee: '#8A6A1F',
    prizeKinds: ['phone', 'watch', 'tablet', 'laptop', 'jackpot', 'headphones', 'gem'],
  },
  {
    id: 'forge',
    level: 9,
    name: 'Fortune Forge',
    short: 'L9 GOLD',
    blurb: 'Gold bricks shine · brutal sway',
    cost: 18,
    unlockWins: 26,
    difficulty: 'legend',
    hitPadding: -1,
    perfectAlign: 0.2,
    clawSpeed: 225,
    dropSpeed: 370,
    sway: 16,
    body: ['#A65D1A', '#824812', '#5C330C'],
    glass: ['#FFD28A', '#F0B85A', '#D99A3A'],
    marquee: '#A65D1A',
    prizeKinds: ['jackpot', 'tablet', 'phone', 'watch', 'trophy', 'gem', 'crown'],
  },
  {
    id: 'mythic',
    level: 10,
    name: 'Mythic Machine',
    short: 'L10 MYTH',
    blurb: 'Mid-boss cabinet · razor aim',
    cost: 25,
    unlockWins: 35,
    difficulty: 'mythic',
    hitPadding: -2,
    perfectAlign: 0.18,
    clawSpeed: 240,
    dropSpeed: 385,
    sway: 18,
    body: ['#5C1A1A', '#401212', '#2A0C0C'],
    glass: ['#E8B86A', '#D4A045', '#B8862E'],
    marquee: '#5C1A1A',
    prizeKinds: ['jackpot', 'tablet', 'phone', 'watch', 'rocket', 'crown', 'trophy', 'gem'],
  },
  {
    id: 'neon',
    level: 11,
    name: 'Neon Night',
    short: 'L11 NEON',
    blurb: 'Super Dooper Neon · mythic & OG mutations',
    cost: 28,
    unlockWins: 42,
    difficulty: 'mythic',
    hitPadding: -2,
    perfectAlign: 0.17,
    clawSpeed: 245,
    dropSpeed: 390,
    sway: 19,
    body: ['#0E3D4A', '#0A2C36', '#061C24'],
    glass: ['#7EE0F0', '#4FC4D8', '#2AA0B8'],
    marquee: '#0E3D4A',
    prizeKinds: [
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
    ],
  },
  {
    id: 'storm',
    level: 12,
    name: 'Storm Bay',
    short: 'L12 STORM',
    blurb: 'Bolt · Super Electric · Storm OG forge',
    cost: 32,
    unlockWins: 50,
    difficulty: 'nightmare',
    hitPadding: -3,
    perfectAlign: 0.16,
    clawSpeed: 255,
    dropSpeed: 405,
    sway: 20,
    body: ['#1A3358', '#122440', '#0C182C'],
    glass: ['#9BB8E0', '#6F92C4', '#4A6FA0'],
    marquee: '#1A3358',
    prizeKinds: ['watch', 'phone', 'tablet', 'headphones', 'drone', 'camera', 'laptop'],
  },
  {
    id: 'crystal',
    level: 13,
    name: 'Crystal Case',
    short: 'L13 CRYS',
    blurb: 'High-value crystals · Prism · Relic',
    cost: 36,
    unlockWins: 58,
    difficulty: 'nightmare',
    hitPadding: -3,
    perfectAlign: 0.15,
    clawSpeed: 260,
    dropSpeed: 410,
    sway: 21,
    body: ['#4A6A78', '#35505C', '#243842'],
    glass: ['#D8EEF5', '#B5D8E4', '#8FBAC8'],
    marquee: '#4A6A78',
    prizeKinds: [
      'gem',
      'crystalShard',
      'crystalPrism',
      'crystalCluster',
      'crystalRelic',
      'ring',
      'crown',
      'jackpot',
    ],
  },
  {
    id: 'shadow',
    level: 14,
    name: 'Shadow Shelf',
    short: 'L14 SHAD',
    blurb: 'Shade · Umbra · Shadow OG mutations',
    cost: 40,
    unlockWins: 66,
    difficulty: 'nightmare',
    hitPadding: -3,
    perfectAlign: 0.145,
    clawSpeed: 265,
    dropSpeed: 415,
    sway: 22,
    body: ['#2A2A32', '#1C1C22', '#121216'],
    glass: ['#6A6A78', '#50505C', '#3A3A44'],
    marquee: '#2A2A32',
    prizeKinds: ['phone', 'watch', 'tablet', 'jackpot', 'laptop', 'rocket', 'gem'],
  },
  {
    id: 'titan',
    level: 15,
    name: 'Titan Claw',
    short: 'L15 TITAN',
    blurb: 'Heavy sway · legend loot only',
    cost: 45,
    unlockWins: 75,
    difficulty: 'nightmare',
    hitPadding: -4,
    perfectAlign: 0.14,
    clawSpeed: 270,
    dropSpeed: 420,
    sway: 23,
    body: ['#6B3A1E', '#522C16', '#3A1E0F'],
    glass: ['#E0B898', '#C9946A', '#A8744A'],
    marquee: '#6B3A1E',
    prizeKinds: ['jackpot', 'tablet', 'phone', 'watch', 'trophy', 'crown', 'rocket', 'neonBlade', 'neonFox'],
  },
  {
    id: 'nova',
    level: 16,
    name: 'Nova Nest',
    short: 'L16 NOVA',
    blurb: 'Star-speed claw · gold rush',
    cost: 50,
    unlockWins: 85,
    difficulty: 'nightmare',
    hitPadding: -4,
    perfectAlign: 0.135,
    clawSpeed: 280,
    dropSpeed: 430,
    sway: 24,
    body: ['#7A4A12', '#5C380C', '#402708'],
    glass: ['#FFE6A8', '#F0C86A', '#D4A845'],
    marquee: '#7A4A12',
    prizeKinds: ['jackpot', 'tablet', 'phone', 'watch', 'headphones', 'gem', 'crown', 'neonHydra', 'neonFox'],
  },
  {
    id: 'ember',
    level: 17,
    name: 'Ember Engine',
    short: 'L17 EMBER',
    blurb: 'Scorching pace · no forgiveness',
    cost: 55,
    unlockWins: 95,
    difficulty: 'apex',
    hitPadding: -4,
    perfectAlign: 0.13,
    clawSpeed: 290,
    dropSpeed: 440,
    sway: 25,
    body: ['#8B2A12', '#6A1F0C', '#4A1508'],
    glass: ['#FFB08A', '#E88855', '#C86435'],
    marquee: '#8B2A12',
    prizeKinds: ['jackpot', 'tablet', 'phone', 'watch', 'rocket', 'trophy', 'crown', 'neonBlade', 'neonOG'],
  },
  {
    id: 'frost',
    level: 18,
    name: 'Frost Fortress',
    short: 'L18 FROST',
    blurb: 'Ice-cold precision required',
    cost: 60,
    unlockWins: 108,
    difficulty: 'apex',
    hitPadding: -5,
    perfectAlign: 0.125,
    clawSpeed: 295,
    dropSpeed: 445,
    sway: 26,
    body: ['#2A4A5C', '#1E3644', '#142430'],
    glass: ['#C8E8F5', '#9CCFE4', '#6FB0C8'],
    marquee: '#2A4A5C',
    prizeKinds: ['tablet', 'phone', 'watch', 'jackpot', 'gem', 'laptop', 'drone'],
  },
  {
    id: 'omega',
    level: 19,
    name: 'Omega Orbit',
    short: 'L19 OMEGA',
    blurb: 'Near-impossible sway · mega payouts',
    cost: 70,
    unlockWins: 122,
    difficulty: 'apex',
    hitPadding: -5,
    perfectAlign: 0.12,
    clawSpeed: 305,
    dropSpeed: 455,
    sway: 28,
    body: ['#1A3A2E', '#123028', '#0C201A'],
    glass: ['#A8E0C8', '#7EC8A8', '#5AA888'],
    marquee: '#1A3A2E',
    prizeKinds: ['jackpot', 'tablet', 'phone', 'watch', 'crown', 'trophy', 'rocket', 'gem', 'neonHydra', 'neonOG', 'neonKing'],
  },
  {
    id: 'apex',
    level: 20,
    name: 'Apex Arena',
    short: 'L20 APEX',
    blurb: 'Final level · master claw only',
    cost: 85,
    unlockWins: 140,
    difficulty: 'apex',
    hitPadding: -6,
    perfectAlign: 0.11,
    clawSpeed: 320,
    dropSpeed: 470,
    sway: 30,
    body: ['#1A0A0A', '#120606', '#0A0404'],
    glass: ['#FFD27A', '#E8B04A', '#C9902E'],
    marquee: '#1A0A0A',
    prizeKinds: [
      'jackpot',
      'tablet',
      'phone',
      'watch',
      'headphones',
      'crown',
      'trophy',
      'rocket',
      'gem',
      'neonFox',
      'neonHydra',
      'neonOG',
      'neonKing',
    ],
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
