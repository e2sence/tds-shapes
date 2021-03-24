import { StrokeData } from '@svgdotjs/svg.js'
import { Path, Rect, FillData } from '@svgdotjs/svg.js'

import {
  ItemIconStyle,
  ItemState,
  ItemType,
  TitleStyle,
} from './common'
import { label, LabelAttr } from './label'
import { title } from './title'

/** events to which the object reacts */
export type ItemCondition =
  | 'normal'
  | 'mouseenter'
  | 'onclick'
  | 'inactive'
  | 'highlight'

/** type of object part */
export type ItemPartType =
  | 'background'
  | 'title'
  | 'icon'
  | 'foreground'
  | 'shotrcut'

//#region

// behavior dependent condition
export type Behavior = {
  condition?: ItemCondition
  attr?: { fill?: FillData; stroke?: StrokeData }
}

export type ItemPartsBehavior = {
  itemPart: ItemPartType
  behavior: Behavior[]
}[]

export const itemPartOrder: ItemPartType[] = [
  'background',
  'title',
  'icon',
  'shotrcut',
  'foreground',
]

export const ItemDefaultBehavior: ItemPartsBehavior = [
  // background
  {
    itemPart: 'background',
    behavior: [
      {
        condition: 'normal',
        attr: {
          fill: { color: '#EEEEEE' },
          stroke: { color: '#D2D2D2', width: 1 },
        },
      },
      {
        condition: 'mouseenter',
        attr: {
          fill: { color: '#00AAFF' },
          stroke: { color: '#00AAFF', width: 1 },
        },
      },
      {
        condition: 'onclick',
        attr: {
          fill: { color: '#999999' },
          stroke: { color: '#999999', width: 1 },
        },
      },
    ],
  },
  // label
  {
    itemPart: 'title',
    behavior: [
      {
        condition: 'normal',
        attr: { fill: { color: 'black' } },
      },
      {
        condition: 'mouseenter',
        attr: { fill: { color: 'white' } },
      },
    ],
  },
  // foreground
  {
    itemPart: 'foreground',
    behavior: [
      {
        condition: 'normal',
        attr: {
          fill: { color: 'transparent' },
          stroke: { color: 'transparent' },
        },
      },
      {
        condition: 'mouseenter',
        attr: {
          fill: { color: '#00AAFF' },
          stroke: { color: 'transparent' },
        },
      },
    ],
  },
  // shortcut
  {
    itemPart: 'shotrcut',
    behavior: [
      {
        condition: 'normal',
        attr: {
          fill: { color: '#999999' },
        },
      },
      {
        condition: 'mouseenter',
        attr: {
          fill: { color: '#FFFFFF' },
        },
      },
    ],
  },
  // icon
  {
    itemPart: 'icon',
    behavior: [
      {
        condition: 'normal',
        attr: {
          fill: { color: 'black' },
          stroke: { color: 'black' },
        },
      },
      {
        condition: 'mouseenter',
        attr: {
          fill: { color: 'white' },
          stroke: { color: 'white' },
        },
      },
    ],
  },
]

//#endregion

//?        top
//?  |  |  |  |  |  |  |
//?  V  V  V  V  V  V  V
//!  --------- foreground - background ------------
//!  title - Title & [icon - PATH || shotrcut - Title]
//!  --------- background - background ------------
//?  A  A  A  A  A  A  A
//?  |  |  |  |  |  |  |
//?        bottom
export class item extends label {
  // -- title
  // -- background

  kind: ItemType
  foreground: Rect

  behavior: ItemPartsBehavior
  condition?: ItemCondition = 'normal'
  state?: ItemState = 'active'

  suppItem: Path | title
  suppIndent: number = 15

  constructor(attr: {
    label: LabelAttr
    kind: ItemType
    width: number
    suppIndent?: number

    icon?: ItemIconStyle
    shortcut?: TitleStyle

    behavior?: ItemPartsBehavior
    condition?: ItemCondition
    state?: ItemState
  }) {
    super(attr.label)

    this.kind = attr.kind

    // check type and adds icon or shortcut to core
    if (this.kind == 'icon') {
      this.suppItem = new Path({ ...attr.icon })
    } else if (this.kind == 'shortcut') {
      this.suppItem = new title({ ...attr.shortcut })
    }
    attr.suppIndent && (this.suppIndent = attr.suppIndent)

    // set overal background width
    if (this.kind != 'general') {
      //prettier-ignore
      this.suppItem.move(
        attr.label.position.x +
        attr.width - this.suppItem?.bbox().width - this.suppIndent,
        this.bbox().cy - this.suppItem?.bbox().height / 2
      )
    }
    this.background.width(attr.width)

    // foreground
    this.foreground = new Rect()
      .width(this.background.width())
      .height(this.background.height())
      // .fill({ color: 'red', opacity: 0.2 })
      .fill({ color: 'transparent' })
      .move(this.background.x(), this.background.y())

    // set state and condition
    this.condition = attr.condition ? attr.condition : 'normal'
    this.state = attr.state ? attr.state : 'active'

    // finally set how it will look )
    attr.behavior
      ? (this.behavior = attr.behavior)
      : (this.behavior = ItemDefaultBehavior)
    this.applyBehavior()

    // adds supp item and foreground
    this.add(this.suppItem)
    this.add(this.foreground)

    // handle mouseenter / mouseleave and mousedown
    this.foreground.on('mouseenter', () => {
      this.condition != 'highlight'
        ? (this.condition = 'mouseenter')
        : 0
      this.front()
      this.applyBehavior()
    })
    this.foreground.on('mouseleave', () => {
      this.condition != 'highlight' ? (this.condition = 'normal') : 0
      this.applyBehavior()
    })
    this.foreground.on('mousedown', () => {
      this.condition = 'onclick'
      this.applyBehavior()
    })
  }

  /**
   * change the appearance of the element depending on the external influence
   * @param c current condition
   */
  applyBehavior(c?: ItemCondition) {
    !c && (c = this.condition)

    getB(this, this.background, c, 'background')
    getB(this, this.title, c, 'title')

    if (this.suppItem instanceof Path) {
      getB(this, this.suppItem, c, 'icon')
    }
    if (this.suppItem instanceof title) {
      getB(this, this.suppItem, c, 'shotrcut')
    }
  }
}

//! wtf (...
const getB = (
  i: item,
  rop: any,
  c?: ItemCondition,
  pt?: ItemPartType
) => {
  let bf = i.behavior.find((el) => el.itemPart == pt)
  let dbc = bf && bf.behavior.find((el) => el.condition == c)
  dbc &&
    (rop.fill({ ...dbc.attr.fill }),
    rop.stroke({ ...dbc.attr.stroke }))
}
