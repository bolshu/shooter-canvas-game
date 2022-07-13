import { BaseStyles } from './modules/BaseStyles'
import { Canvas } from './modules/Canvas'

BaseStyles.apply()

const canvas = new Canvas()

const xCenter = canvas.element.width / 2
const yCenter = canvas.element.height / 2

class Circle {
  x: number
  y: number
  readonly r: number
  private readonly color: string

  constructor (x: number, y: number, r: number, color: string) {
    this.x = x
    this.y = y
    this.r = r
    this.color = color
  }

  public draw (ctx: CanvasRenderingContext2D) {
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2, false)

    ctx.fillStyle = this.color

    ctx.fill()
  }
}

class Player extends Circle {
  constructor () {
    super(xCenter, yCenter, 50, 'tomato')
  }
}

type Velocity = { x: number; y: number}

class CircleWithVelocity extends Circle {
  protected readonly velocity: Velocity

  constructor (x: number, y: number, r: number, color: string, velocity: Velocity) {
    super(x, y, r, color)

    this.velocity = velocity
  }

  public update (ctx: CanvasRenderingContext2D) {
    this.draw(ctx)

    this.x = this.x + this.velocity.x
    this.y = this.y + this.velocity.y
  }
}

class Projectile extends CircleWithVelocity {
  constructor (velocity: Velocity) {
    super(xCenter, yCenter, 10, 'aqua', velocity)
  }
}

class Enemy extends CircleWithVelocity {
  constructor (x: number, y: number, r: number, velocity: Velocity) {
    super(x, y, r, 'red', velocity)
  }
}

const enemies: Enemy[] = []

const spawnEnemies = () => {
  setInterval(() => {
    const rMin = 10
    const r = Math.random() * (50 - rMin) + rMin
    let x
    let y

    if (Math.random() < 0.5) {
      x = Math.random() < 0.5 ? 0 - r : canvas.element.width + r
      y = Math.random() * canvas.element.height
    } else {
      x = Math.random() * canvas.element.width
      y = Math.random() < 0.5 ? 0 - r : canvas.element.height + r
    }

    const angle = Math.atan2(
      canvas.element.height / 2 - y,
      canvas.element.width / 2 - x
    )

    enemies.push(new Enemy(x, y, r, { x: Math.cos(angle), y: Math.sin(angle) }))
  }, 1000)
}

spawnEnemies()

const player = new Player()

const projectiles: Projectile[] = []

canvas.element.addEventListener('click', (e: MouseEvent) => {
  const angle = Math.atan2(
    e.clientY - canvas.element.height / 2,
    e.clientX - canvas.element.width / 2
  )

  projectiles.push(new Projectile({ x: Math.cos(angle), y: Math.sin(angle) }))
})

const tick = () => {
  canvas.clear()

  player.draw(canvas.context)

  projectiles.forEach((projectile) => {
    projectile.update(canvas.context)
  })

  enemies.forEach((enemy, enemyIndex) => {
    enemy.update(canvas.context)

    const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y)

    setTimeout(() => {
      if (dist - enemy.r - player.r < 1) {
        canvas.stopAnimation()
      }
    }, 0)

    projectiles.forEach((projectile, projectileIndex) => {
      const dist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y)

      setTimeout(() => {
        if (dist - enemy.r - projectile.r < 1) {
          enemies.splice(enemyIndex, 1)
          projectiles.splice(projectileIndex, 1)
        }
      })
    })
  })
}

canvas.startAnimation(tick)
