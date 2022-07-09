import { BaseStyles } from './BaseStyles'
import { Canvas } from './Canvas'

BaseStyles.apply()

const canvas = new Canvas()

console.log(canvas.context)
console.log(canvas.element)
