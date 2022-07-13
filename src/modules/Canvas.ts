export class Canvas {
  readonly element: HTMLCanvasElement
  readonly context: CanvasRenderingContext2D
  private animationId: number | null

  constructor () {
    this.init()

    this.element = <HTMLCanvasElement>document.getElementById('canvas')!
    this.context = this.element.getContext('2d')!
    this.animationId = null
  }

  private addCanvas () {
    const canvas = document.createElement('canvas')

    const { innerWidth, innerHeight } = window

    canvas.setAttribute('id', 'canvas')
    canvas.setAttribute('width', innerWidth.toString())
    canvas.setAttribute('height', innerHeight.toString())

    canvas.style.display = 'block'

    document.body.appendChild(canvas)
  }

  private addResizeHandler () {
    const canvas = document.getElementById('canvas')!

    window.addEventListener('resize', () => {
      const { innerWidth, innerHeight } = window

      canvas.setAttribute('width', innerWidth.toString())
      canvas.setAttribute('height', innerHeight.toString())
    })
  }

  private init () {
    this.addCanvas()
    this.addResizeHandler()
  }

  public startAnimation (callback: () => void) {
    this.animationId = requestAnimationFrame(() => this.startAnimation(callback))
    callback()
  }

  public stopAnimation () {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId)
    }
  }

  public clear () {
    this.context.clearRect(0, 0, this.element.width, this.element.height)
  }
}
