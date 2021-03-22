import { Rect } from '@svgdotjs/svg.js'
import { BackgroundStyle, Create_ID } from './common'

/**
 * create <rect>
 * @param attr Type - OutlineStyle
 * @returns Rect object, <rect> node
 */
const createRect = (attr: BackgroundStyle): Rect => {
  let outline = new Rect()
  outline
    .width(attr.width)
    .height(attr.height)
    .fill(attr.fill)
    .stroke(attr.stroke)
    .radius(attr.radius)
    .attr({
      x: attr.position.x,
      y: attr.position.y,
    })
  return outline
}

/**
 * background
 */
export class background extends Rect {
  constructor(attr: BackgroundStyle) {
    super()
    Object.assign(this, createRect(attr))
    this.id(Create_ID()).addClass('tds-background')
  }
}
