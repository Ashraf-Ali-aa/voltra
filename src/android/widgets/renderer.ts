import { ComponentRegistry, createVoltraRenderer } from '../../renderer/renderer.js'
import { getAndroidComponentId } from '../payload/component-ids.js'
import type { AndroidWidgetVariants } from './types.js'

/**
 * Android component registry that uses Android component ID mappings
 */
const androidComponentRegistry: ComponentRegistry = {
  getComponentId: (name: string) => getAndroidComponentId(name),
}

/**
 * Renders Android widget variants to a JSON payload object with size breakpoints.
 *
 * This function converts JSX widget definitions into a serializable payload format
 * that can be sent to the native Android module. Use this when you need to create
 * widget payloads for `updateAndroidWidgetFromJS` or other programmatic updates.
 *
 * @param variants - Array of size variants, each containing a size breakpoint and JSX content
 * @returns A JSON payload object with the following structure:
 *   - `v`: Version number (currently 1)
 *   - `variants`: Object mapping size keys (e.g., "150x100") to rendered node trees
 *   - `s`: Shared styles array (for deduplication)
 *   - `e`: Shared elements array (for deduplication)
 *
 * @example Basic usage with useInteractiveWidget
 * ```tsx
 * import { renderAndroidWidgetToJson, useInteractiveWidget, VoltraAndroid } from 'voltra'
 *
 * const CounterWidget = ({ count }: { count: number }) => (
 *   <VoltraAndroid.Column>
 *     <VoltraAndroid.Text fontSize={32}>{count}</VoltraAndroid.Text>
 *     <VoltraAndroid.Button actionType="refresh" actionName="increment" text="+" />
 *   </VoltraAndroid.Column>
 * )
 *
 * useInteractiveWidget('counter', {
 *   onAction: async (action) => {
 *     const newCount = action.actionName === 'increment' ? count + 1 : count
 *     return renderAndroidWidgetToJson([
 *       { size: { width: 150, height: 100 }, content: <CounterWidget count={newCount} /> }
 *     ])
 *   }
 * })
 * ```
 *
 * @example Multiple size variants
 * ```tsx
 * const payload = renderAndroidWidgetToJson([
 *   { size: { width: 150, height: 100 }, content: <SmallWidget data={data} /> },
 *   { size: { width: 250, height: 150 }, content: <MediumWidget data={data} /> },
 *   { size: { width: 350, height: 200 }, content: <LargeWidget data={data} /> }
 * ])
 * ```
 */
export const renderAndroidWidgetToJson = (variants: AndroidWidgetVariants): Record<string, any> => {
  const renderer = createVoltraRenderer(androidComponentRegistry)

  // Add each size variant with key format "WIDTHxHEIGHT"
  for (const { size, content } of variants) {
    const key = `${size.width}x${size.height}`
    renderer.addRootNode(key, content)
  }

  const rendered = renderer.render()

  // Extract variant keys (everything except v, s, e which are metadata)
  const variantsMap: Record<string, any> = {}
  const metadataKeys = ['v', 's', 'e']

  for (const key of Object.keys(rendered)) {
    if (!metadataKeys.includes(key)) {
      variantsMap[key] = rendered[key]
      delete rendered[key]
    }
  }

  // Add variants as a nested object (expected by Kotlin parser)
  rendered.variants = variantsMap

  return rendered
}

/**
 * Renders Android widget variants to a JSON string.
 *
 * This is a convenience wrapper around `renderAndroidWidgetToJson` that returns
 * the payload as a stringified JSON. Useful when you need the raw string format
 * for direct native module calls or debugging.
 *
 * @param variants - Array of size variants, each containing a size breakpoint and JSX content
 * @returns A JSON string representation of the widget payload
 *
 * @example
 * ```tsx
 * const jsonString = renderAndroidWidgetToString([
 *   { size: { width: 150, height: 100 }, content: <MyWidget /> }
 * ])
 * console.log(jsonString) // '{"v":1,"variants":{"150x100":{...}},...}'
 * ```
 *
 * @see {@link renderAndroidWidgetToJson} for the object-based version
 */
export const renderAndroidWidgetToString = (variants: AndroidWidgetVariants): string => {
  return JSON.stringify(renderAndroidWidgetToJson(variants))
}
