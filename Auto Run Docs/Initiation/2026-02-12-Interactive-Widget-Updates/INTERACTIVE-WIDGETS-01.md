# Phase 01: ActionCallback Foundation and Basic Refresh

This phase establishes the core infrastructure for interactive widget updates on Android. By the end of this phase, you'll have a working prototype where a button in an Android widget can trigger a refresh without opening the app. This is the foundational building block that makes widgets truly interactive.

## Tasks

- [x] Create the VoltraRefreshAction ActionCallback class in Kotlin:
  - Create new file `android/src/main/java/voltra/glance/actions/VoltraRefreshAction.kt`
  - Implement `ActionCallback` interface from `androidx.glance.appwidget.action`
  - In `onAction()`: extract widgetId from ActionParameters, call `VoltraWidgetManager.updateWidget(widgetId)` to refresh the widget
  - Use `ActionParameters.Key<String>("widgetId")` and `ActionParameters.Key<String>("componentId")` for parameter passing
  - Add logging for debugging action triggers
  - Ensure the action runs in a coroutine scope (use `CoroutineScope(Dispatchers.IO)`)

  **Completed:** Created `VoltraRefreshAction.kt` that implements the `ActionCallback` interface. The class extracts widgetId and componentId from `ActionParameters`, logs action triggers, and calls `VoltraWidgetManager.updateWidget()` in an IO coroutine scope.

- [ ] Update `getOnClickAction` function in `RenderCommon.kt` to support refresh actions:
  - Add a new parameter check for `actionType` prop (values: `"refresh"`, `"deepLink"`, or default to current behavior)
  - When `actionType === "refresh"`, return `actionRunCallback<VoltraRefreshAction>()` with widgetId and componentId parameters
  - Use `actionParametersOf()` to pass the widgetId and componentId to the callback
  - Keep existing deepLink behavior as default for backward compatibility
  - Import the new `VoltraRefreshAction` class

- [ ] Add `actionType` prop support to React components:
  - Update `src/android/jsx/baseProps.tsx` to add `actionType?: 'refresh' | 'deepLink'` to `VoltraAndroidBaseProps`
  - The prop will flow through existing serialization without additional changes needed

- [ ] Update the example widget to demonstrate interactive refresh:
  - Modify `example/widgets/AndroidVoltraWidget.tsx` to add a FilledButton with `actionType="refresh"`
  - Add a `count` prop to the widget and display it
  - Update `example/widgets/updateAndroidVoltraWidget.tsx` to increment count on each update
  - Store count in AsyncStorage or a simple state file that persists between updates

- [ ] Test the interactive widget refresh flow:
  - Build the example app for Android: `cd example && npx expo run:android`
  - Add the widget to home screen
  - Verify clicking the refresh button updates the widget without opening the app
  - Check logs for `VoltraRefreshAction` trigger events
