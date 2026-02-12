import { Platform } from 'react-native'
import { renderHook, act, waitFor } from '@testing-library/react-native'

import type { WidgetActionEvent, AndroidWidgetPayload } from '../../widgets/api'

// Mock react-native Platform
jest.mock('react-native', () => ({
  Platform: {
    OS: 'android',
  },
}))

// Store subscription callback for testing
let subscriptionCallback: ((action: WidgetActionEvent) => void) | null = null
const mockRemove = jest.fn()
const mockSubscribeToWidgetActions = jest.fn().mockImplementation(
  (_widgetId: string, callback: (action: WidgetActionEvent) => void) => {
    subscriptionCallback = callback
    return { remove: mockRemove }
  }
)

const mockUpdateAndroidWidgetFromJS = jest.fn().mockResolvedValue({ success: true })

// Mock the widgets API
jest.mock('../../widgets/api', () => ({
  subscribeToWidgetActions: (...args: unknown[]) => mockSubscribeToWidgetActions(...args),
  updateAndroidWidgetFromJS: (...args: unknown[]) => mockUpdateAndroidWidgetFromJS(...args),
}))

// Import after mocking
import { useInteractiveWidget } from '../useInteractiveWidget'

describe('useInteractiveWidget', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    subscriptionCallback = null
  })

  test('subscribes to widget actions on mount', () => {
    renderHook(() => useInteractiveWidget('testWidget'))

    expect(mockSubscribeToWidgetActions).toHaveBeenCalledTimes(1)
    expect(mockSubscribeToWidgetActions).toHaveBeenCalledWith('testWidget', expect.any(Function))
  })

  test('unsubscribes on unmount', () => {
    const { unmount } = renderHook(() => useInteractiveWidget('testWidget'))

    unmount()

    expect(mockRemove).toHaveBeenCalledTimes(1)
  })

  test('re-subscribes when widgetId changes', () => {
    const { rerender } = renderHook(
      ({ widgetId }) => useInteractiveWidget(widgetId),
      { initialProps: { widgetId: 'widget1' } }
    )

    expect(mockSubscribeToWidgetActions).toHaveBeenCalledWith('widget1', expect.any(Function))

    rerender({ widgetId: 'widget2' })

    // Should have removed old subscription and created new one
    expect(mockRemove).toHaveBeenCalledTimes(1)
    expect(mockSubscribeToWidgetActions).toHaveBeenCalledWith('widget2', expect.any(Function))
  })

  test('calls onAction callback when action is triggered', async () => {
    const mockOnAction = jest.fn().mockResolvedValue(undefined)

    renderHook(() => useInteractiveWidget('testWidget', { onAction: mockOnAction }))

    const event: WidgetActionEvent = {
      type: 'widgetAction',
      widgetId: 'testWidget',
      actionName: 'increment',
      componentId: 'btn1',
      timestamp: Date.now(),
    }

    await act(async () => {
      subscriptionCallback?.(event)
    })

    expect(mockOnAction).toHaveBeenCalledWith(event)
  })

  test('updates widget when onAction returns a payload', async () => {
    const payload: AndroidWidgetPayload = {
      v: 1,
      variants: { '150x100': { t: 1, c: 'test' } },
    }
    const mockOnAction = jest.fn().mockResolvedValue(payload)

    renderHook(() => useInteractiveWidget('testWidget', { onAction: mockOnAction }))

    const event: WidgetActionEvent = {
      type: 'widgetAction',
      widgetId: 'testWidget',
      actionName: 'increment',
      componentId: 'btn1',
      timestamp: Date.now(),
    }

    await act(async () => {
      subscriptionCallback?.(event)
    })

    await waitFor(() => {
      expect(mockUpdateAndroidWidgetFromJS).toHaveBeenCalledWith('testWidget', payload)
    })
  })

  test('does not update widget when onAction returns void', async () => {
    const mockOnAction = jest.fn().mockResolvedValue(undefined)

    renderHook(() => useInteractiveWidget('testWidget', { onAction: mockOnAction }))

    const event: WidgetActionEvent = {
      type: 'widgetAction',
      widgetId: 'testWidget',
      actionName: 'test',
      componentId: 'btn1',
      timestamp: Date.now(),
    }

    await act(async () => {
      subscriptionCallback?.(event)
    })

    expect(mockUpdateAndroidWidgetFromJS).not.toHaveBeenCalled()
  })

  test('handles synchronous onAction callback', async () => {
    const payload: AndroidWidgetPayload = {
      v: 1,
      variants: { '150x100': { t: 1, c: 'sync' } },
    }
    const mockOnAction = jest.fn().mockReturnValue(payload)

    renderHook(() => useInteractiveWidget('testWidget', { onAction: mockOnAction }))

    const event: WidgetActionEvent = {
      type: 'widgetAction',
      widgetId: 'testWidget',
      actionName: 'test',
      componentId: 'btn1',
      timestamp: Date.now(),
    }

    await act(async () => {
      subscriptionCallback?.(event)
    })

    await waitFor(() => {
      expect(mockUpdateAndroidWidgetFromJS).toHaveBeenCalledWith('testWidget', payload)
    })
  })

  test('logs error when update fails', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
    mockUpdateAndroidWidgetFromJS.mockResolvedValueOnce({ success: false, error: 'Update failed' })

    const payload: AndroidWidgetPayload = { v: 1, variants: {} }
    const mockOnAction = jest.fn().mockResolvedValue(payload)

    renderHook(() => useInteractiveWidget('testWidget', { onAction: mockOnAction }))

    const event: WidgetActionEvent = {
      type: 'widgetAction',
      widgetId: 'testWidget',
      actionName: 'test',
      componentId: 'btn1',
      timestamp: Date.now(),
    }

    await act(async () => {
      subscriptionCallback?.(event)
    })

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed to update widget'),
        'Update failed'
      )
    })

    consoleErrorSpy.mockRestore()
  })

  test('logs error when onAction throws', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
    const error = new Error('Callback error')
    const mockOnAction = jest.fn().mockRejectedValue(error)

    renderHook(() => useInteractiveWidget('testWidget', { onAction: mockOnAction }))

    const event: WidgetActionEvent = {
      type: 'widgetAction',
      widgetId: 'testWidget',
      actionName: 'test',
      componentId: 'btn1',
      timestamp: Date.now(),
    }

    await act(async () => {
      subscriptionCallback?.(event)
    })

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Error in onAction callback'),
        error
      )
    })

    consoleErrorSpy.mockRestore()
  })

  test('does nothing when no onAction callback is provided', async () => {
    renderHook(() => useInteractiveWidget('testWidget'))

    const event: WidgetActionEvent = {
      type: 'widgetAction',
      widgetId: 'testWidget',
      actionName: 'test',
      componentId: 'btn1',
      timestamp: Date.now(),
    }

    await act(async () => {
      subscriptionCallback?.(event)
    })

    expect(mockUpdateAndroidWidgetFromJS).not.toHaveBeenCalled()
  })

  test('updateWidget method calls updateAndroidWidgetFromJS', async () => {
    const { result } = renderHook(() => useInteractiveWidget('testWidget'))

    const payload: AndroidWidgetPayload = { v: 1, variants: {} }

    await act(async () => {
      await result.current.updateWidget(payload)
    })

    expect(mockUpdateAndroidWidgetFromJS).toHaveBeenCalledWith('testWidget', payload)
  })

  test('uses latest onAction callback without re-subscribing', async () => {
    const mockOnAction1 = jest.fn().mockResolvedValue(undefined)
    const mockOnAction2 = jest.fn().mockResolvedValue(undefined)

    const { rerender } = renderHook(
      ({ onAction }) => useInteractiveWidget('testWidget', { onAction }),
      { initialProps: { onAction: mockOnAction1 } }
    )

    // Change the callback
    rerender({ onAction: mockOnAction2 })

    // Should not have re-subscribed (only initial subscription)
    expect(mockSubscribeToWidgetActions).toHaveBeenCalledTimes(1)

    // Trigger action
    const event: WidgetActionEvent = {
      type: 'widgetAction',
      widgetId: 'testWidget',
      actionName: 'test',
      componentId: 'btn1',
      timestamp: Date.now(),
    }

    await act(async () => {
      subscriptionCallback?.(event)
    })

    // Should use the new callback
    expect(mockOnAction1).not.toHaveBeenCalled()
    expect(mockOnAction2).toHaveBeenCalledWith(event)
  })
})

describe('useInteractiveWidget on non-Android platform', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    subscriptionCallback = null
    ;(Platform.OS as string) = 'ios'
  })

  afterEach(() => {
    ;(Platform.OS as string) = 'android'
  })

  test('does not subscribe on non-Android platform', () => {
    renderHook(() => useInteractiveWidget('testWidget'))

    expect(mockSubscribeToWidgetActions).not.toHaveBeenCalled()
  })

  test('updateWidget returns error on non-Android platform', async () => {
    const { result } = renderHook(() => useInteractiveWidget('testWidget'))

    const payload: AndroidWidgetPayload = { v: 1, variants: {} }

    let updateResult: { success: boolean; error?: string } | undefined
    await act(async () => {
      updateResult = await result.current.updateWidget(payload)
    })

    expect(updateResult?.success).toBe(false)
    expect(updateResult?.error).toContain('only supported on Android')
    expect(mockUpdateAndroidWidgetFromJS).not.toHaveBeenCalled()
  })
})
