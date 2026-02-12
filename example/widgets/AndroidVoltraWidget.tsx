import { VoltraAndroid } from 'voltra/android'

type AndroidVoltraWidgetProps = {
  time: string
  /** Counter value to display */
  count?: number
}

export const AndroidVoltraWidget = ({ time, count = 0 }: AndroidVoltraWidgetProps) => {
  return (
    <VoltraAndroid.Column
      style={{
        backgroundColor: '#FFFFFF',
        width: '100%',
        height: '100%',
        padding: 16,
      }}
      horizontalAlignment="center-horizontally"
      verticalAlignment="center-vertically"
    >
      <VoltraAndroid.Image source={{ assetName: 'voltra_logo' }} />
      <VoltraAndroid.Spacer style={{ height: 12 }} />
      <VoltraAndroid.Text>Launched: {time}</VoltraAndroid.Text>
      <VoltraAndroid.Spacer style={{ height: 8 }} />
      <VoltraAndroid.Text style={{ fontSize: 24, fontWeight: 'bold' }}>Count: {count}</VoltraAndroid.Text>
      <VoltraAndroid.Spacer style={{ height: 12 }} />
      <VoltraAndroid.Row style={{ gap: 8 }}>
        <VoltraAndroid.FilledButton
          text="-"
          actionType="refresh"
          actionName="decrement"
          backgroundColor="#EF4444"
          contentColor="#FFFFFF"
        />
        <VoltraAndroid.FilledButton
          text="Reset"
          actionType="refresh"
          actionName="reset"
          backgroundColor="#6B7280"
          contentColor="#FFFFFF"
        />
        <VoltraAndroid.FilledButton
          text="+"
          actionType="refresh"
          actionName="increment"
          backgroundColor="#22C55E"
          contentColor="#FFFFFF"
        />
      </VoltraAndroid.Row>
    </VoltraAndroid.Column>
  )
}
