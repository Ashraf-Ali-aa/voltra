package voltra.events

/**
 * Represents a Voltra event that can be sent from widgets to the React Native app.
 * Events are persisted to SharedPreferences to survive app process death.
 */
sealed class VoltraEvent {
    abstract val type: String
    abstract val timestamp: Long

    /**
     * Convert event to a map for React Native bridge.
     */
    abstract fun toMap(): Map<String, Any?>

    companion object {
        /**
         * Parse event from persisted map data.
         */
        fun fromMap(map: Map<String, Any?>): VoltraEvent? {
            val type = map["type"] as? String ?: return null

            return when (type) {
                WidgetActionEvent.TYPE -> WidgetActionEvent.fromMap(map)
                else -> null
            }
        }
    }
}
