import VoltraModule from '../../../VoltraModule'
import { getLastTriggeredAction } from '../api'

// Mock VoltraModule
jest.mock('../../../VoltraModule', () => ({
  getLastTriggeredAction: jest.fn(),
}))

describe('getLastTriggeredAction', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  test('returns action info when action was triggered', async () => {
    const mockActionInfo = {
      actionName: 'increment',
      componentId: 'btn-1',
      timestamp: 1699900000000,
    }

    ;(VoltraModule.getLastTriggeredAction as jest.Mock).mockResolvedValue(mockActionInfo)

    const result = await getLastTriggeredAction('myWidget')

    expect(VoltraModule.getLastTriggeredAction).toHaveBeenCalledWith('myWidget')
    expect(result).toEqual(mockActionInfo)
  })

  test('returns null when no action was triggered', async () => {
    ;(VoltraModule.getLastTriggeredAction as jest.Mock).mockResolvedValue(null)

    const result = await getLastTriggeredAction('myWidget')

    expect(VoltraModule.getLastTriggeredAction).toHaveBeenCalledWith('myWidget')
    expect(result).toBeNull()
  })

  test('passes widgetId correctly to native module', async () => {
    ;(VoltraModule.getLastTriggeredAction as jest.Mock).mockResolvedValue(null)

    await getLastTriggeredAction('specific-widget-id')

    expect(VoltraModule.getLastTriggeredAction).toHaveBeenCalledWith('specific-widget-id')
  })

  test('handles different action names', async () => {
    const testCases = [
      { actionName: 'increment', componentId: 'btn-inc', timestamp: 1699900000000 },
      { actionName: 'decrement', componentId: 'btn-dec', timestamp: 1699900001000 },
      { actionName: 'reset', componentId: 'btn-reset', timestamp: 1699900002000 },
    ]

    for (const expectedAction of testCases) {
      ;(VoltraModule.getLastTriggeredAction as jest.Mock).mockResolvedValue(expectedAction)

      const result = await getLastTriggeredAction('counter')

      expect(result).toEqual(expectedAction)
    }
  })

  test('preserves timestamp precision', async () => {
    const now = Date.now()
    const mockActionInfo = {
      actionName: 'test',
      componentId: 'btn',
      timestamp: now,
    }

    ;(VoltraModule.getLastTriggeredAction as jest.Mock).mockResolvedValue(mockActionInfo)

    const result = await getLastTriggeredAction('myWidget')

    expect(result?.timestamp).toBe(now)
  })

  test('handles action with special characters in names', async () => {
    const mockActionInfo = {
      actionName: 'action:with:colons',
      componentId: 'component-with-dashes',
      timestamp: 1699900000000,
    }

    ;(VoltraModule.getLastTriggeredAction as jest.Mock).mockResolvedValue(mockActionInfo)

    const result = await getLastTriggeredAction('myWidget')

    expect(result?.actionName).toBe('action:with:colons')
    expect(result?.componentId).toBe('component-with-dashes')
  })
})
