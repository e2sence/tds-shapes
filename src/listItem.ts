import { Path, Rect } from '@svgdotjs/svg.js'

import { ItemIconStyle, ItemType, TitleStyle } from './common'
import { label, LabelAttr } from './label'
import { title } from './title'

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

  suppItem: Path | title
  suppIndent: number = 15

  constructor(attr: {
    label: LabelAttr
    kind: ItemType
    width: number
    suppIndent?: number

    icon?: ItemIconStyle
    shortcut?: TitleStyle
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
        attr.label.position.y + attr.label.indents[1]
      )
      this.add(this.suppItem)
    }
    this.background.width(attr.width)

    // this.background.width(ol)
  }
}
