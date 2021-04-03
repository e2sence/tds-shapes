import {
  StrokeData,
  Element,
  FillData,
} from '@svgdotjs/svg.js'

import { AnchorsMap, Create_ID, distP } from './common'

import { label, LabelAttr } from './label'

const mitemLabelAtr = {
  title: {
    value: '',
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
  position: { x: 0, y: 0 },
}

const mitemHighliteStyle = {
  fill: { color: '#FFFFFF' },
  stroke: { color: '#000000', width: 1 },
}

const mitemSelectStyle = {
  fill: { color: '#D0D0D0' },
  stroke: { color: '#000000', width: 1 },
}

const GRID_STEP = 9
const MITEM_FRIENDS_ZONE = 100

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
      backgroundRule: ['indent'],
      indents: [4, 2, 2, 2],
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
    wFactor: number = GRID_STEP,
    highlightStyle: {
      fill: FillData
      stroke: StrokeData
    } = mitemHighliteStyle,
    selectStyle: {
      fill: FillData
      stroke: StrokeData
    } = mitemSelectStyle
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
    let bbx = bb.x % this.widthFactor
    let bby = bb.y % this.widthFactor
    if (bbx != 0 || bby != 0) {
      this.move(bb.x - bbx, bb.y - bby)
    }

    this.on('mouseenter', () => {
      !this.selected && this.setHighLightStyle()
      this.front()
    })

    this.on('mousedown', () => {
      !this.selected
        ? ((this.selected = true),
          this.setSelectStyle(),
          this.root().fire('tds-mitem-directSelect', this))
        : // dont switch state
          0
    })

    this.on('mouseleave', () => {
      !this.selected && this.setNormalStyle()
    })

    this.on('dragmove', (ev: CustomEvent) => {
      let a: [number, number[]] = [0, []]

      snapHandler(this, a)

      const { box } = ev.detail
      ev.preventDefault()

      if (a[0] == a[1].length) {
        this.snaped = false
      }

      if (this.snaped) {
        this.move(
          box.x - (box.x % this.widthFactor),
          box.y - (box.y % this.widthFactor)
        )
      } else {
        this.move(box.x, box.y)
      }
    })

    function snapHandler(
      inst: mitem,
      a: [number, number[]]
    ) {
      let cb = inst.bbox()
      // find mitem instances
      //prettier-ignore
      let fi = inst.parent().children().filter(
        (el: Element) => el.hasClass('tds-mitem') && el != inst)
      a[0] = fi.length
      fi.forEach((el: Element) => {
        let elb = el.bbox()
        let dist = distP(cb.cx, cb.cy, elb.cx, elb.cy) // get distance to mitems

        //prettier-ignore
        if (dist < MITEM_FRIENDS_ZONE && el instanceof mitem)
        {
          let can = el.anchors // el - mitem in range
          inst.anchors.forEach((this_el) => {
            can.forEach((c_el) => {
                let adist = distP(this_el[0], this_el[1], c_el[0], c_el[1])
                // turn on snap to grid mode
                if (adist < inst.widthFactor * 1.5) {
                  inst.snaped = true
                  return true
                }
              })
            })
        }
        else if (dist > MITEM_FRIENDS_ZONE * 0.1 && inst.snaped == true) {
          a[1].push(1)
        }
      })
    }

    /** set to grid on drop */
    this.on('dragend', () => {
      const box = this.background.bbox()
      this.move(
        box.x - (box.x % this.widthFactor),
        box.y - (box.y % this.widthFactor)
      )
      this.snaped = false
    })
  }

  /** proxy move */
  move(x: number, y: number) {
    super.move(x, y)

    return this
  }

  /** set styles */
  setHighLightStyle() {
    this.background.fill({ ...this.highlightStyle.fill })
    this.background.stroke({
      ...this.highlightStyle.stroke,
    })
  }
  setSelectStyle() {
    this.background.fill({ ...this.selectStyle.fill })
    this.background.stroke({ ...this.selectStyle.stroke })
  }
  setNormalStyle() {
    this.background.fill({ ...this.normalStateStyle.fill })
    this.background.stroke({
      ...this.normalStateStyle.stroke,
    })
  }

  /** switch selection
   * state - if defined, sets directly to 'true' or 'false'
   * in other case just 'switch'
   */
  select(state?: boolean) {
    state != undefined
      ? state
        ? // set select
          ((this.selected = true), this.setSelectStyle())
        : // remove select
          ((this.selected = false), this.setNormalStyle())
      : // switch
      this.selected
      ? ((this.selected = false), this.setNormalStyle())
      : ((this.selected = true), this.setSelectStyle())
  }

  /**  correct width according to widthFactor */
  private correctWidth() {
    let curWidth = this.background.width()
    this.background.width(
      curWidth -
        (curWidth % this.widthFactor) +
        this.widthFactor
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
