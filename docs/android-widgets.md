# Android Widgets

Voltra provides a powerful API for building Android home screen widgets using React Native JSX. Widgets are rendered using Jetpack Compose Glance, giving you native performance with a familiar development experience.

## Overview

Android widgets support:

- **Static content**: Display information like weather, calendar events, or quick stats
- **Deep links**: Tap to open specific screens in your app
- **Interactive widgets**: Buttons that update the widget without opening the app

## Interactive Widgets

Interactive widgets let users interact with buttons directly on the home screen. When a button with `actionType="refresh"` is pressed, the widget triggers a refresh action that your JavaScript code can respond to and update the widget with new content.

### Key Concepts

| Concept | Description |
|---------|-------------|
| `actionType` | Determines what happens when a component is pressed: `'refresh'` (updates widget) or `'deepLink'` (opens app) |
| `actionName` | Custom identifier for the button, used to distinguish between multiple buttons |
| `useInteractiveWidget` | React hook that subscribes to widget actions and handles updates automatically |
| `subscribeToWidgetActions` | Lower-level function for subscribing to widget action events |
| `updateAndroidWidgetFromJS` | Function to programmatically update a widget with new content |

### The `actionType` Prop

The `actionType` prop controls what happens when a touchable component is pressed:

```tsx
// Opens the app with a deep link (default behavior when deepLinkUrl is set)
<VoltraAndroid.FilledButton
  text="Open Details"
  actionType="deepLink"
  deepLinkUrl="/details/123"
/>

// Triggers a widget refresh without opening the app
<VoltraAndroid.FilledButton
  text="Refresh"
  actionType="refresh"
  actionName="refresh_data"
/>
```

**Values:**
- `'deepLink'` - Opens the app with the specified `deepLinkUrl`. This is the default behavior when `deepLinkUrl` is set.
- `'refresh'` - Triggers a widget refresh action that your JavaScript code can respond to, without opening the app.

### The `actionName` Prop

The `actionName` prop identifies which button was pressed when handling refresh actions. This is essential when your widget has multiple buttons:

```tsx
<VoltraAndroid.Row style={{ gap: 8 }}>
  <VoltraAndroid.FilledButton
    text="-"
    actionType="refresh"
    actionName="decrement"
  />
  <VoltraAndroid.FilledButton
    text="Reset"
    actionType="refresh"
    actionName="reset"
  />
  <VoltraAndroid.FilledButton
    text="+"
    actionType="refresh"
    actionName="increment"
  />
</VoltraAndroid.Row>
```

If `actionName` is not provided, it defaults to the component's `id` prop.

## Using the `useInteractiveWidget` Hook

The `useInteractiveWidget` hook is the recommended way to handle interactive widgets. It automatically subscribes to widget action events and updates the widget with the data returned from your callback.

### Basic Usage

```tsx
import { useInteractiveWidget, renderAndroidWidgetToJson } from 'voltra/android/client'
import { useState } from 'react'

const CounterWidget = ({ count }: { count: number }) => (
  <VoltraAndroid.Column style={{ padding: 16 }}>
    <VoltraAndroid.Text style={{ fontSize: 32 }}>{count}</VoltraAndroid.Text>
    <VoltraAndroid.Row style={{ gap: 8 }}>
      <VoltraAndroid.FilledButton actionType="refresh" actionName="decrement" text="-" />
      <VoltraAndroid.FilledButton actionType="refresh" actionName="increment" text="+" />
    </VoltraAndroid.Row>
  </VoltraAndroid.Column>
)

function MyScreen() {
  const [count, setCount] = useState(0)

  useInteractiveWidget('counter', {
    onAction: async (action) => {
      let newCount = count

      switch (action.actionName) {
        case 'increment':
          newCount = count + 1
          break
        case 'decrement':
          newCount = count - 1
          break
      }

      setCount(newCount)

      // Return the new widget payload - the hook automatically updates the widget
      return renderAndroidWidgetToJson([
        { size: { width: 150, height: 100 }, content: <CounterWidget count={newCount} /> }
      ])
    }
  })

  return <View>{/* Your screen content */}</View>
}
```

### Hook Parameters

