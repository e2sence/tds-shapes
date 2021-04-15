import { G, Circle, Element } from '@svgdotjs/svg.js'
import { background } from './background'
import {
  BackgroundStyle,
  Create_ID,
  GRID_STEP,
  size,
  TitleStyle,
} from './common'
import { mitem } from './mitem'
import { textarea, TextAreaStyleAttr } from './textarea'

/** default body style for mitemjail header */
export const mitemjailHeaderDefStyle = (): BackgroundStyle => {
  return {
    width: 288,
    height: 36,
    fill: { color: '#EEEEEE' },
    stroke: { color: '#D2D2D2', width: 1 },
    radius: 6,
    position: { x: 0, y: 0 },
  }
}

/** default style for single row in  */
export const mitemjailRowDefStyle = (): TitleStyle => {
  return {
    value: '\u2800',
    font: 'Menlo',
    fontWeight: 'normal',
    size: 12,
    position: { x: 8, y: 4 },
    fill: { color: 'black' },
  }
}

/** default style for mitemjail body */
export const mitemjailBodyDefStyle = (): BackgroundStyle => {
  return {
    width: 324,
    height: 144,
    radius: 4,
    fill: { color: '#EEEEEE' },
    stroke: { color: '#D2D2D2', width: 1, dasharray: '5 5' },
    position: { x: 0, y: 36 },
  }
}

/** default style for mitemjail pin */
export const nitemjailPinDefStyle = () => {
  return {
    radius: 9,
    fill: { color: '#FFFFFF' },
    stroke: { color: '#999999', width: 1 },
  }
}

export type mitemjailAttr = {
  header: TextAreaStyleAttr
  body: BackgroundStyle
  pin: Circle
  minSize: size
  position: { x: number; y: number }
}

export const mitemjailAttrDef = (
  s: string,
  p: { x: number; y: number }
): mitemjailAttr => {
  let _p = nitemjailPinDefStyle()
  return {
    header: {
      body: mitemjailHeaderDefStyle(),
      rowsTitleStyle: mitemjailRowDefStyle(),
      data: s,
      position: { x: 0, y: 0 },
      maxRows: 2,
      disallowDirect: true,
    },
    body: mitemjailBodyDefStyle(),
    pin: new Circle()
      .radius(_p.radius)
      .fill(_p.fill)
      .stroke(_p.stroke),
    position: p,
    minSize: { width: 307, height: 44 },
  }
}

export class mitemjail extends G {
  header: textarea
  body: background
  pin: Circle
  minSize: size

  collapsed: boolean = false

  constructor(attr: mitemjailAttr) {
    super()
    this.addClass('tds-container').id(Create_ID())

    attr.body.position.x += attr.position.x
    attr.body.position.y += attr.position.y
    attr.header.position.x += attr.position.x
    attr.header.position.y += attr.position.y

    this.minSize = attr.minSize

    this.body = new background(attr.body)
    this.header = new textarea(attr.header)

    this.add(this.body)
    this.add(this.header)

    this.pin = attr.pin.draggable()
    let _bb = this.body.bbox()
    this.pin.cx(_bb.x2)
    this.pin.cy(_bb.y2)
    this.add(this.pin)
    this.pin.on('dragmove', (ev: CustomEvent) => {
      this.pinMoveHandler(ev)
    })

    this.header.on('dblclick', () => {
      if (!this.collapsed) {
        this.items.forEach((el) => {
          el.hide()
        })
        this.collapsed = true
      } else {
        this.items.forEach((el) => {
          el.show()
        })
        this.collapsed = false
      }
    })

    this.dragendHandler()

    this.on('dragend', () => {
      // snap to grid on drag end
      this.dragendHandler()
    })
  }

  // snap to grid on drag end
  dragendHandler() {
    const box = this.bbox()
    this.move(
      box.x - (box.x % (GRID_STEP / 2)),
      box.y - (box.y % (GRID_STEP / 2))
    )
  }

  /** child elements */
  get items() {
    return this.children().filter((el) => el instanceof mitem)
  }

  /** proxy parent 'add' */
  add(el: Element, i?: number) {
    super.add(el, i)
    //// adds only mitem instances
    //highlight adding mitems
    if (el instanceof mitem) {
      console.log('mitem adds )')
    }

    return this
  }

  /**
   * support for marker movement that changes the working area
   */
  pinMoveHandler(ev: CustomEvent) {
    // min values for width, height
    const { width, height } = this.minSize
    // resizeShape instance and its box
    const { box, handler } = ev.detail
    let { cx, cy, x, y } = box
    // disable default behavior
    ev.preventDefault()
    // check body size set it to min if it less then 'unionMinSize'
    // current width, height
    let _w = this.pin.cx() - this.body.x()
    let _h = this.pin.cy() - this.body.y()
    // set it to min
    this.body.width(_w <= width ? width : _w)
    this.body.height(_h < height ? height : _h)
    // callc min x, y of resizeShape
    let minX = this.body.x() + width - (cx - x)
    let minY = this.body.y() + height - (cy - y)
    // set resizeShape x, y to min
    x < minX ? (x = minX) : 0
    y < minY ? (y = minY) : 0
    // move resizeShape to callculated position
    handler.move(x, y)
  }
}
