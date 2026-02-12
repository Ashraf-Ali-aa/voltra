import { Platform } from 'react-native'

import type { EventSubscription } from '../../types.js'
import VoltraModule from '../../VoltraModule.js'
import { renderAndroidWidgetToString } from './renderer.js'
import type { AndroidWidgetVariants, UpdateAndroidWidgetOptions, WidgetInfo } from './types.js'

// Re-export types for public API
export type {
  AndroidWidgetSize,
  AndroidWidgetSizeVariant,
  AndroidWidgetVariants,
  UpdateAndroidWidgetOptions,
  WidgetInfo,
} from './types.js'

/**
 * Update an Android home screen widget with new content.
 *
 * The content will be stored in SharedPreferences and the widget
 * will be updated to display the new content.
 *
 * @param widgetId - The widget identifier
 * @param variants - An array of size variants with their breakpoints and content.
 *   Android will automatically select the best matching variant based on the
 *   actual widget dimensions.
 * @param options - Optional settings like deep link URL
 *
 * @example Different content per size
 * ```tsx
 * import { VoltraAndroid, updateAndroidWidget } from 'voltra'
 *
 * await updateAndroidWidget('weather', [
 *   {
 *     size: { width: 150, height: 100 },
 *     content: <VoltraAndroid.Text fontSize={32}>72°F</VoltraAndroid.Text>
 *   },
 *   {
 *     size: { width: 250, height: 150 },
 *     content: (
 *       <VoltraAndroid.Row>
 *         <VoltraAndroid.Text fontSize={32}>72°F</VoltraAndroid.Text>
 *         <VoltraAndroid.Column>
 *           <VoltraAndroid.Text>Sunny</VoltraAndroid.Text>
 *           <VoltraAndroid.Text>High: 78° Low: 65°</VoltraAndroid.Text>
 *         </VoltraAndroid.Column>
 *       </VoltraAndroid.Row>
 *     )
 *   }
 * ], { deepLinkUrl: '/weather' })
 * ```
 */
export const updateAndroidWidget = async (
  widgetId: string,
  variants: AndroidWidgetVariants,
  options?: UpdateAndroidWidgetOptions
): Promise<void> => {
  const payload = renderAndroidWidgetToString(variants)

  return VoltraModule.updateAndroidWidget(widgetId, payload, {
    deepLinkUrl: options?.deepLinkUrl,
  })
}

/**
 * Reload widget timelines to refresh their content.
 *
 * Use this after updating data that widgets depend on (e.g., after preloading
 * new images) to force them to re-render.
 *
 * @param widgetIds - Optional array of widget IDs to reload. If omitted, reloads all widgets.
 *
 * @example
 * ```typescript
 * // Reload specific widgets
 * await reloadAndroidWidgets(['weather', 'calendar'])
 *
 * // Reload all widgets
 * await reloadAndroidWidgets()
 * ```
 */
export const reloadAndroidWidgets = async (widgetIds?: string[]): Promise<void> => {
  return VoltraModule.reloadAndroidWidgets(widgetIds ?? null)
}

/**
 * Clear a widget's stored data.
 *
 * This removes the JSON content and deep link URL for the specified widget,
 * causing it to show its placeholder state.
 *
 * @param widgetId - The widget identifier to clear
 *
 * @example
 * ```typescript
 * await clearAndroidWidget('weather')
 * ```
 */
export const clearAndroidWidget = async (widgetId: string): Promise<void> => {
  return VoltraModule.clearAndroidWidget(widgetId)
}

/**
 * Clear all widgets' stored data.
 *
 * This removes the JSON content and deep link URLs for all configured widgets,
 * causing them to show their placeholder states.
 *
 * @example
 * ```typescript
 * await clearAllAndroidWidgets()
 * ```
 */
export const clearAllAndroidWidgets = async (): Promise<void> => {
  return VoltraModule.clearAllAndroidWidgets()
}

