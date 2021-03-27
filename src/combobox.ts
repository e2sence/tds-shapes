import { G } from '@svgdotjs/svg.js'
import { TitleStyle } from './common'
import { list, ListAttr } from './list'
import { listItem } from './listItem'
import { title } from './title'

export type ComboboxState = 'openend' | 'closed'

export class combobox extends G {
  title: title
  curntSelection: listItem
  list: list
  state: ComboboxState

  pdy: number = 0

  constructor(
    attr: ListAttr,
    curntSelection: number,
    cbt?: TitleStyle
  ) {
    super()

    // set title
    cbt && (this.title = new title(cbt))

    // set initial state
    this.state = 'openend'

    // create list
    this.list = new list({ ...attr })

    // set selection
    this.curntSelection = this.list.items[curntSelection]

    // add list to instance
    this.add(this.list)

    // set visual state
    this.initialSet()

    // add title
    this.add(this.title)

    this.on('mouseleave', () => {
      this.state == 'openend' && this.switchState()
    })

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

    let tp = this.list.items[0].background.bbox()

    let dy = this.curntSelection.background.bbox().y - tp.y

    this.pdy = dy

    this.curntSelection.move(tp.x, tp.y)

    this.list.hide()

    this.list.items.forEach((el) => {
      el.condition = 'normal'
      el.applyBehavior()
    })
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
  }
}
