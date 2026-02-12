package voltra.glance.actions

import android.content.Context
import android.util.Log
import androidx.glance.GlanceId
import androidx.glance.action.ActionParameters
import androidx.glance.appwidget.action.ActionCallback
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import voltra.widget.VoltraWidgetManager

/**
 * ActionCallback that refreshes a Voltra widget without opening the app.
 * This enables interactive widget updates where a button click triggers
 * a widget data refresh cycle.
 */
class VoltraRefreshAction : ActionCallback {
    companion object {
        private const val TAG = "VoltraRefreshAction"

        /** Parameter key for passing the widget ID to the callback */
        val WIDGET_ID_KEY = ActionParameters.Key<String>("widgetId")

        /** Parameter key for passing the component ID to the callback */
        val COMPONENT_ID_KEY = ActionParameters.Key<String>("componentId")
    }

    override suspend fun onAction(
        context: Context,
        glanceId: GlanceId,
        parameters: ActionParameters,
    ) {
        val widgetId = parameters[WIDGET_ID_KEY]
        val componentId = parameters[COMPONENT_ID_KEY]

        Log.d(TAG, "onAction triggered: widgetId=$widgetId, componentId=$componentId, glanceId=$glanceId")

        if (widgetId == null) {
            Log.w(TAG, "No widgetId provided in action parameters, cannot refresh")
            return
        }

        // Launch widget update in IO coroutine scope
        CoroutineScope(Dispatchers.IO).launch {
            try {
                Log.d(TAG, "Starting widget refresh for widgetId=$widgetId")
                val widgetManager = VoltraWidgetManager(context)
                widgetManager.updateWidget(widgetId)
                Log.d(TAG, "Widget refresh completed for widgetId=$widgetId")
            } catch (e: Exception) {
                Log.e(TAG, "Failed to refresh widget widgetId=$widgetId: ${e.message}", e)
            }
        }
    }
}
