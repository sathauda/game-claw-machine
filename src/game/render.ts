import { CABINET, type ClawState, type Particle, type Prize, type PrizeKind } from './types'

export function drawCabinetBackground(ctx: CanvasRenderingContext2D, w: number, h: number, time: number) {
  const g = ctx.createLinearGradient(0, 0, 0, h)
  g.addColorStop(0, '#1a0f12')
  g.addColorStop(0.45, '#3a1518')
  g.addColorStop(1, '#12080a')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, w, h)

  // Soft carnival lights
  for (let i = 0; i < 8; i++) {
    const x = 30 + i * ((w - 60) / 7)
    const pulse = 0.55 + Math.sin(time * 3 + i) * 0.25
    ctx.beginPath()
    ctx.fillStyle = `rgba(255, 196, 90, ${pulse})`
    ctx.arc(x, 22, 6, 0, Math.PI * 2)
    ctx.fill()
  }
}

export function drawCabinet(ctx: CanvasRenderingContext2D, time: number) {
  const { width: w, height: h, glassLeft, glassRight, glassTop, glassBottom } = CABINET

  // Outer cabinet body
  roundRect(ctx, 8, 40, w - 16, h - 56, 28)
  const body = ctx.createLinearGradient(0, 40, w, h)
  body.addColorStop(0, '#C62828')
  body.addColorStop(0.5, '#A11818')
  body.addColorStop(1, '#7A0F12')
  ctx.fillStyle = body
  ctx.fill()

  // Side chrome trim
  ctx.strokeStyle = 'rgba(255,220,160,0.45)'
  ctx.lineWidth = 3
  roundRect(ctx, 14, 48, w - 28, h - 72, 22)
  ctx.stroke()

  // Marquee panel
  roundRect(ctx, 28, 52, w - 56, 48, 12)
  const marquee = ctx.createLinearGradient(28, 52, 28, 100)
  marquee.addColorStop(0, '#F7E8C8')
  marquee.addColorStop(1, '#E8D4A8')
  ctx.fillStyle = marquee
  ctx.fill()

  ctx.fillStyle = '#C62828'
  ctx.font = '32px "Lilita One", system-ui'
  ctx.textAlign = 'center'
  ctx.fillText('LUCKY CLAW', w / 2, 86)

  // Glass window
  roundRect(ctx, glassLeft, glassTop, glassRight - glassLeft, glassBottom - glassTop, 10)
  const glass = ctx.createLinearGradient(0, glassTop, 0, glassBottom)
  glass.addColorStop(0, '#9AD7D4')
  glass.addColorStop(0.55, '#7EC8C8')
  glass.addColorStop(1, '#5BA8A8')
  ctx.fillStyle = glass
  ctx.fill()

  // Glass shine
  ctx.fillStyle = 'rgba(255,255,255,0.18)'
  ctx.beginPath()
  ctx.moveTo(glassLeft + 12, glassTop + 10)
  ctx.lineTo(glassLeft + 70, glassTop + 10)
  ctx.lineTo(glassLeft + 40, glassBottom - 20)
  ctx.lineTo(glassLeft + 12, glassBottom - 20)
  ctx.closePath()
  ctx.fill()

  // Floor shelf
  ctx.fillStyle = '#2F6B6B'
  ctx.fillRect(glassLeft, CABINET.floorY, glassRight - glassLeft, glassBottom - CABINET.floorY)

  // Prize chute
  ctx.fillStyle = '#1F4A4A'
  roundRect(ctx, CABINET.chuteX - 42, glassBottom - 8, 84, 18, 6)
  ctx.fill()
  ctx.fillStyle = '#0D2A2A'
  roundRect(ctx, CABINET.chuteX - 30, glassBottom - 2, 60, 50, 8)
  ctx.fill()

  // Control panel
  roundRect(ctx, 28, glassBottom + 18, w - 56, 120, 16)
  ctx.fillStyle = '#2B2B2B'
  ctx.fill()
  roundRect(ctx, 36, glassBottom + 26, w - 72, 104, 12)
  ctx.fillStyle = '#1A1A1A'
  ctx.fill()

  // Decorative rivets
  ctx.fillStyle = '#F4C15D'
  for (const [x, y] of [
    [24, 120],
    [w - 24, 120],
    [24, glassBottom],
    [w - 24, glassBottom],
  ] as const) {
    ctx.beginPath()
    ctx.arc(x, y, 4 + Math.sin(time * 2 + x) * 0.3, 0, Math.PI * 2)
    ctx.fill()
  }
}

