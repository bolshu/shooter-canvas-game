export class Circle {
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
