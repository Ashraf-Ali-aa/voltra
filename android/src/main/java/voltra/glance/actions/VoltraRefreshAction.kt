package voltra.glance.actions

import android.content.Context
import android.util.Log
import androidx.glance.GlanceId
import androidx.glance.action.ActionParameters
import androidx.glance.appwidget.action.ActionCallback
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import org.json.JSONObject
import voltra.events.VoltraEventBus
import voltra.events.WidgetActionEvent
import voltra.widget.VoltraWidgetManager

/**
 * ActionCallback that refreshes a Voltra widget without opening the app.
 * This enables interactive widget updates where a button click triggers
 * a widget data refresh cycle.
 *
 * The action stores information about which button was pressed (actionName, componentId)
 * in SharedPreferences, allowing the JavaScript side to retrieve this information
 * and perform different updates based on which action was triggered.
 */
class VoltraRefreshAction : ActionCallback {
    companion object {
        private const val TAG = "VoltraRefreshAction"
        private const val PREFS_NAME = "voltra_widgets"
        private const val KEY_LAST_ACTION_PREFIX = "Voltra_Widget_LastAction_"

        /** Parameter key for passing the widget ID to the callback */
        val WIDGET_ID_KEY = ActionParameters.Key<String>("widgetId")

        /** Parameter key for passing the component ID to the callback */
        val COMPONENT_ID_KEY = ActionParameters.Key<String>("componentId")

        /** Parameter key for passing the action name to the callback */
        val ACTION_NAME_KEY = ActionParameters.Key<String>("actionName")
    }

    override suspend fun onAction(
        context: Context,
        glanceId: GlanceId,
        parameters: ActionParameters,
    ) {
        val widgetId = parameters[WIDGET_ID_KEY]
        val componentId = parameters[COMPONENT_ID_KEY]
        val actionName = parameters[ACTION_NAME_KEY] ?: componentId

        Log.d(TAG, "onAction triggered: widgetId=$widgetId, componentId=$componentId, actionName=$actionName, glanceId=$glanceId")

        if (widgetId == null) {
            Log.w(TAG, "No widgetId provided in action parameters, cannot refresh")
            return
        }

        // Store the triggered action info in SharedPreferences
        storeLastAction(context, widgetId, actionName, componentId)

        // Emit event to JS via event bus
        emitActionEvent(context, widgetId, actionName ?: componentId ?: "unknown", componentId ?: "unknown")

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

    /**
     * Store the last triggered action info in SharedPreferences.
     * This allows JavaScript to retrieve which action was triggered.
     */
    private fun storeLastAction(
        context: Context,
        widgetId: String,
        actionName: String?,
        componentId: String?,
    ) {
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        val actionInfo =
            JSONObject().apply {
                put("actionName", actionName ?: componentId ?: "unknown")
                put("componentId", componentId ?: "unknown")
                put("timestamp", System.currentTimeMillis())
            }

        prefs
            .edit()
            .putString("$KEY_LAST_ACTION_PREFIX$widgetId", actionInfo.toString())
            .commit()

        Log.d(TAG, "Stored last action for widgetId=$widgetId: $actionInfo")
    }

    /**
     * Emit an event to JavaScript via the event bus.
     * This enables reactive widget updates from JavaScript.
     */
    private fun emitActionEvent(
        context: Context,
        widgetId: String,
        actionName: String,
        componentId: String,
    ) {
        try {
            val eventBus = VoltraEventBus.getInstance(context)
            val event = WidgetActionEvent(
                widgetId = widgetId,
                actionName = actionName,
                componentId = componentId,
            )
            eventBus.send(event)
            Log.d(TAG, "Emitted widgetAction event: widgetId=$widgetId, actionName=$actionName")
        } catch (e: Exception) {
            Log.w(TAG, "Failed to emit action event (app may not be running): ${e.message}")
        }
    }
}
