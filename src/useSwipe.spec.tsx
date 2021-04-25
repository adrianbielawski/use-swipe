import { act, renderHook } from '@testing-library/react-hooks'
import { createEvent, fireEvent } from '@testing-library/react'
import { advanceTo, advanceBy, clear } from 'jest-date-mock'
import { useSwipe } from './useSwipe'

describe('useSwipe', () => {
    let element: HTMLElement;
    let onSwipe: () => void;
    let onSwipeEnd: () => void;

    beforeEach(() => {
        element = document.createElement('div')
        onSwipe = jest.fn()
        onSwipeEnd = jest.fn()
    })

    afterEach(() => {
        clear()
    })

    it('adds an event listener for touchstart', () => {
        const mockAddEventListener = jest.spyOn(element, 'addEventListener')
        const { result } = renderHook(() => useSwipe(onSwipe, onSwipeEnd))
        // result.current is the element setting function
        act(() => result.current(element))

        expect(mockAddEventListener).toHaveBeenCalledTimes(1)
        expect(mockAddEventListener).toHaveBeenNthCalledWith(1, 'touchstart', expect.anything())
    })

    it('adds event listeners for touchmove and touchend', () => {
        const mockAddEventListener = jest.spyOn(element, 'addEventListener')
        const { result } = renderHook(() => useSwipe(onSwipe, onSwipeEnd))
        // result.current is the element setting function
        act(() => result.current(element))

        mockAddEventListener.mockReset()
        fireEvent.touchStart(element, { touches: [{ clientX: 150, clientY: 150 }] })

        expect(mockAddEventListener).toHaveBeenCalledTimes(2)
        expect(mockAddEventListener).toHaveBeenNthCalledWith(1, 'touchmove', expect.anything())
        expect(mockAddEventListener).toHaveBeenNthCalledWith(2, 'touchend', expect.anything())
    })

    it('removes event listeners on touchend', () => {
        const mockRemoveEventListener = jest.spyOn(element, 'removeEventListener')
        const { result } = renderHook(() => useSwipe(onSwipe, onSwipeEnd))
        // result.current is the element setting function
        act(() => result.current(element))

        fireEvent.touchStart(element, { touches: [{ clientX: 150, clientY: 150 }] })
        fireEvent.touchEnd(element)

        expect(mockRemoveEventListener).toHaveBeenCalledTimes(2)
        expect(mockRemoveEventListener).toHaveBeenNthCalledWith(1, 'touchmove', expect.anything())
        expect(mockRemoveEventListener).toHaveBeenNthCalledWith(2, 'touchend', expect.anything())
    })

    it('removes event listeners on cleanup', () => {
        const mockRemoveEventListener = jest.spyOn(element, 'removeEventListener')
        const { result, unmount } = renderHook(() => useSwipe(onSwipe, onSwipeEnd))
        // result.current is the element setting function
        act(() => result.current(element))

        unmount()

        expect(mockRemoveEventListener).toHaveBeenCalledTimes(3)
        expect(mockRemoveEventListener).toHaveBeenNthCalledWith(1, 'touchstart', expect.anything())
        expect(mockRemoveEventListener).toHaveBeenNthCalledWith(2, 'touchmove', expect.anything())
        expect(mockRemoveEventListener).toHaveBeenNthCalledWith(3, 'touchend', expect.anything())
    })

    it('calls onSwipe and onSwipeEnd when user swipes on an element', () => {
        const { result } = renderHook(() => useSwipe(onSwipe, onSwipeEnd))
        // result.current is the element setting function
        act(() => result.current(element))

        fireEvent.touchStart(element, { touches: [{ clientX: 150, clientY: 150 }] })
        fireEvent.touchMove(element, { touches: [{ clientX: 200, clientY: 200 }] })

        expect(onSwipe).toHaveBeenCalledTimes(1)
        expect(onSwipe).toHaveBeenCalledWith(50, 50)
        expect(onSwipeEnd).not.toHaveBeenCalled()

        fireEvent.touchEnd(element)

        expect(onSwipeEnd).toHaveBeenCalled()
    })

    it.each([
        ['stops propagation', true],
        ['does not stop propagation', false],
    ])('%s when stopPropagation is %s', (_, stopPropagation) => {
        const { result } = renderHook(() => useSwipe(onSwipe, onSwipeEnd, stopPropagation))
        // result.current is the element setting function
        act(() => result.current(element))

        const startEvent = createEvent.touchStart(element, { touches: [{ clientX: 150, clientY: 150 }] })
        let mockStopPropagation = jest.spyOn(startEvent, 'stopPropagation')
        fireEvent(element, startEvent)
        expect(mockStopPropagation.mock.calls.length).toEqual(stopPropagation ? 1 : 0)

        const moveEvent = createEvent.touchMove(element, { touches: [{ clientX: 150, clientY: 150 }] })
        mockStopPropagation = jest.spyOn(moveEvent, 'stopPropagation')
        fireEvent(element, moveEvent)
        expect(mockStopPropagation.mock.calls.length).toEqual(stopPropagation ? 1 : 0)

        const endEvent = createEvent.touchEnd(element)
        mockStopPropagation = jest.spyOn(endEvent, 'stopPropagation')
        fireEvent(element, endEvent)
        expect(mockStopPropagation.mock.calls.length).toEqual(stopPropagation ? 1 : 0)
    })

    it.each([
        ['quick', 99, 101, true],
        ['too slow', 100, 101, false],
        ['too short', 99, 100, false],
        ['too slow and too short', 100, 100, false],
    ])('handles quick swipes correctly (%s)', (_, duration, distance, isQuick) => {
        const { result } = renderHook(() => useSwipe(onSwipe, onSwipeEnd, true, 100, 100))
        // result.current is the element setting function
        act(() => result.current(element))

        advanceTo(0)
        fireEvent.touchStart(element, { touches: [{ clientX: 100, clientY: 100 }] })
        fireEvent.touchMove(element, { touches: [{ clientX: 100 + distance, clientY: 100 + distance }] })
        advanceBy(duration)
        fireEvent.touchEnd(element)

        expect(onSwipeEnd).toHaveBeenCalledWith(distance, distance, isQuick)
    })
})