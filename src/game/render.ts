import { CABINET, type ClawState, type MachineDef, type Particle, type Prize, type PrizeKind } from './types'

export function drawCabinetBackground(ctx: CanvasRenderingContext2D, w: number, h: number, time: number) {
  const g = ctx.createLinearGradient(0, 0, 0, h)
  g.addColorStop(0, '#1a0f12')
  g.addColorStop(0.45, '#3a1518')
  g.addColorStop(1, '#12080a')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, w, h)

  for (let i = 0; i < 8; i++) {
    const x = 30 + i * ((w - 60) / 7)
    const pulse = 0.55 + Math.sin(time * 3 + i) * 0.25
    ctx.beginPath()
    ctx.fillStyle = `rgba(255, 196, 90, ${pulse})`
    ctx.arc(x, 22, 6, 0, Math.PI * 2)
    ctx.fill()
  }
}

export function drawCabinet(ctx: CanvasRenderingContext2D, time: number, machine: MachineDef) {
  const { width: w, height: h, glassLeft, glassRight, glassTop, glassBottom } = CABINET

  roundRect(ctx, 8, 40, w - 16, h - 56, 28)
  const body = ctx.createLinearGradient(0, 40, w, h)
  body.addColorStop(0, machine.body[0])
  body.addColorStop(0.5, machine.body[1])
  body.addColorStop(1, machine.body[2])
  ctx.fillStyle = body
  ctx.fill()

  ctx.strokeStyle = 'rgba(255,220,160,0.45)'
  ctx.lineWidth = 3
  roundRect(ctx, 14, 48, w - 28, h - 72, 22)
  ctx.stroke()

  roundRect(ctx, 28, 52, w - 56, 48, 12)
  const marquee = ctx.createLinearGradient(28, 52, 28, 100)
  marquee.addColorStop(0, '#F7E8C8')
  marquee.addColorStop(1, '#E8D4A8')
  ctx.fillStyle = marquee
  ctx.fill()

  ctx.fillStyle = machine.marquee
  ctx.font = '28px "Lilita One", system-ui'
  ctx.textAlign = 'center'
  ctx.fillText(machine.name.toUpperCase(), w / 2, 84)

  roundRect(ctx, glassLeft, glassTop, glassRight - glassLeft, glassBottom - glassTop, 10)
  const glass = ctx.createLinearGradient(0, glassTop, 0, glassBottom)
  glass.addColorStop(0, machine.glass[0])
  glass.addColorStop(0.55, machine.glass[1])
  glass.addColorStop(1, machine.glass[2])
  ctx.fillStyle = glass
  ctx.fill()

  ctx.fillStyle = 'rgba(255,255,255,0.18)'
  ctx.beginPath()
  ctx.moveTo(glassLeft + 12, glassTop + 10)
  ctx.lineTo(glassLeft + 70, glassTop + 10)
  ctx.lineTo(glassLeft + 40, glassBottom - 20)
  ctx.lineTo(glassLeft + 12, glassBottom - 20)
  ctx.closePath()
  ctx.fill()

  ctx.fillStyle = 'rgba(0,0,0,0.22)'
  ctx.fillRect(glassLeft, CABINET.floorY, glassRight - glassLeft, glassBottom - CABINET.floorY)

  ctx.fillStyle = 'rgba(0,0,0,0.35)'
  roundRect(ctx, CABINET.chuteX - 42, glassBottom - 8, 84, 18, 6)
  ctx.fill()
  ctx.fillStyle = 'rgba(0,0,0,0.5)'
  roundRect(ctx, CABINET.chuteX - 30, glassBottom - 2, 60, 50, 8)
  ctx.fill()

  roundRect(ctx, 28, glassBottom + 18, w - 56, 120, 16)
  ctx.fillStyle = '#2B2B2B'
  ctx.fill()
  roundRect(ctx, 36, glassBottom + 26, w - 72, 104, 12)
  ctx.fillStyle = '#1A1A1A'
  ctx.fill()

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
  const bob = Math.sin(time * 2.2 + p.wobble) * 1.2
  ctx.save()
  ctx.translate(p.x, p.y + bob)
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
    case 'car':
      drawCar(ctx, p)
      break
    case 'doll':
      drawDoll(ctx, p)
      break
    case 'phone':
      drawPhone(ctx, p)
      break
    case 'watch':
      drawWatch(ctx, p)
      break
    case 'headphones':
      drawHeadphones(ctx, p)
      break
    case 'tablet':
      drawTablet(ctx, p)
      break
    case 'cat':
      drawCat(ctx, p)
      break
    case 'dino':
      drawDino(ctx, p)
      break
    case 'unicorn':
      drawUnicorn(ctx, p)
      break
    case 'penguin':
      drawPenguin(ctx, p)
      break
    case 'soccer':
      drawSoccer(ctx, p)
      break
    case 'drone':
      drawDrone(ctx, p)
      break
    case 'camera':
      drawCamera(ctx, p)
      break
    case 'console':
      drawConsole(ctx, p)
      break
    case 'speaker':
      drawSpeaker(ctx, p)
      break
    case 'laptop':
      drawLaptop(ctx, p)
      break
    case 'ring':
      drawRing(ctx, p)
      break
    case 'sneakers':
      drawSneakers(ctx, p)
      break
    case 'gem':
      drawGem(ctx, p)
      break
    case 'crystalShard':
      drawCrystalShard(ctx, p, time)
      break
    case 'crystalPrism':
      drawCrystalPrism(ctx, p, time)
      break
    case 'crystalCluster':
      drawCrystalCluster(ctx, p, time)
      break
    case 'crystalRelic':
      drawCrystalRelic(ctx, p, time)
      break
    case 'trophy':
      drawTrophy(ctx, p)
      break
    case 'rocket':
      drawRocket(ctx, p)
      break
    case 'crown':
      drawCrown(ctx, p)
      break
    case 'neonStick':
    case 'neonCat':
    case 'neonSkate':
    case 'neonPhone':
    case 'neonWolf':
    case 'neonPulse':
    case 'neonBlade':
    case 'neonFox':
    case 'neonHydra':
    case 'neonOG':
    case 'neonKing':
      drawNeonPrize(ctx, p, time)
      break
  }

  // Storm lightning / Super Electric / Shadow auras on non-neon prizes
  if (
    p.mutation &&
    p.mutation !== 'none' &&
    !p.kind.startsWith('neon')
  ) {
    if (p.mutation === 'lightning' || p.mutation === 'superElectric' || p.mutation === 'ogMut' || p.mutation === 'superOg') {
      drawLightningAura(ctx, p, time)
    } else if (p.mutation === 'shadow' || p.mutation === 'umbra') {
      drawShadowAura(ctx, p, time)
    } else {
      drawMutationRing(ctx, p, time)
    }
  }

  ctx.restore()
}

function withAlpha(hex: string, alpha: number) {
  if (hex.startsWith('#') && hex.length === 7) {
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    return `rgba(${r}, ${g}, ${b}, ${alpha})`
  }
  return `rgba(126, 224, 240, ${alpha})`
}

