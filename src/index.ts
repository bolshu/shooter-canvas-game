import gsap from 'gsap'
import { BaseStyles } from './modules/BaseStyles'
import { Canvas } from './modules/Canvas'

BaseStyles.apply()

const canvas = new Canvas()

const xCenter = canvas.element.width / 2
const yCenter = canvas.element.height / 2

class Colors {
  static white = 'white'

  static getEnemyColor () {

  }
}

class Circle {
  x: number
  y: number
  r: number
  readonly color: string

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
    super(xCenter, yCenter, 20, Colors.white)
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
    super(xCenter, yCenter, 5, Colors.white, velocity)
  }
}

class Enemy extends CircleWithVelocity {
  constructor (x: number, y: number, r: number, velocity: Velocity) {
    super(x, y, r, `hsl(${Math.random() * 200}, 50%, 50%)`, velocity)
  }
}

class Particle extends CircleWithVelocity {
  alpha: number;
  fritcion: number;

  constructor (x: number, y: number, r: number, color: string, velocity: Velocity) {
    super(x, y, r, color, velocity)

    this.alpha = 1
    this.fritcion = 0.99
  }

  update(ctx: CanvasRenderingContext2D): void {
    this.draw(ctx)

    this.velocity.x *= this.fritcion 
    this.velocity.y *= this.fritcion 

    this.x = this.x + this.velocity.x
    this.y = this.y + this.velocity.y

    this.alpha -= 0.01
  }

  public draw (ctx: CanvasRenderingContext2D) {
    ctx.save()
    ctx.globalAlpha = this.alpha

    super.draw(ctx)

    ctx.restore()
  }
}

const spawnEnemies = () => {
  setInterval(() => {
    const rMin = 20
    const r = Math.random() * (60 - rMin) + rMin
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
const enemies: Enemy[] = []
const particles: Particle[] = [];

canvas.element.addEventListener('click', (e: MouseEvent) => {
  const MULTIPLIER = 6
  const angle = Math.atan2(
    e.clientY - canvas.element.height / 2,
    e.clientX - canvas.element.width / 2
  )

  projectiles.push(new Projectile({
    x: Math.cos(angle) * MULTIPLIER,
    y: Math.sin(angle) * MULTIPLIER
  }))
})

const tick = () => {
  canvas.context.fillStyle = 'rgba(0, 0, 0, 0.1)'
  canvas.context.fillRect(0, 0, canvas.element.width, canvas.element.height)

  player.draw(canvas.context)

  projectiles.forEach((projectile, index) => {
    projectile.update(canvas.context)

    setTimeout(() => {
      if (projectile.x + projectile.r < 0 || projectile.x - projectile.r > canvas.element.width ||
            projectile.y + projectile.r < 0 || projectile.y - projectile.r > canvas.element.height) {
        projectiles.splice(index, 1)
      }
    })
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
          const minEnemyR = 20;

          for (let i = 0; i <= enemy.r * 0.5; i++) {
            particles.push(new Particle(
              projectile.x,
              projectile.y,
              Math.random() * 4,
              enemy.color,
              {
                x: (Math.random() - 0.5) * 6,
                y: (Math.random() - 0.5) * 6,
              }
            ))
          }

          if (enemy.r - minEnemyR > minEnemyR) {
            gsap.to(enemy, {
              r: enemy.r - 10
            })
          } else {
            enemies.splice(enemyIndex, 1)
          }
          projectiles.splice(projectileIndex, 1)
        }
      })
    })
  })

  particles.forEach((particle, index) => {
    if (particle.alpha <= 0) {
      particles.splice(index, 1)
    } else {
      particle.update(canvas.context);
    }
  })
}

canvas.startAnimation(tick)
