import { G, Rect, Text } from '@svgdotjs/svg.js'
import { BackgroundStyle, Create_ID, TitleStyle } from './common'
import { title } from './title'

import { Dom } from '@svgdotjs/svg.js'

/** default body style for textarea */
export const textareaDefStyle: BackgroundStyle = {
  width: 236,
  height: 80,
  fill: { color: '#D2D2D2' },
  stroke: { color: '#999999', width: 1 },
  radius: 6,
  position: { x: 0, y: 0 },
}

/** default style for single row */
export const extendsTittleDefStyle: TitleStyle = {
  value: '\u2800',
  font: 'Menlo',
  fontWeight: 'normal',
  size: 12,
  position: { x: 10, y: 10 },
  fill: { color: 'black' },
}

/** default style for header row */
export const extendsHeaderDefStyle: TitleStyle = {
  value: 'textArea:',
  font: 'Menlo',
  fontWeight: 'normal',
  size: 12,
  position: { x: 0, y: -15 },
  fill: { color: 'black' },
}

/**
 * smth like this: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/textarea
 */
export class textarea extends G {
  /** text area body */
  body: Rect

  /** caption in the title */
  title: title

  /** collection of titles when data in SVG mode */
  rows: title[] = []
  /** max allowed row lenght */
  rowLen: number = 0
  /** max number of rows allowed */
  maxRows: number = 0
  /** raw string */
  value: string

  /** dom element - <textarea> */
  input: Dom
  /** dom element id */
  inputID: string = Create_ID()

  /**
   * create textarea  instance
   * @param attr - BackgroundStyle, TitleStyle, data - directly the string to be displayed
   */
  constructor(attr: {
    body: BackgroundStyle
    rowsTitleStyle: TitleStyle
    headerTitleStyle?: TitleStyle
    data: string
    rowLen?: number
    maxRows?: number
    position?: { x: number; y: number }
  }) {
    super()

    if (attr.position) {
      attr.body.position.x += attr.position.x
      attr.body.position.y += attr.position.y
    }

    // body
    this.body = new Rect()
      .width(attr.body.width)
      .height(attr.body.height)
      .fill({ ...attr.body.fill })
      .stroke({ ...attr.body.stroke })
      .radius(attr.body.radius)
      .x(attr.body.position.x)
      .y(attr.body.position.y)
    this.add(this.body)

    // adds title if available
    if (attr.headerTitleStyle) {
      // correct position according to 'body'
      attr.headerTitleStyle.position.x += attr.body.position.x
      attr.headerTitleStyle.position.y += attr.body.position.y

      this.title = new title(attr.headerTitleStyle)
      this.add(this.title)
    }

    // calc single sing lenght and overal no wrap string
    attr.rowLen
      ? (this.rowLen = attr.rowLen)
      : (this.rowLen = this.setRowLen(
          attr.body.width,
          attr.rowsTitleStyle
        ))

    // calc single row height and overal rows count
    attr.maxRows
      ? (this.maxRows = attr.maxRows)
      : (this.maxRows = this.setMaxRows(
          attr.body.height,
          attr.rowsTitleStyle,
          0.7
        ))

    // adds rows to body
    this.fillRows(attr.data, this.rowLen, attr.rowsTitleStyle)

    // hide input before drag
    this.on('beforedrag', () => {
      this.reset()
    })

    // handle click - start edit
    this.on('click', () => {
      //dblclick
      changeHandler(this)
    })

    /**
     * adds to canvas <foreignObject> with <textarea>
     * @param ta textarea instance
     */
    function changeHandler(ta: textarea) {
      // id for foreing element
      let frid = Create_ID()

      // create foreign object
      ta.input = ta
        .root()
        .element('foreignObject')
        .attr({
          width: ta.body.width() + 20,
          height: ta.body.height() + 20,
          x: ta.body.bbox().x + 3,
          y: ta.body.bbox().y + 3,
          id: frid,
        })

      let _v = ta.value

      if (_v == '\u2800') {
        _v = ''
      }

      // DOM string of input
      let inputHTML = `<textarea id="${ta.inputID}" 
                                    class="txtinput"
                                    style="resize:none;width:90%;height:90%;font-family:Menlo;font-size:"12">${_v}</textarea>`

      // show input with new data
      ta.input.node.innerHTML = inputHTML
      ta.setInputVisibility(true)

      // handle loose focus
      ta.input.node.addEventListener(
        'blur',
        () => {
          ta.setInputVisibility(false)
          ta.input.node.remove()
        },
        true
      )

      // handle keyboard
      ta.input.node.addEventListener(
        'keydown',
        (ev: KeyboardEvent) => {
          if (ev.key == 'Enter') {
            // if (!ev.shiftKey) {
            ta.clearRows()
            let _v = ta.getInput().value

            console.log(ta.getInput().innerHTML)

            _v == '' && (_v = '\u2800')

            ta.fillRows(_v, ta.rowLen, extendsTittleDefStyle)

            ta.dispatch('tds-textarea-valuechanged', ta)

            ta.setInputVisibility(false)
          }
          //   }
          if (ev.key == 'Escape') {
            ta.setInputVisibility(false)
          }
        },
        true
      )
    }
  }

