import { Dom } from '@svgdotjs/svg.js'

import { Create_ID } from './common'

import { label, LabelAttr } from './label'

/**
 * the label that has abbilyty to change title value with direct input
 */
export class textbox extends label {
  input: Dom
  inputID: string = Create_ID()
  inputType: 'number' | 'text'

  constructor(attr: {
    label: LabelAttr
    inputType: 'number' | 'text'
  }) {
    super(attr.label)
    this.id(Create_ID()).addClass('tds-textbox')

    this.inputType = attr.inputType

    this.on('dblclick', (ev: MouseEvent) => {
      // id for foreing element
      let frid = Create_ID()

      // create foreign object
      this.input = this.root()
        .element('foreignObject')
        .attr({
          width: this.width() + 20,
          height: this.height() + 20,
          x: this.title.bbox().x - 3,
          y: this.title.bbox().y - 3,
          id: frid,
        })

      // value to transfer to input
      let _v = this.title.value
      if (_v == '\u2800') _v = ''

      // DOM string of input
      let inputHTML = `<input id="${this.inputID}" 
                                class="txtinput"
                                value="${_v}" 
                                type="${this.inputType}"
                                size="1" 
                                style="width:100%;">
                        </input>`

      // show input with new data
      this.input.node.innerHTML = inputHTML
      this.setInputVisibility(true)
      this.dispatch('tds-textbox-changingStart', this)

      // handle loose focus
      this.input.node.addEventListener(
        'blur',
        () => {
          this.setInputVisibility(false)
          this.input.node.remove()
        },
        true
      )

      // handle keyboard
      this.input.node.addEventListener(
        'keydown',
        (ev: KeyboardEvent) => {
          if (ev.key == 'Enter') {
            let _v = this.getInput().value

            _v !== ''
              ? (this.value = _v)
              : this.inputType == 'text'
              ? (this.value = '\u2800')
              : (this.value = Number(0).toString())

            this.setInputVisibility(false)
            this.dispatch('tds-textbox-changingEnd', this)
          }
          if (ev.key == 'Escape') {
            this.setInputVisibility(false)
          }
        },
        true
      )
    })
  }

  reset() {
    this.setInputVisibility(false)
  }

  /** get input as HTMLInputElement */
  getInput() {
    return document.getElementById(
      this.inputID
    ) as HTMLInputElement
  }

  /** hide/ show input field */
  private setInputVisibility(isVisible: boolean) {
    let el = this.getInput()

    if (isVisible) {
      this.hide()
      this.input.node.setAttribute(
        'style',
        'display: inline-block;'
      )
      // set focus and move cursor to end
      el.focus()
      // if input type is 'text'
      this.inputType == 'text'
        ? (el.selectionEnd = el.selectionStart = this.value.length)
        : 0
    } else {
      this.show()
      if (this.input)
        this.input?.node?.setAttribute(
          'style',
          'display: none;'
        )
    }
  }
}
