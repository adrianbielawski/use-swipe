# useSwipe react hook

## Description

Very easy to use react hook for detection of swipe length and quick swipe check on touch screen.

## Technology

Created with TypeScript and React. Tested with Jest and React-testing-library.

## Usage

`$ npm i @adrianbielawski/use-swipe`

```tsx
import { useSwipe } from '@adrianbielawski/use-swipe'

const YourComponent = () => {
    const swipeRef = useSwipe(handleSwipe, handleSwipeEnd)

    const handleSwipe = (x: number, y: number) => {
        console.log(x, y)
    }
        
    const handleSwipeEnd = (x: number, y: number, isQuick: boolean) => {
        console.log(x, y, isQuick)
    }

    return (
        <div ref={swipeRef}>
            your content here
        </div>
    )
}
```

## Props / Config

All must be passed as ordered below

**x, y** - swipe lendth \
**isQuick** - was the swipe quick and short enough

| Name                 | Type                                                  | required | Description |
| -------------------- | ----------------------------------------------------- | -------- | ----------- |
| onSwipe              | (x: number, y: number) => void                        | true     | Called while swiping |
| onSwipeEnd           | (x: number, y: number, isQuick: boolean) => void      | true     | Called when swipe has ended |
| onSwipeStart         | (x: number, y: number, isQuick: boolean) => void      | false    | Called when swipe has ended |
| stopPropagation      | boolean, default true                                 | false    | if true, e.stopPropagation is called on every events |
| quickSwipeDuration   | number, default 300                                   | false    | max time of swipe to be considered as quick (in miliseconds) |
| quickSwipeDistance   | number, default 50                                    | false    | min length of swipe to be considered as quick (in miliseconds) |