  /** calculating line length depending on body width */
  setRowLen(bw: number, ta: TitleStyle, f: number = 0.97) {
    return Math.floor((bw / new title(ta).bbox().width) * f)
  }

  /** calculating maxRows depending on body height */
  setMaxRows(bh: number, ta: TitleStyle, f: number = 0.97) {
    return Math.floor((bh / new title(ta).bbox().height) * f)
  }

  /**
   * translate string to rows
   * @param data string for translate to rows
   * @param len max row lenght
   * @param style single row style
   */
  fillRows(data: string, len: number, style: TitleStyle) {
    // store data localy
    this.value = data
    // separate string to rows
    let rd = wordwrap(data, len)

    // check not more number then 'maxRow'
    let endFlag = 0

    // iterate rows and adds labels to area
    rd.forEach((el, i) => {
      // if not last element
      if (endFlag == 0) {
        if (i < this.maxRows) {
          // create instance for row
          let _t = new title(style)
          _t.value = el
          // heck first
          if (i == 0) {
            this.rows.push(_t)
            _t.y(this.body.y() + style.position.y)
          } else {
            let ph = this.rows[i - 1].bbox()
            _t.y(ph.y + ph.height)
            this.rows.push(_t)
          }
          // add class property for ability remove
          _t.addClass('tds-textarearow')
          _t.x(this.body.x() + style.position.x)
          this.add(_t)
        } else {
          // if you have reached the maximum possible number of rows
          let ss = this.rows[i - 1].value
          this.rows[i - 1].value = ss.slice(0, -3) + '...'
          console.log(this.rows[i - 1].value)

          endFlag = 1
        }
      }
    })
  }

  /**
   * realy clear rows
   */
  clearRows() {
    this.children()
      .filter((el) => el.hasClass('tds-textarearow'))
      .forEach((el) => el.remove())
    this.rows = [] //.slice(0, this.rows.length - 1)
  }

  /**
   * split rows to string
   * @returns resulted string
   */
  collectString() {
    let r = ''
    let rl = this.rows.length
    this.rows.forEach((el, i) => {
      if (i < rl - 1) r += el.value + ' '
      if (i == rl - 1) r += el.value
    })
    return r.replace(/\s{2,}/g, ' ')
  }

  /** hide input */
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
      this.body.hide()
      this.input.node.setAttribute('style', 'display: inline-block;')
      el.focus()
      el.selectionEnd = el.selectionStart = this.value.length
    } else {
      this.body.show()
      if (this.input)
        this.input?.node?.setAttribute('style', 'display: none;')
    }
  }
}

/** word wrap */
function wordwrap(str: string, width: number) {
  let strn = str
    .replace(
      new RegExp(
        `(?:\\S(?:.{0,${width}}\\S)?(?:\\s+|-|$)|(?:\\S{${width}}))`,
        'g'
      ),
      (s) => `${s}\n`
    )
    .slice(0, -1)
  return strn.split('\n')
}
