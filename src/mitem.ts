import { G } from '@svgdotjs/svg.js'
import { Line } from '@svgdotjs/svg.js'
import { Polyline } from '@svgdotjs/svg.js'
import { Rect } from '@svgdotjs/svg.js'
import {
  AnchorsMap,
  BackgroundStyle,
  createPinPoint,
  createTempLine,
  Create_ID,
  distP,
  Indents,
  isPointInCircle,
} from './common'
import { label, LabelAttr } from './label'
import { style } from './style'

export const mitemCreator = (
  v: string,
  p: { x: number; y: number }
): mitem => {
  return new mitem(
    {
      title: {
        value: v,
        font: 'Menlo',
        fontWeight: 'normal',
        size: 12,
        fill: { color: 'black' },
      },
      background: {
        width: 5,
        height: 5,
        radius: 4,
        fill: { color: '#FFFFFF' },
        stroke: { color: 'black', width: 1 },
      },
      backgroundRule: ['indent', 'centered'],
      indents: [4, 2, 4, 2],
      position: { x: p.x, y: p.y },
      widthFactor: 9,
    },
    {
      border: {
        width: 1,
        height: 1,
        fill: { color: 'transparent' },
        stroke: { color: '#3F8EFC', width: 1, dasharray: '5 5' },
        radius: 3,
      },
      indents: [2, 2, 2, 2],
    }
  )
}

/** base item for tds-core */
export class mitem extends label {
  outline: mitemOutline

  constructor(
    attr: LabelAttr,
    outline: { border: BackgroundStyle; indents: Indents }
  ) {
    super(attr)
    this.id(Create_ID()).addClass('tds-mitem')

    // set outline
    this.outline = new mitemOutline(outline.border, outline.indents)
    this.setOutline()
    this.add(this.outline)
    this.outline.hide()

    this.on('mouseenter', () => {
      this.outline.show()
    })

    this.on('mouseleave', () => {
      this.outline.hide()
    })

    this.on('dragmove', (ev: CustomEvent) => {
      let cb = this.bbox()

      // find mitem instances
      this.parent()
        .children()
        .filter((el) => el.hasClass('tds-mitem') && el != this)
        .forEach((el) => {
          let elb = el.bbox()
          // mitem in range
          let dist = distP(cb.x, cb.y, elb.x, elb.y)
          if (dist < 200 && el instanceof mitem) {
            // el - element in range
            let can = el.anchors
            this.anchors.forEach((this_el) => {
              can.forEach((c_el) => {
                let adist = distP(
                  this_el[0],
                  this_el[1],
                  c_el[0],
                  c_el[1]
                )

                if (adist < 22) {
                  ev.preventDefault()

                  const { box } = ev.detail

                  ev.detail.handler.el.move(
                    box.x - (box.x % 9),
                    box.y - (box.y % 9)
                  )

                  createPinPoint(
                    this.root(),
                    c_el[0],
                    c_el[1],
                    5,
                    el.id(),
                    undefined,
                    undefined
                  )
                  createPinPoint(
                    this.root(),
                    this_el[0],
                    this_el[1],
                    5,
                    this.id(),
                    { color: 'green', width: 1 }
                  )
                  return true
                }
              })
            })
          }
        })
    })

    this.on('dragend', (ev: CustomEvent) => {
      const { handler, box } = ev.detail
      ev.detail.handler.el.move(
        box.x - (box.x % 9),
        box.y - (box.y % 9)
      )
      // 639 288
      // 632 281
      this.root()
        .children()
        .map((el) => {
          el.hasClass('tds-pinpoint' + this.id()) && el.remove()
        })
    })

    const bb = this.bbox()
    let tx = bb.x - (bb.x % this.widthFactor) //- this.widthFactor
    let ty = bb.y - (bb.y % this.widthFactor) //- this.widthFactor
    this.move(tx, ty)

    // console.log(this.bbox())
  }

  /**
   * 1 | 2
   * -----
   * 4 | 3
   */
  /** control of the quarter approach to the goal */
  getQuater(dx: number, dy: number) {
    if (dx >= 0 && dy >= 0) return 1
    if (dx <= 0 && dy >= 0) return 2
    if (dx <= 0 && dy <= 0) return 3
    if (dx >= 0 && dy <= 0) return 4
    return 5
  }

  /** get string value from item */
  get titleString() {
    return this.value
  }
  /** set string value to item */
  set titleString(v: string) {
    this.value = v
    this.setOutline()
  }

  /** stick points */
  get anchors(): AnchorsMap {
    let bb = this.background.bbox()
    return [
      [bb.x, bb.y + bb.height / 2],
      [bb.x, bb.y],
      [bb.x + bb.width / 2, bb.y],
      [bb.x2, bb.y],
      [bb.x2, bb.y + bb.height / 2],
      [bb.x2, bb.y2],
      [bb.x + bb.width / 2, bb.y2],
      [bb.x, bb.y2],
    ]
  }

  /** set outline size and position according to its indents  */
  setOutline() {
    let bb = this.background.bbox()
    let b = this.outline

    b.border.width(bb.width + b.indents[0] + b.indents[2])
    b.border.height(bb.height + b.indents[1] + b.indents[3])

    b.x(bb.x - b.indents[0])
    b.y(bb.y - b.indents[0])
  }
}

/** the stroke line is activated when you hover over an object */
export class mitemOutline extends G {
  /** outline style */
  border: Rect
  /** padding from parent object */
  indents: Indents

  /** create outline instance */
  constructor(attr: BackgroundStyle, i: Indents) {
    super()

    this.indents = i

    this.border = new Rect()
      .fill({ ...attr.fill })
      .stroke({ ...attr.stroke })
      .radius(attr.radius)

    this.add(this.border)
  }
}