function neonGlow(
  ctx: CanvasRenderingContext2D,
  color: string,
  time: number,
  wobble: number,
  radius: number,
  strength = 1,
) {
  const pulse = (0.35 + Math.sin(time * 7 + wobble) * 0.2) * strength
  ctx.beginPath()
  ctx.fillStyle = withAlpha(color, Math.min(0.85, pulse))
  ctx.arc(0, 0, radius * (1.35 + 0.15 * strength), 0, Math.PI * 2)
  ctx.fill()
}

function mutationStrength(p: Prize): number {
  switch (p.mutation) {
    case 'superOg':
      return 3.0
    case 'superDooperNeon':
      return 2.8
    case 'ogMut':
      return 2.4
    case 'umbra':
      return 2.1
    case 'superElectric':
      return 2.15
    case 'mythicMut':
      return 1.9
    case 'shadow':
      return 1.7
    case 'lightning':
      return 1.75
    case 'overcharge':
      return 1.55
    case 'volt':
      return 1.25
    default:
      return 1
  }
}

function drawMutationRing(ctx: CanvasRenderingContext2D, p: Prize, time: number) {
  if (!p.mutation || p.mutation === 'none') return
  const colors: Record<string, string> = {
    volt: '#B8FF4A',
    overcharge: '#FF6B9A',
    mythicMut: '#FF8A5A',
    ogMut: '#FFE29A',
    lightning: '#E8F4FF',
    superElectric: '#7EE0F0',
    superDooperNeon: '#FF6B9A',
    superOg: '#FFE29A',
    shadow: '#9B8AFF',
    umbra: '#C9B8FF',
  }
  const c = colors[p.mutation] ?? p.accent
  const spin = time * (p.mutation === 'superDooperNeon' || p.mutation === 'superOg' || p.mutation === 'umbra' ? 6 : 4) + p.wobble
  const thick =
    p.mutation === 'superOg'
      ? 4.5
      : p.mutation === 'superDooperNeon' || p.mutation === 'umbra'
        ? 4
        : p.mutation === 'ogMut' || p.mutation === 'superElectric'
          ? 3.5
          : 2.5
  ctx.strokeStyle = withAlpha(c, 0.8)
  ctx.lineWidth = thick
  ctx.beginPath()
  ctx.arc(0, 0, p.radius * 1.15, spin, spin + Math.PI * 1.35)
  ctx.stroke()
  if (
    p.mutation === 'ogMut' ||
    p.mutation === 'mythicMut' ||
    p.mutation === 'lightning' ||
    p.mutation === 'superElectric' ||
    p.mutation === 'superDooperNeon' ||
    p.mutation === 'superOg' ||
    p.mutation === 'shadow' ||
    p.mutation === 'umbra'
  ) {
    ctx.beginPath()
    ctx.strokeStyle = withAlpha(
      p.mutation === 'superDooperNeon'
        ? '#B8FF4A'
        : p.mutation === 'superOg'
          ? '#FF6B9A'
          : p.mutation === 'shadow' || p.mutation === 'umbra'
            ? '#9B8AFF'
            : '#7EE0F0',
      0.6,
    )
    ctx.arc(0, 0, p.radius * 1.28, -spin, -spin + Math.PI)
    ctx.stroke()
  }
  if (p.mutation === 'superDooperNeon' || p.mutation === 'superOg' || p.mutation === 'umbra') {
    ctx.beginPath()
    ctx.strokeStyle = withAlpha(p.mutation === 'umbra' ? '#6A6A78' : p.mutation === 'superOg' ? '#FFE29A' : '#7EE0F0', 0.7)
    ctx.lineWidth = 2.5
    ctx.arc(0, 0, p.radius * 1.42, spin * 0.7, spin * 0.7 + Math.PI * 1.6)
    ctx.stroke()
  }
}

function drawShadowAura(ctx: CanvasRenderingContext2D, p: Prize, time: number) {
  const isUmbra = p.mutation === 'umbra'
  const pulse = 0.25 + Math.sin(time * 5 + p.wobble) * 0.12
  ctx.beginPath()
  ctx.fillStyle = withAlpha('#121216', isUmbra ? 0.45 + pulse : 0.3 + pulse)
  ctx.arc(0, 0, p.radius * (isUmbra ? 1.55 : 1.35), 0, Math.PI * 2)
  ctx.fill()
  neonGlow(ctx, isUmbra ? '#C9B8FF' : '#9B8AFF', time, p.wobble, p.radius, isUmbra ? 1.9 : 1.5)
  drawMutationRing(ctx, p, time)

  // wispy shadow streaks
  ctx.strokeStyle = withAlpha(isUmbra ? '#C9B8FF' : '#6A6A78', 0.4 + pulse)
  ctx.lineWidth = isUmbra ? 2.2 : 1.6
  const drift = Math.sin(time * 3 + p.wobble)
  ctx.beginPath()
  ctx.moveTo(-p.radius * 0.9, -p.radius * 0.2 + drift * 3)
  ctx.quadraticCurveTo(-p.radius * 1.2, p.radius * 0.4, -p.radius * 0.5, p.radius * 1.1)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(p.radius * 0.85, -p.radius * 0.3 - drift * 2)
  ctx.quadraticCurveTo(p.radius * 1.15, p.radius * 0.35, p.radius * 0.4, p.radius * 1.05)
  ctx.stroke()
  if (isUmbra) {
    ctx.fillStyle = withAlpha('#C9B8FF', 0.35 + pulse)
    ctx.font = `bold ${Math.floor(p.radius * 0.36)}px Nunito, system-ui`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('UMB', 0, 0)
    ctx.textBaseline = 'alphabetic'
  }
}

function drawLightningAura(ctx: CanvasRenderingContext2D, p: Prize, time: number) {
  const flash = 0.35 + Math.sin(time * 14 + p.wobble) * 0.25
  const isSuper = p.mutation === 'superElectric'
  const isOg = p.mutation === 'ogMut' || p.mutation === 'superOg'
  const isSuperOg = p.mutation === 'superOg'
  neonGlow(
    ctx,
    isSuperOg ? '#FFE29A' : isSuper ? '#7EE0F0' : '#9BB8E0',
    time,
    p.wobble,
    p.radius,
    isSuperOg ? 2.5 : isOg ? 2.1 : isSuper ? 2.0 : 1.6,
  )
  drawMutationRing(ctx, p, time)

  const boltColor = isSuperOg ? '#FF6B9A' : isOg ? '#FFE29A' : isSuper ? '#B8FF4A' : '#E8F4FF'
  ctx.strokeStyle = withAlpha(boltColor, 0.55 + flash * 0.4)
  ctx.lineWidth = isOg || isSuper || isSuperOg ? 2.4 : 1.8
  ctx.lineJoin = 'round'

  const drawBolt = (x0: number, y0: number, scale: number, flip: number) => {
    ctx.beginPath()
    ctx.moveTo(x0, y0)
    ctx.lineTo(x0 + 4 * scale * flip, y0 + 7 * scale)
    ctx.lineTo(x0 - 2 * scale * flip, y0 + 7 * scale)
    ctx.lineTo(x0 + 5 * scale * flip, y0 + 16 * scale)
    ctx.stroke()
  }

  const pulse = Math.sin(time * 18 + p.wobble)
  if (pulse > -0.2) {
    drawBolt(-p.radius * 0.85, -p.radius * 0.9, 1, 1)
    drawBolt(p.radius * 0.7, -p.radius * 0.75, 0.85, -1)
  }
  if ((isOg || isSuper) && pulse > 0.15) {
    drawBolt(0, -p.radius * 1.05, 1.1, 1)
  }
  if ((isSuper || isSuperOg) && pulse > 0.4) {
    drawBolt(-p.radius * 0.2, -p.radius * 1.15, 1.25, -1)
    ctx.strokeStyle = withAlpha('#FFFFFF', 0.35 + flash * 0.3)
    drawBolt(p.radius * 0.35, -p.radius * 0.95, 0.95, 1)
  }
}

