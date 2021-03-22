import { Path } from '@svgdotjs/svg.js'
import '@svgdotjs/svg.draggable.js'
import {
  G,
  Rect,
  Circle,
  Svg,
  Box,
  Element,
  Line,
  StrokeData,
} from '@svgdotjs/svg.js'

import {
  Create_ID,
  SliderOrientation,
  SliderPayload,
  SliderTickDirection,
  SliderTicks,
  SliderType,
  StyleSize,
  StyleSizeNumber,
  TickKind,
  TitleStyle,
  vTo01,
} from './common'

import { label } from './label'
import { textbox } from './textbox'

const tickKindOrder: TickKind[] = [
  'main',
  'half',
  'subhalf',
]

type tpResult = {
  main: number[]
  half: number[]
  subhalf: number[]
}

/**
 * usage scenario:
 *
 *  1. from direct pin drag:
 *      - get new coordinate                | (op)
 *      - get approx value                  | getRawValue
 *      - reduce value to step base         | getInLineValue
 *      - get coordinate for reduced value  | getCoordinate
 *      - set coordinate to pin             | setPinToCoordinate
 *      - update payload                    | (op)
 *      - update value box                  | (op)
 *
 *  2. from value change:
 *      - reduce value to step base
 *      - get coordinate for reduced value
 *      - set coordinate to pin
 *      - update payload
 *      - update value box
 */

export type Slider = {
  title: label

  payload: SliderPayload
  ruller: Rect
  filler: Rect
  pin: Element
  valueBox: textbox

  labels?: label[]
  orientation: SliderOrientation
  sliderType?: SliderType
  ticks?: SliderTicks
}

export class slider extends G {
  title: label

  payload: SliderPayload

  ruller: Rect
  filler: Rect
  pin: Element
  valueBox: textbox

  #orientation: SliderOrientation
  #sliderType: SliderType
  labels: label[]
  ticks: SliderTicks
  ticksGroup: G = new G()

  constructor(attr: Slider) {
    super()

    // ticks storage
    attr.ticks && (this.ticks = attr.ticks)
    this.ticksGroup
      .id(Create_ID())
      .addClass('tds-ticksgroup')
    this.add(this.ticksGroup)

    this.id(Create_ID()).addClass('tds-slider')

    // apply properties from attr
    this.payload = { ...attr.payload }
    this.ruller = attr.ruller
    this.filler = attr.filler
    this.valueBox = attr.valueBox
    this.title = attr.title
    this.pin = attr.pin

    this.#orientation = attr.orientation
    this.#sliderType = attr.sliderType

    // add items to field
    this.add(this.title)
      .add(this.ruller)
      .add(this.filler)
      .add(this.pin)
      .add(this.valueBox)

    if (this.sliderType == 'twostate')
      this.valueBox.remove()

    // set pin to value
    this.value = this.payload.value

    setTimeout(() => {
      this.tickHandler()
    }, 0)

    // handle two state slider
    this.pin.on('click', (ev: MouseEvent) => {
      ev.preventDefault()
      if (this.sliderType == 'twostate') {
        let v = this.payload.value
        v == 1 ? (this.value = 0) : (this.value = 1)
      }
      return true
    })

    // set constrainted pin move
    // on move update values in 'value box' and 'payload' storage
    this.pin.on('dragmove', (ev: CustomEvent) => {
      const ruller = this.ruller.bbox()
      const { box } = ev.detail

      ev.preventDefault()

      this.dragHandler(box, ruller)

      return true
    })

    // hide input on beafore drag
    this.on('beforedrag', () => {
      this.valueBox.reset()
    })

    /** handle manual changing in value box */
    this.valueBox.on('tds-textbox-changingEnd', () => {
      Number(this.valueBox.value) != this.payload.value &&
        (this.value = Number(this.valueBox.value))
    })

    // handle operational manual change input
    // define this.valueBox.input.node.onchange = () => {}
    this.valueBox.on('tds-textbox-changingStart', () => {
      let el = this.valueBox.getInput()

      this.valueBox.input.node.onchange = () => {
        Number(el.value) != this.payload.value &&
          (this.value = Number(el.value))
      }
    })
  }

  //?--------------------------------------------------- drag handler
  /**
   * hadle drag with horizontal or vertical restriction
   * @param el_bb pin bbox
   * @param rl_bb ruller bbox
   */
  private dragHandler(el_bb: Box, rl_bb: Box) {
    let or = this.orientation
    let p = this.payload

    // get new coordinate
    let cxy = or == 'horizontal' ? el_bb.cx : el_bb.cy

    // get approx value
    let r = this.getRawValue(cxy, rl_bb, or, p)

    // reduce value to step base
    r = this.getInLineValue(r, p)

    // get coordinate for reduced value
    let c = this.getCoordinate(r, rl_bb, or, p)

    // set coordinate to pin
    this.setPinToCoordinate(c, rl_bb, or)

    // update payload
    this.setPayloadValue(r)

    // update value box
    this.setValueBoxValue(r)
  }

