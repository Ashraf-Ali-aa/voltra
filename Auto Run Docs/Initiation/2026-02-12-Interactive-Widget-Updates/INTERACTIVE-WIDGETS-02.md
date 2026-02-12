# Phase 02: Action Parameters and Event Communication

This phase extends the refresh action to support passing custom parameters back to JavaScript, enabling widgets to communicate which specific button was pressed. This allows developers to handle different button actions differently in their update logic.

## Tasks

- [x] Extend ActionCallback to support custom action names:
  - Update `VoltraRefreshAction.kt` to extract an `actionName` parameter alongside widgetId and componentId
  - Add ActionParameters.Key for actionName: `ActionParameters.Key<String>("actionName")`
  - Store the triggered action info in SharedPreferences under a dedicated key (e.g., `Voltra_Widget_LastAction_${widgetId}`)
  - Store a JSON object with `actionName`, `componentId`, and `timestamp`

  **Completed:** Added `ACTION_NAME_KEY` parameter and `storeLastAction()` method to `VoltraRefreshAction.kt`

- [x] Update `getOnClickAction` to pass actionName parameter:
  - Modify `RenderCommon.kt` to extract `actionName` prop from component props
  - Pass actionName through `actionParametersOf()` when creating the refresh action
  - Default actionName to componentId if not explicitly provided

  **Completed:** Updated `getOnClickAction` in `RenderCommon.kt` to pass `ACTION_NAME_KEY` with fallback to componentId

- [x] Add `actionName` prop to React component types:
  - Update `src/android/jsx/baseProps.tsx` to add `actionName?: string` to `VoltraAndroidBaseProps`
  - This allows developers to identify which button triggered the refresh

  **Completed:** Added `actionName?: string` with documentation to `VoltraAndroidBaseProps`

- [x] Create a JavaScript API to retrieve the last triggered action:
  - Add `getLastTriggeredAction(widgetId: string)` method to `VoltraModule.kt`
  - Return the stored action info (actionName, componentId, timestamp) as a Promise
  - Clear the stored action after reading (one-time read pattern)
  - Add corresponding TypeScript function in `src/android/module.ts`

  **Completed:** Added `getLastTriggeredAction` to `VoltraModule.kt`, `VoltraModule.ts`, `widgets/api.ts`, and exported from `client.ts`

- [x] Update example to demonstrate action-based updates:
  - Modify `example/widgets/AndroidVoltraWidget.tsx` to add multiple buttons:
    - "Increment" button with `actionName="increment"`
    - "Decrement" button with `actionName="decrement"`
    - "Reset" button with `actionName="reset"`
  - Update `example/widgets/updateAndroidVoltraWidget.tsx` to:
    - Call `getLastTriggeredAction()` to determine which button was pressed
    - Perform different updates based on actionName
    - Handle case where no action was triggered (regular update)

  **Completed:** Updated widget with increment (+), decrement (-), and reset buttons; update logic uses switch statement on actionName
