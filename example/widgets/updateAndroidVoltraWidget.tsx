import { Platform } from 'react-native'
import { updateAndroidWidget } from 'voltra/android/client'

import { AndroidVoltraWidget } from './AndroidVoltraWidget'

/**
 * In-memory counter for widget refresh demonstrations.
 * This persists as long as the app process is running.
 * For production use, consider using AsyncStorage or MMKV.
 */
let refreshCount = 0

/**
 * Update the Android Voltra widget with the current launch time.
 * Increments the refresh count on each update to demonstrate
 * interactive widget refresh functionality.
 *
 * @param size - The widget size dimensions
 */
export const updateAndroidVoltraWidget = async (size: { width: number; height: number }): Promise<void> => {
  if (Platform.OS !== 'android') {
    return
  }

  // Increment count on each update
  refreshCount += 1

  return updateAndroidWidget('voltra', [
    {
      size,
      content: <AndroidVoltraWidget time={new Date().toLocaleString()} count={refreshCount} />,
    },
  ]).catch((error) => {
    console.error('Failed to initialize Voltra widget:', error)
  })
}
