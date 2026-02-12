import { Platform } from 'react-native'

import type { WidgetActionEvent } from '../api'

// Create a fresh import of the module for each test suite
// by using jest.isolateModules

// Mock react-native Platform
jest.mock('react-native', () => ({
  Platform: {
    OS: 'android',
  },
}))

// Track addListener calls
const mockRemove = jest.fn()
let mockEventHandler: ((event: WidgetActionEvent) => void) | null = null
const mockAddListener = jest.fn().mockImplementation((_event: string, handler: (event: WidgetActionEvent) => void) => {
  mockEventHandler = handler
  return { remove: mockRemove }
})

// Mock VoltraModule
jest.mock('../../../VoltraModule', () => ({
  addListener: (...args: unknown[]) => mockAddListener(...args),
}))

describe('subscribeToWidgetActions', () => {
  // Import fresh for each test
  let subscribeToWidgetActions: typeof import('../api').subscribeToWidgetActions

  beforeEach(() => {
    jest.clearAllMocks()
    mockEventHandler = null
    // Re-import module to reset internal state
    jest.isolateModules(() => {
      const api = require('../api')
      subscribeToWidgetActions = api.subscribeToWidgetActions
    })
  })

  test('returns a subscription object with remove method', () => {
    const callback = jest.fn()
    const subscription = subscribeToWidgetActions('testWidget', callback)

    expect(subscription).toHaveProperty('remove')
    expect(typeof subscription.remove).toBe('function')

    // Clean up
    subscription.remove()
  })

  test('sets up global listener on first subscription', () => {
    const callback = jest.fn()
    subscribeToWidgetActions('testWidget', callback)

    expect(mockAddListener).toHaveBeenCalledWith('widgetAction', expect.any(Function))
  })

  test('only sets up one global listener for multiple subscriptions', () => {
    const callback1 = jest.fn()
    const callback2 = jest.fn()

    const sub1 = subscribeToWidgetActions('widget1', callback1)
    const sub2 = subscribeToWidgetActions('widget2', callback2)

    // Should only call addListener once
    expect(mockAddListener).toHaveBeenCalledTimes(1)

    // Clean up
    sub1.remove()
    sub2.remove()
  })

  test('dispatches events to correct widget subscribers', () => {
    const callback1 = jest.fn()
    const callback2 = jest.fn()

    subscribeToWidgetActions('widget1', callback1)
    subscribeToWidgetActions('widget2', callback2)

    // Simulate an event for widget1
    const event: WidgetActionEvent = {
      type: 'widgetAction',
      widgetId: 'widget1',
      actionName: 'increment',
      componentId: 'btn1',
      timestamp: Date.now(),
    }

    expect(mockEventHandler).not.toBeNull()
    mockEventHandler!(event)

    expect(callback1).toHaveBeenCalledWith(event)
    expect(callback2).not.toHaveBeenCalled()
  })

  test('allows multiple callbacks for the same widget', () => {
    const callback1 = jest.fn()
    const callback2 = jest.fn()

    subscribeToWidgetActions('widget1', callback1)
    subscribeToWidgetActions('widget1', callback2)

    // Simulate an event
    const event: WidgetActionEvent = {
      type: 'widgetAction',
      widgetId: 'widget1',
      actionName: 'test',
      componentId: 'btn1',
      timestamp: Date.now(),
    }

    expect(mockEventHandler).not.toBeNull()
    mockEventHandler!(event)

    expect(callback1).toHaveBeenCalledWith(event)
    expect(callback2).toHaveBeenCalledWith(event)
  })

  test('removes specific callback when subscription.remove() is called', () => {
    const callback1 = jest.fn()
    const callback2 = jest.fn()

    const sub1 = subscribeToWidgetActions('widget1', callback1)
    subscribeToWidgetActions('widget1', callback2)

    // Remove first subscription
    sub1.remove()

    // Simulate an event
    const event: WidgetActionEvent = {
      type: 'widgetAction',
      widgetId: 'widget1',
      actionName: 'test',
      componentId: 'btn1',
      timestamp: Date.now(),
    }

    expect(mockEventHandler).not.toBeNull()
    mockEventHandler!(event)

    expect(callback1).not.toHaveBeenCalled()
    expect(callback2).toHaveBeenCalledWith(event)
  })

  test('handles errors in callbacks gracefully', () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
    const errorCallback = jest.fn().mockImplementation(() => {
      throw new Error('Callback error')
    })
    const normalCallback = jest.fn()

    subscribeToWidgetActions('widget1', errorCallback)
    subscribeToWidgetActions('widget1', normalCallback)

    // Simulate an event - should not throw
    const event: WidgetActionEvent = {
      type: 'widgetAction',
      widgetId: 'widget1',
      actionName: 'test',
      componentId: 'btn1',
      timestamp: Date.now(),
    }

    expect(mockEventHandler).not.toBeNull()
    expect(() => mockEventHandler!(event)).not.toThrow()
    expect(consoleErrorSpy).toHaveBeenCalled()
    expect(normalCallback).toHaveBeenCalledWith(event)

    consoleErrorSpy.mockRestore()
  })

  test('ignores events for unsubscribed widgets', () => {
    const callback = jest.fn()
    subscribeToWidgetActions('widget1', callback)

    // Simulate an event for a different widget
    const event: WidgetActionEvent = {
      type: 'widgetAction',
      widgetId: 'widget2',
      actionName: 'test',
      componentId: 'btn1',
      timestamp: Date.now(),
    }

    expect(mockEventHandler).not.toBeNull()
    mockEventHandler!(event)

    expect(callback).not.toHaveBeenCalled()
  })

  test('removes global listener when all subscriptions are removed', () => {
    const callback = jest.fn()
    const subscription = subscribeToWidgetActions('widget1', callback)

    expect(mockAddListener).toHaveBeenCalledTimes(1)

    // Remove the subscription
    subscription.remove()

    // The mock's remove should have been called
    expect(mockRemove).toHaveBeenCalledTimes(1)
  })
})

describe('subscribeToWidgetActions on non-Android platform', () => {
  let subscribeToWidgetActions: typeof import('../api').subscribeToWidgetActions

  beforeEach(() => {
    jest.clearAllMocks()
    mockEventHandler = null
    // Override Platform.OS for this test suite
    ;(Platform.OS as string) = 'ios'
    // Re-import module to reset internal state
    jest.isolateModules(() => {
      const api = require('../api')
      subscribeToWidgetActions = api.subscribeToWidgetActions
    })
  })

  afterEach(() => {
    // Reset Platform.OS
    ;(Platform.OS as string) = 'android'
  })

  test('returns no-op subscription on non-Android', () => {
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation()
    const callback = jest.fn()

    const subscription = subscribeToWidgetActions('testWidget', callback)

    expect(consoleWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining('only supported on Android')
    )
    expect(mockAddListener).not.toHaveBeenCalled()

    // Calling remove should not throw
    expect(() => subscription.remove()).not.toThrow()

    consoleWarnSpy.mockRestore()
  })
})
