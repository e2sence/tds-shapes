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
  autoHeight?: boolean
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
  autoHeight: true,
  indents: [5, 8, 5, 8],
  subItemIndents: {
    item: 0,
    separator: 5,
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
      radius: 4,
      position: { x: 0, y: 0 },
    },
    indents: [8, 2, 8, 2],
    position: { x: 0, y: 0 },
  },

  // prettier-ignore
  itemsBehavior: [{
      itemPart: 'background', behavior: [
        //    { condition: 'normal', attr: { fill: { color: 'red' }, stroke: { color: 'blue', width: 2 } } },
        //    { condition: 'mouseenter', attr: {fill: {color: 'grey'}, stroke: { color: 'black', width: 2}}}
      ]}, {
      itemPart: 'shotrcut', behavior: [
        //    {condition: 'mouseenter', attr: {fill: { color : 'red'}}},
        //    {},   
          ]
      }],

  // prettier-ignore
  itemsInstances: [
    { kind: 'general', str: 'File'},
    { kind: 'general', str: 'Edit' },
    { kind: 'shortcut', str: 'Window', shortcut: {value: 'cmd + X', font: 'Menlo', fontWeight: 'normal', size: 12, position: {x: 0, y: 0}, fill: {color: 'green'}}},
    { kind: 'general', str: 'View' },
    { kind: 'icon', str: 'Magic line', icon: { d: iconPath.rightChevron, fill: {color: 'black'}, stroke: {color: 'black'}}},
    { kind: 'general', str: 'Terminal'},
    { kind: 'general', str: 'Wait a minutes...'},
    ],
  // prettier-ignore
  separatorsInstances: [
      {order: 2, value: {start: {x: 25, y: 0}, length: 160, stroke: {color: '#D2D2D2'}} },
      {order: 4, value: {start: {x: 25, y: 0}, length: 160, stroke: {color: '#D2D2D2'}} }
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
    let summHeight = 0
    attr.itemsInstances.forEach((ii, num) => {
      num == 0 && (summHeight += attr.indents[1])

      // check separator
      let isSep = attr.separatorsInstances.find(
        (el) => el.order == num
      )
      if (isSep) {
        isSep.value.start.y =
          summHeight + attr.subItemIndents.separator
        this.items.push(new separator(isSep.value))
        summHeight += attr.subItemIndents.separator * 2
      }

      // base indent

      let el
      // get item style
      let is = attr.itemsStyle
      // set string
      is.title.value = ii.str
      // set position
      is.position.y = summHeight
      is.position.x = attr.indents[0]

      if (ii.kind == 'general') {
        el = new listItem({
          label: is,
          kind: 'general',
          width: attr.itemWidth,
          behavior: attr.itemsBehavior,
        }).draggable()
      }
      if (ii.kind == 'shortcut') {
        el = new listItem({
          label: is,
          kind: 'shortcut',
          width: attr.itemWidth,
          suppIndent: 20,
          shortcut: ii.shortcut,
          behavior: attr.itemsBehavior,
        }).draggable()
      }
      if (ii.kind == 'icon') {
        el = new listItem({
          label: is,
          kind: 'icon',
          width: attr.itemWidth,
          suppIndent: 20,
          icon: ii.icon,
          behavior: attr.itemsBehavior,
        }).draggable()
      }

      // adds element to list items collection
      this.items.push(el)
      // increase overal items height
      summHeight +=
        el.title.bbox().height + el.indents[1] + el.indents[3]
    })

    this.items.forEach((i) => this.add(i))

    // set auto height
    attr.autoHeight && this.body.height(attr.indents[3] + summHeight)
  }
}
