import { VoltraAndroid } from 'voltra/android'

/**
 * Props for the InteractiveCounterWidget
 */
type InteractiveCounterWidgetProps = {
  /** The current count value to display */
  count: number
  /** Optional timestamp of the last update */
  lastUpdated?: string
}

/**
 * A polished interactive counter widget showcasing interactive features.
 *
 * Features:
 * - Increment button (+) - increases count by 1
 * - Decrement button (-) - decreases count by 1
 * - Reset button - resets count to 0
 * - Large count display with proper styling
 * - Last updated timestamp display
 *
 * @example
 * ```tsx
 * <InteractiveCounterWidget count={5} lastUpdated="12:30:45 PM" />
 * ```
 */
export const InteractiveCounterWidget = ({ count, lastUpdated }: InteractiveCounterWidgetProps) => {
  // Determine text color based on count value
  const countColor = count > 0 ? '#22C55E' : count < 0 ? '#EF4444' : '#FFFFFF'

  return (
    <VoltraAndroid.Column
      style={{
        backgroundColor: '#1E293B',
        width: '100%',
        height: '100%',
        padding: 16,
        borderRadius: 16,
      }}
      horizontalAlignment="center-horizontally"
      verticalAlignment="center-vertically"
    >
      {/* Header */}
      <VoltraAndroid.Text
        style={{
          fontSize: 12,
          fontWeight: '600',
          color: '#94A3B8',
          textAlign: 'center',
        }}
      >
        COUNTER
      </VoltraAndroid.Text>

      <VoltraAndroid.Spacer style={{ height: 8 }} />

      {/* Count Display */}
      <VoltraAndroid.Text
        style={{
          fontSize: 48,
          fontWeight: 'bold',
          color: countColor,
          textAlign: 'center',
        }}
      >
        {count}
      </VoltraAndroid.Text>

      <VoltraAndroid.Spacer style={{ height: 16 }} />

      {/* Increment/Decrement Row */}
      <VoltraAndroid.Row style={{ gap: 12 }}>
        <VoltraAndroid.FilledButton
          text="-"
          actionType="refresh"
          actionName="decrement"
          backgroundColor="#EF4444"
          contentColor="#FFFFFF"
          style={{ width: 56, height: 48 }}
        />
        <VoltraAndroid.FilledButton
          text="+"
          actionType="refresh"
          actionName="increment"
          backgroundColor="#22C55E"
          contentColor="#FFFFFF"
          style={{ width: 56, height: 48 }}
        />
      </VoltraAndroid.Row>

      <VoltraAndroid.Spacer style={{ height: 12 }} />

      {/* Reset Button */}
      <VoltraAndroid.OutlineButton
        text="Reset"
        actionType="refresh"
        actionName="reset"
        contentColor="#94A3B8"
        style={{ width: 120 }}
      />

      {/* Last Updated Timestamp */}
      {lastUpdated && (
        <>
          <VoltraAndroid.Spacer style={{ height: 12 }} />
          <VoltraAndroid.Text
            style={{
              fontSize: 10,
              color: '#64748B',
              textAlign: 'center',
            }}
          >
            Updated: {lastUpdated}
          </VoltraAndroid.Text>
        </>
      )}
    </VoltraAndroid.Column>
  )
}