function drawNeonPrize(ctx: CanvasRenderingContext2D, p: Prize, time: number) {
  const strength = mutationStrength(p)
  if (p.mutation === 'superDooperNeon' || p.mutation === 'superOg') {
    neonGlow(ctx, p.mutation === 'superOg' ? '#FFE29A' : '#FF6B9A', time, p.wobble + 1, p.radius, 2.2)
    neonGlow(ctx, p.mutation === 'superOg' ? '#FF6B9A' : '#B8FF4A', time * 1.2, p.wobble, p.radius, 1.8)
  }
  neonGlow(ctx, p.color, time, p.wobble, p.radius, strength)
  drawMutationRing(ctx, p, time)
  switch (p.kind) {
    case 'neonStick':
      drawNeonStick(ctx, p)
      break
    case 'neonCat':
      drawNeonCat(ctx, p)
      break
    case 'neonSkate':
      drawNeonSkate(ctx, p)
      break
    case 'neonPhone':
      drawNeonPhone(ctx, p)
      break
    case 'neonWolf':
      drawNeonWolf(ctx, p)
      break
    case 'neonPulse':
      drawNeonPulse(ctx, p, time)
      break
    case 'neonBlade':
      drawNeonBlade(ctx, p)
      break
    case 'neonFox':
      drawNeonFox(ctx, p)
      break
    case 'neonHydra':
      drawNeonHydra(ctx, p, time)
      break
    case 'neonOG':
      drawNeonOG(ctx, p, time)
      break
    case 'neonKing':
      drawNeonKing(ctx, p, time)
      break
  }
  if (p.mutation === 'superElectric' || p.mutation === 'superDooperNeon' || p.mutation === 'superOg') {
    const flash = 0.35 + Math.sin(time * 16 + p.wobble) * 0.3
    const dooper = p.mutation === 'superDooperNeon'
    const superOg = p.mutation === 'superOg'
    ctx.strokeStyle = withAlpha(superOg ? '#FFE29A' : dooper ? '#FF6B9A' : '#B8FF4A', 0.45 + flash * 0.4)
    ctx.lineWidth = superOg || dooper ? 2.8 : 2.2
    ctx.beginPath()
    ctx.moveTo(-p.radius * 0.9, -p.radius * 0.95)
    ctx.lineTo(-p.radius * 0.35, -p.radius * 0.2)
    ctx.lineTo(-p.radius * 0.55, -p.radius * 0.2)
    ctx.lineTo(p.radius * 0.15, p.radius * 0.85)
    ctx.stroke()
    ctx.strokeStyle = withAlpha(superOg ? '#FF6B9A' : dooper ? '#B8FF4A' : '#FFFFFF', 0.35 + flash * 0.25)
    ctx.beginPath()
    ctx.moveTo(p.radius * 0.75, -p.radius * 0.8)
    ctx.lineTo(p.radius * 0.2, -p.radius * 0.1)
    ctx.lineTo(p.radius * 0.4, -p.radius * 0.1)
    ctx.lineTo(-p.radius * 0.1, p.radius * 0.7)
    ctx.stroke()
    if (dooper || superOg) {
      ctx.fillStyle = withAlpha(superOg ? '#FFE29A' : '#FFE29A', 0.55 + flash * 0.3)
      ctx.font = `bold ${Math.floor(p.radius * 0.38)}px Nunito, system-ui`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(superOg ? 'S-OG' : 'SDN', 0, p.radius * 0.05)
      ctx.textBaseline = 'alphabetic'
    }
  }
}

function drawNeonStick(ctx: CanvasRenderingContext2D, p: Prize) {
  const r = p.radius
  ctx.fillStyle = p.color
  roundRect(ctx, -r * 0.18, -r * 0.9, r * 0.36, r * 1.8, 8)
  ctx.fill()
  ctx.fillStyle = p.accent
  roundRect(ctx, -r * 0.12, -r * 0.75, r * 0.24, r * 1.2, 6)
  ctx.fill()
}

