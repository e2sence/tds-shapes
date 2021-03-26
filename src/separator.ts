import { StrokeData, Line } from '@svgdotjs/svg.js'
import { ItemType } from './common'

/**
 * @param start start position {x: , y:}
 * @param length lenght of line
 * @param stroke line appearance
 * @param end if defined, used to set direction
 */
export type ISeparatorTemplate = {
  start: { x: number; y: number }
  length: number
  stroke: StrokeData
  end?: { x: number; y: number }
  kind?: ItemType
}

/**
 * just a Line for separate stencil items logical groups
 * typicaly horizontal
 */
export class separator extends Line {
  constructor(attr: ISeparatorTemplate) {
    super()

    // set appearance
    this.stroke(attr.stroke)

    attr.end
      ? // draw a non-horizontal line in this case the length does not matter
        this.plot(attr.start.x, attr.start.y, attr.end.x, attr.end.y)
      : // ordinary horizontal line
        this.plot(
          attr.start.x,
          attr.start.y,
          attr.start.x + attr.length,
          attr.start.y
        )
  }
}
