import { VoltraAndroid } from 'voltra/android'

type AndroidVoltraWidgetProps = {
  time: string
  /** Counter that increments on each widget refresh */
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
      <VoltraAndroid.Text style={{ fontSize: 14, color: '#666666' }}>Refresh count: {count}</VoltraAndroid.Text>
      <VoltraAndroid.Spacer style={{ height: 12 }} />
      <VoltraAndroid.FilledButton
        text="Refresh Widget"
        actionType="refresh"
        backgroundColor="#3B82F6"
        contentColor="#FFFFFF"
      />
    </VoltraAndroid.Column>
  )
}
