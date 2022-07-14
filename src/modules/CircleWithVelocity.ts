import { Velocity } from '../types'
import { Circle } from './Circle'

export class CircleWithVelocity extends Circle {
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
