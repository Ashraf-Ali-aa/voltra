import VoltraModule from '../../../VoltraModule'
import { updateAndroidWidgetFromJS, type AndroidWidgetPayload } from '../api'

// Mock VoltraModule
jest.mock('../../../VoltraModule', () => ({
  updateWidgetFromJS: jest.fn().mockResolvedValue({ success: true }),
}))

describe('updateAndroidWidgetFromJS', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  const mockPayload: AndroidWidgetPayload = {
    v: 1,
    variants: {
      '150x100': { t: 1, c: 'test-content' },
    },
    s: [],
    e: [],
  }

  test('calls native module with serialized JSON payload', async () => {
    const result = await updateAndroidWidgetFromJS('myWidget', mockPayload)

    expect(VoltraModule.updateWidgetFromJS).toHaveBeenCalledWith(
      'myWidget',
      JSON.stringify(mockPayload)
    )
    expect(result).toEqual({ success: true })
  })

  test('returns success result from native module', async () => {
    ;(VoltraModule.updateWidgetFromJS as jest.Mock).mockResolvedValueOnce({
      success: true,
    })

    const result = await updateAndroidWidgetFromJS('testWidget', mockPayload)

    expect(result.success).toBe(true)
    expect(result.error).toBeUndefined()
  })

  test('returns error result from native module', async () => {
    ;(VoltraModule.updateWidgetFromJS as jest.Mock).mockResolvedValueOnce({
      success: false,
      error: 'Invalid JSON payload',
    })

    const result = await updateAndroidWidgetFromJS('testWidget', mockPayload)

    expect(result.success).toBe(false)
    expect(result.error).toBe('Invalid JSON payload')
  })

  test('handles payload with only required fields', async () => {
    const minimalPayload: AndroidWidgetPayload = {
      variants: {
        '100x100': { t: 1 },
      },
    }

    await updateAndroidWidgetFromJS('minimalWidget', minimalPayload)

    expect(VoltraModule.updateWidgetFromJS).toHaveBeenCalledWith(
      'minimalWidget',
      JSON.stringify(minimalPayload)
    )
  })

  test('handles payload with multiple variants', async () => {
    const multiVariantPayload: AndroidWidgetPayload = {
      v: 1,
      variants: {
        '150x100': { t: 1, c: 'small' },
        '250x200': { t: 1, c: 'large' },
        '300x300': { t: 1, c: 'xlarge' },
      },
    }

    await updateAndroidWidgetFromJS('multiWidget', multiVariantPayload)

    expect(VoltraModule.updateWidgetFromJS).toHaveBeenCalledWith(
      'multiWidget',
      JSON.stringify(multiVariantPayload)
    )
  })
})
