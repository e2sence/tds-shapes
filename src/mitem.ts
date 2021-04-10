import {
  StrokeData,
  Element,
  FillData,
} from '@svgdotjs/svg.js'

import {
  AnchorsMap,
  createPinPoint,
  createTempLine,
  Create_ID,
  distP,
  isPointInCircle,
} from './common'

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
        fill: { color: '#000000' },
      },
      background: {
        width: 5,
        height: 36,
        radius: 4,
        fill: { color: '#FFFFFF' },
        stroke: { color: '#999999', width: 1 },
      },
      backgroundRule: ['centered', 'indent'],
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

/** base item for tds-core
 *  'label' that can
 *  - snap to grid or other item
 *  - be 'selected'
 */
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
    this.id(Create_ID()).addClass('tds-mitem')

    // set styles
    this.highlightStyle = highlightStyle
    this.selectStyle = selectStyle
    this.normalStateStyle = {
      fill: { ...attr.background.fill },
      stroke: { ...attr.background.stroke },
    }

    // correct width according to widthFactor
    this.widthFactor = wFactor
    this.correctWidth()

    // set initial position to grid
    const bb = this.background.bbox()
    let bbx = bb.x % this.widthFactor
    let bby = bb.y % this.widthFactor
    if (bbx != 0 || bby != 0) {
      this.move(bb.x - bbx, bb.y - bby)
    }

    // hightlight item on mouse over
    this.on('mouseenter', () => {
      !this.selected && this.setHighLightStyle()
      this.front()
    })

    // 'select' on mouse down
    this.on('mousedown', () => {
      !this.selected
        ? ((this.selected = true),
          this.setSelectStyle(),
          this.fire('tds-mitem-directSelect', this))
        : // dont switch state
          0
    })

    // restore normal state on 'mouseleave'
    this.on('mouseleave', () => {
      !this.selected && this.setNormalStyle()
    })

    this.on('dragmove', (ev: CustomEvent) => {
      // turn on snap

      snapHandler(this)

      const { box } = ev.detail
      ev.preventDefault()

      if (this.snaped) {
        this.move(
          box.x -
            (box.x % this.widthFactor) +
            this.widthFactor,
          box.y -
            (box.y % this.widthFactor) +
            this.widthFactor
        )
        this.move(
          box.x - (box.x % this.widthFactor),
          box.y - (box.y % this.widthFactor)
        )
      } else {
        this.move(box.x, box.y)
      }
    })

    /**
     * set snap if one item to close to another
     * @param inst drag instance
     * @param ff flag for free not snaped item
     */
    function snapHandler(inst: mitem) {
      let cb = inst.bbox()
      let ff = 0

      let fi = inst
        .parent()
        .children()
        .filter(
          (el: Element) =>
            el.hasClass('tds-mitem') && el != inst
        )

      let instgiag = distP(cb.x, cb.y, cb.x2, cb.y2)

      let trgI: [item: Element, dist: number][] = []

      for (let i = 0; i < fi.length; i++) {
        let ib = fi[i].bbox()
        let idiag = distP(ib.x, ib.y, ib.x2, ib.y2)
        if (
          isPointInCircle(
            ib.cx,
            ib.cy,
            cb.cx,
            cb.cy,
            (idiag + instgiag) * 0.75
          )
        ) {
          let dist = distP(ib.cx, ib.cy, cb.cx, cb.cy)
          if (fi[i] instanceof mitem)
            trgI.push([fi[i], dist])
        }
      }
      let srtT = trgI.sort((a, b) => a[1] - b[1])

      for (let i = 0; i < srtT.length; i++) {
        let ti = srtT[i][0]
        if (ti instanceof mitem) {
          for (
            let tii = 0;
            tii < ti.anchors.length;
            tii++
          ) {
            for (
              let ia = 0;
              ia < inst.anchors.length;
              ia++
            ) {
              let adist = distP(
                ti.anchors[tii][0],
                ti.anchors[tii][1],
                inst.anchors[ia][0],
                inst.anchors[ia][1]
              )
              if (adist < inst.widthFactor * 2) {
                inst.snaped = true
                ff = 1
              }
            }
            if (ff == 1) break
          }
          if (ff == 1) break
        }
      }
      if (ff == 0) {
        inst.snaped = false
      }
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
