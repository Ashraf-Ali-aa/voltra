package voltra.events

/**
 * Event emitted when a widget action (like a button press) is triggered.
 * Used to notify JavaScript code that it should update the widget.
 */
data class WidgetActionEvent(
    val widgetId: String,
    val actionName: String,
    val componentId: String,
    override val timestamp: Long = System.currentTimeMillis(),
) : VoltraEvent() {
    override val type: String = TYPE

    override fun toMap(): Map<String, Any?> =
        mapOf(
            "type" to type,
            "widgetId" to widgetId,
            "actionName" to actionName,
            "componentId" to componentId,
            "timestamp" to timestamp,
        )

    companion object {
        const val TYPE = "widgetAction"

        /**
         * Parse a WidgetActionEvent from a map.
         * Returns null if the map doesn't contain required fields.
         */
        fun fromMap(map: Map<String, Any?>): WidgetActionEvent? {
            val type = map["type"] as? String ?: return null
            if (type != TYPE) return null

            val widgetId = map["widgetId"] as? String ?: return null
            val actionName = map["actionName"] as? String ?: return null
            val componentId = map["componentId"] as? String ?: return null
            val timestamp = (map["timestamp"] as? Number)?.toLong() ?: System.currentTimeMillis()

            return WidgetActionEvent(
                widgetId = widgetId,
                actionName = actionName,
                componentId = componentId,
                timestamp = timestamp,
            )
        }
    }
}
