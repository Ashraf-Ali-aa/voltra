// Android Live Update API and types
export {
  endAllAndroidLiveUpdates,
  isAndroidLiveUpdateActive,
  startAndroidLiveUpdate,
  stopAndroidLiveUpdate,
  updateAndroidLiveUpdate,
  useAndroidLiveUpdate,
} from './live-update/api.js'
export type {
  AndroidLiveUpdateJson,
  AndroidLiveUpdateVariants,
  AndroidLiveUpdateVariantsJson,
  StartAndroidLiveUpdateOptions,
  UpdateAndroidLiveUpdateOptions,
  UseAndroidLiveUpdateOptions,
  UseAndroidLiveUpdateResult,
} from './live-update/types.js'

// Android Widget API and types
export {
  clearAllAndroidWidgets,
  clearAndroidWidget,
  getActiveWidgets,
  getLastTriggeredAction,
  reloadAndroidWidgets,
  requestPinAndroidWidget,
  subscribeToWidgetActions,
  updateAndroidWidget,
  updateAndroidWidgetFromJS,
} from './widgets/api.js'
export type {
  AndroidWidgetPayload,
  TriggeredActionInfo,
  UpdateAndroidWidgetFromJSResult,
  WidgetActionEvent,
} from './widgets/api.js'
export type {
  AndroidWidgetSize,
  AndroidWidgetSizeVariant,
  AndroidWidgetVariants,
  UpdateAndroidWidgetOptions,
  WidgetInfo,
} from './widgets/types.js'

// Widget renderer utilities (for creating payloads for updateAndroidWidgetFromJS)
export { renderAndroidWidgetToJson, renderAndroidWidgetToString } from './widgets/renderer.js'

// Preload API
export { clearPreloadedImages, preloadImages, reloadWidgets } from './preload.js'

// Interactive Widget Hook
export { useInteractiveWidget } from './hooks/index.js'
export type { UseInteractiveWidgetOptions, UseInteractiveWidgetResult } from './hooks/index.js'

// Android Preview Components
export { VoltraView, type VoltraViewProps } from './components/VoltraView.js'
export {
  type AndroidWidgetFamily,
  VoltraWidgetPreview,
  type VoltraWidgetPreviewProps,
} from './components/VoltraWidgetPreview.js'
