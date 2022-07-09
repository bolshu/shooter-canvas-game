export class Canvas {
  private readonly elem: HTMLCanvasElement

  private readonly ctx: CanvasRenderingContext2D

  constructor () {
    this.init()

    this.elem = <HTMLCanvasElement>document.getElementById('canvas')!
    this.ctx = this.elem.getContext('2d')!
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

  public get element () {
    return this.elem
  }

  public get context () {
    return this.ctx
  }
}