  /**
   * return payload.value
   */
  get value() {
    return Number(this.payload.value)
  }
  /**
   * general value setting
   */
  set value(v: number) {
    let p = this.payload
    let ruller = this.ruller.bbox()
    let or = this.orientation

    let rv = this.getInLineValue(v, p)
    let c = this.getCoordinate(rv, ruller, or, p)
    this.setPinToCoordinate(c, ruller, or)

    this.setPayloadValue(rv)
    this.setValueBoxValue(rv)
  }

  /** readonly direction */
  get orientation(): SliderOrientation {
    return this.#orientation
  }
  /** read only type */
  get sliderType(): SliderType {
    return this.#sliderType
  }
  //?--------------------------------------------------- private voids
  /**
   * getting the estimated value of the slider
   * at a certain coordinate
   * @param c coordinate
   * @param rb the limit in which slider is located
   * @param or Slider orientation
   * @param p Slider payload
   * @returns estimated value 'number'
   */
  private getRawValue(
    c: number,
    rb: Box,
    or: SliderOrientation,
    p: SliderPayload
  ) {
    let k = 0

    if (or == 'vertical') {
      k = vTo01(c, rb.y2, rb.y)
    } else if (or == 'horizontal') {
      k = vTo01(c, rb.x, rb.x2)
    }

    return Number(p.min + k * (p.max - p.min))
  }
  //?--------------------------------------------------- CAUTION .xls
  /**
   * returns the reduced value with the base from the step
   * @param v the value to be given
   * @param p payload containing constraints
   * @returns 'number' - the value reduced to the series
   */
  private getInLineValue(v: number, p: SliderPayload) {
    v = Math.round((v - p.min) / p.step) * p.step + p.min

    if (v < p.min) return (v = p.min)
    if (v > p.max) return (v = p.max)

    return v
  }
  /**
   * get the coordinate of the value in certain constraints
   * @param v estimated value
   * @param rb restriction in which estimate occur
   * @param or 'restriction' orientation - (slider - it mean)
   * @param p payload containing constraints
   */
  private getCoordinate(
    v: number,
    rb: Box,
    or: SliderOrientation,
    p: SliderPayload
  ) {
    let k = vTo01(v, p.min, p.max)

    let result

    if (or == 'vertical') {
      result = rb.y2 - k * rb.height
      if (result < rb.y) return rb.y
      if (result > rb.y2) return rb.y2
    } else if (or == 'horizontal') {
      result = rb.x + k * rb.width
      if (result > rb.x2) return rb.x2
      if (result < rb.x) return rb.x
    }

    return result
  }
  /**
   * set filler
   * @param rb filler restriction
   * @param or filler orientation
   */
  private setFiller(rb: Box, or: SliderOrientation) {
    if (or == 'vertical') {
      this.filler.move(
        this.pin.cx() - rb.width / 2,
        this.pin.cy()
      )
      this.filler.height(rb.y2 - this.pin.cy())
    } else if (or === 'horizontal') {
      this.filler.width(this.pin.cx() - rb.x)
    }
  }
  /**
   * set pin center to coordinate
   * @param c coordinate
   * @param rb restriction box
   * @param or restriction box orientation
   * @param f optional, if set (default - true) also set filler
   */
  private setPinToCoordinate(
    c: number,
    rb: Box,
    or: SliderOrientation,
    f: boolean = true
  ) {
    if (or == 'horizontal') {
      this.pin.cx(c)
      this.pin.cy(rb.cy)
    } else if (or === 'vertical') {
      this.pin.cy(c)
      this.pin.cx(rb.cx)
    }

    f && this.setFiller(rb, or)
  }

  private setPayloadValue(v: number) {
    if (v != this.payload.value) {
      this.payload.value = v
      this.dispatch('tds-slider-valueChanged', this)
    }
  }
  private setValueBoxValue(v: number) {
    this.valueBox.value = v.toFixed(this.payload.precision)
  }

