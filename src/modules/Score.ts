export class Score {
  total: number

  constructor () {
    this.total = 0
  }

  draw (ctx: CanvasRenderingContext2D) {
    ctx.font = '24px sans-serif'
    ctx.fillStyle = 'white'
    ctx.textAlign = 'left'
    ctx.fillText(`Score: ${this.total}`, 20, 40)
  }

  public reset () {
    this.total = 0
  }

  public increase (value: number) {
    this.total += value
  }
}