```tsx
useInteractiveWidget(widgetId: string, options?: UseInteractiveWidgetOptions): UseInteractiveWidgetResult
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `widgetId` | `string` | The widget identifier to subscribe to |
| `options.onAction` | `(action: WidgetActionEvent) => Promise<AndroidWidgetPayload \| void>` | Callback invoked when a widget action is triggered. Return a payload to update the widget. |

### Return Value

The hook returns an object with:

| Property | Type | Description |
|----------|------|-------------|
| `updateWidget` | `(payload: AndroidWidgetPayload) => Promise<{ success: boolean; error?: string }>` | Function to manually update the widget |

### Action Event Object

The `onAction` callback receives a `WidgetActionEvent` object:

```tsx
type WidgetActionEvent = {
  type: 'widgetAction'           // Event type identifier
  widgetId: string               // The widget ID that triggered the action
  actionName: string             // The action name (from actionName prop)
  componentId: string            // The component ID that triggered the action
  timestamp: number              // Unix timestamp in milliseconds
}
```

### Manual Updates

You can also update the widget manually using the `updateWidget` function:

```tsx
const { updateWidget } = useInteractiveWidget('myWidget')

// Later, update the widget programmatically
const handleRefresh = async () => {
  const payload = renderAndroidWidgetToJson([
    { size: { width: 150, height: 100 }, content: <MyWidget data={newData} /> }
  ])

  const result = await updateWidget(payload)
  if (!result.success) {
    console.error('Failed to update widget:', result.error)
  }
}
```

## Code Examples

### Simple Refresh Button

A widget with a single button that refreshes its content:

```tsx
import { VoltraAndroid } from 'voltra/android'
import { useInteractiveWidget, renderAndroidWidgetToJson } from 'voltra/android/client'

const TimeWidget = ({ time }: { time: string }) => (
  <VoltraAndroid.Column style={{ padding: 16, backgroundColor: '#FFFFFF' }}>
    <VoltraAndroid.Text>Last updated:</VoltraAndroid.Text>
    <VoltraAndroid.Text style={{ fontSize: 18, fontWeight: 'bold' }}>{time}</VoltraAndroid.Text>
    <VoltraAndroid.Spacer style={{ height: 12 }} />
    <VoltraAndroid.FilledButton
      text="Refresh"
      actionType="refresh"
      actionName="refresh_time"
      backgroundColor="#007AFF"
    />
  </VoltraAndroid.Column>
)

function TimeWidgetHandler() {
  useInteractiveWidget('time', {
    onAction: async () => {
      const newTime = new Date().toLocaleTimeString()

      return renderAndroidWidgetToJson([
        { size: { width: 150, height: 120 }, content: <TimeWidget time={newTime} /> }
      ])
    }
  })

  return null
}
```

### Multiple Buttons with Different Actions

A counter widget with increment, decrement, and reset buttons:

```tsx
import { VoltraAndroid } from 'voltra/android'
import { useInteractiveWidget, renderAndroidWidgetToJson } from 'voltra/android/client'
import { useState } from 'react'

const CounterWidget = ({ count }: { count: number }) => (
  <VoltraAndroid.Column
    style={{ padding: 16, backgroundColor: '#FFFFFF', width: '100%', height: '100%' }}
    horizontalAlignment="center-horizontally"
    verticalAlignment="center-vertically"
  >
    <VoltraAndroid.Text style={{ fontSize: 48, fontWeight: 'bold' }}>{count}</VoltraAndroid.Text>
    <VoltraAndroid.Spacer style={{ height: 16 }} />
    <VoltraAndroid.Row style={{ gap: 8 }}>
      <VoltraAndroid.FilledButton
        text="-"
        actionType="refresh"
        actionName="decrement"
        backgroundColor="#EF4444"
        contentColor="#FFFFFF"
      />
      <VoltraAndroid.FilledButton
        text="Reset"
        actionType="refresh"
        actionName="reset"
        backgroundColor="#6B7280"
        contentColor="#FFFFFF"
      />
      <VoltraAndroid.FilledButton
        text="+"
        actionType="refresh"
        actionName="increment"
        backgroundColor="#22C55E"
        contentColor="#FFFFFF"
      />
    </VoltraAndroid.Row>
  </VoltraAndroid.Column>
)

