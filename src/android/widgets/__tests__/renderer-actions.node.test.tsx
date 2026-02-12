import React from 'react'

import { FilledButton } from '../../jsx/FilledButton'
import { OutlineButton } from '../../jsx/OutlineButton'
import { Column } from '../../jsx/Column'
import { Box } from '../../jsx/Box'
import { renderAndroidWidgetToJson } from '../renderer'

describe('Android Widget Renderer - Action Props', () => {
  describe('actionType prop serialization', () => {
    test('serializes actionType="refresh" correctly', () => {
      const payload = renderAndroidWidgetToJson([
        {
          size: { width: 150, height: 100 },
          content: (
            <FilledButton
              text="Refresh"
              actionType="refresh"
            />
          ),
        },
      ])

      // Navigate to the button props
      const variant = payload.variants['150x100']
      expect(variant).toBeDefined()
      expect(variant.p?.actionType).toBe('refresh')
    })

    test('serializes actionType="deepLink" correctly', () => {
      const payload = renderAndroidWidgetToJson([
        {
          size: { width: 150, height: 100 },
          content: (
            <FilledButton
              text="Open App"
              actionType="deepLink"
              deepLinkUrl="/home"
            />
          ),
        },
      ])

      const variant = payload.variants['150x100']
      expect(variant).toBeDefined()
      expect(variant.p?.actionType).toBe('deepLink')
      // deepLinkUrl is shortened to 'dlu' during serialization
      expect(variant.p?.dlu).toBe('/home')
    })

    test('handles missing actionType (defaults to deepLink behavior in Kotlin)', () => {
      const payload = renderAndroidWidgetToJson([
        {
          size: { width: 150, height: 100 },
          content: (
            <FilledButton
              text="Click Me"
              deepLinkUrl="/home"
            />
          ),
        },
      ])

      const variant = payload.variants['150x100']
      expect(variant).toBeDefined()
      // actionType should be undefined (Kotlin handles the default)
      expect(variant.p?.actionType).toBeUndefined()
      // deepLinkUrl is shortened to 'dlu' during serialization
      expect(variant.p?.dlu).toBe('/home')
    })
  })

  describe('actionName prop serialization', () => {
    test('serializes custom actionName correctly', () => {
      const payload = renderAndroidWidgetToJson([
        {
          size: { width: 150, height: 100 },
          content: (
            <FilledButton
              text="Increment"
              actionType="refresh"
              actionName="increment"
            />
          ),
        },
      ])

      const variant = payload.variants['150x100']
      expect(variant).toBeDefined()
      expect(variant.p?.actionName).toBe('increment')
    })

    test('allows actionName without id (Kotlin uses componentId as fallback)', () => {
      const payload = renderAndroidWidgetToJson([
        {
          size: { width: 150, height: 100 },
          content: (
            <FilledButton
              text="Test"
              actionType="refresh"
              actionName="my-action"
            />
          ),
        },
      ])

      const variant = payload.variants['150x100']
      expect(variant).toBeDefined()
      expect(variant.p?.actionName).toBe('my-action')
    })

    test('serializes both id and actionName correctly', () => {
      const payload = renderAndroidWidgetToJson([
        {
          size: { width: 150, height: 100 },
          content: (
            <FilledButton
              id="btn-increment"
              text="Increment"
              actionType="refresh"
              actionName="increment"
            />
          ),
        },
      ])

      const variant = payload.variants['150x100']
      expect(variant).toBeDefined()
      expect(variant.i).toBe('btn-increment')
      expect(variant.p?.actionName).toBe('increment')
    })
  })

  describe('multiple buttons with different actions', () => {
    test('serializes multiple buttons with distinct actionNames', () => {
      const payload = renderAndroidWidgetToJson([
        {
          size: { width: 150, height: 150 },
          content: (
            <Column>
              <FilledButton
                text="+"
                actionType="refresh"
                actionName="increment"
              />
              <FilledButton
                text="-"
                actionType="refresh"
                actionName="decrement"
              />
              <OutlineButton
                text="Reset"
                actionType="refresh"
                actionName="reset"
              />
            </Column>
          ),
        },
      ])

      const variant = payload.variants['150x150']
      expect(variant).toBeDefined()

      // variant is a Column with 3 children
      expect(variant.c).toHaveLength(3)

      // Check each button has correct actionName
      expect(variant.c[0].p?.actionName).toBe('increment')
      expect(variant.c[1].p?.actionName).toBe('decrement')
      expect(variant.c[2].p?.actionName).toBe('reset')

      // All should have actionType="refresh"
      expect(variant.c[0].p?.actionType).toBe('refresh')
      expect(variant.c[1].p?.actionType).toBe('refresh')
      expect(variant.c[2].p?.actionType).toBe('refresh')
    })

    test('mixed action types in same widget', () => {
      const payload = renderAndroidWidgetToJson([
        {
          size: { width: 200, height: 100 },
          content: (
            <Column>
              <FilledButton
                text="Refresh Data"
                actionType="refresh"
                actionName="refresh-data"
              />
              <OutlineButton
                text="View Details"
                actionType="deepLink"
                deepLinkUrl="/details"
              />
            </Column>
          ),
        },
      ])

      const variant = payload.variants['200x100']
      expect(variant).toBeDefined()
      expect(variant.c).toHaveLength(2)

      // First button: refresh
      expect(variant.c[0].p?.actionType).toBe('refresh')
      expect(variant.c[0].p?.actionName).toBe('refresh-data')
      expect(variant.c[0].p?.dlu).toBeUndefined()

      // Second button: deepLink
      expect(variant.c[1].p?.actionType).toBe('deepLink')
      // deepLinkUrl is shortened to 'dlu' during serialization
      expect(variant.c[1].p?.dlu).toBe('/details')
    })
  })

  describe('action props on container components', () => {
    test('Box with deepLinkUrl should serialize correctly', () => {
      const payload = renderAndroidWidgetToJson([
        {
          size: { width: 100, height: 100 },
          content: (
            <Box
              id="clickable-box"
              deepLinkUrl="/details"
            >
              <FilledButton text="Child" />
            </Box>
          ),
        },
      ])

      const variant = payload.variants['100x100']
      expect(variant).toBeDefined()
      expect(variant.i).toBe('clickable-box')
      // deepLinkUrl is shortened to 'dlu' during serialization
      expect(variant.p?.dlu).toBe('/details')
    })
  })

  describe('edge cases', () => {
    test('empty actionName is preserved', () => {
      const payload = renderAndroidWidgetToJson([
        {
          size: { width: 150, height: 100 },
          content: (
            <FilledButton
              text="Test"
              actionType="refresh"
              actionName=""
            />
          ),
        },
      ])

      const variant = payload.variants['150x100']
      expect(variant.p?.actionName).toBe('')
    })

    test('special characters in actionName are preserved', () => {
      const payload = renderAndroidWidgetToJson([
        {
          size: { width: 150, height: 100 },
          content: (
            <FilledButton
              text="Test"
              actionType="refresh"
              actionName="action:with:colons"
            />
          ),
        },
      ])

      const variant = payload.variants['150x100']
      expect(variant.p?.actionName).toBe('action:with:colons')
    })

    test('unicode in actionName is preserved', () => {
      const payload = renderAndroidWidgetToJson([
        {
          size: { width: 150, height: 100 },
          content: (
            <FilledButton
              text="Test"
              actionType="refresh"
              actionName="action-éèà"
            />
          ),
        },
      ])

      const variant = payload.variants['150x100']
      // Unicode characters are preserved in the JSON output
      expect(variant.p?.actionName).toBe('action-éèà')
    })
  })
})
