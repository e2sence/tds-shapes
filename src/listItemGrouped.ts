import { list, ListAttr } from './list'
import { listItem, ListItemAttr } from './listItem'

export class listItemGrouped extends listItem {
  list: list

  constructor(itemAttr: ListItemAttr, listAttr: ListAttr) {
    super(itemAttr)

    //! list initialization moved outside setTimeout
    this.list = new list(listAttr).hide()
    this.add(this.list)

    setTimeout(() => {}, 0)

    this.on('mouseenter', () => {
      this.condition = 'highlight'

      let x = this.x() + this.width()
      let y = this.y()

      this.list.show()
      this.list.move(x, y - 5)
    })

    this.on('mouseleave', () => {
      this.condition = 'normal'
      this.applyBehavior()

      this.list.hide()
    })
  }
}