function CounterWidgetHandler() {
  const [count, setCount] = useState(0)

  useInteractiveWidget('counter', {
    onAction: async (action) => {
      let newCount = count

      switch (action.actionName) {
        case 'increment':
          newCount = count + 1
          break
        case 'decrement':
          newCount = count - 1
          break
        case 'reset':
          newCount = 0
          break
        default:
          return // Unknown action, don't update
      }

      setCount(newCount)

      return renderAndroidWidgetToJson([
        { size: { width: 200, height: 150 }, content: <CounterWidget count={newCount} /> }
      ])
    }
  })

  return null
}
```

### Combining Refresh and Deep Link Actions

A widget that can both update itself and navigate to the app:

```tsx
const TaskWidget = ({ taskName, isComplete }: { taskName: string; isComplete: boolean }) => (
  <VoltraAndroid.Column style={{ padding: 16, backgroundColor: '#FFFFFF' }}>
    <VoltraAndroid.Text style={{ fontSize: 16 }}>{taskName}</VoltraAndroid.Text>
    <VoltraAndroid.Text style={{ color: isComplete ? '#22C55E' : '#EF4444' }}>
      {isComplete ? '✓ Complete' : '○ Pending'}
    </VoltraAndroid.Text>
    <VoltraAndroid.Spacer style={{ height: 12 }} />
    <VoltraAndroid.Row style={{ gap: 8 }}>
      {/* Toggle completion without opening app */}
      <VoltraAndroid.FilledButton
        text={isComplete ? 'Undo' : 'Complete'}
        actionType="refresh"
        actionName="toggle_complete"
        backgroundColor="#007AFF"
      />
      {/* Open task details in app */}
      <VoltraAndroid.FilledButton
        text="Details"
        actionType="deepLink"
        deepLinkUrl="/tasks/123"
        backgroundColor="#6B7280"
      />
    </VoltraAndroid.Row>
  </VoltraAndroid.Column>
)
```

## Lower-Level API

For more control, you can use the lower-level `subscribeToWidgetActions` and `updateAndroidWidgetFromJS` functions directly:

```tsx
import {
  subscribeToWidgetActions,
  updateAndroidWidgetFromJS,
  renderAndroidWidgetToJson
} from 'voltra/android/client'
import { useEffect } from 'react'

function MyComponent() {
  useEffect(() => {
    const subscription = subscribeToWidgetActions('myWidget', async (action) => {
      console.log('Widget action received:', action.actionName)

      // Compute new data based on action
      const newData = computeNewData(action)

      // Update the widget
      const payload = renderAndroidWidgetToJson([
        { size: { width: 150, height: 100 }, content: <MyWidget data={newData} /> }
      ])

      const result = await updateAndroidWidgetFromJS('myWidget', payload)
      if (!result.success) {
        console.error('Update failed:', result.error)
      }
    })

    return () => subscription.remove()
  }, [])

  return <View>{/* ... */}</View>
}
```

### `getLastTriggeredAction`

For one-time reads of the last triggered action (useful in widget update callbacks):

```tsx
import { getLastTriggeredAction } from 'voltra/android/client'

const action = await getLastTriggeredAction('myWidget')
if (action) {
  console.log('Last action:', action.actionName)
  console.log('Triggered at:', new Date(action.timestamp))
}
```

## Troubleshooting

### Widget not updating after button press

1. **App must be running**: The `useInteractiveWidget` hook only works when your app is running (foreground or background). If the app is killed, widget actions will be queued but won't be processed until the app starts.

2. **Check widget ID**: Ensure the `widgetId` in your hook matches the widget ID configured in your app.

3. **Verify actionType**: Make sure buttons have `actionType="refresh"` set.

4. **Check for errors**: The hook logs errors to the console. Check for any error messages.

### Actions not being received

1. **Platform check**: Interactive widgets are only supported on Android. The hook returns a no-op on other platforms.

2. **Multiple subscriptions**: If you have multiple components subscribing to the same widget, all callbacks will be invoked. Consider centralizing your widget handling logic.

3. **Callback errors**: If your `onAction` callback throws an error, it's caught and logged but won't prevent other callbacks from running.

### Widget shows stale data

1. **State synchronization**: Make sure your local state matches what's displayed on the widget. The widget only updates when you return a new payload from `onAction`.

2. **Closure issues**: If your `onAction` callback captures stale state, use refs or ensure the callback is properly memoized with updated dependencies.

### Error: "Widget update failed"

1. **Invalid payload**: Ensure `renderAndroidWidgetToJson` is called with valid widget variants.

2. **Widget not configured**: The widget must be properly configured in your native code and `voltra.json`.

3. **SharedPreferences issues**: In rare cases, storage errors can occur. The error message will indicate the specific issue.

## Best Practices

1. **Keep widgets responsive**: Return from `onAction` as quickly as possible. For heavy computations, update the widget first with a loading state, then update again when data is ready.

2. **Handle all action names**: Use a `switch` statement or object lookup to handle different `actionName` values, with a default case for unknown actions.

3. **Persist state**: Widget state should typically be persisted (AsyncStorage, database, etc.) so it survives app restarts.

4. **Test on device**: Widget interactions behave differently in emulators. Always test on a real device.

5. **Centralize widget logic**: Keep widget update logic in a single component or service to avoid conflicts between multiple subscriptions.
