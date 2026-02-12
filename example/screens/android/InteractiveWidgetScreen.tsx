import { useRouter } from 'expo-router'
import React, { useCallback, useState } from 'react'
import { Platform, ScrollView, StyleSheet, Text, View } from 'react-native'
import { renderAndroidWidgetToJson, useInteractiveWidget, type WidgetActionEvent } from 'voltra/android/client'

import { Button } from '~/components/Button'
import { Card } from '~/components/Card'
import { AndroidVoltraWidget } from '~/widgets/AndroidVoltraWidget'

/**
 * Screen demonstrating the useInteractiveWidget hook for reactive widget updates.
 *
 * This screen tests the complete JS-triggered update flow:
 * 1. Subscribe to widget action events via the hook
 * 2. Handle increment/decrement/reset button presses from the widget
 * 3. Automatically update the widget with new data from the callback
 */
export default function InteractiveWidgetScreen() {
  const router = useRouter()
  const [count, setCount] = useState(0)
  const [lastAction, setLastAction] = useState<WidgetActionEvent | null>(null)
  const [actionLog, setActionLog] = useState<string[]>([])
  const [isListening, setIsListening] = useState(true)

  // Log helper function
  const addLog = useCallback((message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setActionLog((prev) => [`[${timestamp}] ${message}`, ...prev.slice(0, 19)])
  }, [])

  // Create the onAction handler for the hook
  const onAction = useCallback(
    async (action: WidgetActionEvent) => {
      addLog(`Received action: ${action.actionName} (componentId: ${action.componentId})`)
      setLastAction(action)

      let newCount = count
      switch (action.actionName) {
        case 'increment':
          newCount = count + 1
          addLog(`Incrementing count: ${count} -> ${newCount}`)
          break
        case 'decrement':
          newCount = count - 1
          addLog(`Decrementing count: ${count} -> ${newCount}`)
          break
        case 'reset':
          newCount = 0
          addLog(`Resetting count to 0`)
          break
        default:
          addLog(`Unknown action: ${action.actionName}`)
          return undefined
      }

      setCount(newCount)

      // Return the new widget payload - the hook will automatically update the widget
      const payload = renderAndroidWidgetToJson([
        {
          size: { width: 250, height: 200 },
          content: <AndroidVoltraWidget time={new Date().toLocaleString()} count={newCount} />,
        },
      ])

      addLog(`Returning updated widget payload with count: ${newCount}`)
      return payload
    },
    [count, addLog]
  )

  // Use the interactive widget hook - it handles subscription and updates automatically
  const { updateWidget } = useInteractiveWidget('voltra', isListening ? { onAction } : undefined)

  // Manual update function for testing
  const handleManualUpdate = useCallback(async () => {
    addLog(`Manual update triggered with count: ${count}`)

    const payload = renderAndroidWidgetToJson([
      {
        size: { width: 250, height: 200 },
        content: <AndroidVoltraWidget time={new Date().toLocaleString()} count={count} />,
      },
    ])

    const result = await updateWidget(payload)
    if (result.success) {
      addLog('Manual update succeeded')
    } else {
      addLog(`Manual update failed: ${result.error}`)
    }
  }, [count, updateWidget, addLog])

  // Toggle listening on/off
  const handleToggleListening = useCallback(() => {
    setIsListening((prev) => {
      const newState = !prev
      addLog(newState ? 'Started listening for widget actions' : 'Stopped listening for widget actions')
      return newState
    })
  }, [addLog])

  // Clear the log
  const handleClearLog = useCallback(() => {
    setActionLog([])
    setLastAction(null)
  }, [])

  // Adjust count locally (for testing)
  const handleLocalIncrement = useCallback(() => {
    setCount((prev) => prev + 1)
    addLog('Local count incremented (widget not updated)')
  }, [addLog])

  const handleLocalDecrement = useCallback(() => {
    setCount((prev) => prev - 1)
    addLog('Local count decremented (widget not updated)')
  }, [addLog])

  const handleLocalReset = useCallback(() => {
    setCount(0)
    addLog('Local count reset (widget not updated)')
  }, [addLog])

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <Text style={styles.heading}>Interactive Widget Hook</Text>
        <Text style={styles.subheading}>
          Test the useInteractiveWidget hook that subscribes to widget actions and automatically updates the widget with
          returned data.
        </Text>

        <Card>
          <Card.Title>Current State</Card.Title>
          <View style={styles.stateRow}>
            <Text style={styles.stateLabel}>Platform:</Text>
            <Text style={styles.stateValue}>{Platform.OS}</Text>
          </View>
          <View style={styles.stateRow}>
            <Text style={styles.stateLabel}>Listening:</Text>
            <Text style={[styles.stateValue, isListening ? styles.stateActive : styles.stateInactive]}>
              {isListening ? 'Yes' : 'No'}
            </Text>
          </View>
          <View style={styles.stateRow}>
            <Text style={styles.stateLabel}>Count:</Text>
            <Text style={styles.stateValue}>{count}</Text>
          </View>
          {lastAction && (
            <View style={styles.lastActionContainer}>
              <Text style={styles.lastActionTitle}>Last Action:</Text>
              <Text style={styles.lastActionText}>Name: {lastAction.actionName}</Text>
              <Text style={styles.lastActionText}>Component: {lastAction.componentId}</Text>
              <Text style={styles.lastActionText}>Time: {new Date(lastAction.timestamp).toLocaleTimeString()}</Text>
            </View>
          )}
        </Card>

        <Card>
          <Card.Title>Local Controls</Card.Title>
          <Card.Text>Adjust the count locally without updating the widget. Use Manual Update to sync.</Card.Text>
          <View style={styles.buttonRow}>
            <Button title="-" variant="secondary" onPress={handleLocalDecrement} style={styles.smallButton} />
            <Button title="Reset" variant="secondary" onPress={handleLocalReset} style={styles.smallButton} />
            <Button title="+" variant="secondary" onPress={handleLocalIncrement} style={styles.smallButton} />
          </View>
        </Card>

        <Card>
          <Card.Title>Hook Controls</Card.Title>
          <View style={styles.buttonColumn}>
            <Button
              title={isListening ? 'Stop Listening' : 'Start Listening'}
              variant={isListening ? 'secondary' : 'primary'}
              onPress={handleToggleListening}
            />
            <Button title="Manual Update Widget" variant="primary" onPress={handleManualUpdate} />
          </View>
        </Card>

        <Card>
          <Card.Title>Action Log</Card.Title>
          <Button title="Clear Log" variant="ghost" onPress={handleClearLog} style={styles.clearButton} />
          <View style={styles.logContainer}>
            {actionLog.length === 0 ? (
              <Text style={styles.logEmpty}>No actions logged yet. Press buttons on the widget to see events.</Text>
            ) : (
              actionLog.map((log, index) => (
                <Text key={index} style={styles.logEntry}>
                  {log}
                </Text>
              ))
            )}
          </View>
        </Card>

        <Card>
          <Card.Title>How to Test</Card.Title>
          <View style={styles.instructionsList}>
            <Text style={styles.instructionItem}>1. Pin the "Voltra Widget" to your home screen</Text>
            <Text style={styles.instructionItem}>2. Keep this app open in the foreground</Text>
            <Text style={styles.instructionItem}>3. Press the +, -, or Reset buttons on the widget</Text>
            <Text style={styles.instructionItem}>4. Watch the action log update in real-time</Text>
            <Text style={styles.instructionItem}>5. Verify the widget updates with the new count</Text>
          </View>
        </Card>

        <View style={styles.footer}>
          <Button title="Back to Android Home" variant="ghost" onPress={() => router.push('/android-widgets')} />
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  heading: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  subheading: {
    fontSize: 14,
    lineHeight: 20,
    color: '#CBD5F5',
    marginBottom: 16,
  },
  stateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  stateLabel: {
    fontSize: 14,
    color: '#94A3B8',
  },
  stateValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  stateActive: {
    color: '#22C55E',
  },
  stateInactive: {
    color: '#EF4444',
  },
  lastActionContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  lastActionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8232FF',
    marginBottom: 4,
  },
  lastActionText: {
    fontSize: 12,
    color: '#CBD5F5',
    marginLeft: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  buttonColumn: {
    gap: 8,
    marginTop: 12,
  },
  smallButton: {
    flex: 1,
  },
  clearButton: {
    marginBottom: 8,
  },
  logContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 8,
    padding: 12,
    maxHeight: 200,
  },
  logEmpty: {
    fontSize: 12,
    color: '#94A3B8',
    fontStyle: 'italic',
  },
  logEntry: {
    fontSize: 11,
    color: '#E2E8F0',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    marginBottom: 4,
  },
  instructionsList: {
    gap: 8,
    marginTop: 8,
  },
  instructionItem: {
    fontSize: 13,
    color: '#CBD5F5',
  },
  footer: {
    marginTop: 24,
    alignItems: 'center',
  },
})
