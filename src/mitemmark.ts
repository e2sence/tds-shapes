import { Element } from '@svgdotjs/svg.js'

import { GRID_STEP, posdef, position } from './common'

import { label, LabelAttr } from './label'
import { mitem } from './mitem'

/** location of the marker relative to the base */
export type MarkSide = 'left' | 'right'

/** type for the description of the mark */
export type MarkStyleAttr = {
  sing: string
  tagSide: MarkSide
  singColor: string
  backColor: string
  strokeColor: string
}

/**
 * collecting properties for 'mark' description
 * @param sing sing
 * @param tagSide tagside
 * @param singColor sing color
 * @param backColor back color
 * @param strokeColor stroke color
 * @returns LabelAttr
 */
export const markAttrCreator = (
  attr: MarkStyleAttr,
  p: position
): LabelAttr => {
  attr.tagSide == 'left'
    ? (attr.sing = attr.sing + mark.emptySign)
    : (attr.sing = mark.emptySign + attr.sing)
  return {
    title: {
      value: attr.sing,
      font: 'Menlo',
      fontWeight: 'normal',
      size: 12,
      fill: { color: attr.singColor },
      position: posdef,
    },
    background: {
      width: 1,
      height: 1,
      fill: { color: attr.backColor },
      stroke: { color: attr.strokeColor },
      radius: 4,
      position: posdef,
    },
    backgroundRule: ['indent'],
    indents: [GRID_STEP, 2, GRID_STEP, 2],
    position: { x: p.x, y: p.y },
  }
}

/**
 * a small mark of 2-3 characters located on the left or right side of the mitem
 */
export class mark extends label {
  sing: string
  side: MarkSide
  /**
   * @param sing sing
   * @param tagSide tagside
   * @param singColor sing color
   * @param backColor back color
   * @param strokeColor stroke color
   */
  constructor(attr: MarkStyleAttr, p: position) {
    super(markAttrCreator(attr, p))
    this.addClass('tds-mark')

    this.sing = attr.sing.replace(mark.emptySign, '')
    this.side = attr.tagSide

    this.widthTitleFix()
  }

  /** fix the width and position of the text */
  widthTitleFix() {
    // round width to current GRID_STEP
    let _cw = this.background.width()
    this.background.width(_cw - (_cw % GRID_STEP))

    // slightly move title acording to 'tagSide'
    this.title.dx(-GRID_STEP * 0.25)
  }

  static get emptySign() {
    return '\u2007'
  }
}

/** marks storage */
type ms = [mark: mark, width: number]

/** array of tags  attached to a specific element */
export class marks {
  parent: mitem
  left: ms[] = []
  right: ms[] = []

  /** initial instance, fill and draw elements if it defines  */
  constructor(b: mitem, els?: MarkStyleAttr[]) {
    this.parent = b

    els?.forEach((el) => this.add(el))

    this.left.length > 0 && this.setPosition('left')
    this.right.length > 0 && this.setPosition('right')
  }

  /** check is mark exist */
  hasMark(s: string, side: MarkSide) {
    // get find string accordind to 'side'
    let fs =
      side == 'left'
        ? s + mark.emptySign
        : mark.emptySign + s
    // get storage
    let ar = this.getStorage(side)
    let fnds = ar.filter((el) => el[0].value == fs)
    return fnds.length > 0 ? true : false
  }

  /** adds mark to local storage */
  add(attr: MarkStyleAttr, i: number = -1) {
    // create instance of mark
    this.addHandler(new mark(attr, posdef), i)
  }

  /** remove mark from storage and erase from canvas */
  remove(
    s: string,
    side: MarkSide,
    animate: boolean = false
  ) {
    // get find string accordind to 'side'
    let fs =
      side == 'left'
        ? s + mark.emptySign
        : mark.emptySign + s

    // get storage
    let ar = this.getStorage(side)

    // find and remove mark
    let fnds = ar.filter((el) => el[0].value == fs)
    if (fnds.length > 0) {
      let _t = fnds[0][0]

      const dx = fnds[0][1]

      // remove element from storage
      let _ti = ar.findIndex((el) => el[0] == _t)
      ar.splice(_ti, 1)

      // remove from canvas
      if (animate) {
        this.wiggle(_t, 'remove', () => {
          _t.remove()
          _t = undefined
        })
      } else {
        _t.remove()
        _t = undefined
      }

      // restore inner mark positions
      if (ar.length > 0) {
        if (side == 'right') {
          for (let i = _ti; i < ar.length; i++) {
            ar[i][0].dx(-dx + GRID_STEP)
          }
          return
        }
        if (side == 'left') {
          for (let i = _ti; i < ar.length; i++) {
            ar[i][0].dx(dx - GRID_STEP)
          }
        }
      }
    }
  }

  /**
   * puts marks in its place, show element on canvas
   * @param s the side to be processed
   * @param nf set to true if use outside constructor
   */
  setPosition(
    s: MarkSide,
    nf: boolean = false,
    wgl: boolean = true
  ): void {
    // get storage
    let _st = this.getStorage(s)

    let opX = 0
    let _cb = !nf
      ? this.parent.bbox()
      : this.parent.background.bbox()
    let _x = 0

    if (s == 'left') {
      for (let i = 0; i < _st.length; i++) {
        let _el = _st[i][0]

        if (i > 0) {
          _x = opX - _st[i][1] + GRID_STEP
        } else {
          _x = _cb.x - _st[i][1] + GRID_STEP
        }

        _el.move(_x, _cb.y)
        this.parent.add(_el)
        _el.back()
        opX = _x

        if (wgl) {
          setTimeout(() => {
            this.wiggle(_el, 'addorput')
          }, 50 * i)
        }
      }
      return
    }

    if (s == 'right') {
      for (let i = 0; i < _st.length; i++) {
        let _el = _st[i][0]

        if (i > 0) {
          _x = opX - GRID_STEP
        } else {
          _x = _cb.x2 - GRID_STEP
        }
        _el.move(_x, _cb.y)
        this.parent.add(_el)
        _el.back()
        opX = _x + _st[i][1]

        if (wgl) {
          setTimeout(() => {
            this.wiggle(_el, 'addorput')
          }, 50 * i)
        }
      }
      return
    }
  }

  /** return local storage according to marks side */
  private getStorage(el: mark | MarkSide): ms[] {
    return el instanceof mark
      ? el.side == 'left'
        ? this.left
        : this.right
      : el == 'left'
      ? this.left
      : this.right
  }

  /** handler for 'put' or 'add' */
  private addHandler(el: mark, i: number) {
    // check storage place
    let _ar = el.side == 'left' ? this.left : this.right

    // check operation type
    let _op = i == -1 ? 'add' : 'put'

    // make operation according to type
    let _el: ms = [el, el.width()]
    _op == 'add' ? _ar.push(_el) : _ar.splice(i, 0, _el)
  }

  wiggle(
    el: mark,
    t: 'addorput' | 'remove',
    efn?: EventListener
  ) {
    if (t == 'addorput') {
      let d = !(el.side == 'left')
        ? el.width() * 0.25
        : -el.width() * 0.25
      el.animate(100).dx(d).loop(2, true)
      return
    }
    if (t == 'remove') {
      let d = !(el.side == 'left')
        ? -el.width()
        : el.width()
      el.animate(100).dx(d).after(efn)
    }
  }
}