/**
 * Request to pin a widget to the home screen.
 *
 * This will show the Android system pin widget dialog, allowing the user
 * to add the widget to their home screen. Optionally, you can provide
 * preview dimensions to show a preview of the widget in the pin dialog.
 *
 * See: https://developer.android.com/develop/ui/compose/glance/pin-in-app
 *
 * @param widgetId - The widget identifier to pin
 * @param options - Optional settings for the pin request
 * @param options.previewWidth - Optional preview width in dp (default: 245)
 * @param options.previewHeight - Optional preview height in dp (default: 115)
 * @returns Promise that resolves to true if the pin request was successful
 *
 * @example Basic usage
 * ```typescript
 * const success = await requestPinAndroidWidget('weather')
 * if (success) {
 *   console.log('Widget pin request sent')
 * }
 * ```
 *
 * @example With preview dimensions
 * ```typescript
 * const success = await requestPinAndroidWidget('weather', {
 *   previewWidth: 245,
 *   previewHeight: 115
 * })
 * ```
 */
export const requestPinAndroidWidget = async (
  widgetId: string,
  options?: { previewWidth?: number; previewHeight?: number }
): Promise<boolean> => {
  return VoltraModule.requestPinGlanceAppWidget(widgetId, options)
}

/**
 * Fetches all active widget instances for the containing app on Android.
 *
 * @returns A promise that resolves to an array of active widget instances.
 *
 * @example
 * ```typescript
 * const widgets = await getActiveWidgets()
 * console.log('Active widgets:', widgets)
 * ```
 */
export const getActiveWidgets = async (): Promise<WidgetInfo[]> => {
  return VoltraModule.getActiveWidgets()
}

/**
 * Information about the last triggered action on a widget.
 */
export type TriggeredActionInfo = {
  /** The action name that was triggered (from the actionName prop) */
  actionName: string
  /** The component ID that triggered the action */
  componentId: string
  /** Unix timestamp in milliseconds when the action was triggered */
  timestamp: number
}

/**
 * Get the last triggered action for a widget.
 *
 * When a button with `actionType="refresh"` is pressed, the action info is stored.
 * This function retrieves and clears that stored action (one-time read pattern).
 *
 * Use this in your widget update function to determine which button was pressed
 * and perform different updates accordingly.
 *
 * @param widgetId - The widget identifier
 * @returns Promise that resolves to the action info or null if no action was triggered
 *
 * @example
 * ```typescript
 * const action = await getLastTriggeredAction('myWidget')
 * if (action) {
 *   switch (action.actionName) {
 *     case 'increment':
 *       count += 1
 *       break
 *     case 'decrement':
 *       count -= 1
 *       break
 *     case 'reset':
 *       count = 0
 *       break
 *   }
 * }
 * ```
 */
export const getLastTriggeredAction = async (widgetId: string): Promise<TriggeredActionInfo | null> => {
  return VoltraModule.getLastTriggeredAction(widgetId)
}

/**
 * Payload for updating an Android widget from JavaScript.
 * This represents the serializable widget data structure.
 */
export type AndroidWidgetPayload = {
  /** Version of the payload format (typically 1) */
  v?: number
  /** Size variants mapping size keys to rendered node trees */
  variants: Record<string, unknown>
  /** Shared styles array (optional) */
  s?: unknown[]
  /** Shared elements array (optional) */
  e?: unknown[]
}

/**
 * Result from updating a widget from JavaScript.
 */
export type UpdateAndroidWidgetFromJSResult = {
  /** Whether the update was successful */
  success: boolean
  /** Error message if the update failed */
  error?: string
}

/**
 * Update an Android widget from JavaScript with a payload object.
 *
 * This function allows programmatic widget updates triggered by JS code,
 * such as responding to widget action callbacks. Use this when you need
 * to update a widget with new data computed in JavaScript.
 *
 * For JSX-based updates, use `updateAndroidWidget` instead.
 *
 * @param widgetId - The widget identifier
 * @param payload - The widget payload to send to the native module
 * @returns Promise that resolves to a result indicating success or failure
 *
 * @example
 * ```typescript
 * import { updateAndroidWidgetFromJS, renderAndroidWidgetToJson } from 'voltra/android/widgets'
 *
 * // Create payload from JSX
 * const payload = renderAndroidWidgetToJson([
 *   { size: { width: 150, height: 100 }, content: <MyWidget count={newCount} /> }
 * ])
 *
 * // Update the widget
 * const result = await updateAndroidWidgetFromJS('myWidget', payload)
 * if (!result.success) {
 *   console.error('Failed to update widget:', result.error)
 * }
 * ```
 */
