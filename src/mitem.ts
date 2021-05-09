import {
  StrokeData,
  Element,
  FillData,
} from '@svgdotjs/svg.js'

import {
  AnchorsMap,
  Create_ID,
  distP,
  GRID_STEP,
  isPointInCircle,
  pointInRectBox,
  shapeStackAtPoint,
} from './common'

import { label, LabelAttr } from './label'
import { mitemjail } from './mitemjail'
import { marks } from './mitemmark'

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

  friends: Element[] = []

  marks: marks

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
      // this.front()
    })

    // 'select' on mouse down
    this.on('mousedown', () => {
      this.selectHandler()
    })

    // restore normal state on 'mouseleave'
    this.on('mouseleave', () => {
      !this.selected && this.setNormalStyle()
    })

    this.on('dragstart', (ev: CustomEvent) => {
      // if drag start from 'tds-container'
      let _p = this.parents()[0]
      if (_p.hasClass('tds-container')) {
        this.fire('tds-mitem-leavejail', _p)
      }
      if (this.parent() != this.root()) this.toRoot()

      // skipping the mouse movement event through the element when dragging
      this.attr({ 'pointer-events': 'none' })

      // fill friends
      this.friends = this.friendsMitems()
    })

    this.on('dragmove', (ev: CustomEvent) => {
      this.dragMoveHandler(ev)
    })

    /** set to grid on drop */
    this.on('dragend', (ev: CustomEvent) => {
      this.checkLandingPosition(ev)
      this.dragEndHandler()

      // returning the perception of mouse events
      this.attr({ 'pointer-events': 'auto' })
    })
  }

  initFriends() {
    this.friends = this.friendsMitems()
  }

  /** try to find 'mitemjail' */
  checkLandingPosition(ev: CustomEvent) {
    let cb = this.bbox()

    // get stack of elements at item center
    const r = shapeStackAtPoint(
      this.root(),
      { x: cb.cx, y: cb.cy },
      this
    )

    // if we have 'tds-container'
    let rl = r.length
    if (rl != 0) {
      let landingElement = r[rl - 1]
      if (landingElement instanceof mitemjail) {
        // check body
        if (
          pointInRectBox(landingElement.body.bbox(), {
            x: cb.cx,
            y: cb.cy,
          })
        ) {
          //! ---------------------------------------------------
          //! at this point mitem adds to jail
          r[rl - 1].add(this)
        }
      }
    }
  }

  selectHandler() {
    !this.selected
      ? ((this.selected = true),
        this.select(true),
        this.fire('tds-mitem-directSelect', this))
      : // dont switch state
        0
  }

  /** friends mitens on field and in the containers */
  private friendsMitems() {
    // 'mitems' directly on field
    let fi = this.parent()
      .children()
      .filter(
        (el: Element) =>
          el.hasClass('tds-mitem') && el != this
      )

    // mitems inside 'tds-container'
    let ja: mitem[] = []
    this.parent()
      .children()
      .filter((el: Element) => el.hasClass('tds-container'))
      .forEach((el) => {
        if (el instanceof mitemjail) {
          el.items.forEach((el) => {
            if (el instanceof mitem) {
              ja.push(el)
            }
          })
        }
      })

    // adds hiden by 'tds-container' mitems
    fi.push(...ja)

    return fi
  }

  /**
   * set snap if one item to close to another
   * @param ff flag for free not snaped item
   */
  private snapHandler() {
    let cb = this.bbox()
    let ff = 0

    let instgiag = distP(cb.x, cb.y, cb.x2, cb.y2)

    let trgI: [item: Element, dist: number][] = []

    for (let i = 0; i < this.friends.length; i++) {
      let ib = this.friends[i].bbox()
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
        if (this.friends[i] instanceof mitem)
          trgI.push([this.friends[i], dist])
      }
    }
    let srtT = trgI.sort((a, b) => a[1] - b[1])

    for (let i = 0; i < srtT.length; i++) {
      let ti = srtT[i][0]
      if (ti instanceof mitem) {
        for (let tii = 0; tii < ti.anchors.length; tii++) {
          for (let ia = 0; ia < this.anchors.length; ia++) {
            let adist = distP(
              ti.anchors[tii][0],
              ti.anchors[tii][1],
              this.anchors[ia][0],
              this.anchors[ia][1]
            )
            if (adist < this.widthFactor * 2) {
              this.snaped = true
              this.front()
              ff = 1
            }
          }
          if (ff == 1) break
        }
        if (ff == 1) break
      }
    }
    if (ff == 0) {
      this.snaped = false
    }
  }
  dragMoveHandler(ev: CustomEvent, c: boolean = false) {
    // handle snap
    this.snapHandler()

    const { box } = ev.detail
    ev.preventDefault()

    if (this.snaped) {
      if (!c) {
        this.move(
          box.x - (box.x % this.widthFactor),
          box.y - (box.y % this.widthFactor)
        )
      } else {
        this.cx(
          ev.detail.event.x -
            (ev.detail.event.x % this.widthFactor)
        )
        this.cy(
          ev.detail.event.y -
            (ev.detail.event.y % this.widthFactor)
        )
        c = false
      }
    } else {
      if (!c) {
        this.move(box.x, box.y)
      } else {
        this.cx(ev.detail.event.x)
        this.cy(ev.detail.event.y)
        c = false
      }
    }
  }

  /** handle grid snapping on end of drag */
  dragEndHandler() {
    const box = this.bbox()
    this.move(
      box.x - (box.x % this.widthFactor),
      box.y - (box.y % this.widthFactor)
    )
    this.snaped = false
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
    let bb = this.bbox()
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
