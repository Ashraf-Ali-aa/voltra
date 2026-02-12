import { Platform } from 'react-native'
import { getLastTriggeredAction, updateAndroidWidget } from 'voltra/android/client'

import { AndroidVoltraWidget } from './AndroidVoltraWidget'

/**
 * In-memory counter for widget action demonstrations.
 * This persists as long as the app process is running.
 * For production use, consider using AsyncStorage or MMKV.
 */
let count = 0

/**
 * Update the Android Voltra widget based on the triggered action.
 *
 * This demonstrates how to use `getLastTriggeredAction()` to determine
 * which button was pressed and perform different updates accordingly:
 * - "increment": Increases the count by 1
 * - "decrement": Decreases the count by 1
 * - "reset": Resets the count to 0
 * - No action: Regular update (e.g., on app launch)
 *
 * @param size - The widget size dimensions
 */
export const updateAndroidVoltraWidget = async (size: { width: number; height: number }): Promise<void> => {
  if (Platform.OS !== 'android') {
    return
  }

  // Check if an action was triggered (button press)
  const action = await getLastTriggeredAction('voltra')

  if (action) {
    // Perform different updates based on which action was triggered
    switch (action.actionName) {
      case 'increment':
        count += 1
        break
      case 'decrement':
        count -= 1
        break
      case 'reset':
        count = 0
        break
      default:
        // Unknown action - no change
        break
    }
  }

  return updateAndroidWidget('voltra', [
    {
      size,
      content: <AndroidVoltraWidget time={new Date().toLocaleString()} count={count} />,
    },
  ]).catch((error) => {
    console.error('Failed to update Voltra widget:', error)
  })
}
