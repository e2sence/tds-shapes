import { Rect } from '@svgdotjs/svg.js'
import { G } from '@svgdotjs/svg.js'
import {
  BackgroundStyle,
  Create_ID,
  iconPath,
  Indents,
  ItemIconStyle,
  ItemType,
  TitleStyle,
} from './common'
import { label, LabelAttr } from './label'
import { ItemPartsBehavior, listItem } from './listItem'
import { ISeparatorTemplate, separator } from './separator'

// single item description
export type ListItemInstanceAttr = {
  kind: ItemType
  value: string

  icon?: string
  shortcut?: string
}

// list overal description
export type ListAttr = {
  body: BackgroundStyle
  indents: Indents
  subItemIndents: {
    item: number
    separator: number
    itemIcon: number
    itemShortcut: number
  }

  itemWidth: number
  itemsStyle: LabelAttr
  itemsBehavior?: ItemPartsBehavior
  // prettier-ignore
  itemsInstances?: { kind: ItemType, str: string, icon?: ItemIconStyle, shortcut?: TitleStyle, persStyle?: TitleStyle}[]
  separatorsInstances?: { order: number; value: ISeparatorTemplate }[]
}

export const ListAttrDefault: ListAttr = {
  //
  body: {
    width: 206,
    height: 200,
    fill: { color: '#EEEEEE' },
    stroke: { color: '#D2D2D2', width: 1 },
    radius: 10,
    position: { x: 300, y: 300 },
  },
  indents: [8, 8, 8, 8],
  subItemIndents: {
    item: 0,
    separator: 20,
    itemIcon: 20,
    itemShortcut: 20,
  },

  //
  itemWidth: 190,
  itemsStyle: {
    title: {
      value: '',
      font: 'Menlo',
      fontWeight: 'normal',
      size: 12,
      fill: { color: 'black' },
      position: { x: 0, y: 0 },
    },
    backgroundRule: ['indent'],
    background: {
      width: 50,
      height: 20,
      fill: { color: '#EEEEEE' },
      stroke: { color: '#EEEEEE' },
      radius: 8,
      position: { x: 0, y: 0 },
    },
    indents: [13, 5, 3, 5],
    position: { x: 0, y: 0 },
  },

  // prettier-ignore
  itemsInstances: [
    { kind: 'general', str: 'File'},
    { kind: 'general', str: 'Edit' },
    { kind: 'shortcut', str: 'Window', shortcut: {value: 'cmd + X', font: 'Menlo', fontWeight: 'normal', size: 12, position: {x: 0, y: 0}, fill: {color: 'red'}}},
    { kind: 'general', str: 'View' },
    { kind: 'icon', str: 'Magic line', icon: { d: iconPath.rightChevron, fill: {color: 'black'}, stroke: {color: 'black'}}},
    { kind: 'general', str: 'Terminal'},
    ],
  // prettier-ignore
  separatorsInstances: [
      {order: 3, value: {start: {x: 0, y: 0}, length: 180, stroke: {color: 'black'}} }
  ],
}

export class list extends G {
  body: Rect
  items: Array<listItem | separator | label> = []

  constructor(attr: ListAttr = ListAttrDefault) {
    super()
    this.id(Create_ID()).addClass('tds-list')

    // create body rectangle
    this.body = new Rect()
      .width(attr.body.width)
      .height(attr.body.height)
      .fill({ ...attr.body.fill })
      .stroke({ ...attr.body.stroke })
      .radius(attr.body.radius)
    this.add(this.body)

    // create items
    let seprCount = 0
    let itemCount = 0
    let curItemHeight = 0
    attr.itemsInstances.forEach((ii, num) => {
      // base indent
      let isi = attr.subItemIndents.item
      let bi = {
        x: attr.indents[0],
        y: attr.indents[0] + isi,
      }

      let el
      // set string
      let is = attr.itemsStyle
      is.title.value = ii.str
      if (num == 0) {
        is.position = { x: attr.indents[0], y: attr.indents[1] }
      } else {
        is.position = {
          x: attr.indents[0],
          y: num * curItemHeight + attr.indents[1],
        }
      }

      if (ii.kind == 'general') {
        el = new listItem({
          label: is,
          kind: 'general',
          width: attr.itemWidth,
        }).draggable()
      }
      if (ii.kind == 'shortcut') {
        el = new listItem({
          label: is,
          kind: 'shortcut',
          width: attr.itemWidth,
          suppIndent: 20,
          shortcut: ii.shortcut,
        }).draggable()
      }
      if (ii.kind == 'icon') {
        el = new listItem({
          label: is,
          kind: 'icon',
          width: attr.itemWidth,
          suppIndent: 20,
          icon: ii.icon,
        }).draggable()
      }
      num == 0 &&
        (curItemHeight =
          el.title.bbox().height + el.indents[1] + el.indents[3]) // set items height

      //   console.log(curItemHeight + el.indents[1] + el.indents[3])

      this.items.push(el)
    })

    this.items.forEach((i) => this.add(i))
  }
}
