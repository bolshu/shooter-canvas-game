import gsap from 'gsap'
import { BaseStyles } from './modules/BaseStyles'
import { Canvas } from './modules/Canvas'
import { Score } from './modules/Score'
import { Circle } from './modules/Circle'
import { CircleWithVelocity } from './modules/CircleWithVelocity'
import { Particle } from './modules/Particle'

BaseStyles.apply()

const canvas = new Canvas()

const xCenter = canvas.element.width / 2
const yCenter = canvas.element.height / 2

class Game {
  player: Circle
  projectiles: CircleWithVelocity[]
  enemies: CircleWithVelocity[]
  particles: Particle[]
  score: Score

  constructor () {
    this.player = new Circle(xCenter, yCenter, 20, 'white')
    this.projectiles = []
    this.enemies = []
    this.particles = []
    this.score = new Score()

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
    this.projectiles.splice(0, this.particles.length)
    this.enemies.splice(0, this.enemies.length)
    this.particles.splice(0, this.particles.length)

    this.score.reset()

    this.removeListener()

    canvas.startAnimation(tick)
  }

  drawGameOverMessage (ctx: CanvasRenderingContext2D) {
    ctx.font = '48px sans-serif'
    ctx.fillStyle = 'white'
    ctx.textAlign = 'center'
    ctx.fillText(`Your score is ${game.score.total}`, xCenter, yCenter - 100)
    ctx.fillText('Press any key to restart', xCenter, yCenter - 40)
  }

  gameOver (ctx: CanvasRenderingContext2D) {
    this.drawGameOverMessage(ctx)
    this.addListener()
  }

  spawnEnemies () {
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

      game.enemies.push(new CircleWithVelocity(
        x,
        y,
        r,
        `hsl(${Math.random() * 200}, 50%, 50%)`,
        { x: Math.cos(angle), y: Math.sin(angle) }
      ))
    }, 1000)
  }
}

const game = new Game()

canvas.element.addEventListener('click', (e: MouseEvent) => {
  const MULTIPLIER = 6
  const angle = Math.atan2(
    e.clientY - canvas.element.height / 2,
    e.clientX - canvas.element.width / 2
  )

  game.projectiles.push(new CircleWithVelocity(
    xCenter, yCenter, 5, 'white', {
      x: Math.cos(angle) * MULTIPLIER,
      y: Math.sin(angle) * MULTIPLIER
    }))
})

function tick () {
  canvas.context.fillStyle = 'rgba(0, 0, 0, 0.1)'
  canvas.context.fillRect(0, 0, canvas.element.width, canvas.element.height)

  game.player.draw(canvas.context)

  game.projectiles.forEach((projectile, index) => {
    projectile.update(canvas.context)

    setTimeout(() => {
      if (projectile.x + projectile.r < 0 || projectile.x - projectile.r > canvas.element.width ||
            projectile.y + projectile.r < 0 || projectile.y - projectile.r > canvas.element.height) {
        game.projectiles.splice(index, 1)
      }
    })
  })

  game.enemies.forEach((enemy, enemyIndex) => {
    enemy.update(canvas.context)

    const dist = Math.hypot(game.player.x - enemy.x, game.player.y - enemy.y)

    setTimeout(() => {
      if (dist - enemy.r - game.player.r < 1) {
        canvas.stopAnimation()
        game.gameOver(canvas.context)
      }
    })

    game.projectiles.forEach((projectile, projectileIndex) => {
      const dist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y)

      setTimeout(() => {
        if (dist - enemy.r - projectile.r < 1) {
          const minEnemyR = 20

          for (let i = 0; i <= enemy.r * 0.5; i++) {
            game.particles.push(new Particle(
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
            game.score.increase(1)
          } else {
            game.enemies.splice(enemyIndex, 1)
            game.score.increase(2)
          }
          game.projectiles.splice(projectileIndex, 1)
        }
      })
    })
  })

  game.particles.forEach((particle, index) => {
    if (particle.alpha <= 0) {
      game.particles.splice(index, 1)
    } else {
      particle.update(canvas.context)
    }
  })

  game.score.draw(canvas.context)
}

canvas.startAnimation(tick)
