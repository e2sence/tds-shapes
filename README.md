# tds-shapes

User interface components created with [svg.js](https://github.com/svgdotjs/svg.js)

## Usage example

`git clone https://github.com/e2sence/tds-shapes.git`

add entry point

```typescript
import * as shape from './src/tds-shapes/tds-shapes-entry'
```

adds [svg.js](https://svgjs.com/docs/3.0/getting-started/) canvas:

```typescript
let draw = SVG().addTo('body').size(300, 300)
```

### label

lets create simple label, ... 4 instance:

```typescript
/**
 * creating a label attributes
 * @param s text on label
 * @param p position
 * @returns LabelAttr instance
 */
const la = (
  s: string | number,
  p: { x: number; y: number } = { x: 0, y: 0 }
): shape.LabelAttr => {
  return {
    title: {
      value: typeof s == 'number' ? s.toString() : s,
      font: 'Menlo',
      fontWeight: 'normal',
      size: 12,
      fill: { color: 'black' },
      position: { x: 0, y: 0 },
    },
    background: {
      width: 5,
      height: 5,
      fill: { color: '#EEEEEE' },
      stroke: { color: '#D2D2D2', width: 1 },
      radius: 5,
      position: { x: 0, y: 0 },
    },
    backgroundRule: ['indent'],
    indents: [5, 3, 5, 3],
    position: { x: p.x, y: p.y },
  }
}

/**
 * creating a label with the specified properties
 * @param s text on label
 * @param p position
 * @returns label instance
 */
const lm = (s: string, p: { x: number; y: number }) => {
  return new shape.label(la(s, p)).draggable()
}

draw.add(lm('whĄt a beautiful day', { x: 40, y: 50 }))
draw.add(lm('wĤat a beautiful tree st͜ump', { x: 40, y: 70 }))
draw.add(lm('How beAutiful I Äm', { x: 40, y: 90 }))
draw.add(lm('and my s̬ong', { x: 40, y: 110 }))
```
