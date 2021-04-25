import { useCallback, useEffect, useRef, useState } from "react"

interface Coords {
    x: number,
    y: number,
}

interface Slide {
    start: {
        time: number | null,
    } & Coords | null,
    length: Coords | null,
}

export const useSwipe = (
    onSwipe: (x: number, y: number) => void,
    onSwipeEnd: (x: number, y: number, quickSwipe: boolean) => void,
    stopPropagation: boolean = true,
    quickSwipeDuration: number = 300,
    quickSwipeDistance: number = 50,
) => {
    const [element, setElement] = useState<HTMLElement | null>(null)
    const elementRef = useCallback(setElement, [])
    const slide = useRef<Slide | null>(null)

    useEffect(() => {
        const handleTouchStart = (e: TouchEvent) => {
            if (stopPropagation) {
                e.stopPropagation()
            }

            slide.current = {
                start: {
                    x: e.touches[0].clientX,
                    y: e.touches[0].clientY,
                    time: Date.now(),
                },
                length: null,
            }

            element!.addEventListener('touchmove', handleTouchMove)
            element!.addEventListener('touchend', handleTouchEnd)
        }

        const handleTouchMove = (e: TouchEvent) => {
            if (stopPropagation) {
                e.stopPropagation()
            }
            
            const slideX = e.touches[0].clientX - slide.current!.start!.x
            const slideY = e.touches[0].clientY - slide.current!.start!.y

            slide.current = {
                start: slide.current!.start,
                length: {
                    x: slideX,
                    y: slideY,
                },
            }

            onSwipe(slideX, slideY)
        }

        const handleTouchEnd = (e: TouchEvent) => {
            if (stopPropagation) {
                e.stopPropagation()
            }
            
            const start = slide.current?.start
            const length = slide.current?.length
            
            let isQuick = false

            if (length !== null && Date.now() < start!.time! + quickSwipeDuration) {
                if (Math.abs(length!.x) > quickSwipeDistance
                    || Math.abs(length!.y) > quickSwipeDistance
                ) {
                    isQuick = true
                }
            }

            if (length !== null) {
                onSwipeEnd(
                    slide.current!.length!.x,
                    slide.current!.length!.y,
                    isQuick
                )
            }

            slide.current = null

            element!.removeEventListener('touchmove', handleTouchMove)
            element!.removeEventListener('touchend', handleTouchEnd)
        }

        if (element !== null) {
            element.addEventListener('touchstart', handleTouchStart)
        }

        return () => {
            if (element !== null) {
                element.removeEventListener('touchstart', handleTouchStart)
                element.removeEventListener('touchmove', handleTouchMove)
                element.removeEventListener('touchend', handleTouchEnd)
            }
        }
    }, [element, onSwipe, onSwipeEnd, stopPropagation, quickSwipeDuration, quickSwipeDistance])

    return elementRef
}