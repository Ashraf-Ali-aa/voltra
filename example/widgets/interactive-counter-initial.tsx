import { InteractiveCounterWidget } from './InteractiveCounterWidget'

/**
 * Initial state for the InteractiveCounterWidget.
 * This is rendered when the widget is first added to the home screen.
 */
const initialState = [
  {
    size: { width: 250, height: 280 },
    content: <InteractiveCounterWidget count={0} />,
  },
]

export default initialState
