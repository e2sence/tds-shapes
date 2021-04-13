import { Svg } from '@svgdotjs/svg.js'
import { Box } from '@svgdotjs/svg.js'
import { Circle } from '@svgdotjs/svg.js'
import {
  Element,
  FillData,
  Line,
  StrokeData,
} from '@svgdotjs/svg.js'
import { ListAttr } from './list'

export type StyleSize =
  | 'xxs'
  | 'xs'
  | 's'
  | 'm'
  | 'l'
  | 'xl'
  | 'xxl'

export type FontWeight =
  | 'normal'
  | 'bold'
  | 'bolder'
  | 'lighter'
  | '100'
  | '200'
  | '300'
  | '400'
  | '500'
  | '600'
  | '700'
  | '800'
  | '900'
  | 'inherit'

export type TitleToBackgroundRules =
  | 'none' //     label does not have background
  | 'direct' //   coordinates defined directly
  | 'indent' //   static indents
  | 'centered' // allign title center to background

export type TitleStyle = {
  value: string
  font: string
  fontWeight: FontWeight
  size: number
  fill: FillData
  position?: Position
}

export type BackgroundStyle = {
  width: number
  height: number
  fill: FillData
  stroke: StrokeData
  radius: number
  position?: Position
}

export type Indents = [
  left: number,
  top: number,
  right: number,
  bottom: number
]

export type AnchorsMap = [
  left: [number, number],
  leftTop: [number, number],
  top: [number, number],
  topRight: [number, number],
  right: [number, number],
  rightBottom: [number, number],
  bottom: [number, number],
  bottomLeft: [number, number]
]

export type SliderPayload = {
  min: number
  max: number
  step: number
  precision: number
  value?: number
}

export type SliderOrientation = 'vertical' | 'horizontal'

export type SliderType = 'general' | 'twostate'

export type SliderTickDirection = 'up' | 'down' | 'both'

export type Tick = {
  step: number
  side: SliderTickDirection
  shape?: Element
  size?: StyleSize
  sizeBase?: number
  stroke?: StrokeData
}

export type TickKind = 'main' | 'half' | 'subhalf'

export type SliderTicks = {
  main: Tick
  half: Tick
  subhalf: Tick
}

export type ItemIconStyle = {
  d: string
  fill: FillData
  stroke: StrokeData
}

export type ItemType =
  | 'general'
  | 'icon'
  | 'shortcut'
  | 'separtor'
  | 'group'

export type ItemState = 'active' | 'inactive'

export type Position = { x: number; y: number }

