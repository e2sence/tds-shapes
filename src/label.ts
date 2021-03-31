import { G, Element } from '@svgdotjs/svg.js'

import {
  Create_ID,
  TitleToBackgroundRules,
  Indents,
  BackgroundStyle,
  Position,
  TitleStyle,
} from './common'

import { title } from './title'
import { background } from './background'

// export type TitleToBackgroundRules =
//   | 'none' //     label does not have background
//   | 'direct' //   coordinates defined directly
//   | 'indent' //   static indents
//   | 'centered' // allign title center to background

export type LabelAttr = {
  title: title | TitleStyle
  backgroundRule?: TitleToBackgroundRules[]
  background?: background | BackgroundStyle
  indents?: Indents
  position?: Position
  // widthFactor?: number
}

export class label extends G {
  title: title
  background: background
  rules: TitleToBackgroundRules[] = []
  indents: Indents
  // widthFactor: number

  constructor(attr: LabelAttr) {
    super()
    this.id(Create_ID()).addClass('tds-label')

    attr.backgroundRule ??= ['none']
    this.rules.push(...attr.backgroundRule)

    // attr.widthFactor && (this.widthFactor = attr.widthFactor)

    attr.indents ??= [0, 0, 0, 0]
    this.indents = attr.indents

    if (attr.title instanceof title) {
      Object.assign(attr.title, this.title)
    } else {
      this.title = new title(attr.title)
    }

    if (attr.background && !this.rules.includes('none')) {
      if (attr.background instanceof background) {
        Object.assign(attr.background, this.background)
      } else {
        this.background = new background(attr.background)
      }
    }

    applyRules(
      this.title,
      this.background,
      this.rules,
      this.indents
      // this.widthFactor
    )

    this.background && this.add(this.background)
    this.add(this.title)

    attr.position && this.move(attr.position.x, attr.position.y)
  }

  // value operations
  /** get value from title */
  get value() {
    return this.title.value
  }
  /** set title value and apply rules */
  set value(v: string) {
    this.title.value = v
    this.applyRules(this.rules, this.indents)
  }

  /**
   * alling 'background' position to 'title' by rules
   * the rules are applied in the order of definition
   * @param r new rules
   * @param i new indents
   */
  applyRules(r: TitleToBackgroundRules[], i: Indents = [0, 0, 0, 0]) {
    // store rules and indents
    this.rules = []
    this.rules.push(...r)
    this.indents = i

    applyRules(
      this.title,
      this.background,
      this.rules,
      this.indents
      // this.widthFactor
    )
  }
}

/**
 * alling 'background' position to 'title' by rules
 * the rules are applied in the order of definition
 * @param t title
 * @param b background
 * @param r array of rules from TitleToBackgroundRules
 * @param i indents array [0,0,0,0] by default
 * @param wf width factor
 */
const applyRules = (
  t: Element,
  b: Element,
  r: TitleToBackgroundRules[],
  i?: Indents //| { sp: Position; tp: Position }
  // wf?: number
): void => {
  r.forEach((rule) => {
    switch (rule) {
      case 'centered':
        // set background to title
        b.cx(t.cx())
        b.cy(t.cy())
        break
      case 'indent':
        // change background size accordind
        // title size and indents
        let tb = t.bbox()

        b.width(tb.width + i[0] + i[2])
        b.height(tb.height + i[1] + i[3])

        b.x(tb.x - i[0])
        b.y(tb.y - i[1])
        break
      default:
        break
    }
    // check factor
  })
}