  /**
   * adds tick layout to slider
   */
  private tickHandler() {
    const t = this.ticks
    const rb = this.ruller.bbox()
    const p = this.payload
    const or = this.orientation

    let res: tpResult = {
      main: [],
      half: [],
      subhalf: [],
    }

    // create default tick line
    const tline = (
      tk: TickKind,
      sd: SliderTickDirection = 'down',
      size: StyleSize = 'xxs',
      sb: number = 1,
      color: StrokeData = { color: '#999999', width: 1 }
    ) => {
      let llk = 0

      switch (tk) {
        case 'main':
          llk = 2.5
          break
        case 'half':
          llk = 2
          break
        case 'subhalf':
          llk = 1.5
          break

        default:
          break
      }

      llk *= StyleSizeNumber(size, sb)

      let ml = new Line()

      // set len
      or == 'horizontal'
        ? sd == 'down' || sd == 'up'
          ? ml.plot([
              [0, 0],
              [0, rb.height * llk],
            ])
          : ml.plot([
              [0, 0],
              [0, rb.height * llk * 2],
            ])
        : sd == 'down' || sd == 'up'
        ? ml.plot([
            [0, 0],
            [rb.width * llk, 0],
          ])
        : ml.plot([
            [0, 0],
            [rb.width * llk * 2, 0],
          ])

      ml.stroke({ ...color })

      return ml
    }

    // coordinates
    tickKindOrder.forEach((el) => {
      if (t) {
        if (t[el]) {
          let count = Math.floor(
            (p.max - p.min) / t[el].step
          )

          // distance between ticks
          let len =
            or == 'horizontal'
              ? rb.width / count
              : rb.height / count

          for (let i = 0; i < count + 1; i++) {
            let r =
              or == 'horizontal'
                ? rb.x + len * i
                : rb.y2 - len * i

            switch (el) {
              case 'main':
                res.main.push(r)

                break
              case 'half':
                !res.main.includes(r) && res.half.push(r)

                break
              case 'subhalf':
                !res.main.includes(r) &&
                  !res.half.includes(r) &&
                  res.subhalf.push(r)

                break
              default:
                break
            }
          }
        }
      }

      // draw ticks
      res[el].forEach((cel) => {
        let sd = this.ticks[el].side

        let noUseLine = tline(
          el,
          sd,
          t[el].size,
          t[el].sizeBase,
          t[el].stroke
        )

        if (or == 'horizontal') {
          let horCor = cel - noUseLine.bbox().w / 2

          sd == 'down' &&
            noUseLine.move(horCor, rb.y2 - rb.height / 2)

          sd == 'up' &&
            noUseLine.move(
              horCor,
              rb.y - noUseLine.bbox().h + rb.height / 2
            )

          if (sd == 'both') {
            noUseLine.move(
              horCor,
              rb.y2 - noUseLine.bbox().h / 2 - rb.height / 2
            )
          }
        }
        if (or == 'vertical') {
          let verCor = cel - noUseLine.bbox().h / 2

          sd == 'down' &&
            noUseLine.move(rb.x2 - rb.width / 2, verCor)

          sd == 'up' &&
            noUseLine.move(
              rb.x - noUseLine.bbox().w + rb.width / 2,
              verCor
            )

          sd == 'both' &&
            noUseLine.move(
              rb.x2 - noUseLine.bbox().w / 2 - rb.width / 2,
              verCor
            )
        }

        this.ticksGroup.add(noUseLine)
      })
    })
  }