export const iconPath = {
  rightChevron:
    'M6.8 6C6.8 5.8 6.7 5.7 6.6 5.5L1.1 0.2C1 0.1 0.8 0 0.6 0 0.3 0 0 0.3 0 0.6 0 0.8 0.1 1 0.2 1.1L5.2 6 0.2 10.9C0.1 11 0 11.2 0 11.4 0 11.7 0.3 12 0.6 12 0.8 12 1 11.9 1.1 11.8L6.6 6.5C6.7 6.3 6.8 6.2 6.8 6Z',
  dstack:
    'M6.3 12C6.5 12 6.7 11.8 6.8 11.7L3.7 6.2C3.6 6.1 3.6 6.1 3.6 6 3.6 5.9 3.6 5.9 3.7 5.8L6.8 0.3C6.7 0.2 6.5 0 6.3 0 6.1 0 5.9 0.1 5.8 0.3L2.8 5.4C2.7 5.6 2.6 5.8 2.6 6 2.6 6.2 2.7 6.4 2.8 6.6L5.8 11.7C5.9 11.9 6.1 12 6.3 12ZM9.2 12C9.6 12 9.8 11.8 10 11.3L12.7 6.7C12.9 6.5 13 6.2 13 6 13 5.8 12.9 5.5 12.7 5.3L10 0.7C9.8 0.2 9.6 0 9.2 0 8.9 0 8.7 0.2 8.4 0.7L5.8 5.3C5.6 5.5 5.5 5.8 5.5 6 5.5 6.2 5.6 6.5 5.8 6.7L8.4 11.3C8.7 11.8 8.9 12 9.2 12ZM3.4 0.9C3.6 0.9 3.8 0.7 3.8 0.5 3.8 0.3 3.6 0.1 3.4 0.1 3.2 0.1 3 0.3 3 0.5 3 0.7 3.2 0.9 3.4 0.9ZM2.8 2C3 2 3.2 1.8 3.2 1.6 3.2 1.4 3 1.2 2.8 1.2 2.6 1.2 2.4 1.4 2.4 1.6 2.4 1.8 2.6 2 2.8 2ZM2.2 3.1C2.4 3.1 2.6 2.9 2.6 2.7 2.6 2.5 2.4 2.3 2.2 2.3 2 2.3 1.8 2.5 1.8 2.7 1.8 2.9 2 3.1 2.2 3.1ZM1.6 4.1C1.8 4.1 2 4 2 3.8 2 3.5 1.8 3.4 1.6 3.4 1.4 3.4 1.2 3.5 1.2 3.8 1.2 4 1.4 4.1 1.6 4.1ZM1 5.2C1.2 5.2 1.4 5.1 1.4 4.9 1.4 4.6 1.2 4.5 1 4.5 0.8 4.5 0.6 4.6 0.6 4.9 0.6 5.1 0.8 5.2 1 5.2ZM0.4 6.3C0.6 6.3 0.8 6.2 0.8 5.9 0.8 5.7 0.6 5.6 0.4 5.6 0.2 5.6 0 5.7 0 5.9 0 6.2 0.2 6.3 0.4 6.3ZM1 7.4C1.2 7.4 1.4 7.2 1.4 7 1.4 6.8 1.2 6.6 1 6.6 0.8 6.6 0.6 6.8 0.6 7 0.6 7.2 0.8 7.4 1 7.4ZM1.6 8.5C1.8 8.5 2 8.3 2 8.1 2 7.9 1.8 7.7 1.6 7.7 1.4 7.7 1.2 7.9 1.2 8.1 1.2 8.3 1.4 8.5 1.6 8.5ZM2.2 9.6C2.4 9.6 2.6 9.4 2.6 9.2 2.6 9 2.4 8.8 2.2 8.8 2 8.8 1.8 9 1.8 9.2 1.8 9.4 2 9.6 2.2 9.6ZM2.8 10.7C3 10.7 3.2 10.5 3.2 10.3 3.2 10.1 3 9.9 2.8 9.9 2.6 9.9 2.4 10.1 2.4 10.3 2.4 10.5 2.6 10.7 2.8 10.7ZM3.4 11.8C3.6 11.8 3.8 11.6 3.8 11.4 3.8 11.2 3.6 11 3.4 11 3.2 11 3 11.2 3 11.4 3 11.6 3.2 11.8 3.4 11.8Z',
  cross:
    'M0 6.9C0 8 0.5 8.5 1.5 8.5H3.5V10.5C3.5 11.5 4 12 5.1 12H6.9C8 12 8.5 11.5 8.5 10.5V8.5H10.5C11.5 8.5 12 8 12 6.9V5.1C12 4 11.5 3.5 10.5 3.5H8.5V1.5C8.5 0.5 8 0 6.9 0H5.1C4 0 3.5 0.5 3.5 1.5V3.5H1.5C0.5 3.5 0 4 0 5.1V6.9ZM0.9 6.9V5.1C0.9 4.7 1.1 4.4 1.6 4.4H4.4V1.6C4.4 1.1 4.7 0.9 5.1 0.9H6.9C7.3 0.9 7.6 1.1 7.6 1.6V4.4H10.4C10.9 4.4 11.1 4.7 11.1 5.1V6.9C11.1 7.3 10.9 7.6 10.4 7.6H7.6V10.4C7.6 10.9 7.3 11.1 6.9 11.1H5.1C4.7 11.1 4.4 10.9 4.4 10.4V7.6H1.6C1.1 7.6 0.9 7.3 0.9 6.9Z',
}

/** simple ID string for object identification
 * @returns string like 'T40fbb0e49f748c'
 */
export function Create_ID() {
  return `T${(~~(
    (Math.random() * (1 - 0.5) + 0.5) *
    1e8
  )).toString(16)}${(~~(
    (Math.random() * (1 - 0.5) + 0.5) *
    1e8
  )).toString(16)}`
}

/**
 * translate 'xxs ... xxl' to number
 * @param i string from StyleSize type
 * @param base StyleSize
 * @returns number
 */
export const StyleSizeNumber = (
  i: StyleSize,
  base: number = 1
): number => {
  switch (i) {
    case 'xxs':
      return base
    case 'xs':
      return base + 0.2
    case 's':
      return base + 0.4
    case 'm':
      return base + 1
    case 'l':
      return base + 1.2
    case 'xl':
      return base + 1.4
    case 'xxl':
      return base + 1.6
    default:
      break
  }
}

/**
 *  scale value to 0 - 1 row, if value < min or > max, result can be less 0 or gretter then 1
 *
 * @param v input value
 * @param vMin input value min
 * @param vMax input value max
 * @param d number of digits in 'return', if '0' => round up to integer
 */
export const vTo01 = (
  v: number,
  vMin: number,
  vMax: number,
  d?: number
): number => {
  return !(d || d === 0)
    ? (v - vMin) / (vMax - vMin)
    : Number(((v - vMin) / (vMax - vMin)).toFixed(d))
}

/**
 * rounding x to the nearest integer, taking into account the multiplier
 *
 * @param n value to be rounded
 * @param x the value to which the result should be a multiple
 */
