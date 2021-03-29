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

    this.on('dblclick', () => {
      changeHandler(this)
    })

    let tf = 0
    this.on('touchstart', (ev: TouchEvent) => {
      // changeHandler(this)
      tf = 1

      setTimeout(() => {
        tf == 1 && changeHandler(this)
      }, 1000)

      console.log('touchstart')
    })

    this.on('touchend', (ev: TouchEvent) => {
      // changeHandler(this)
      tf = 0

      console.log('touchend')
    })

    this.on('touchcancel', (ev: TouchEvent) => {
      // changeHandler(this)
      console.log('touchcancel')
    })

    this.on('touchmove', (ev: TouchEvent) => {
      // changeHandler(this)
      tf = 0
      console.log('touchmove')
    })

    function changeHandler(tb: textbox) {
      // id for foreing element
      let frid = Create_ID()

      // create foreign object
      tb.input = tb
        .root()
        .element('foreignObject')
        .attr({
          width: tb.width() + 20,
          height: tb.height() + 20,
          x: tb.title.bbox().x - 3,
          y: tb.title.bbox().y - 3,
          id: frid,
        })

      // value to transfer to input
      let _v = tb.title.value
      if (_v == '\u2800') _v = ''

      // DOM string of input
      let inputHTML = `<input id="${tb.inputID}" 
                                class="txtinput"
                                value="${_v}" 
                                type="${tb.inputType}"
                                size="1" 
                                style="width:100%;">
                        </input>`

      // show input with new data
      tb.input.node.innerHTML = inputHTML
      tb.setInputVisibility(true)
      tb.dispatch('tds-textbox-changingStart', tb)

      // handle loose focus
      tb.input.node.addEventListener(
        'blur',
        () => {
          tb.setInputVisibility(false)
          tb.input.node.remove()
        },
        true
      )

      // handle keyboard
      tb.input.node.addEventListener(
        'keydown',
        (ev: KeyboardEvent) => {
          if (ev.key == 'Enter') {
            let _v = tb.getInput().value

            _v !== ''
              ? (tb.value = _v)
              : tb.inputType == 'text'
              ? (tb.value = '\u2800')
              : (tb.value = Number(0).toString())

            tb.setInputVisibility(false)
            tb.dispatch('tds-textbox-changingEnd', tb)
          }
          if (ev.key == 'Escape') {
            tb.setInputVisibility(false)
          }
        },
        true
      )
    }
  }

  reset() {
    this.setInputVisibility(false)
  }

  /** get input as HTMLInputElement */
  getInput() {
    return document.getElementById(this.inputID) as HTMLInputElement
  }

  /** hide/ show input field */
  private setInputVisibility(isVisible: boolean) {
    let el = this.getInput()

    if (isVisible) {
      this.hide()
      this.input.node.setAttribute('style', 'display: inline-block;')
      // set focus and move cursor to end
      el.focus()
      // if input type is 'text'
      this.inputType == 'text'
        ? (el.selectionEnd = el.selectionStart = this.value.length)
        : 0
    } else {
      this.show()
      if (this.input)
        this.input?.node?.setAttribute('style', 'display: none;')
    }
  }
}
