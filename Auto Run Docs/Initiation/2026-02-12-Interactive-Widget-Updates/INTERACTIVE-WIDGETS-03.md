# Phase 03: JavaScript-Triggered Widget Updates

This phase adds the ability for JavaScript code to programmatically trigger widget updates. Combined with action callbacks from Phase 02, this creates a complete feedback loop where widget interactions can trigger JS logic that then updates the widget with new data.

## Tasks

- [x] Add updateWidget method to the native module:
  - In `VoltraModule.kt`, add a new method `updateWidgetFromJS(widgetId: String, jsonPayload: String, promise: Promise)`
  - Parse the JSON payload and write to SharedPreferences via VoltraWidgetManager
  - Trigger widget refresh after writing data
  - Return success/failure through the Promise
  - **Completed**: Added `updateWidgetFromJS` AsyncFunction in `VoltraModule.kt:178-203` that validates JSON, writes to SharedPreferences via `widgetManager.writeWidgetData()`, triggers refresh via `widgetManager.updateWidget()`, and returns `{success: true}` or `{success: false, error: string}`

- [x] Create TypeScript wrapper for widget updates:
  - Add `updateWidget(widgetId: string, payload: WidgetPayload)` function in `src/android/module.ts`
  - Type the payload properly to match existing widget data structures
  - Handle serialization to JSON before passing to native
  - **Completed**: Added `updateAndroidWidgetFromJS(widgetId, payload)` function in `src/android/widgets/api.ts:268-274`. Created types `AndroidWidgetPayload` and `UpdateAndroidWidgetFromJSResult`. Added `updateWidgetFromJS` to `VoltraModuleSpec` in `src/VoltraModule.ts:159-166`. Exported from `src/android/widgets/index.ts` and `src/android/client.ts`. Also exported `renderAndroidWidgetToJson` utility for creating payloads from JSX. Added 5 unit tests in `src/android/widgets/__tests__/update-widget-from-js.node.test.ts`.

- [x] Implement a widget update subscription system:
  - Add `subscribeToWidgetActions(widgetId: string, callback: (action: WidgetAction) => void)` in TypeScript
  - Use React Native's DeviceEventEmitter or NativeEventEmitter to listen for action events
  - In `VoltraRefreshAction.kt`, emit an event to JS when an action is triggered (not just store in SharedPreferences)
  - Add `VoltraEventEmitter` or use existing event infrastructure if available
  - **Completed**:
    - Created `WidgetActionEvent` class in `android/src/main/java/voltra/events/WidgetActionEvent.kt` that extends `VoltraEvent` with widgetId, actionName, componentId, and timestamp fields
    - Updated `VoltraRefreshAction.kt:56-69` to emit `WidgetActionEvent` via `VoltraEventBus` when a refresh action is triggered
    - Updated `VoltraEvent.kt:20-25` to parse `WidgetActionEvent` from map data in `fromMap()` method
    - Added `subscribeToWidgetActions(widgetId, callback)` function in `src/android/widgets/api.ts:340-393` that uses module-level subscription management to filter events by widgetId
    - Added `WidgetActionEvent` type exported from `src/android/widgets/api.ts:282-293`
    - Exported `subscribeToWidgetActions` and `WidgetActionEvent` from `src/android/widgets/index.ts` and `src/android/client.ts`
    - Added 10 unit tests in `src/android/widgets/__tests__/subscribe-to-widget-actions.node.test.ts` covering subscription setup, event dispatch, callback removal, error handling, and cross-platform behavior

- [x] Create a higher-level hook for interactive widgets:
  - Create `src/android/hooks/useInteractiveWidget.ts`
  - Hook signature: `useInteractiveWidget(widgetId: string, options?: { onAction?: (action) => Promise<WidgetData> })`
  - The hook should:
    - Subscribe to action events for the widgetId
    - Call the onAction callback when an action is triggered
    - Automatically update the widget with returned data
  - Export from main android entry point
  - **Completed**:
    - Created `useInteractiveWidget` hook in `src/android/hooks/useInteractiveWidget.ts` with signature `useInteractiveWidget(widgetId: string, options?: UseInteractiveWidgetOptions): UseInteractiveWidgetResult`
    - Hook subscribes to widget actions via `subscribeToWidgetActions`, calls the `onAction` callback when triggered, and automatically updates the widget with returned `AndroidWidgetPayload`
    - Uses refs to avoid re-subscribing when `onAction` changes, properly cleans up subscription on unmount
    - Returns `updateWidget(payload)` method for manual updates
    - Handles both async and sync `onAction` callbacks, logs errors for failed updates or callback exceptions
    - On non-Android platforms, skips subscription and `updateWidget` returns error
    - Created index file `src/android/hooks/index.ts` exporting the hook and types
    - Exported `useInteractiveWidget`, `UseInteractiveWidgetOptions`, `UseInteractiveWidgetResult` from `src/android/client.ts`
    - Added 14 unit tests in `src/android/hooks/__tests__/useInteractiveWidget.node.test.ts` covering subscription lifecycle, action handling, widget updates, error handling, callback changes, and cross-platform behavior

- [ ] Test the complete JS-triggered update flow:
  - Update example to use the new `useInteractiveWidget` hook
  - Verify that button presses in the widget trigger JS callbacks
  - Verify that returning new data from the callback updates the widget
  - Test with both increment/decrement scenarios