export const rndX = (n: number, x: number): number => {
  return Math.round(n / x) * x
}

/**
 * fill source with target
 * @param s source
 * @param t target
 */
export const objectMerge = (s: any, t: any): void => {
  Object.keys(s).forEach((prop) => {
    if (typeof s[prop] == 'object' || undefined) {
      !t[prop]
        ? (t[prop] = s[prop])
        : objectMerge(s[prop], t[prop])
    } else {
      !t[prop] ? (t[prop] = s[prop]) : 0
    }
  })
}

/** random hex color */
export const getRandomColor = (): string => {
  let letters = '0123456789ABCDEF'
  let color = '#'
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)]
  }
  return color
}

/**
 * checks if coordinates are in a circle
 *
 * @param x x coordinate
 * @param y y coordinate
 * @param x1 circle x coordinate
 * @param y1 circle y coordinate
 * @param r circle radius
 */
export const isPointInCircle = (
  x: number,
  y: number,
  x1: number,
  y1: number,
  r: number
): boolean => {
  let distance = (x - x1) * (x - x1) + (y - y1) * (y - y1)
  r *= r
  return distance < r
}

/**
 * distance from point to point (circle center...etc)
 *
 * @param x x coordinate
 * @param y y coordinate
 * @param x1 circle x coordinate
 * @param y1 circle y coordinate
 */
export const distP = (
  x: number,
  y: number,
  x1: number,
  y1: number
): number => {
  return Math.sqrt(
    (x1 - x) * (x1 - x) + (y1 - y) * (y1 - y)
  )
}

/** controled, 'auto erase' line from point to point */
export const createTempLine = (
  root: Svg,
  x: number,
  y: number,
  x1: number,
  y1: number,
  id: string,
  la?: StrokeData
) => {
  root.children().map((el) => {
    el.hasClass('tds-templine' + id) && el.remove()
  })

  !la &&
    (la = { color: 'red', width: 1, dasharray: '5 2 5' })

  root.add(
    new Line()
      .plot([
        [x, y],
        [x1, y1],
      ])
      .stroke({
        color: la.color,
        width: la.width,
        dasharray: la.dasharray,
      })
      .addClass('tds-templine' + id)
  )
}

export const createPinPoint = (
  root: Svg,
  x: number,
  y: number,
  r: number,
  id: string,
  la?: StrokeData,
  fd?: FillData
) => {
  root.children().map((el) => {
    el.hasClass('tds-pinpoint' + id) && el.remove()
  })

  !la && (la = { color: 'red', width: 1 })
  !fd && (fd = { color: 'transparent' })

  root.add(
    new Circle()
      .radius(r)
      .stroke({ ...la })
      .fill({ ...fd })
      .cx(x)
      .cy(y)
      .addClass('tds-pinpoint' + id)
  )
}

/**
 * truncates the string to the specified number of characters
 * @param s the string to trim
 * @param n number of characters, including the number of characters in the specified ending 'es'
 * @param es characters set at the end of a line
 */
export function shrinkString(
  s: string,
  n: number,
  es: string
) {
  return s.length - n > 0
    ? s.substr(0, n - es.length) + es
    : s
}

/**
 * check if point is inside rectangle
 * Set boolean b to true if if the point with coordinates (x,y)
 * is inside the rectangle with coordinates (x1,y1,x2,y2) , or to false otherwise.
 * @param rect rectangle (x1,y1,x2,y2): number`s
 * @param point point (x: number,y: number)
 */
export const pointInRect = (
  rect: { x1: number; y1: number; x2: number; y2: number },
  point: { x: number; y: number }
) =>
  point.x > rect.x1 &&
  point.x < rect.x2 &&
  point.y > rect.y1 &&
  point.y < rect.y2

// the same but rect is specified as Box
export const pointInRectBox = (
  rect: Box,
  point: { x: number; y: number }
) =>
  point.x > rect.x &&
  point.x < rect.x2 &&
  point.y > rect.y &&
  point.y < rect.y2

/**
 * list group config example
 */
