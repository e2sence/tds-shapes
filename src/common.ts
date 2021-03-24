import { Element, FillData, StrokeData } from '@svgdotjs/svg.js'

export type StyleSize = 'xxs' | 'xs' | 's' | 'm' | 'l' | 'xl' | 'xxl'

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
  position: Position
}

export type BackgroundStyle = {
  width: number
  height: number
  fill: FillData
  stroke: StrokeData
  radius: number
  position: Position
}

export type Indents = [
  left: number,
  top: number,
  right: number,
  bottom: number
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

export type ItemType = 'general' | 'icon' | 'shortcut'

export type ItemState = 'active' | 'inactive'

export type Position = { x: number; y: number }

/** simple ID string for object identification
 * @returns string like 'T40fbb0e49f748c'
 */
export function Create_ID() {
  return `T${(~~((Math.random() * (1 - 0.5) + 0.5) * 1e8)).toString(
    16
  )}${(~~((Math.random() * (1 - 0.5) + 0.5) * 1e8)).toString(16)}`
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
      !t[prop] ? (t[prop] = s[prop]) : objectMerge(s[prop], t[prop])
    } else {
      !t[prop] ? (t[prop] = s[prop]) : 0
    }
  })
}
