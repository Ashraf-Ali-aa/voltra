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
  style?: VoltraAndroidStyleProp
  children?: ReactNode
}
