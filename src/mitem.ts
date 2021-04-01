import { FillData } from '@svgdotjs/svg.js'
import { StrokeData } from '@svgdotjs/svg.js'
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
        stroke: { color: '#999999', width: 1 },
      },
      backgroundRule: ['indent', 'centered'],
      indents: [4, 2, 4, 2],
      position: { x: p.x, y: p.y },
    },
    // widthFactor
    9,
    // highlightStyle
    {
      fill: { color: '#FFFFFF' },
      stroke: { color: '#000000', width: 1 },
    },
    // selectStyle
    {
      fill: { color: '#D0D0D0' },
      stroke: { color: '#000000', width: 1 },
    }
  )
}

const MITEM_FRIENDS_ZONE = 200
const GRID_STEP = 9

/** base item for tds-core */
export class mitem extends label {
  widthFactor: number

  normalStateStyle: { fill: FillData; stroke: StrokeData }
  highlightStyle: { fill: FillData; stroke: StrokeData }
  selectStyle: { fill: FillData; stroke: StrokeData }

  snaped: boolean = false
  selected: boolean = false

  constructor(
    attr: LabelAttr,
    wFactor: number,
    highlightStyle: { fill: FillData; stroke: StrokeData },
    selectStyle: { fill: FillData; stroke: StrokeData }
  ) {
    super(attr)

    this.highlightStyle = highlightStyle
    this.selectStyle = selectStyle
    this.normalStateStyle = {
      fill: { ...attr.background.fill },
      stroke: { ...attr.background.stroke },
    }

    this.id(Create_ID()).addClass('tds-mitem')

    this.widthFactor = wFactor
    // correct width according to widthFactor
    this.correctWidth()

    // set initial position to grid
    const bb = this.background.bbox()
    let tx = bb.x - (bb.x % this.widthFactor)
    let ty = bb.y - (bb.y % this.widthFactor)
    this.move(tx, ty)

    this.on('mouseenter', () => {
      !this.selected && this.highLight()
      this.front()
    })

    this.on('mousedown', () => {
      !this.selected
        ? ((this.selected = true),
          this.select(),
          this.root().fire('tds-mitem-directSelect', this))
        : ((this.selected = false), this.highLight())
    })

    this.on('mouseleave', () => {
      !this.selected && this.normal()
    })

    this.on('dragmove', (ev: CustomEvent) => {
      snapHandler(ev, this)
    })
    function snapHandler(ev: CustomEvent, inst: mitem) {
      //
      let finds: string[] = []
      if (!inst.snaped) {
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
                    let cid = el.id()
                    !finds.includes(cid) && finds.push(cid)

                    const { box } = ev.detail
                    ev.preventDefault()

                    if (!inst.snaped) {
                      inst.move(
                        box.x - (box.x % inst.widthFactor),
                        box.y - (box.y % inst.widthFactor)
                      )
                      inst.snaped = true
                    }

                    return true
                  }
                })
              })
            }
          })
      } else {
        const { box } = ev.detail
        ev.preventDefault()

        inst.move(
          box.x - (box.x % inst.widthFactor),
          box.y - (box.y % inst.widthFactor)
        )
      }
      // finds.length == 0 && (inst.snaped = false)
    }

    this.on('dragend', () => {
      const box = this.background.bbox()
      this.move(
        box.x - (box.x % this.widthFactor),
        box.y - (box.y % this.widthFactor)
      )
      this.snaped = false
    })
  }

  /** set styles */
  highLight() {
    this.background.fill({ ...this.highlightStyle.fill })
    this.background.stroke({ ...this.highlightStyle.stroke })
  }
  select() {
    this.background.fill({ ...this.selectStyle.fill })
    this.background.stroke({ ...this.selectStyle.stroke })
  }
  normal() {
    this.background.fill({ ...this.normalStateStyle.fill })
    this.background.stroke({ ...this.normalStateStyle.stroke })
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
}
