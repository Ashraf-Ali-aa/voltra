package voltra.glance.actions

import android.content.Context
import android.util.Log
import androidx.glance.GlanceId
import androidx.glance.action.ActionParameters
import androidx.glance.appwidget.action.ActionCallback
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.TimeoutCancellationException
import kotlinx.coroutines.launch
import kotlinx.coroutines.withTimeout
import org.json.JSONException
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

        /** Timeout for widget update operations in milliseconds */
        private const val UPDATE_TIMEOUT_MS = 30_000L

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

        // Validate widgetId - it's required for refresh actions
        if (widgetId == null) {
            Log.e(TAG, "No widgetId provided in action parameters, cannot refresh widget")
            return
        }

        if (widgetId.isBlank()) {
            Log.e(TAG, "Empty widgetId provided in action parameters, cannot refresh widget")
            return
        }

        // Validate widgetId format (should be alphanumeric with optional underscores/hyphens)
        if (!isValidWidgetId(widgetId)) {
            Log.e(TAG, "Invalid widgetId format: $widgetId")
            return
        }

        // Store the triggered action info in SharedPreferences (with error handling)
        val actionStored = storeLastAction(context, widgetId, actionName, componentId)
        if (!actionStored) {
            Log.w(TAG, "Failed to store last action, but continuing with widget refresh")
        }

        // Emit event to JS via event bus
        emitActionEvent(context, widgetId, actionName ?: componentId ?: "unknown", componentId ?: "unknown")

        // Launch widget update in IO coroutine scope with timeout
        CoroutineScope(Dispatchers.IO).launch {
            try {
                Log.d(TAG, "Starting widget refresh for widgetId=$widgetId")
                val widgetManager = VoltraWidgetManager(context)

                // Apply timeout to prevent indefinitely hanging updates
                withTimeout(UPDATE_TIMEOUT_MS) {
                    widgetManager.updateWidget(widgetId)
                }

                Log.d(TAG, "Widget refresh completed for widgetId=$widgetId")
            } catch (e: TimeoutCancellationException) {
                Log.e(TAG, "Widget refresh timed out after ${UPDATE_TIMEOUT_MS}ms for widgetId=$widgetId", e)
                // Attempt to show fallback state on timeout
                showFallbackState(context, widgetId, "Update timed out")
            } catch (e: Exception) {
                Log.e(TAG, "Failed to refresh widget widgetId=$widgetId: ${e.message}", e)
                // Attempt to show fallback state on error
                showFallbackState(context, widgetId, e.message ?: "Unknown error")
            }
        }
    }

    /**
     * Validate widgetId format to prevent injection or malformed IDs.
     * Valid IDs should be alphanumeric with optional underscores, hyphens, and dots.
     */
    private fun isValidWidgetId(widgetId: String): Boolean {
        // Allow alphanumeric, underscores, hyphens, and dots
        // Max length of 128 characters to prevent abuse
        if (widgetId.length > 128) return false
        return widgetId.matches(Regex("^[a-zA-Z0-9_\\-.]+$"))
    }

    /**
     * Attempt to show a fallback state when widget update fails.
     * This keeps the widget visible with a sensible message rather than
     * leaving it in a broken state.
     */
    private suspend fun showFallbackState(
        context: Context,
        widgetId: String,
        errorMessage: String,
    ) {
        try {
            Log.d(TAG, "Attempting to show fallback state for widgetId=$widgetId, error=$errorMessage")
            // For now, we log the error. The widget will retain its last known good state
            // since we don't clear the SharedPreferences data.
            // In the future, this could render a specific error UI.
            Log.w(TAG, "Widget $widgetId is using last known good state due to update failure")
        } catch (e: Exception) {
            Log.e(TAG, "Failed to show fallback state for widgetId=$widgetId: ${e.message}", e)
        }
    }

    /**
     * Store the last triggered action info in SharedPreferences.
     * This allows JavaScript to retrieve which action was triggered.
     *
     * @return true if the action was stored successfully, false otherwise
     */
    private fun storeLastAction(
        context: Context,
        widgetId: String,
        actionName: String?,
        componentId: String?,
    ): Boolean {
        return try {
            val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
                ?: run {
                    Log.e(TAG, "Failed to get SharedPreferences for widgetId=$widgetId")
                    return false
                }

            val actionInfo = try {
                JSONObject().apply {
                    put("actionName", actionName ?: componentId ?: "unknown")
                    put("componentId", componentId ?: "unknown")
                    put("timestamp", System.currentTimeMillis())
                }
            } catch (e: JSONException) {
                Log.e(TAG, "Failed to create action info JSON: ${e.message}", e)
                return false
            }

            val success = prefs
                .edit()
                .putString("$KEY_LAST_ACTION_PREFIX$widgetId", actionInfo.toString())
                .commit()

            if (success) {
                Log.d(TAG, "Stored last action for widgetId=$widgetId: $actionInfo")
            } else {
                Log.e(TAG, "SharedPreferences commit() returned false for widgetId=$widgetId")
            }

            success
        } catch (e: Exception) {
            Log.e(TAG, "Exception storing last action for widgetId=$widgetId: ${e.message}", e)
            false
        }
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
