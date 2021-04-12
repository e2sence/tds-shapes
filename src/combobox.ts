import { G } from '@svgdotjs/svg.js'
import { Create_ID, TitleStyle } from './common'
import { list, ListAttr } from './list'
import { listItem } from './listItem'
import { title } from './title'

export type ComboboxState = 'openend' | 'closed'

export type ComboboxStyle = {
  listAttr: ListAttr
  selection?: number
  title?: TitleStyle
  position?: { x: number; y: number }
  autoshow?: boolean
  autohide?: boolean
}

export class combobox extends G {
  title: title
  curntSelection: listItem
  list: list
  state: ComboboxState

  pdy: number = 0

  constructor(attr: {
    listAttr: ListAttr
    selection?: number
    title?: TitleStyle
    position?: { x: number; y: number }
    autoshow?: boolean
    autohide?: boolean
  }) {
    super()
    this.id(Create_ID()).addClass('tds-combobox')

    !attr.position && (attr.position = { x: 0, y: 0 })
    // set title
    attr.title &&
      ((attr.title.position.x += attr.position.x),
      (attr.title.position.y += attr.position.y),
      (this.title = new title(attr.title)))

    // set initial state
    this.state = 'openend'

    !attr.position && (attr.position = { x: 0, y: 0 })
    !attr.listAttr.position &&
      (attr.listAttr.position = { x: 0, y: 0 })
    // create list
    attr.listAttr.position.x += attr.position.x
    attr.listAttr.position.y += attr.position.y
    this.list = new list({ ...attr.listAttr })

    // set selection
    // let r = attr.selection <= 0 && 0
    this.curntSelection = this.list.items[attr.selection]

    // add list to instance
    this.add(this.list)

    // set visual state
    this.initialSet()

    // add title
    this.add(this.title)

    //? move it

    attr.autohide &&
      this.on('mouseleave', () => {
        this.state == 'openend' && this.switchState()
      })

    attr.autoshow &&
      this.on('mouseenter', () => {
        this.state == 'closed' && this.switchState()
      })

    this.list.items.forEach((el) => {
      el.on('mousedown', () => {
        this.curntSelection = el
        this.switchState()
      })

      // for avoid stroke overlapping
      el.on('mouseenter', () => {
        this.curntSelection.front()
      })
    })
  }

  initialSet() {
    // move selection to top of 'combobox'
    this.curntSelection.addTo(this).front()

    // set position for 'background' 'title' and 'suppitem'
    // position of the first item
    let cs = this.curntSelection

    let dy =
      cs.background.bbox().y - this.list.items[0].background.bbox().y

    // move
    cs.background.dmove(0, -dy)
    cs.title.dmove(0, -dy)
    cs.suppItem?.dmove(0, -dy)
    cs.foreground.dmove(0, -dy)

    // hide list
    this.list.hide()

    // change state
    this.state = 'closed'

    // remember dy
    this.pdy = dy
  }

  switchState() {
    // change instance state
    if (this.state == 'closed') {
      this.state = 'openend'
    } else {
      this.state = 'closed'
    }
    this.checkState()
  }

  checkState() {
    // do smth for 'close' or 'open'
    if (this.state == 'closed') {
      this.hideList()
    } else {
      this.showList()
    }
  }

  hideList() {
    // move selection to top
    this.curntSelection.addTo(this).front()

    // store position
    let tp = this.list.items[0].background.bbox()
    let dy = this.curntSelection.background.bbox().y - tp.y
    this.pdy = dy

    // uprise selection
    this.curntSelection.move(tp.x, tp.y)

    // hide list
    this.list.hide()

    // reset condition for hiden items
    this.list.items.forEach((el) => {
      el.condition = 'normal'
      el.applyBehavior()
    })

    this.dispatch('tds-combobox-hidelist', this)
    this.dispatch('tds-combobox-itemselected', this)
  }

  showList() {
    // show list
    this.list.show()

    // return selection to list
    this.curntSelection.addTo(this.list).front()

    // highlight current selection
    this.curntSelection.condition = 'highlight'
    this.curntSelection.applyBehavior()

    // move selection to its initial position
    this.curntSelection.dmove(0, this.pdy)

    this.dispatch('tds-combobox-showlist', this)
  }
}
