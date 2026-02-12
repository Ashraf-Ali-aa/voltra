# Phase 03: JavaScript-Triggered Widget Updates

This phase adds the ability for JavaScript code to programmatically trigger widget updates. Combined with action callbacks from Phase 02, this creates a complete feedback loop where widget interactions can trigger JS logic that then updates the widget with new data.

## Tasks

- [x] Add updateWidget method to the native module:
  - In `VoltraModule.kt`, add a new method `updateWidgetFromJS(widgetId: String, jsonPayload: String, promise: Promise)`
  - Parse the JSON payload and write to SharedPreferences via VoltraWidgetManager
  - Trigger widget refresh after writing data
  - Return success/failure through the Promise
  - **Completed**: Added `updateWidgetFromJS` AsyncFunction in `VoltraModule.kt:178-203` that validates JSON, writes to SharedPreferences via `widgetManager.writeWidgetData()`, triggers refresh via `widgetManager.updateWidget()`, and returns `{success: true}` or `{success: false, error: string}`

- [ ] Create TypeScript wrapper for widget updates:
  - Add `updateWidget(widgetId: string, payload: WidgetPayload)` function in `src/android/module.ts`
  - Type the payload properly to match existing widget data structures
  - Handle serialization to JSON before passing to native

- [ ] Implement a widget update subscription system:
  - Add `subscribeToWidgetActions(widgetId: string, callback: (action: WidgetAction) => void)` in TypeScript
  - Use React Native's DeviceEventEmitter or NativeEventEmitter to listen for action events
  - In `VoltraRefreshAction.kt`, emit an event to JS when an action is triggered (not just store in SharedPreferences)
  - Add `VoltraEventEmitter` or use existing event infrastructure if available

- [ ] Create a higher-level hook for interactive widgets:
  - Create `src/android/hooks/useInteractiveWidget.ts`
  - Hook signature: `useInteractiveWidget(widgetId: string, options?: { onAction?: (action) => Promise<WidgetData> })`
  - The hook should:
    - Subscribe to action events for the widgetId
    - Call the onAction callback when an action is triggered
    - Automatically update the widget with returned data
  - Export from main android entry point

- [ ] Test the complete JS-triggered update flow:
  - Update example to use the new `useInteractiveWidget` hook
  - Verify that button presses in the widget trigger JS callbacks
  - Verify that returning new data from the callback updates the widget
  - Test with both increment/decrement scenarios
