import { Text } from '@svgdotjs/svg.js'
import { Create_ID, Position, TitleStyle } from './common'

/**
 * create <text> node
 * @param attr Type - TitleStyle
 * @returns Text object, <text> node
 */
const createText = (attr: TitleStyle): Text => {
  let title = new Text()
  // direct set value to node
  title.node.innerHTML = attr.value

  title.attr({
    'font-family': attr.font,
    'font-size': attr.size,
    'font-weight': attr.fontWeight,
  })

  let ts = title.bbox()
  title.attr({
    fill: attr.fill.color,
    'fill-opacity': attr.fill.opacity,
    x: attr.position?.x,
    y: attr.position?.y + ts.height - ts.y2,
  })

  return title
}

/**
 * text
 */
export class title extends Text {
  constructor(attr: TitleStyle) {
    super()
    Object.assign(this, createText(attr))
    this.id(Create_ID()).addClass('tds-background')
  }

  // value operations
  /** get string from node */
  get value() {
    return this.node.innerHTML
  }
  /** set string to node */
  set value(v: string) {
    this.node.innerHTML = v
  }

  /**
   * coordinates depending on the font height
   */
  get topleft(): Position {
    let bb = this.bbox()
    return { x: this.x(), y: this.y() + bb.height - bb.y2 }
  }
}
