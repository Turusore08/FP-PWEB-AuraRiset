// --- AURARISET EVENT BUS (OBSERVER PATTERN) ---

class EventBus {
  constructor() {
    this.events = {};
  }

  /**
   * Subscribe to an event.
   * @param {string} event Name of the event
   * @param {function} callback Function to trigger
   * @returns {function} Unsubscribe trigger
   */
  subscribe(event, callback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
    
    // Return unsubscribe function
    return () => {
      this.events[event] = this.events[event].filter(cb => cb !== callback);
    };
  }

  /**
   * Publish an event to all subscribers.
   * @param {string} event Name of the event
   * @param {any} data Optional data to transmit
   */
  publish(event, data) {
    if (!this.events[event]) return;
    this.events[event].forEach(callback => {
      try {
        callback(data);
      } catch (err) {
        console.error(`Error in subscriber for event "${event}":`, err);
      }
    });
  }
}

// Export a single global instance (Singleton Observer Event Bus)
export const events = new EventBus();