export const updateAndroidWidgetFromJS = async (
  widgetId: string,
  payload: AndroidWidgetPayload
): Promise<UpdateAndroidWidgetFromJSResult> => {
  const jsonPayload = JSON.stringify(payload)
  return VoltraModule.updateWidgetFromJS(widgetId, jsonPayload)
}

/**
 * Event emitted when a widget action is triggered.
 */
export type WidgetActionEvent = {
  /** Event type identifier */
  type: 'widgetAction'
  /** The widget ID that triggered the action */
  widgetId: string
  /** The action name (from actionName prop or componentId) */
  actionName: string
  /** The component ID that triggered the action */
  componentId: string
  /** Unix timestamp in milliseconds when the action was triggered */
  timestamp: number
}

const noopSubscription: EventSubscription = {
  remove: () => {},
}

// Store subscriptions by widgetId for filtering
const widgetSubscriptions = new Map<string, Set<(action: WidgetActionEvent) => void>>()
let globalSubscription: EventSubscription | null = null

/**
 * Subscribe to widget action events for a specific widget.
 *
 * When a button with `actionType="refresh"` is pressed on the widget,
 * the callback will be invoked with information about the action.
 *
 * This enables reactive widget updates from JavaScript - you can respond
 * to user interactions and update the widget in real-time.
 *
 * @param widgetId - The widget ID to subscribe to
 * @param callback - Function called when an action is triggered on the widget
 * @returns EventSubscription with a remove() method to unsubscribe
 *
 * @example
 * ```typescript
 * import { subscribeToWidgetActions, updateAndroidWidgetFromJS, renderAndroidWidgetToJson } from 'voltra/android/widgets'
 *
 * let count = 0
 *
 * const subscription = subscribeToWidgetActions('counter', async (action) => {
 *   if (action.actionName === 'increment') {
 *     count++
 *   } else if (action.actionName === 'decrement') {
 *     count--
 *   }
 *
 *   // Update the widget with new count
 *   const payload = renderAndroidWidgetToJson([
 *     { size: { width: 150, height: 100 }, content: <CounterWidget count={count} /> }
 *   ])
 *   await updateAndroidWidgetFromJS('counter', payload)
 * })
 *
 * // Later: unsubscribe
 * subscription.remove()
 * ```
 */
export const subscribeToWidgetActions = (
  widgetId: string,
  callback: (action: WidgetActionEvent) => void
): EventSubscription => {
  if (Platform.OS !== 'android') {
    console.warn('[Voltra] subscribeToWidgetActions is only supported on Android. Returning no-op subscription.')
    return noopSubscription
  }

  // Get or create the set of callbacks for this widget
  if (!widgetSubscriptions.has(widgetId)) {
    widgetSubscriptions.set(widgetId, new Set())
  }
  const callbacks = widgetSubscriptions.get(widgetId)!
  callbacks.add(callback)

  // Set up the global listener if not already active
  if (!globalSubscription) {
    globalSubscription = VoltraModule.addListener('widgetAction', (event: WidgetActionEvent) => {
      const targetCallbacks = widgetSubscriptions.get(event.widgetId)
      if (targetCallbacks) {
        targetCallbacks.forEach((cb) => {
          try {
            cb(event)
          } catch (error) {
            console.error('[Voltra] Error in widget action callback:', error)
          }
        })
      }
    })
  }

  // Return a subscription that removes this specific callback
  return {
    remove: () => {
      callbacks.delete(callback)

      // Clean up empty sets
      if (callbacks.size === 0) {
        widgetSubscriptions.delete(widgetId)
      }

      // Remove global listener if no more subscriptions
      if (widgetSubscriptions.size === 0 && globalSubscription) {
        globalSubscription.remove()
        globalSubscription = null
      }
    },
  }
}