function drawNeonCat(ctx: CanvasRenderingContext2D, p: Prize) {
  const r = p.radius
  ctx.fillStyle = p.color
  ctx.beginPath()
  ctx.arc(0, 2, r * 0.7, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.moveTo(-r * 0.5, -r * 0.15)
  ctx.lineTo(-r * 0.7, -r * 0.75)
  ctx.lineTo(-r * 0.15, -r * 0.4)
  ctx.fill()
  ctx.beginPath()
  ctx.moveTo(r * 0.5, -r * 0.15)
  ctx.lineTo(r * 0.7, -r * 0.75)
  ctx.lineTo(r * 0.15, -r * 0.4)
  ctx.fill()
  ctx.fillStyle = p.accent
  ctx.beginPath()
  ctx.arc(-6, 0, 2.4, 0, Math.PI * 2)
  ctx.arc(6, 0, 2.4, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = p.accent
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(-r * 0.9, 4)
  ctx.lineTo(-r * 0.55, 4)
  ctx.moveTo(r * 0.55, 4)
  ctx.lineTo(r * 0.9, 4)
  ctx.stroke()
}

function drawNeonSkate(ctx: CanvasRenderingContext2D, p: Prize) {
  const r = p.radius
  ctx.fillStyle = p.color
  roundRect(ctx, -r * 0.95, -r * 0.1, r * 1.9, r * 0.4, 10)
  ctx.fill()
  ctx.fillStyle = p.accent
  roundRect(ctx, -r * 0.7, -r * 0.45, r * 0.9, r * 0.35, 6)
  ctx.fill()
  ctx.beginPath()
  ctx.arc(-r * 0.45, r * 0.4, 5, 0, Math.PI * 2)
  ctx.arc(r * 0.45, r * 0.4, 5, 0, Math.PI * 2)
  ctx.fill()
}

function drawNeonPhone(ctx: CanvasRenderingContext2D, p: Prize) {
  const r = p.radius
  ctx.fillStyle = p.color
  roundRect(ctx, -r * 0.55, -r * 0.95, r * 1.1, r * 1.9, 8)
  ctx.fill()
  ctx.fillStyle = p.accent
  roundRect(ctx, -r * 0.4, -r * 0.75, r * 0.8, r * 1.35, 4)
  ctx.fill()
  ctx.fillStyle = withAlpha(p.accent, 0.45)
  roundRect(ctx, -r * 0.28, -r * 0.2, r * 0.56, r * 0.12, 2)
  ctx.fill()
}

function drawNeonWolf(ctx: CanvasRenderingContext2D, p: Prize) {
  const r = p.radius
  ctx.fillStyle = p.color
  ctx.beginPath()
  ctx.moveTo(0, r * 0.75)
  ctx.lineTo(-r * 0.75, -r * 0.15)
  ctx.lineTo(-r * 0.35, -r * 0.85)
  ctx.lineTo(0, -r * 0.45)
  ctx.lineTo(r * 0.35, -r * 0.85)
  ctx.lineTo(r * 0.75, -r * 0.15)
  ctx.closePath()
  ctx.fill()
  ctx.strokeStyle = p.accent
  ctx.lineWidth = 2.5
  ctx.stroke()
  ctx.fillStyle = p.accent
  ctx.beginPath()
  ctx.arc(-8, -4, 3, 0, Math.PI * 2)
  ctx.arc(8, -4, 3, 0, Math.PI * 2)
  ctx.fill()
}

function drawNeonPulse(ctx: CanvasRenderingContext2D, p: Prize, time: number) {
  const r = p.radius
  const ring = 0.55 + Math.sin(time * 8 + p.wobble) * 0.15
  ctx.strokeStyle = withAlpha(p.accent, 0.7)
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.arc(0, 0, r * (0.9 + ring * 0.25), 0, Math.PI * 2)
  ctx.stroke()
  ctx.fillStyle = p.color
  ctx.beginPath()
  ctx.arc(0, 0, r * 0.7, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = p.accent
  ctx.beginPath()
  ctx.arc(0, 0, r * 0.28, 0, Math.PI * 2)
  ctx.fill()
}

function drawNeonBlade(ctx: CanvasRenderingContext2D, p: Prize) {
  const r = p.radius
  ctx.fillStyle = p.accent
  roundRect(ctx, -r * 0.18, r * 0.15, r * 0.36, r * 0.7, 4)
  ctx.fill()
  ctx.fillStyle = p.color
  ctx.beginPath()
  ctx.moveTo(0, -r * 0.95)
  ctx.lineTo(r * 0.28, r * 0.2)
  ctx.lineTo(-r * 0.28, r * 0.2)
  ctx.closePath()
  ctx.fill()
  ctx.fillStyle = withAlpha('#FFFFFF', 0.45)
  ctx.beginPath()
  ctx.moveTo(0, -r * 0.75)
  ctx.lineTo(r * 0.08, r * 0.05)
  ctx.lineTo(-r * 0.02, r * 0.05)
  ctx.closePath()
  ctx.fill()
}

function drawNeonFox(ctx: CanvasRenderingContext2D, p: Prize) {
  const r = p.radius
  ctx.fillStyle = p.color
  ctx.beginPath()
  ctx.arc(0, 4, r * 0.68, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.moveTo(-r * 0.45, -r * 0.1)
  ctx.lineTo(-r * 0.65, -r * 0.85)
  ctx.lineTo(-r * 0.1, -r * 0.35)
  ctx.fill()
  ctx.beginPath()
  ctx.moveTo(r * 0.45, -r * 0.1)
  ctx.lineTo(r * 0.65, -r * 0.85)
  ctx.lineTo(r * 0.1, -r * 0.35)
  ctx.fill()
  ctx.fillStyle = p.accent
  ctx.beginPath()
  ctx.moveTo(0, 2)
  ctx.lineTo(-7, 12)
  ctx.lineTo(7, 12)
  ctx.fill()
  ctx.beginPath()
  ctx.arc(-6, -2, 2.2, 0, Math.PI * 2)
  ctx.arc(6, -2, 2.2, 0, Math.PI * 2)
  ctx.fill()
}

function drawNeonOG(ctx: CanvasRenderingContext2D, p: Prize, time: number) {
  const r = p.radius
  const spin = time * 2 + p.wobble
  ctx.fillStyle = p.color
  ctx.beginPath()
  ctx.arc(0, 0, r * 0.85, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = p.accent
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.arc(0, 0, r * 0.55, spin, spin + Math.PI * 1.4)
  ctx.stroke()
  ctx.fillStyle = p.accent
  ctx.font = `bold ${Math.floor(r * 0.55)}px Nunito, system-ui`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('OG', 0, 1)
  ctx.textBaseline = 'alphabetic'
}

function drawNeonHydra(ctx: CanvasRenderingContext2D, p: Prize, time: number) {
  const r = p.radius
  const bob = Math.sin(time * 6 + p.wobble) * 2
  ctx.fillStyle = p.color
  for (const [ox, oy] of [
    [-r * 0.45, -r * 0.35 + bob],
    [0, -r * 0.55 - bob],
    [r * 0.45, -r * 0.35 + bob],
  ]) {
    ctx.beginPath()
    ctx.ellipse(ox, oy, r * 0.28, r * 0.38, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = p.accent
    ctx.beginPath()
    ctx.arc(ox, oy - 4, 2.2, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = p.color
  }
  ctx.fillStyle = p.accent
  roundRect(ctx, -r * 0.35, 2, r * 0.7, r * 0.75, 10)
  ctx.fill()
}

function drawNeonKing(ctx: CanvasRenderingContext2D, p: Prize, time: number) {
  const r = p.radius
  const pulse = 0.85 + Math.sin(time * 5 + p.wobble) * 0.1
  ctx.fillStyle = p.color
  ctx.beginPath()
  ctx.arc(0, 4, r * 0.7 * pulse, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = p.accent
  ctx.beginPath()
  ctx.moveTo(-r * 0.7, -r * 0.15)
  ctx.lineTo(-r * 0.45, -r * 0.85)
  ctx.lineTo(-r * 0.15, -r * 0.25)
  ctx.lineTo(0, -r * 0.95)
  ctx.lineTo(r * 0.15, -r * 0.25)
  ctx.lineTo(r * 0.45, -r * 0.85)
  ctx.lineTo(r * 0.7, -r * 0.15)
  ctx.closePath()
  ctx.fill()
  ctx.fillStyle = '#0A1A22'
  ctx.font = `bold ${Math.floor(r * 0.42)}px Nunito, system-ui`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('OG', 0, 6)
  ctx.textBaseline = 'alphabetic'
}

function drawCat(ctx: CanvasRenderingContext2D, p: Prize) {
  const r = p.radius
  ctx.fillStyle = p.color
  ctx.beginPath()
  ctx.arc(0, 2, r * 0.72, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.moveTo(-r * 0.55, -r * 0.2)
  ctx.lineTo(-r * 0.75, -r * 0.75)
  ctx.lineTo(-r * 0.2, -r * 0.45)
  ctx.moveTo(r * 0.55, -r * 0.2)
  ctx.lineTo(r * 0.75, -r * 0.75)
  ctx.lineTo(r * 0.2, -r * 0.45)
  ctx.fill()
  ctx.fillStyle = p.accent
  ctx.beginPath()
  ctx.arc(-6, 0, 2, 0, Math.PI * 2)
  ctx.arc(6, 0, 2, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.moveTo(0, 4)
  ctx.lineTo(-3, 8)
  ctx.lineTo(3, 8)
  ctx.fill()
}

function drawDino(ctx: CanvasRenderingContext2D, p: Prize) {
  const r = p.radius
  ctx.fillStyle = p.color
  roundRect(ctx, -r * 0.55, -r * 0.2, r * 1.2, r * 0.85, 8)
  ctx.fill()
  ctx.beginPath()
  ctx.arc(r * 0.45, -r * 0.35, r * 0.4, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = p.accent
  for (let i = 0; i < 4; i++) {
    ctx.beginPath()
    ctx.moveTo(-r * 0.35 + i * r * 0.28, -r * 0.2)
    ctx.lineTo(-r * 0.25 + i * r * 0.28, -r * 0.55)
    ctx.lineTo(-r * 0.15 + i * r * 0.28, -r * 0.2)
    ctx.fill()
  }
  ctx.fillStyle = '#2B2B2B'
  ctx.beginPath()
  ctx.arc(r * 0.55, -r * 0.4, 2.2, 0, Math.PI * 2)
  ctx.fill()
}

function drawUnicorn(ctx: CanvasRenderingContext2D, p: Prize) {
  const r = p.radius
  ctx.fillStyle = p.color
  ctx.beginPath()
  ctx.arc(0, 4, r * 0.7, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = p.accent
  ctx.beginPath()
  ctx.moveTo(0, -r * 0.15)
  ctx.lineTo(-4, -r * 0.85)
  ctx.lineTo(4, -r * 0.85)
  ctx.closePath()
  ctx.fill()
  ctx.fillStyle = '#F4C15D'
  ctx.beginPath()
  ctx.moveTo(2, -r * 0.2)
  ctx.lineTo(0, -r * 0.95)
  ctx.lineTo(8, -r * 0.35)
  ctx.closePath()
  ctx.fill()
  ctx.fillStyle = '#2B2B2B'
  ctx.beginPath()
  ctx.arc(-6, 2, 2, 0, Math.PI * 2)
  ctx.arc(6, 2, 2, 0, Math.PI * 2)
  ctx.fill()
}

function drawPenguin(ctx: CanvasRenderingContext2D, p: Prize) {
  const r = p.radius
  ctx.fillStyle = p.color
  ctx.beginPath()
  ctx.ellipse(0, 2, r * 0.65, r * 0.85, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = p.accent
  ctx.beginPath()
  ctx.ellipse(0, 8, r * 0.4, r * 0.5, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#F4C15D'
  ctx.beginPath()
  ctx.moveTo(0, 0)
  ctx.lineTo(-5, 5)
  ctx.lineTo(5, 5)
  ctx.fill()
  ctx.fillStyle = '#F7E8C8'
  ctx.beginPath()
  ctx.arc(-6, -6, 2.2, 0, Math.PI * 2)
  ctx.arc(6, -6, 2.2, 0, Math.PI * 2)
  ctx.fill()
}

function drawSoccer(ctx: CanvasRenderingContext2D, p: Prize) {
  const r = p.radius
  ctx.fillStyle = p.color
  ctx.beginPath()
  ctx.arc(0, 0, r * 0.85, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = p.accent
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.arc(0, 0, r * 0.85, 0, Math.PI * 2)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(0, -r * 0.85)
  ctx.lineTo(0, r * 0.85)
  ctx.moveTo(-r * 0.85, 0)
  ctx.lineTo(r * 0.85, 0)
  ctx.stroke()
  ctx.fillStyle = p.accent
  ctx.beginPath()
  ctx.arc(0, 0, r * 0.22, 0, Math.PI * 2)
  ctx.fill()
}

function drawDrone(ctx: CanvasRenderingContext2D, p: Prize) {
  const r = p.radius
  ctx.fillStyle = p.color
  roundRect(ctx, -r * 0.45, -r * 0.2, r * 0.9, r * 0.4, 6)
  ctx.fill()
  ctx.strokeStyle = p.accent
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.moveTo(-r * 0.45, 0)
  ctx.lineTo(-r * 0.9, -r * 0.45)
  ctx.moveTo(r * 0.45, 0)
  ctx.lineTo(r * 0.9, -r * 0.45)
  ctx.moveTo(-r * 0.45, 0)
  ctx.lineTo(-r * 0.85, r * 0.45)
  ctx.moveTo(r * 0.45, 0)
  ctx.lineTo(r * 0.85, r * 0.45)
  ctx.stroke()
  ctx.fillStyle = p.accent
  for (const [x, y] of [
    [-r * 0.9, -r * 0.45],
    [r * 0.9, -r * 0.45],
    [-r * 0.85, r * 0.45],
    [r * 0.85, r * 0.45],
  ] as const) {
    ctx.beginPath()
    ctx.arc(x, y, 4, 0, Math.PI * 2)
    ctx.fill()
  }
}

function drawCamera(ctx: CanvasRenderingContext2D, p: Prize) {
  const r = p.radius
  ctx.fillStyle = p.color
  roundRect(ctx, -r * 0.85, -r * 0.45, r * 1.7, r * 0.95, 8)
  ctx.fill()
  ctx.fillStyle = p.accent
  ctx.beginPath()
  ctx.arc(0, 0, r * 0.35, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#7EC8C8'
  ctx.beginPath()
  ctx.arc(0, 0, r * 0.18, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#E85D4C'
  roundRect(ctx, r * 0.35, -r * 0.55, r * 0.25, r * 0.18, 3)
  ctx.fill()
}

function drawConsole(ctx: CanvasRenderingContext2D, p: Prize) {
  const r = p.radius
  ctx.fillStyle = p.color
  roundRect(ctx, -r * 0.9, -r * 0.45, r * 1.8, r * 0.9, 12)
  ctx.fill()
  ctx.fillStyle = p.accent
  ctx.beginPath()
  ctx.arc(-r * 0.45, 0, r * 0.22, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#E85D4C'
  ctx.beginPath()
  ctx.arc(r * 0.35, -6, 4, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#F4C15D'
  ctx.beginPath()
  ctx.arc(r * 0.55, 4, 4, 0, Math.PI * 2)
  ctx.fill()
}

function drawSpeaker(ctx: CanvasRenderingContext2D, p: Prize) {
  const r = p.radius
  ctx.fillStyle = p.color
  roundRect(ctx, -r * 0.55, -r * 0.75, r * 1.1, r * 1.5, 8)
  ctx.fill()
  ctx.fillStyle = p.accent
  ctx.beginPath()
  ctx.arc(0, -r * 0.25, r * 0.28, 0, Math.PI * 2)
  ctx.arc(0, r * 0.35, r * 0.35, 0, Math.PI * 2)
  ctx.fill()
}

function drawLaptop(ctx: CanvasRenderingContext2D, p: Prize) {
  const r = p.radius
  ctx.fillStyle = p.color
  roundRect(ctx, -r * 0.85, -r * 0.65, r * 1.7, r * 1.0, 6)
  ctx.fill()
  ctx.fillStyle = p.accent
  roundRect(ctx, -r * 0.7, -r * 0.5, r * 1.4, r * 0.7, 3)
  ctx.fill()
  ctx.fillStyle = p.color
  roundRect(ctx, -r * 0.95, r * 0.35, r * 1.9, r * 0.22, 3)
  ctx.fill()
}

function drawRing(ctx: CanvasRenderingContext2D, p: Prize) {
  const r = p.radius
  ctx.strokeStyle = p.color
  ctx.lineWidth = 5
  ctx.beginPath()
  ctx.arc(0, 4, r * 0.55, 0, Math.PI * 2)
  ctx.stroke()
  ctx.fillStyle = p.accent
  ctx.beginPath()
  ctx.moveTo(0, -r * 0.55)
  ctx.lineTo(-6, -r * 0.15)
  ctx.lineTo(0, r * 0.05)
  ctx.lineTo(6, -r * 0.15)
  ctx.closePath()
  ctx.fill()
}

function drawSneakers(ctx: CanvasRenderingContext2D, p: Prize) {
  const r = p.radius
  ctx.fillStyle = p.color
  roundRect(ctx, -r * 0.9, -r * 0.15, r * 1.8, r * 0.55, 10)
  ctx.fill()
  ctx.beginPath()
  ctx.ellipse(r * 0.55, -r * 0.05, r * 0.45, r * 0.35, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = p.accent
  roundRect(ctx, -r * 0.9, r * 0.25, r * 1.8, r * 0.22, 4)
  ctx.fill()
}

function drawGem(ctx: CanvasRenderingContext2D, p: Prize) {
  const r = p.radius
  ctx.fillStyle = p.color
  ctx.beginPath()
  ctx.moveTo(0, -r * 0.9)
  ctx.lineTo(r * 0.7, -r * 0.2)
  ctx.lineTo(r * 0.45, r * 0.85)
  ctx.lineTo(-r * 0.45, r * 0.85)
  ctx.lineTo(-r * 0.7, -r * 0.2)
  ctx.closePath()
  ctx.fill()
  ctx.fillStyle = 'rgba(255,255,255,0.35)'
  ctx.beginPath()
  ctx.moveTo(0, -r * 0.7)
  ctx.lineTo(r * 0.25, -r * 0.2)
  ctx.lineTo(0, r * 0.1)
  ctx.lineTo(-r * 0.15, -r * 0.15)
  ctx.closePath()
  ctx.fill()
}

function drawCrystalShard(ctx: CanvasRenderingContext2D, p: Prize, time: number) {
  const r = p.radius
  const gleam = 0.25 + Math.sin(time * 8 + p.wobble) * 0.15
  ctx.fillStyle = withAlpha(p.color, 0.35)
  ctx.beginPath()
  ctx.arc(0, 0, r * 1.25, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = p.color
  ctx.beginPath()
  ctx.moveTo(0, -r * 1.05)
  ctx.lineTo(r * 0.42, r * 0.15)
  ctx.lineTo(0, r * 0.95)
  ctx.lineTo(-r * 0.42, r * 0.15)
  ctx.closePath()
  ctx.fill()
  ctx.fillStyle = withAlpha('#FFFFFF', gleam + 0.25)
  ctx.beginPath()
  ctx.moveTo(0, -r * 0.85)
  ctx.lineTo(r * 0.14, r * 0.05)
  ctx.lineTo(0, r * 0.35)
  ctx.lineTo(-r * 0.08, 0)
  ctx.closePath()
  ctx.fill()
  ctx.strokeStyle = p.accent
  ctx.lineWidth = 1.5
  ctx.stroke()
}

function drawCrystalPrism(ctx: CanvasRenderingContext2D, p: Prize, time: number) {
  const r = p.radius
  const spin = time * 2 + p.wobble
  ctx.fillStyle = withAlpha(p.accent, 0.3)
  ctx.beginPath()
  ctx.arc(0, 0, r * 1.3, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = p.color
  ctx.beginPath()
  ctx.moveTo(0, -r * 0.95)
  ctx.lineTo(r * 0.75, -r * 0.1)
  ctx.lineTo(r * 0.45, r * 0.85)
  ctx.lineTo(-r * 0.45, r * 0.85)
  ctx.lineTo(-r * 0.75, -r * 0.1)
  ctx.closePath()
  ctx.fill()
  ctx.fillStyle = withAlpha('#FFFFFF', 0.4 + Math.sin(spin) * 0.15)
  ctx.beginPath()
  ctx.moveTo(-r * 0.1, -r * 0.55)
  ctx.lineTo(r * 0.35, -r * 0.05)
  ctx.lineTo(r * 0.15, r * 0.45)
  ctx.lineTo(-r * 0.25, r * 0.1)
  ctx.closePath()
  ctx.fill()
  ctx.strokeStyle = p.accent
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(0, -r * 0.95)
  ctx.lineTo(0, r * 0.85)
  ctx.stroke()
}

function drawCrystalCluster(ctx: CanvasRenderingContext2D, p: Prize, time: number) {
  const r = p.radius
  const bob = Math.sin(time * 6 + p.wobble) * 1.5
  const spikes: [number, number, number][] = [
    [-r * 0.45, bob, 0.7],
    [0, -bob * 0.5, 1],
    [r * 0.42, bob * 0.8, 0.75],
  ]
  ctx.fillStyle = withAlpha(p.accent, 0.28)
  ctx.beginPath()
  ctx.arc(0, 4, r * 1.15, 0, Math.PI * 2)
  ctx.fill()
  for (const [ox, oy, s] of spikes) {
    const h = r * s
    ctx.fillStyle = p.color
    ctx.beginPath()
    ctx.moveTo(ox, oy - h)
    ctx.lineTo(ox + h * 0.35, oy + h * 0.55)
    ctx.lineTo(ox - h * 0.35, oy + h * 0.55)
    ctx.closePath()
    ctx.fill()
    ctx.fillStyle = withAlpha('#FFFFFF', 0.35)
    ctx.beginPath()
    ctx.moveTo(ox, oy - h * 0.8)
    ctx.lineTo(ox + h * 0.12, oy + h * 0.1)
    ctx.lineTo(ox - h * 0.05, oy + h * 0.15)
    ctx.closePath()
    ctx.fill()
  }
}

function drawCrystalRelic(ctx: CanvasRenderingContext2D, p: Prize, time: number) {
  const r = p.radius
  const pulse = 0.4 + Math.sin(time * 5 + p.wobble) * 0.2
  ctx.fillStyle = withAlpha(p.accent, pulse * 0.55)
  ctx.beginPath()
  ctx.arc(0, 0, r * 1.4, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = p.color
  ctx.beginPath()
  ctx.moveTo(0, -r)
  ctx.lineTo(r * 0.85, -r * 0.15)
  ctx.lineTo(r * 0.55, r * 0.9)
  ctx.lineTo(-r * 0.55, r * 0.9)
  ctx.lineTo(-r * 0.85, -r * 0.15)
  ctx.closePath()
  ctx.fill()
  ctx.fillStyle = p.accent
  ctx.beginPath()
  ctx.moveTo(0, -r * 0.35)
  ctx.lineTo(r * 0.35, r * 0.1)
  ctx.lineTo(0, r * 0.5)
  ctx.lineTo(-r * 0.35, r * 0.1)
  ctx.closePath()
  ctx.fill()
  ctx.fillStyle = '#1A2A32'
  ctx.font = `bold ${Math.floor(r * 0.4)}px Nunito, system-ui`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('CR', 0, r * 0.08)
  ctx.textBaseline = 'alphabetic'
}

function drawTrophy(ctx: CanvasRenderingContext2D, p: Prize) {
  const r = p.radius
  ctx.fillStyle = p.color
  ctx.beginPath()
  ctx.moveTo(-r * 0.45, -r * 0.55)
  ctx.lineTo(r * 0.45, -r * 0.55)
  ctx.lineTo(r * 0.3, r * 0.15)
  ctx.lineTo(-r * 0.3, r * 0.15)
  ctx.closePath()
  ctx.fill()
  ctx.strokeStyle = p.color
  ctx.lineWidth = 4
  ctx.beginPath()
  ctx.arc(-r * 0.45, -r * 0.25, r * 0.28, Math.PI * 0.5, Math.PI * 1.5)
  ctx.arc(r * 0.45, -r * 0.25, r * 0.28, -Math.PI * 0.5, Math.PI * 0.5)
  ctx.stroke()
  ctx.fillStyle = p.accent
  roundRect(ctx, -r * 0.18, r * 0.15, r * 0.36, r * 0.35, 3)
  ctx.fill()
  roundRect(ctx, -r * 0.4, r * 0.5, r * 0.8, r * 0.22, 4)
  ctx.fill()
}

function drawRocket(ctx: CanvasRenderingContext2D, p: Prize) {
  const r = p.radius
  ctx.fillStyle = p.color
  ctx.beginPath()
  ctx.moveTo(0, -r * 0.95)
  ctx.lineTo(r * 0.4, -r * 0.2)
  ctx.lineTo(r * 0.4, r * 0.45)
  ctx.lineTo(-r * 0.4, r * 0.45)
  ctx.lineTo(-r * 0.4, -r * 0.2)
  ctx.closePath()
  ctx.fill()
  ctx.fillStyle = p.accent
  ctx.beginPath()
  ctx.moveTo(-r * 0.4, r * 0.2)
  ctx.lineTo(-r * 0.75, r * 0.65)
  ctx.lineTo(-r * 0.4, r * 0.45)
  ctx.moveTo(r * 0.4, r * 0.2)
  ctx.lineTo(r * 0.75, r * 0.65)
  ctx.lineTo(r * 0.4, r * 0.45)
  ctx.fill()
  ctx.fillStyle = '#F4C15D'
  ctx.beginPath()
  ctx.moveTo(-r * 0.2, r * 0.45)
  ctx.lineTo(0, r * 0.9)
  ctx.lineTo(r * 0.2, r * 0.45)
  ctx.fill()
  ctx.fillStyle = '#7EC8C8'
  ctx.beginPath()
  ctx.arc(0, -r * 0.15, r * 0.16, 0, Math.PI * 2)
  ctx.fill()
}

function drawCrown(ctx: CanvasRenderingContext2D, p: Prize) {
  const r = p.radius
  ctx.fillStyle = p.color
  ctx.beginPath()
  ctx.moveTo(-r * 0.85, r * 0.35)
  ctx.lineTo(-r * 0.7, -r * 0.45)
  ctx.lineTo(-r * 0.35, r * 0.05)
  ctx.lineTo(0, -r * 0.7)
  ctx.lineTo(r * 0.35, r * 0.05)
  ctx.lineTo(r * 0.7, -r * 0.45)
  ctx.lineTo(r * 0.85, r * 0.35)
  ctx.closePath()
  ctx.fill()
  ctx.fillStyle = p.accent
  for (const x of [-r * 0.7, 0, r * 0.7]) {
    ctx.beginPath()
    ctx.arc(x, x === 0 ? -r * 0.55 : -r * 0.3, 3.5, 0, Math.PI * 2)
    ctx.fill()
  }
}

function drawJackpot(ctx: CanvasRenderingContext2D, p: Prize, time: number) {
  const r = p.radius
  const glow = 0.45 + Math.sin(time * 6 + p.wobble) * 0.2
  ctx.fillStyle = `rgba(255, 180, 70, ${glow})`
  ctx.beginPath()
  ctx.arc(0, 0, r * 1.25, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = p.color
  roundRect(ctx, -r * 0.85, -r * 0.55, r * 1.7, r * 1.1, 4)
  ctx.fill()
  ctx.fillStyle = p.accent
  ctx.font = `bold ${Math.floor(r * 0.7)}px Nunito, system-ui`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('GOLD', 0, 2)
  ctx.textBaseline = 'alphabetic'
}

function drawCar(ctx: CanvasRenderingContext2D, p: Prize) {
  const r = p.radius
  ctx.fillStyle = p.color
  roundRect(ctx, -r * 0.9, -r * 0.15, r * 1.8, r * 0.7, 6)
  ctx.fill()
  ctx.beginPath()
  ctx.moveTo(-r * 0.35, -r * 0.15)
  ctx.lineTo(-r * 0.1, -r * 0.55)
  ctx.lineTo(r * 0.45, -r * 0.55)
  ctx.lineTo(r * 0.75, -r * 0.15)
  ctx.closePath()
  ctx.fill()
  ctx.fillStyle = '#8FD3E8'
  roundRect(ctx, -r * 0.05, -r * 0.48, r * 0.45, r * 0.28, 3)
  ctx.fill()
  ctx.fillStyle = p.accent
  ctx.beginPath()
  ctx.arc(-r * 0.55, r * 0.45, r * 0.22, 0, Math.PI * 2)
  ctx.arc(r * 0.5, r * 0.45, r * 0.22, 0, Math.PI * 2)
  ctx.fill()
}

function drawDoll(ctx: CanvasRenderingContext2D, p: Prize) {
  const r = p.radius
  ctx.fillStyle = '#F6D7C3'
  ctx.beginPath()
  ctx.arc(0, -r * 0.35, r * 0.38, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = p.color
  roundRect(ctx, -r * 0.45, -r * 0.05, r * 0.9, r * 0.85, 10)
  ctx.fill()
  ctx.fillStyle = p.accent
  ctx.beginPath()
  ctx.arc(-r * 0.45, -r * 0.5, r * 0.2, 0, Math.PI * 2)
  ctx.arc(r * 0.45, -r * 0.5, r * 0.2, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#2B2B2B'
  ctx.beginPath()
  ctx.arc(-5, -r * 0.38, 1.8, 0, Math.PI * 2)
  ctx.arc(5, -r * 0.38, 1.8, 0, Math.PI * 2)
  ctx.fill()
}

function drawPhone(ctx: CanvasRenderingContext2D, p: Prize) {
  const r = p.radius
  ctx.fillStyle = p.color
  roundRect(ctx, -r * 0.55, -r * 0.95, r * 1.1, r * 1.9, 8)
  ctx.fill()
  ctx.fillStyle = p.accent
  roundRect(ctx, -r * 0.4, -r * 0.75, r * 0.8, r * 1.4, 4)
  ctx.fill()
  ctx.fillStyle = '#F7E8C8'
  ctx.beginPath()
  ctx.arc(0, r * 0.78, 3, 0, Math.PI * 2)
  ctx.fill()
}

function drawWatch(ctx: CanvasRenderingContext2D, p: Prize) {
  const r = p.radius
  ctx.strokeStyle = p.accent
  ctx.lineWidth = 5
  ctx.beginPath()
  ctx.moveTo(0, -r * 1.1)
  ctx.lineTo(0, -r * 0.55)
  ctx.moveTo(0, r * 0.55)
  ctx.lineTo(0, r * 1.1)
  ctx.stroke()
  ctx.fillStyle = p.color
  ctx.beginPath()
  ctx.arc(0, 0, r * 0.7, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = p.accent
  ctx.lineWidth = 3
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(0, 0)
  ctx.lineTo(0, -r * 0.4)
  ctx.moveTo(0, 0)
  ctx.lineTo(r * 0.28, r * 0.1)
  ctx.stroke()
}

function drawHeadphones(ctx: CanvasRenderingContext2D, p: Prize) {
  const r = p.radius
  ctx.strokeStyle = p.color
  ctx.lineWidth = 5
  ctx.beginPath()
  ctx.arc(0, -r * 0.1, r * 0.75, Math.PI * 1.1, Math.PI * 1.9)
  ctx.stroke()
  ctx.fillStyle = p.accent
  roundRect(ctx, -r * 0.95, -r * 0.15, r * 0.35, r * 0.7, 8)
  ctx.fill()
  roundRect(ctx, r * 0.6, -r * 0.15, r * 0.35, r * 0.7, 8)
  ctx.fill()
}

function drawTablet(ctx: CanvasRenderingContext2D, p: Prize) {
  const r = p.radius
  ctx.fillStyle = p.color
  roundRect(ctx, -r * 0.85, -r * 0.7, r * 1.7, r * 1.4, 8)
  ctx.fill()
  ctx.fillStyle = p.accent
  roundRect(ctx, -r * 0.7, -r * 0.55, r * 1.4, r * 1.0, 4)
  ctx.fill()
}

function drawBear(ctx: CanvasRenderingContext2D, p: Prize) {
  const r = p.radius
  ctx.fillStyle = p.color
  ctx.beginPath()
  ctx.arc(0, 2, r * 0.78, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.arc(-r * 0.55, -r * 0.45, r * 0.28, 0, Math.PI * 2)
  ctx.arc(r * 0.55, -r * 0.45, r * 0.28, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = p.accent
  ctx.beginPath()
  ctx.arc(-r * 0.55, -r * 0.45, r * 0.12, 0, Math.PI * 2)
  ctx.arc(r * 0.55, -r * 0.45, r * 0.12, 0, Math.PI * 2)
  ctx.fill()
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
}

export function drawClaw(
  ctx: CanvasRenderingContext2D,
  claw: ClawState,
  held: Prize | null,
  time: number,
  swayX = 0,
) {
  const x = claw.x + swayX
  const { cableY, open } = claw

  ctx.strokeStyle = 'rgba(40,40,40,0.55)'
  ctx.lineWidth = 6
  ctx.beginPath()
  ctx.moveTo(CABINET.glassLeft + 8, CABINET.clawRestY - 8)
  ctx.lineTo(CABINET.glassRight - 8, CABINET.clawRestY - 8)
  ctx.stroke()

  ctx.fillStyle = '#3A3A3A'
  roundRect(ctx, x - 18, CABINET.clawRestY - 18, 36, 16, 4)
  ctx.fill()
  ctx.fillStyle = '#F4C15D'
  roundRect(ctx, x - 10, CABINET.clawRestY - 14, 20, 8, 2)
  ctx.fill()

  ctx.strokeStyle = '#2B2B2B'
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.moveTo(x, CABINET.clawRestY - 2)
  ctx.lineTo(x, cableY - 8)
  ctx.stroke()

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
  cost = 1,
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
  ctx.font = '800 14px Nunito, system-ui'
  ctx.fillText(message, CABINET.width / 2, panelY + 58)

  if (phase === 'attract' || phase === 'ready' || phase === 'result') {
    const pulse = 0.7 + Math.sin(performance.now() / 280) * 0.3
    ctx.globalAlpha = pulse
    ctx.fillStyle = '#7EC8C8'
    ctx.font = '700 12px Nunito, system-ui'
    ctx.fillText(
      phase === 'attract' ? `PLAY COSTS ${cost} COINS · AIM TIGHT` : 'OPEN PRIZES OR PLAY AGAIN',
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
  ctx.font = '32px "Lilita One", system-ui'
  ctx.textAlign = 'center'
  ctx.fillText(title, CABINET.width / 2, CABINET.glassTop + 95)

  ctx.fillStyle = '#FFFFFF'
  ctx.font = '700 14px Nunito, system-ui'
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
  const map: Record<PrizeKind, string> = {
    bear: 'BEAR',
    star: 'STAR',
    duck: 'DUCK',
    heart: 'HEART',
    robot: 'BOT',
    jackpot: 'GOLD',
    car: 'CAR',
    doll: 'DOLL',
    phone: 'PHONE',
    watch: 'WATCH',
    headphones: 'AUDIO',
    tablet: 'TAB',
    cat: 'CAT',
    dino: 'DINO',
    unicorn: 'UNI',
    penguin: 'PENGUIN',
    soccer: 'BALL',
    drone: 'DRONE',
    camera: 'CAM',
    console: 'GAME',
    speaker: 'BOOM',
    laptop: 'NOTE',
    ring: 'RING',
    sneakers: 'KICKS',
    gem: 'GEM',
    crystalShard: 'SHARD',
    crystalPrism: 'PRISM',
    crystalCluster: 'CLUSTER',
    crystalRelic: 'RELIC',
    trophy: 'CUP',
    rocket: 'ROCKET',
    crown: 'CROWN',
    neonStick: 'VOLT',
    neonCat: 'N-CAT',
    neonSkate: 'SKATE',
    neonPhone: 'CYBER',
    neonWolf: 'WOLF',
    neonPulse: 'PULSE',
    neonBlade: 'BLADE',
    neonFox: 'FOX',
    neonHydra: 'HYDRA',
    neonOG: 'OG',
    neonKing: 'KING',
  }
  return map[kind]
}
