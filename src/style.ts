import {
  Svg,
  Element,
  FillData,
  StrokeData,
  G,
  Rect,
  Line,
} from '@svgdotjs/svg.js'

import {
  Indents,
  BackgroundStyle,
  StyleSize,
  StyleSizeNumber,
  TitleStyle,
} from './common'

import { label } from './label'
import { title } from './title'

export const StyleClasses = [
  'tds-stylegroup',
  'tds-stylecross',
  'tds-styleoutline',
  'tds-borderline',
  'tds-styleindent',
]

export const style = (
  el?: Element,
  draggable?: boolean
) => {
  return {
    add: () => {
      let sg: G
      if (!el.parent().hasClass('tds-stylegroup')) {
        sg = new G().addClass('tds-stylegroup')
        let elp = el.parents()
        elp[0].add(sg)
        el.addTo(sg)
      } else {
        let elpa = el.parents()
        let lpg = elpa[0]
        lpg instanceof G ? (sg = lpg) : 0
      }
      if (draggable) sg.draggable()
      return {
        cross: (
          s: StrokeData,
          size: StyleSize,
          label?: string
        ) => {
          sg.children()
            .filter((el) => el.hasClass('tds-stylecross'))
            .map((el) => el.remove())

          let k = StyleSizeNumber(size)
          let k1 = el.bbox().width / el.bbox().height
          let hll = k * el.bbox().width
          let vll = k * el.bbox().height

          let hl = new Line()
            .addClass('tds-stylecross')
            .plot([
              [0, 0],
              [hll, 0],
            ])
            .stroke({ ...s })
            .cx(el.cx())
            .cy(el.cy())

          let vl = new Line()
            .addClass('tds-stylecross')
            .plot([
              [0, 0],
              [0, vll],
            ])
            .stroke({ ...s })
            .cx(el.cx())
            .cy(el.cy())

          if (label) {
            let st = new title({
              value: label,
              fontWeight: 'normal',
              font: 'Menlo',
              size: 8,
              fill: { color: 'black' },
              position: {
                x: vl.bbox().x2 + 5,
                y: vl.bbox().y2 - 5,
              },
            }).addClass('tds-stylecross')
            sg.add(st)
          }

          sg.add(hl).add(vl)
        },
        outline: (
          f: FillData,
          s: StrokeData,
          label?: string
        ) => {
          sg.children()
            .filter((el) => el.hasClass('tds-styleoutline'))
            .map((el) => el.remove())

          let elb = el.bbox()

          let or = new Rect()
            .addClass('tds-styleoutline')
            .width(elb.width)
            .height(elb.height)
            .fill({ ...f })
            .stroke({ ...s })
            .cx(el.cx())
            .cy(el.cy())

          if (label) {
            let st = new title({
              value: label,
              fontWeight: 'normal',
              font: 'Menlo',
              size: 8,
              fill: { color: 'black' },
              position: {
                x: el.bbox().x2,
                y: el.bbox().y2,
              },
            }).addClass('tds-styleoutline')
            sg.add(st)
          }

          sg.add(or)
        },
        borderLines: (
          sides: Indents,
          s: StrokeData,
          size: StyleSize,
          label?: string
        ) => {
          sg.children()
            .filter((el) => el.hasClass('tds-borderline'))
            .map((el) => el.remove())

          const fll = () => {
            let fl = new Line()
              .stroke({ ...s })
              .addClass('tds-borderline')
            return fl
          }

          let elb = el.bbox()

          let k = StyleSizeNumber(size)
          let hll = elb.width * k * 1.5
          let vll = elb.height * k * 2

          let l: Line

          sides.forEach((m, i) => {
            if (m) {
              l = fll()
              // top -- bottom
              if (i % 2) {
                if (i == 1) {
                  // top
                  l.plot([
                    [0, 0],
                    [hll, 0],
                  ])
                  l.cx(elb.x + elb.width / 2)
                  l.cy(elb.y)
                } else {
                  // bottom
                  l.plot([
                    [0, 0],
                    [hll, 0],
                  ])
                  l.cx(elb.x + elb.width / 2)
                  l.cy(elb.y + elb.height)
                }
              } else {
                // left
                if (i == 0) {
                  l.plot([
                    [0, 0],
                    [0, vll],
                  ])
                  l.cx(elb.x)
                  l.cy(elb.y + elb.height / 2)
                } else {
                  // right
                  l.plot([
                    [0, 0],
                    [0, vll],
                  ])
                  l.cx(elb.x2)
                  l.cy(elb.y2 - elb.height / 2)
                }
              }
              sg.add(l)
            }
          })

          if (label) {
            let lel = el
              .parent()
              .children()
              .filter((el) =>
                el.hasClass('tds-borderline')
              )[0]

            let st = new title({
              value: label,
              fontWeight: 'normal',
              font: 'Menlo',
              size: 8,
              fill: { color: 'black' },
              position: {
                x: lel.bbox().x2 + 5,
                y: lel.bbox().y2 - 5,
              },
            }).addClass('tds-borderline')
            sg.add(st)
          }
        },
        indent: (
          t: Element,
          s: StrokeData,
          label?: string
        ) => {
          sg.children()
            .filter((el) => el.hasClass('tds-styleindent'))
            .map((el) => el.remove())

          const fll = () => {
            let fl = new Line()
              .stroke({ ...s })
              .addClass('tds-styleindent')
            return fl
          }

          let elb = el.bbox()
          let tlb = t.bbox()

          // left
          let lll = elb.x - tlb.x
          if (lll > 0) {
            let yx = elb.y + elb.height * 0.2
            let l = fll().plot([
              [elb.x, yx],
              [tlb.x, yx],
            ])
            sg.add(l)
          }

          // top
          let tll = elb.y - tlb.y
          if (tll > 0) {
            let yx = elb.x + elb.width * 0.2
            let l = fll().plot([
              [yx, elb.y],
              [yx, tlb.y],
            ])
            sg.add(l)
          }

          // right
          let rll = elb.x2 - tlb.x2
          if (rll < 0) {
            let yx = elb.y2 - elb.height * 0.2
            let l = fll().plot([
              [elb.x2, yx],
              [tlb.x2, yx],
            ])
            sg.add(l)
          }
          // bottom
          let bll = elb.y2 - tlb.y2
          if (bll < 0) {
            let yx = elb.x2 - elb.width * 0.2
            let l = fll().plot([
              [yx, elb.y2],
              [yx, tlb.y2],
            ])
            sg.add(l)
          }

          if (label) {
            let ttx = sg
              .children()
              .filter((el) =>
                el.hasClass('tds-styleindent')
              )[0]
              .bbox()

            let st = new title({
              value: label,
              fontWeight: 'normal',
              font: 'Menlo',
              size: 8,
              fill: { color: 'black' },
              position: {
                x: ttx.x + 5,
                y: ttx.y + 5,
              },
            }).addClass('tds-styleindent')

            sg.add(st)
          }
        },
      }
    },
    clear: (el: Element) => {},
    demo: (draw: Svg) => {
      const title = (): TitleStyle => {
        return {
          value: 'Äqbc..,!jŠ',
          fill: { color: 'black' },
          font: 'Menlo', // Anonymous Pro
          size: 22,
          position: { x: 200, y: -70 },
          fontWeight: 'normal',
        }
      }
      const outline = (): BackgroundStyle => {
        return {
          width: 230,
          height: 80,
          fill: { color: '#F5F5F5' },
          stroke: { color: '#D2D2D2' },
          radius: 15,
          position: { x: 0, y: 0 },
        }
      }
      const pz = () => {
        return { x: 0, y: 0 }
      }

      let l = new label({
        title: title(),
        // 'none',
        backgroundRule: ['direct'],
        // 'indent',
        // 'centered',
        // 'margins',
        background: outline(),
        indents: [0, 0, 0, 0],
        position: {
          x: 200,
          y: 200,
        },
      }).draggable()

      draw.add(l)

      style(l.background, true).add().cross(
        {
          color: '#3F8EFC',
          width: 2,
          opacity: 0.7,
          dasharray: '5 5',
        },
        'l',
        `outline center`
      )
      style(l.title).add().cross(
        {
          color: '#3F8EFC',
          width: 1,
          opacity: 1,
          dasharray: '5 5',
        },
        'l',
        'label center'
      )
      style(l.background)
        .add()
        .outline(
          { color: '#F25F5C', opacity: 0.2 },
          { color: 'black', opacity: 0.5 },
          'outline bbox'
        )

      style(l.title)
        .add()
        .outline(
          { color: '#F25F5C', opacity: 0.2 },
          { color: 'black', opacity: 0.5 },
          'label bbox'
        )

      style(l.background).add().borderLines(
        [1, 1, 0, 0],
        {
          color: 'red',
          width: 3,
          opacity: 0.2,
        },
        'xs',
        'border line'
      )

      style(l.title).add().indent(
        l.background,
        {
          color: 'black',
          width: 1,
          opacity: 0.5,
          dasharray: '2 2',
        },
        'indent'
      )

      let rt = draw
        .rect(140, 100)
        .fill({ color: '#00A1F1', opacity: 1 })
        .stroke({ color: '#000000', width: 1 })
        .move(220, 100)
        .radius(20)

      style(rt, true)
        .add()
        .cross(
          { color: 'black', width: 1, dasharray: '5 5' },
          'm',
          'rect cross'
        )

      style(rt)
        .add()
        .borderLines(
          [0, 0, 1, 1],
          { color: '#F65314', opacity: 0.4, width: 2 },
          'xxs',
          'rect side'
        )

      style(rt).add().indent(
        l.title,
        {
          color: 'black',
          width: 1,
          dasharray: '2 2',
          opacity: 0.5,
        },
        'rect to title indent'
      )

      let rt1 = draw
        .rect(20, 20)
        .fill({ color: '#EA3E23', opacity: 1 })
        .stroke({ color: '#000000', width: 2 })
        .move(390, 320)
        .radius(5)

      style(rt1)
        .add()
        .cross(
          { color: 'black', width: 1, dasharray: '2 2' },
          'm'
        )

      style(rt1, true).add().indent(
        draw,
        {
          color: 'black',
          width: 1,
          dasharray: '2 2',
        },
        'red point indent'
      )
    },
  }
}
