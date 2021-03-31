import { G, Element, Rect } from '@svgdotjs/svg.js'

import {
  AnchorsMap,
  BackgroundStyle,
  Create_ID,
  distP,
  Indents,
} from './common'

import { label, LabelAttr } from './label'

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
    },
    9
  )
}

const MITEM_FRIENDS_ZONE = 200
const GRID_STEP = 9

/** base item for tds-core */
export class mitem extends label {
  outline: mitemOutline
  widthFactor: number

  fromFreeDrag: boolean = true

  constructor(
    attr: LabelAttr,
    outline: { border: BackgroundStyle; indents: Indents },
    wFactor: number
  ) {
    super(attr)
    this.id(Create_ID()).addClass('tds-mitem')

    this.widthFactor = wFactor

    // set outline
    this.outline = new mitemOutline(outline.border, outline.indents)
    this.add(this.outline)
    this.outline.hide()
    this.on('mouseenter', () => {
      this.outline.show()
    })
    this.on('mouseleave', () => {
      this.outline.hide()
    })

    // correct width according to widthFactor
    this.correctWidth()

    // set initial position to grid
    const bb = this.background.bbox()
    let tx = bb.x - (bb.x % this.widthFactor) + attr.indents[1]
    let ty = bb.y - (bb.y % this.widthFactor) + attr.indents[3]
    this.move(tx, ty)

    // correct outline
    this.setOutline()

    this.on('dragmove', (ev: CustomEvent) => {
      snapHandler(ev, this)
    })
    function snapHandler(ev: CustomEvent, inst: mitem) {
      let cb = inst.bbox()
      // find mitem instances
      inst
        .parent()
        .children()
        .filter(
          (el: Element) => el.hasClass('tds-mitem') && el != inst
        )
        .forEach((el: Element) => {
          let elb = el.bbox()
          // get distance to mitems
          let dist = distP(cb.x, cb.y, elb.x, elb.y)
          if (dist < MITEM_FRIENDS_ZONE && el instanceof mitem) {
            // el - mitem in range
            let can = el.anchors
            inst.anchors.forEach((this_el: number[]) => {
              can.forEach((c_el) => {
                let adist = distP(
                  this_el[0],
                  this_el[1],
                  c_el[0],
                  c_el[1]
                )
                // turn on snap to grid mode
                if (adist < inst.widthFactor) {
                  //   let dx = this_el[0] - c_el[0]
                  //   let dy = this_el[1] - c_el[1]
                  //   let q = inst.getQuater(dx, dy)
                  //   console.log(`${dx} ${dy} ${q}`)

                  ev.preventDefault()
                  const { box } = ev.detail

                  ev.detail.handler.el.move(
                    box.x - (box.x % inst.widthFactor),
                    box.y - (box.y % inst.widthFactor)
                  )

                  //   inst.fromFreeDrag = false
                  return true
                }
              })
            })
          }
        })
    }

    this.on('dragend', () => {
      //   if (this.fromFreeDrag) {
      // set position to grid
      const box = this.background.bbox()
      this.move(
        box.x - (box.x % this.widthFactor),
        box.y - (box.y % this.widthFactor)
      )
      //   } else {
      //     this.fromFreeDrag = true
      //   }
    })
  }

  /**
   *          41
   *        4 | 1
   *     34 ----- 12
   *        3 | 2
   *          23
   */
  /** control of the quarter approach to the goal */
  getQuater(dx: number, dy: number) {
    if (dx > 0 && dy < 0) return 1
    if (dx > 0 && dy > 0) return 2
    if (dx < 0 && dy > 0) return 3
    if (dx < 0 && dy < 0) return 4
    if (dx > 0 && dy == 0) return 12
    if (dx == 0 && dy > 0) return 23
    if (dx < 0 && dy == 0) return 34
    if (dx == 0 && dy < 0) return 41
    if (dx == 0 && dy == 0) return 5

    return 5
  }

  /**  correct width according to widthFactor */
  private correctWidth() {
    let curWidth = this.background.width()
    this.background.width(
      curWidth - (curWidth % this.widthFactor) + this.widthFactor
    )
  }

  /** get string value from item */
  get titleString() {
    return this.value
  }
  /** set string value to item */
  set titleString(v: string) {
    this.value = v
    // correct width according to width factor
    this.correctWidth()

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
