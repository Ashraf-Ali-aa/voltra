import { ReactNode } from 'react'

import type { VoltraAndroidStyleProp } from '../styles/types.js'

export type VoltraAndroidBaseProps = {
  id?: string
  deepLinkUrl?: string
  /**
   * The type of action to perform when the component is clicked.
   * - 'refresh': Triggers a widget refresh without opening the app
   * - 'deepLink': Opens the app with the specified deepLinkUrl (default behavior if deepLinkUrl is set)
   */
  actionType?: 'refresh' | 'deepLink'
  /**
   * Custom name for the action to identify which button triggered the refresh.
   * Used with actionType='refresh' to differentiate between multiple buttons.
   * If not provided, defaults to the component's id.
   *
   * @example
   * ```tsx
   * <VoltraAndroid.FilledButton
   *   actionType="refresh"
   *   actionName="increment"
   *   text="Increment"
   * />
   * ```
   */
  actionName?: string
  style?: VoltraAndroidStyleProp
  children?: ReactNode
}
