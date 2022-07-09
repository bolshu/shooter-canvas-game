import { BaseStyles } from './modules/BaseStyles'
import { Canvas } from './modules/Canvas'

BaseStyles.apply()

const canvas = new Canvas()

console.log(canvas.context)
console.log(canvas.element)