export function drawPrizes(ctx: CanvasRenderingContext2D, prizes: Prize[], time: number) {
  const sorted = [...prizes].sort((a, b) => a.y - b.y)
  for (const p of sorted) {
    if (p.grabbed) continue
    drawPrize(ctx, p, time)
  }
}

export function drawPrize(ctx: CanvasRenderingContext2D, p: Prize, time: number) {
  const bob = Math.sin(time * 2.2 + p.wobble) * 1.5
  const x = p.x
  const y = p.y + bob

  ctx.save()
  ctx.translate(x, y)
  ctx.shadowColor = 'rgba(0,0,0,0.25)'
  ctx.shadowBlur = 8
  ctx.shadowOffsetY = 4

  switch (p.kind) {
    case 'bear':
      drawBear(ctx, p)
      break
    case 'star':
      drawStarPrize(ctx, p)
      break
    case 'duck':
      drawDuck(ctx, p)
      break
    case 'heart':
      drawHeart(ctx, p)
      break
    case 'robot':
      drawRobot(ctx, p)
      break
    case 'jackpot':
      drawJackpot(ctx, p, time)
      break
  }

  ctx.restore()
}

function drawJackpot(ctx: CanvasRenderingContext2D, p: Prize, time: number) {
  const r = p.radius
  const glow = 0.45 + Math.sin(time * 6 + p.wobble) * 0.2
  ctx.fillStyle = `rgba(255, 180, 70, ${glow})`
  ctx.beginPath()
  ctx.arc(0, 0, r * 1.25, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = p.color
  ctx.beginPath()
  ctx.arc(0, 0, r * 0.9, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = p.accent
  starPath(ctx, 0, 0, 5, r * 0.55, r * 0.24)
  ctx.fill()
}

function drawBear(ctx: CanvasRenderingContext2D, p: Prize) {
  const r = p.radius
  ctx.fillStyle = p.color
  ctx.beginPath()
  ctx.arc(0, 2, r * 0.78, 0, Math.PI * 2)
  ctx.fill()
  // ears
  ctx.beginPath()
  ctx.arc(-r * 0.55, -r * 0.45, r * 0.28, 0, Math.PI * 2)
  ctx.arc(r * 0.55, -r * 0.45, r * 0.28, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = p.accent
  ctx.beginPath()
  ctx.arc(-r * 0.55, -r * 0.45, r * 0.12, 0, Math.PI * 2)
  ctx.arc(r * 0.55, -r * 0.45, r * 0.12, 0, Math.PI * 2)
  ctx.fill()
  // face
  ctx.fillStyle = '#FFF5E6'
  ctx.beginPath()
  ctx.ellipse(0, 6, r * 0.42, r * 0.36, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#2B2B2B'
  ctx.beginPath()
  ctx.arc(-7, 0, 2.2, 0, Math.PI * 2)
  ctx.arc(7, 0, 2.2, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.arc(0, 6, 3, 0, Math.PI * 2)
  ctx.fill()
}

function drawStarPrize(ctx: CanvasRenderingContext2D, p: Prize) {
  ctx.fillStyle = p.color
  starPath(ctx, 0, 0, 5, p.radius * 0.95, p.radius * 0.45)
  ctx.fill()
  ctx.fillStyle = p.accent
  starPath(ctx, 0, 0, 5, p.radius * 0.45, p.radius * 0.2)
  ctx.fill()
}

function drawDuck(ctx: CanvasRenderingContext2D, p: Prize) {
  const r = p.radius
  ctx.fillStyle = p.color
  ctx.beginPath()
  ctx.ellipse(0, 4, r * 0.75, r * 0.55, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.arc(r * 0.15, -r * 0.35, r * 0.42, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = p.accent
  ctx.beginPath()
  ctx.ellipse(r * 0.5, -r * 0.3, r * 0.28, r * 0.14, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#2B2B2B'
  ctx.beginPath()
  ctx.arc(r * 0.25, -r * 0.45, 2.4, 0, Math.PI * 2)
  ctx.fill()
}

function drawHeart(ctx: CanvasRenderingContext2D, p: Prize) {
  const r = p.radius * 0.9
  ctx.fillStyle = p.color
  ctx.beginPath()
  ctx.moveTo(0, r * 0.35)
  ctx.bezierCurveTo(0, r * 0.1, -r * 0.55, -r * 0.35, -r * 0.55, -r * 0.05)
  ctx.bezierCurveTo(-r * 0.55, r * 0.25, 0, r * 0.55, 0, r * 0.85)
  ctx.bezierCurveTo(0, r * 0.55, r * 0.55, r * 0.25, r * 0.55, -r * 0.05)
  ctx.bezierCurveTo(r * 0.55, -r * 0.35, 0, r * 0.1, 0, r * 0.35)
  ctx.fill()
  ctx.fillStyle = 'rgba(255,255,255,0.35)'
  ctx.beginPath()
  ctx.ellipse(-r * 0.22, -r * 0.05, r * 0.14, r * 0.1, -0.4, 0, Math.PI * 2)
  ctx.fill()
}

function drawRobot(ctx: CanvasRenderingContext2D, p: Prize) {
  const r = p.radius
  ctx.fillStyle = p.color
  roundRect(ctx, -r * 0.65, -r * 0.55, r * 1.3, r * 1.15, 8)
  ctx.fill()
  ctx.fillStyle = p.accent
  roundRect(ctx, -r * 0.45, -r * 0.35, r * 0.9, r * 0.45, 4)
  ctx.fill()
  ctx.fillStyle = '#F4C15D'
  ctx.beginPath()
  ctx.arc(-r * 0.2, -r * 0.12, 4, 0, Math.PI * 2)
  ctx.arc(r * 0.2, -r * 0.12, 4, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = p.accent
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.moveTo(0, -r * 0.55)
  ctx.lineTo(0, -r * 0.85)
  ctx.stroke()
  ctx.fillStyle = '#E85D4C'
  ctx.beginPath()
  ctx.arc(0, -r * 0.9, 4, 0, Math.PI * 2)
  ctx.fill()
}

export function drawClaw(ctx: CanvasRenderingContext2D, claw: ClawState, held: Prize | null, time: number) {
  const { x, cableY, open } = claw

  // Rail
  ctx.strokeStyle = 'rgba(40,40,40,0.55)'
  ctx.lineWidth = 6
  ctx.beginPath()
  ctx.moveTo(CABINET.glassLeft + 8, CABINET.clawRestY - 8)
  ctx.lineTo(CABINET.glassRight - 8, CABINET.clawRestY - 8)
  ctx.stroke()

  // Carriage
  ctx.fillStyle = '#3A3A3A'
  roundRect(ctx, x - 18, CABINET.clawRestY - 18, 36, 16, 4)
  ctx.fill()
  ctx.fillStyle = '#F4C15D'
  roundRect(ctx, x - 10, CABINET.clawRestY - 14, 20, 8, 2)
  ctx.fill()

  // Cable
  ctx.strokeStyle = '#2B2B2B'
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.moveTo(x, CABINET.clawRestY - 2)
  ctx.lineTo(x, cableY - 8)
  ctx.stroke()

  // Claw body
  ctx.fillStyle = '#D8D8D8'
  ctx.beginPath()
  ctx.arc(x, cableY, 12, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#8A8A8A'
  ctx.beginPath()
  ctx.arc(x, cableY, 6, 0, Math.PI * 2)
  ctx.fill()

  const spread = 10 + open * 22
  const tipY = cableY + 28 + (1 - open) * 6

  drawClawArm(ctx, x, cableY, -spread, tipY, open)
  drawClawArm(ctx, x, cableY, spread, tipY, open)

  if (held) {
    const prize = { ...held, x, y: tipY + held.radius * 0.35, grabbed: false }
    drawPrize(ctx, prize, time)
  }
}

function drawClawArm(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  tipXOffset: number,
  tipY: number,
  open: number,
) {
  ctx.strokeStyle = '#C0C0C0'
  ctx.lineWidth = 5
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(x, y + 6)
  ctx.quadraticCurveTo(x + tipXOffset * 0.55, y + 18, x + tipXOffset, tipY)
  ctx.stroke()

  ctx.fillStyle = '#E8E8E8'
  ctx.beginPath()
  ctx.arc(x + tipXOffset, tipY, 5 + (1 - open), 0, Math.PI * 2)
  ctx.fill()
}

export function drawParticles(ctx: CanvasRenderingContext2D, particles: Particle[]) {
  for (const p of particles) {
    const alpha = p.life / p.maxLife
    ctx.globalAlpha = alpha
    ctx.fillStyle = p.color
    ctx.beginPath()
    ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.globalAlpha = 1
}

export function drawHud(
  ctx: CanvasRenderingContext2D,
  coins: number,
  score: number,
  highScore: number,
  message: string,
  phase: string,
  streak = 0,
) {
  const panelY = CABINET.glassBottom + 34

  ctx.fillStyle = '#F7E8C8'
  ctx.font = '700 15px Nunito, system-ui'
  ctx.textAlign = 'left'
  ctx.fillText(`COINS  ${coins}`, 52, panelY + 28)

  ctx.textAlign = 'right'
  ctx.fillText(`SCORE  ${score}`, CABINET.width - 52, panelY + 28)

  ctx.textAlign = 'center'
  ctx.fillStyle = '#F4C15D'
  ctx.font = '700 13px Nunito, system-ui'
  const mid = streak > 1 ? `STREAK x${streak}` : `BEST ${highScore}`
  ctx.fillText(mid, CABINET.width / 2, panelY + 28)

  ctx.fillStyle = '#FFFFFF'
  ctx.font = '800 15px Nunito, system-ui'
  ctx.fillText(message, CABINET.width / 2, panelY + 58)

  if (phase === 'attract' || phase === 'ready' || phase === 'result') {
    const pulse = 0.7 + Math.sin(performance.now() / 280) * 0.3
    ctx.globalAlpha = pulse
    ctx.fillStyle = '#7EC8C8'
    ctx.font = '700 12px Nunito, system-ui'
    ctx.fillText(
      phase === 'attract' ? 'SKILL CLAW · LAND IT · KEEP IT' : 'OPEN PRIZES OR PLAY AGAIN',
      CABINET.width / 2,
      panelY + 82,
    )
    ctx.globalAlpha = 1
  }
}

export function drawOverlayMessage(ctx: CanvasRenderingContext2D, title: string, subtitle: string) {
  ctx.fillStyle = 'rgba(20, 8, 10, 0.45)'
  roundRect(
    ctx,
    CABINET.glassLeft + 16,
    CABINET.glassTop + 40,
    CABINET.glassRight - CABINET.glassLeft - 32,
    120,
    14,
  )
  ctx.fill()

  ctx.fillStyle = '#F7E8C8'
  ctx.font = '36px "Lilita One", system-ui'
  ctx.textAlign = 'center'
  ctx.fillText(title, CABINET.width / 2, CABINET.glassTop + 95)

  ctx.fillStyle = '#FFFFFF'
  ctx.font = '700 15px Nunito, system-ui'
  ctx.fillText(subtitle, CABINET.width / 2, CABINET.glassTop + 128)
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const radius = Math.min(r, w / 2, h / 2)
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.arcTo(x + w, y, x + w, y + h, radius)
  ctx.arcTo(x + w, y + h, x, y + h, radius)
  ctx.arcTo(x, y + h, x, y, radius)
  ctx.arcTo(x, y, x + w, y, radius)
  ctx.closePath()
}

function starPath(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  spikes: number,
  outer: number,
  inner: number,
) {
  let rot = -Math.PI / 2
  const step = Math.PI / spikes
  ctx.beginPath()
  for (let i = 0; i < spikes; i++) {
    ctx.lineTo(cx + Math.cos(rot) * outer, cy + Math.sin(rot) * outer)
    rot += step
    ctx.lineTo(cx + Math.cos(rot) * inner, cy + Math.sin(rot) * inner)
    rot += step
  }
  ctx.closePath()
}

export function prizeIcon(kind: PrizeKind): string {
  switch (kind) {
    case 'bear':
      return 'BEAR'
    case 'star':
      return 'STAR'
    case 'duck':
      return 'DUCK'
    case 'heart':
      return 'HEART'
    case 'robot':
      return 'BOT'
    case 'jackpot':
      return 'GOLD'
  }
}