export const ListAttrGroupDefault: ListAttr = {
  //
  body: {
    width: 206,
    height: 200,
    fill: { color: '#EEEEEE' },
    stroke: { color: '#D2D2D2', width: 1 },
    radius: 10,
    position: { x: 300, y: 300 },
  },
  autoHeight: true,
  indents: [5, 8, 5, 8],
  subItemIndents: {
    item: 0,
    separator: 5,
    itemIcon: 20,
    itemShortcut: 20,
  },

  //
  itemWidth: 190,
  itemsStyle: {
    title: {
      value: '',
      font: 'Menlo',
      fontWeight: 'normal',
      size: 12,
      fill: { color: 'black' },
      position: { x: 0, y: 0 },
    },
    backgroundRule: ['indent'],
    background: {
      width: 50,
      height: 20,
      fill: { color: '#EEEEEE' },
      stroke: { color: '#EEEEEE' },
      radius: 4,
      position: { x: 0, y: 0 },
    },
    indents: [8, 2, 8, 2],
    position: { x: 0, y: 0 },
  },

  // prettier-ignore
  itemsBehavior: [{
      itemPart: 'background', behavior: [
        //    { condition: 'normal', attr: { fill: { color: 'red' }, stroke: { color: 'blue', width: 2 } } },
        //    { condition: 'mouseenter', attr: {fill: {color: 'grey'}, stroke: { color: 'black', width: 2}}}
      ]}, {
      itemPart: 'shotrcut', behavior: [
        //    {condition: 'mouseenter', attr: {fill: { color : 'red'}}},
        //    {},   
          ]
      }],

  // prettier-ignore
  itemsInstances: [
    { kind: 'general', str: 'File', state: 'active', condition: 'normal' },
    { kind: 'general', str: 'Edit', state: 'active', condition: 'normal' },
    { kind: 'general', str: 'View', state: 'active', condition: 'normal' },
    { kind: 'general', str: 'Terminal', state: 'active', condition: 'normal'},
    { kind: 'general', str: 'Wait a minutes...', state: 'active', condition: 'normal'},
    ],
  // prettier-ignore
  separatorsInstances: [
      {order: 2, value: {start: {x: 25, y: 0}, length: 160, stroke: {color: '#D2D2D2'}} },
  ],
}

/**
 * list config example
 */
export const ListAttrDefault: ListAttr = {
  //
  body: {
    width: 206,
    height: 200,
    fill: { color: '#EEEEEE' },
    stroke: { color: '#D2D2D2', width: 1 },
    radius: 10,
    position: { x: 300, y: 300 },
  },
  autoHeight: true,
  indents: [5, 8, 5, 8],
  subItemIndents: {
    item: 0,
    separator: 5,
    itemIcon: 20,
    itemShortcut: 20,
  },
  position: { x: 0, y: 0 },
  //
  itemWidth: 190,
  itemsStyle: {
    title: {
      value: '',
      font: 'Menlo',
      fontWeight: 'normal',
      size: 12,
      fill: { color: 'black' },
      position: { x: 0, y: 0 },
    },
    backgroundRule: ['indent'],
    background: {
      width: 50,
      height: 20,
      fill: { color: '#EEEEEE' },
      stroke: { color: '#EEEEEE' },
      radius: 4,
      position: { x: 0, y: 0 },
    },
    indents: [8, 2, 8, 2],
    position: { x: 0, y: 0 },
  },

  // prettier-ignore
  itemsBehavior: [{
      itemPart: 'background', behavior: [
        //    { condition: 'normal', attr: { fill: { color: 'red' }, stroke: { color: 'blue', width: 2 } } },
        //    { condition: 'mouseenter', attr: {fill: {color: 'grey'}, stroke: { color: 'black', width: 2}}}
      ]}, {
      itemPart: 'shotrcut', behavior: [
        //    {condition: 'mouseenter', attr: {fill: { color : 'red'}}},
        //    {},   
          ]
      }],

  // prettier-ignore
  itemsInstances: [
    { kind: 'general', str: 'File', state: 'active', condition: 'normal' },
    { kind: 'general', str: 'Edit', state: 'active', condition: 'normal' },
    { kind: 'shortcut', str: 'Window', state: 'active', condition: 'normal', shortcut: {value: 'cmd + X', font: 'Menlo', fontWeight: 'normal', size: 12, position: {x: 0, y: 0}, fill: {color: 'green'}}},
    { kind: 'general', str: 'View', state: 'active', condition: 'normal' },
    { kind: 'icon', str: 'Magic cross', state: 'active', condition: 'normal', icon: { d: iconPath.cross, fill: {color: 'black'}, stroke: {color: 'black'}}},
    { kind: 'general', str: 'Terminal', state: 'active', condition: 'normal'},
    { kind: 'general', str: 'Wait a minutes...', state: 'active', condition: 'normal'},
    { kind: 'group', str: 'Wonder group', state: 'active', condition: 'normal', icon: { d: iconPath.rightChevron, fill: {color: 'black'}, stroke: {color: 'black'}}, list: ListAttrGroupDefault},
    ],
  // prettier-ignore
  separatorsInstances: [
      {order: 2, value: {start: {x: 25, y: 0}, length: 160, stroke: {color: '#D2D2D2'}} },
      {order: 4, value: {start: {x: 25, y: 0}, length: 160, stroke: {color: '#D2D2D2'}} },
      {order: 7, value: {start: {x: 25, y: 0}, length: 160, stroke: {color: '#D2D2D2'}} },
  ],
}
