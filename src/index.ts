import gsap from 'gsap'
import { BaseStyles } from './modules/BaseStyles'
import { Canvas } from './modules/Canvas'
import { Score } from './modules/Score'

BaseStyles.apply()

const canvas = new Canvas()

const xCenter = canvas.element.width / 2
const yCenter = canvas.element.height / 2

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

class Particle extends CircleWithVelocity {
  alpha: number
  fritcion: number

  constructor (x: number, y: number, r: number, color: string, velocity: Velocity) {
    super(x, y, r, color, velocity)

    this.alpha = 1
    this.fritcion = 0.99
  }

  update (ctx: CanvasRenderingContext2D): void {
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

class Game {
  constructor () {
    this.keyDownHandler = this.keyDownHandler.bind(this)
    this.restart = this.restart.bind(this)
  }

  private keyDownHandler () {
    this.restart()
  }

  addListener () {
    window.addEventListener('keydown', this.keyDownHandler)
  }

  removeListener () {
    window.removeEventListener('keydown', this.keyDownHandler)
  }

  restart () {
    projectiles.splice(0, particles.length)
    enemies.splice(0, enemies.length)
    particles.splice(0, particles.length)

    score.reset()

    this.removeListener()

    canvas.startAnimation(tick)
  }

  drawGameOverMessage (ctx: CanvasRenderingContext2D) {
    ctx.font = '48px sans-serif'
    ctx.fillStyle = 'white'
    ctx.textAlign = 'center'
    ctx.fillText(`Your score is ${score.total}`, xCenter, yCenter - 100)
    ctx.fillText('Press any key to restart', xCenter, yCenter - 40)
  }

  gameOver (ctx: CanvasRenderingContext2D) {
    this.drawGameOverMessage(ctx)
    this.addListener()
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

    enemies.push(new CircleWithVelocity(
      x,
      y,
      r,
      `hsl(${Math.random() * 200}, 50%, 50%)`,
      { x: Math.cos(angle), y: Math.sin(angle) }
    ))
  }, 1000)
}

spawnEnemies()

const player = new Circle(xCenter, yCenter, 20, 'white')
const projectiles: CircleWithVelocity[] = []
const enemies: CircleWithVelocity[] = []
const particles: Particle[] = []
const score = new Score()
const game = new Game()

canvas.element.addEventListener('click', (e: MouseEvent) => {
  const MULTIPLIER = 6
  const angle = Math.atan2(
    e.clientY - canvas.element.height / 2,
    e.clientX - canvas.element.width / 2
  )

  projectiles.push(new CircleWithVelocity(
    xCenter, yCenter, 5, 'white', {
      x: Math.cos(angle) * MULTIPLIER,
      y: Math.sin(angle) * MULTIPLIER
    }))
})

function tick () {
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
        game.gameOver(canvas.context)
      }
    })

    projectiles.forEach((projectile, projectileIndex) => {
      const dist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y)

      setTimeout(() => {
        if (dist - enemy.r - projectile.r < 1) {
          const minEnemyR = 20

          for (let i = 0; i <= enemy.r * 0.5; i++) {
            particles.push(new Particle(
              projectile.x,
              projectile.y,
              Math.random() * 4,
              enemy.color,
              {
                x: (Math.random() - 0.5) * 6,
                y: (Math.random() - 0.5) * 6
              }
            ))
          }

          if (enemy.r - minEnemyR > minEnemyR) {
            gsap.to(enemy, {
              r: enemy.r - 10
            })
            score.increase(1)
          } else {
            enemies.splice(enemyIndex, 1)
            score.increase(2)
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
      particle.update(canvas.context)
    }
  })

  score.draw(canvas.context)
}

canvas.startAnimation(tick)
