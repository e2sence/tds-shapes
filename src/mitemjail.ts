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
    fill: { color: '#F1F1F1' },
    stroke: { color: '#D2D2D2', width: 1, dasharray: '5 5' },
    position: { x: 0, y: 36 },
  }
}

/** default style for mitemjail pin */
export const mitemjailPinDefStyle = () => {
  return {
    radius: 9,
    fill: { color: '#FFFFFF' },
    stroke: { color: '#999999', width: 1 },
  }
}

export const mitemHighliteStyles = () => {
  return {
    highlite: {
      headerStroke: { color: 'black', opacity: 0.5 },
      bodyStroke: { color: 'black', opacity: 0.5 },
      pinStroke: { color: 'black', opacity: 0.5 },
    },
    select: {
      headerStroke: { color: 'black', opacity: 1 },
      bodyStroke: { color: 'black', opacity: 1 },
      pinStroke: { color: 'black', opacity: 1 },
    },
    normal: {
      headerStroke: { color: '#D2D2D2', width: 1, opacity: 1 },
      bodyStroke: {
        color: '#D2D2D2',
        width: 1,
        dasharray: '5 5',
        opacity: 1,
      },
      pinStroke: { color: '#D2D2D2', width: 1, opacity: 1 },
    },
  }
}

const acceptStyle = (
  el: mitemjail,
  s: 'highlite' | 'select' | 'normal'
) => {
  let sel = mitemHighliteStyles()[s]
  el.header.body.stroke({ ...sel.headerStroke })
  el.body.stroke({ ...sel.bodyStroke })
  el.pin.stroke({ ...sel.pinStroke })
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
  let _p = mitemjailPinDefStyle()
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
    minSize: { width: 279, height: 44 },
  }
}

export class mitemjail extends G {
  header: textarea
  body: background
  pin: Circle
  minSize: size
  #operMinSize: any

  collapsed: boolean = false
  beforeCollapseSize: size = { width: 0, height: 0 }

  selected: boolean = false
  dragFlag: boolean = false

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
    this.pin.on('beforedrag', () => {
      this.#operMinSize = this.maxXY
    })
    this.pin.on('dragmove', (ev: CustomEvent) => {
      this.pinMoveHandler(ev)
    })
    this.dragendHandler()

    // hide items
    this.header.on('dblclick', () => {
      this.hideHandler()
    })
    this.pin.on('dblclick', () => {
      this.autosize()
    })

    this.on('dragmove', () => {})
    this.on('dragend', () => {
      // snap to grid on drag end
      this.dragendHandler()
    })

    // selection region
    this.on('mouseenter', () => {
      acceptStyle(this, 'highlite')
    })
    this.on('mouseleave', () => {
      acceptStyle(this, 'normal')
    })
  }

  /** automatic adjustment of the body size to the elements inside */
  autosize() {
    // check colapse state
    if (!this.collapsed) {
      const _actSize = this.maxXY
      // move pin
      this.pin.cx(_actSize.x + GRID_STEP)
      this.pin.cy(_actSize.y + GRID_STEP)
      // resize body
      this.body.width(_actSize.bodyWidht + GRID_STEP)
      this.body.height(_actSize.bodyHeight + GRID_STEP)
    }
  }

  hideHandler() {
    if (!this.collapsed) {
      // store size
      this.beforeCollapseSize = {
        width: this.body.width(),
        height: this.body.height(),
      }
      // hide items
      this.items.forEach((el) => {
        el.hide()
      })
      // collapse body
      this.body.width(0)
      this.body.height(0)
      // move pin
      let cb = this.header.bbox()
      this.pin.cx(cb.x2)
      this.pin.cy(cb.y2)
      this.pin.draggable(false)
      this.pin.backward()

      this.collapsed = true
    } else {
      // show items
      this.items.forEach((el) => {
        el.show()
      })
      // restore body size
      this.body.width(this.beforeCollapseSize.width)
      this.body.height(this.beforeCollapseSize.height)
      //move pin
      let cb = this.body.bbox()
      this.pin.cx(cb.x2)
      this.pin.cy(cb.y2)
      this.pin.draggable(true)
      this.pin.forward()

      this.collapsed = false
    }
  }

  // snap to grid on drag end
  dragendHandler() {
    const box = this.bbox()
    this.move(
      box.x - (box.x % GRID_STEP),
      box.y - (box.y % GRID_STEP)
    )
  }

  /** child elements */
  get items() {
    return this.children().filter((el) => el instanceof mitem)
  }

  get maxXY() {
    // take the coordinates as far as possible from the upper left corner
    let xy = this.items.map((el) => el.bbox())
    let cb = this.body.bbox()

    if (xy.length > 0) {
      let result = {
        x: xy.sort((a, b) => b.x2 - a.x2)[0].x2,
        y: xy.sort((a, b) => b.y2 - a.y2)[0].y2,
      }
      // check if we are in the minimum size zone
      let maxSizeX = cb.x + this.minSize.width
      let maxSizeY = cb.y + this.minSize.height

      // compare max mitem coordinate with allow accordind to minSize
      // calculate recomended body size
      let _x = result.x < maxSizeX ? maxSizeX : result.x
      let _y = result.y < maxSizeY ? maxSizeY : result.y

      return {
        x: _x,
        y: _y,
        bodyWidht: _x - cb.x,
        bodyHeight: _y - cb.y,
      }
    }
    // return default if there is no items inside
    return {
      x: cb.x + this.minSize.width,
      y: cb.y + this.minSize.height,
      bodyWidht: this.minSize.width,
      bodyHeight: this.minSize.height,
    }
  }

  /** proxy parent 'add' */
  add(el: Element, i?: number) {
    super.add(el, i)
    //// adds only mitem instances
    //highlight adding mitems
    if (el instanceof mitem) {
      //   console.log('mitem adds )')
    }
    return this
  }

  /**
   * support for marker movement that changes the working area
   */
  pinMoveHandler(ev: CustomEvent) {
    const _oper = this.#operMinSize
    // min values for width, height
    const { width, height } = _oper
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
    // control whether the limit on the current 'mitems' is not exceeded
    x < _oper.x && (x = _oper.x)
    y < _oper.y && (y = _oper.y)

    handler.move(x, y)
  }
}
