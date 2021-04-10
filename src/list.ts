import { Rect } from '@svgdotjs/svg.js'
import { G } from '@svgdotjs/svg.js'
import {
  BackgroundStyle,
  Create_ID,
  Indents,
  ItemIconStyle,
  ItemState,
  ItemType,
  ListAttrDefault,
  TitleStyle,
} from './common'
import { LabelAttr } from './label'
import {
  ItemPartsBehavior,
  listItem,
  ListItemAttr,
  ListItemCondition,
} from './listItem'
import { listItemGrouped } from './listItemGrouped'
import { ISeparatorTemplate, separator } from './separator'
import { title } from './title'

// single item description
export type ListItemInstanceAttr = {
  kind: ItemType
  value: string

  icon?: string
  shortcut?: string
}

// list overal description
export type ListAttr = {
  position?: { x: number; y: number }
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
  titleStyle?: TitleStyle
  itemsBehavior?: ItemPartsBehavior

  itemsInstances?: {
    kind: ItemType
    str: string
    state: ItemState
    condition: ListItemCondition
    icon?: ItemIconStyle
    shortcut?: TitleStyle
    persStyle?: TitleStyle
    list?: ListAttr
  }[]

  separatorsInstances?: {
    order: number
    value: ISeparatorTemplate
  }[]
}

export class list extends G {
  title: title
  body: Rect
  items: Array<listItem> = [] //| separator | label> = []
  separators: Array<separator> = []

  constructor(attr: ListAttr = ListAttrDefault) {
    super()
    this.id(Create_ID()).addClass('tds-list')

    // create titile
    if (attr.titleStyle) {
      this.title = new title(attr.titleStyle)
      this.add(this.title)
    }

    // create body rectangle
    this.body = new Rect()
      .width(attr.body.width)
      .height(attr.body.height)
      .fill({ ...attr.body.fill })
      .stroke({ ...attr.body.stroke })
      .radius(attr.body.radius)
      .x(attr.position.x)
      .y(attr.position.y)
    this.add(this.body)

    // create items
    let summHeight = 0
    attr.itemsInstances.forEach((ii, num) => {
      // add top indent to fist item
      num == 0 && (summHeight += attr.indents[1])

      // check separator
      let isSep = attr.separatorsInstances?.find(
        (el) => el.order == num
      )
      if (isSep) {
        isSep.value.start.y =
          summHeight +
          attr.subItemIndents.separator +
          attr.position.y
        isSep.value.start.x += attr.position.x

        let cs = new separator(isSep.value)
        this.separators.push(cs)
        this.add(cs)
        summHeight += attr.subItemIndents.separator * 2
      }

      let el
      // get item style
      let is = attr.itemsStyle
      // set string
      is.title.value = ii.str
      // set position
      is.position.y = summHeight + attr.position.y
      is.position.x = attr.indents[0] + attr.position.x

      if (ii.kind == 'general') {
        el = new listItem({
          label: is,
          kind: 'general',
          width: attr.itemWidth,
          behavior: attr.itemsBehavior,
          condition: ii.condition,
          state: ii.state,
        })
      }

      if (ii.kind == 'shortcut') {
        el = new listItem({
          label: is,
          kind: 'shortcut',
          width: attr.itemWidth,
          suppIndent: attr.subItemIndents.itemShortcut,
          shortcut: ii.shortcut,
          behavior: attr.itemsBehavior,
          condition: ii.condition,
          state: ii.state,
        })
      }

      if (ii.kind == 'icon') {
        el = new listItem({
          label: is,
          kind: 'icon',
          width: attr.itemWidth,
          suppIndent: attr.subItemIndents.itemIcon,
          icon: ii.icon,
          behavior: attr.itemsBehavior,
          condition: ii.condition,
          state: ii.state,
        })
      }

      if (ii.kind == 'group') {
        let lia: ListItemAttr = {
          label: is,
          kind: 'icon',
          width: attr.itemWidth,
          suppIndent: attr.subItemIndents.itemIcon,
          icon: ii.icon,
          behavior: attr.itemsBehavior,
          condition: ii.condition,
          state: ii.state,
        }
        let la: ListAttr = ii.list
        el = new listItemGrouped(lia, la)
      }

      // adds element to list items collection
      this.items.push(el)
      // increase overal items height
      summHeight +=
        el.title.bbox().height +
        el.indents[1] +
        el.indents[3] +
        attr.subItemIndents.item
    })

    this.items.forEach((i) => {
      i.on('mousedown', () => {
        this.dispatch('tds-list-mousedown', i)
      })
      this.add(i)
    })

    // set auto height
    attr.autoHeight &&
      this.body.height(attr.indents[3] + summHeight)
  }
}
