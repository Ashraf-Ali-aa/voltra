import { useCallback, useEffect, useRef } from 'react'
import { Platform } from 'react-native'

import type { AndroidWidgetPayload, WidgetActionEvent } from '../widgets/api.js'
import { subscribeToWidgetActions, updateAndroidWidgetFromJS } from '../widgets/api.js'

/**
 * Options for the useInteractiveWidget hook.
 */
export type UseInteractiveWidgetOptions = {
  /**
   * Callback invoked when a widget action is triggered.
   * The returned data will be used to update the widget.
   *
   * @param action - The action event containing widgetId, actionName, componentId, and timestamp
   * @returns Promise resolving to the new widget payload to render, or void/undefined to skip updating
   */
  onAction?: (action: WidgetActionEvent) => Promise<AndroidWidgetPayload | void> | AndroidWidgetPayload | void
}

/**
 * Result returned by the useInteractiveWidget hook.
 */
export type UseInteractiveWidgetResult = {
  /**
   * Manually update the widget with new data.
   * @param payload - The widget payload to render
   * @returns Promise resolving to success status
   */
  updateWidget: (payload: AndroidWidgetPayload) => Promise<{ success: boolean; error?: string }>
}

/**
 * React hook for creating interactive Android widgets with automatic action handling.
 *
 * This hook combines `subscribeToWidgetActions` and `updateAndroidWidgetFromJS` to create
 * a seamless feedback loop where widget button presses trigger JavaScript callbacks that
 * can return new data to update the widget.
 *
 * @param widgetId - The widget identifier to subscribe to
 * @param options - Optional configuration including the onAction callback
 * @returns Object with updateWidget method for manual updates
 *
 * @example Counter widget with increment/decrement
 * ```tsx
 * import { useInteractiveWidget, renderAndroidWidgetToJson, VoltraAndroid } from 'voltra'
 * import { useState } from 'react'
 *
 * const CounterWidget = ({ count }: { count: number }) => (
 *   <VoltraAndroid.Column>
 *     <VoltraAndroid.Text fontSize={32}>{count}</VoltraAndroid.Text>
 *     <VoltraAndroid.Row>
 *       <VoltraAndroid.Button actionType="refresh" actionName="decrement" text="-" />
 *       <VoltraAndroid.Button actionType="refresh" actionName="increment" text="+" />
 *     </VoltraAndroid.Row>
 *   </VoltraAndroid.Column>
 * )
 *
 * const MyComponent = () => {
 *   const [count, setCount] = useState(0)
 *
 *   useInteractiveWidget('counter', {
 *     onAction: async (action) => {
 *       let newCount = count
 *       if (action.actionName === 'increment') {
 *         newCount = count + 1
 *       } else if (action.actionName === 'decrement') {
 *         newCount = count - 1
 *       }
 *       setCount(newCount)
 *
 *       return renderAndroidWidgetToJson([
 *         { size: { width: 150, height: 100 }, content: <CounterWidget count={newCount} /> }
 *       ])
 *     }
 *   })
 *
 *   return <View>...</View>
 * }
 * ```
 *
 * @example With manual updates
 * ```tsx
 * const { updateWidget } = useInteractiveWidget('myWidget')
 *
 * // Later, manually update the widget
 * const result = await updateWidget(renderAndroidWidgetToJson([
 *   { size: { width: 150, height: 100 }, content: <MyWidget data={newData} /> }
 * ]))
 *
 * if (!result.success) {
 *   console.error('Failed to update widget:', result.error)
 * }
 * ```
 */
export const useInteractiveWidget = (
  widgetId: string,
  options?: UseInteractiveWidgetOptions
): UseInteractiveWidgetResult => {
  // Use ref to avoid re-subscribing when onAction changes
  const optionsRef = useRef(options)
  useEffect(() => {
    optionsRef.current = options
  }, [options])

  // Subscribe to widget actions
  useEffect(() => {
    if (Platform.OS !== 'android') {
      return
    }

    const subscription = subscribeToWidgetActions(widgetId, async (action) => {
      const onAction = optionsRef.current?.onAction
      if (!onAction) {
        return
      }

      try {
        const payload = await onAction(action)
        if (payload) {
          const result = await updateAndroidWidgetFromJS(widgetId, payload)
          if (!result.success) {
            console.error('[Voltra] useInteractiveWidget: Failed to update widget:', result.error)
          }
        }
      } catch (error) {
        console.error('[Voltra] useInteractiveWidget: Error in onAction callback:', error)
      }
    })

    return () => {
      subscription.remove()
    }
  }, [widgetId])

  // Manual update function
  const updateWidget = useCallback(
    async (payload: AndroidWidgetPayload) => {
      if (Platform.OS !== 'android') {
        return { success: false, error: 'useInteractiveWidget is only supported on Android' }
      }
      return updateAndroidWidgetFromJS(widgetId, payload)
    },
    [widgetId]
  )

  return {
    updateWidget,
  }
}