  // demo one
  static demo(draw: Svg) {
    const pz = () => {
      return { x: 0, y: 0 }
    }

    const slruller = (): Rect => {
      return new Rect()
        .width(120)
        .height(10)
        .fill({ color: '#F5F5F5' })
        .radius(4)
        .stroke({ color: '#D2D2D2' })
    }
    const slfiller = (): Rect => {
      return new Rect()
        .height(10)
        .fill({ color: '#00A1F1' })
        .radius(4)
        .stroke({ color: 'black', width: 2 })
    }
    const slcirc = (): Circle => {
      return new Circle()
        .radius(10)
        .fill({ color: '#FFBB00' })
        .stroke({ color: 'black', width: 1 })
    }

    const payload = (): SliderPayload => {
      return {
        min: 20,
        max: 130,
        value: 100,
        precision: 0,
        step: 1,
      }
    }

    const ntitle = (): TitleStyle => {
      return {
        value: '0', //'Äqbc..,!jŠ',
        fill: { color: 'black' },
        font: 'Menlo', // Anonymous Pro
        size: 12,
        position: { x: 0, y: 0 },
        fontWeight: 'normal',
      }
    }
    const background = () => {
      return {
        width: 180,
        height: 120,
        fill: { color: '#F5F5F5' },
        stroke: { color: '#D2D2D2' },
        radius: 5,
        position: { x: 0, y: 0 },
      }
    }

    const title = (): TitleStyle => {
      return {
        value: 'tds-slider, %:', //'Проверка --> Äqbc..,!jŠ', //'Äqbc..,!jŠ',
        fill: { color: 'black' },
        font: 'Menlo', // Anonymous Pro
        size: 12,
        position: { x: 0, y: 0 },
        fontWeight: 'normal',
      }
    }

    const llb1 = () => {
      let llb = new label({
        title: title(),
        backgroundRule: ['none'],
        background: background(),
        indents: [10, 10, 10, 10],
        position: pz(),
      })
      return llb
    }

    const ntt = (): textbox => {
      return new textbox({
        label: {
          title: ntitle(),
          position: { x: 0, y: 0 },
          background: background(),
          backgroundRule: ['indent'],
          indents: [5, 3, 5, 3],
        },
        inputType: 'number',
      })
    }

    let nonCirclePin = new slider({
      title: llb1(),
      payload: {
        min: 25,
        max: 750,
        step: 1,
        precision: 0,
        value: 400,
      },
      ruller: new Rect()
        .width(240)
        .height(10)
        .radius(5)
        .fill({ color: '#E6E6E6' })
        .stroke({ color: '#D2D2D2', width: 1 }),

      filler: new Rect()
        .height(10)
        .fill({ color: '#4D7D78' })
        .radius(5)
        .stroke({ color: 'black', width: 2 }),
      pin: new Path({
        d:
          'M10.0558 5.93845C10.0558 4.001 12.535 3.19545 13.6738 4.76288L16.0345 8.01208C16.5438 8.71305 17.4465 9.00637 18.2706 8.73862L22.0902 7.49754C23.9328 6.89883 25.4651 9.00779 24.3263 10.5752L21.9656 13.8244C21.4563 14.5254 21.4563 15.4746 21.9656 16.1756L24.3263 19.4247C25.4651 20.9922 23.9328 23.1011 22.0902 22.5024L18.2705 21.2614C17.4465 20.9936 16.5438 21.2869 16.0345 21.9879L13.6738 25.2371C12.535 26.8045 10.0558 25.999 10.0558 24.0615L10.0558 20.0453C10.0558 19.1788 9.49785 18.4109 8.6738 18.1432L4.85414 16.9021C3.01152 16.3034 3.01152 13.6966 4.85414 13.0979L8.67381 11.8568C9.49785 11.589 10.0558 10.8211 10.0558 9.95468L10.0558 5.93845Z',
      })
        .width(32)
        .height(32)
        .fill({ color: '#E63946' })
        .stroke({ color: 'black', width: 2 })
        .draggable(),
      valueBox: ntt(),
      orientation: 'horizontal',
      sliderType: 'general',
      ticks: {
        main: {
          step: 200,
          side: 'both',
          stroke: { color: 'green', dasharray: '5 5' },
        },
        half: undefined,
        subhalf: undefined,
      },
    }).draggable()
    nonCirclePin.valueBox.remove()
    nonCirclePin.title.remove()
    nonCirclePin.title.move(0, -20)
    draw.add(nonCirclePin)

    let sl = new slider({
      payload: payload(),
      ruller: slruller(),
      filler: slfiller(),
      pin: slcirc().draggable(),
      valueBox: ntt(),
      title: llb1(),
      orientation: 'horizontal',
      sliderType: 'general',
    }).draggable()
    sl.valueBox.move(135, -5)
    sl.title.move(0, -20)

    sl.move(0, 0)
    draw.add(sl)

    // let mt = new Line()
    //   .line([
    //     [0, 0],
    //     [0, owner.ruller.height() * 1.5],
    //   ])
    //   .stroke({ color: '#999999', width: 1 })
    //   .id('mainTick')

    let mt = new Line()
      .plot([
        [0, 0],
        [0, 30],
      ])
      .stroke({
        color: '#F25F5C',
        width: 5,
      })

    sl.title.value = `Hello, I'm slider :)`
    //?-------------------------------------------------ticks

    let vmtick = new Rect()
      .width(5)
      .height(25)
      .radius(2)
      .fill({ color: '#3F8EFC' })
      .stroke({ color: 'black', width: 1 })

    let slt = new slider({
      payload: {
        min: 0,
        max: 100,
        value: 74,
        precision: 0,
        step: 10,
      },
      ruller: slruller(),
      filler: slfiller(),
      pin: slcirc().draggable(),
      valueBox: ntt(),
      title: llb1(),
      orientation: 'horizontal',
      sliderType: 'general',
      ticks: {
        main: {
          step: 60,
          side: 'both',
          size: 'xxs',
          sizeBase: 1,
          stroke: {
            color: 'red',
            opacity: 0.5,
            dasharray: '2 2',
          },
        },
        half: {
          step: 50,
          side: 'both',
          size: 'l',
          sizeBase: 0.5,
          stroke: {
            color: 'green',
            width: 2,
            opacity: 1,
            dasharray: '2 2',
          },
        },
        subhalf: {
          step: 5,
          side: 'down',
        },
      },
    }).draggable()
    slt.pin.fill({ opacity: 0.5 })
    slt.valueBox.move(135, -5)
    slt.title.move(35, -30)

    draw.add(slt)

    slt.title.value = `and I !`

    let dl = new slider({
      payload: {
        min: 0,
        max: 64,
        value: 32,
        precision: 0,
        step: 8,
      },
      ruller: new Rect()
        .width(10)
        .height(120)
        .fill({ color: '#F5F5F5' })
        .stroke({ color: '#D2D2D2', width: 1 })
        .radius(4),
      filler: new Rect()
        .width(10)
        .fill({ color: '#F65314' })
        .stroke({ color: 'black', width: 2 })
        .radius(4),
      pin: new Circle()
        .radius(10)
        .fill({ color: '#FFBB00', opacity: 0.5 })
        .stroke({ color: 'black', width: 1 })
        .draggable(),
      valueBox: ntt(),
      title: llb1(),
      orientation: 'vertical',

      ticks: {
        main: {
          step: 32,
          side: 'up',
          size: 'xxl',
          sizeBase: 2,
          stroke: {
            color: 'black',
            opacity: 0.2,
            dasharray: '5 5',
          },
        },
        half: {
          step: 24,
          side: 'up',
          size: 'xxl',
          sizeBase: 3,
          stroke: {
            color: 'black',
            opacity: 0.2,
            dasharray: '5 5',
          },
        },
        subhalf: {
          step: 4,
          side: 'both',
          stroke: { color: 'transparent' },
        },
      },
    }).draggable()

    dl.valueBox.move(-10, 135)
    dl.title.value = `... and We, 4-8 inside `
    dl.title.move(-40, -25)
    draw.add(dl)

    const hmtick = () => {
      return new Rect()
        .width(25)
        .height(5)
        .radius(2)
        .fill({ color: '#3F8EFC' })
        .stroke({ color: 'black', width: 1 })
    }

    let dl1 = new slider({
      payload: {
        min: 0,
        max: 64,
        value: 32,
        precision: 0,
        step: 4,
      },
      ruller: new Rect()
        .width(10)
        .height(120)
        .fill({ color: '#F5F5F5' })
        .stroke({
          color: '#D2D2D2',
          width: 1,
        })
        .radius(4),
      filler: new Rect()
        .width(10)
        .fill({ color: '#F65314' })
        .stroke({ color: 'black', width: 2 })
        .radius(4),
      pin: new Circle()
        .radius(10)
        .fill({ color: '#FFBB00', opacity: 0.5 })
        .stroke({ color: 'black', width: 1 })
        .draggable(),
      valueBox: ntt(),
      title: llb1(),
      orientation: 'vertical',
      ticks: {
        main: {
          step: 32,
          side: 'down',
          stroke: { color: 'transparent' },
        },
        half: {
          step: 24,
          side: 'down',
          stroke: { color: 'transparent' },
        },
        subhalf: { step: 4, side: 'both' },
        // half: undefined,
        // main: undefined,
        // subhalf: undefined,
      },
    }).draggable()

    dl1.valueBox.move(-10, 135)
    dl1.title.value = `\u2800`
    dl1.title.move(-40, -25)
    draw.add(dl1)

    let sw = new slider({
      payload: {
        min: 0,
        max: 1,
        step: 1,
        precision: 0,
        value: 1,
      },
      ruller: new Rect()
        .width(25)
        .height(10)
        .fill({ color: '#F5F5F5' })
        .stroke({ color: '#D2D2D2', width: 1 })
        .radius(4),
      filler: new Rect()
        .height(10)
        .fill({ color: '#7CBB00' })
        .stroke({ color: 'black', width: 2 })
        .radius(4),
      pin: new Circle()
        .radius(10)
        .fill({ color: '#FFBB00' })
        .stroke({ color: 'black', width: 1 })
        .draggable(),
      valueBox: ntt(),
      title: llb1(),
      orientation: 'horizontal',
      sliderType: 'twostate',
    }).draggable()

    sw.title.value = 'me too !!... state )'
    sw.title.move(-10, -25)
    sw.valueBox.move(50, 0).hide()
    draw.add(sw)

    return {
      horizontal: sl,
      vertical: [dl, dl1],
      htwostate: sw,
      tickHor: slt,
      nonCirclePin: nonCirclePin,
    }
  }
}
