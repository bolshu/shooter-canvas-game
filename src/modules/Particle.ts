import { Velocity } from '../types'
import { CircleWithVelocity } from './CircleWithVelocity'

export class Particle extends CircleWithVelocity {
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
