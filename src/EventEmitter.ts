// Type definition for the event map
type EventMap = {
  [key: string]: Function[];
};

/**
 * SimpleEventEmitter class for event management.
 */
export class EventEmitter {
  private events: EventMap = {};

  /**
   * Register a listener for an event.
   * @param event - Event name
   * @param listener - Listener function
   */
  public on<T extends string>(event: T, listener: Function): void {
    // Initialize the listener array if it does not exist
    if (!Array.isArray(this.events[event])) {
      this.events[event] = [];
    }

    // Add the listener to the array
    this.events[event].push(listener);
  }

  /**
   * Register a one-time listener for an event.
   * @param event - Event name
   * @param listener - Listener function
   */
  public once<T extends string>(event: T, listener: Function): void {
    const tempListener = (...args: any[]) => {
      listener(...args);
      this.off(event, tempListener);
    };
    this.on(event, tempListener);
  }

  /**
   * Remove a listener for an event.
   * @param event - Event name
   * @param listener - Listener function
   */
  public off<T extends string>(event: T, listener: Function): void {
    if (!this.events[event]) return;

    // Remove the listener from the array
    this.events[event] = this.events[event].filter((l) => l !== listener);
  }

  /**
   * Emit an event with arguments.
   * @param event - Event name
   * @param args - Arguments to pass to the listener functions
   */
  public emit<T extends string>(event: T, ...args: any[]): void {
    if (!this.events[event]) return;

    // Call each listener with the provided arguments
    for (const listener of this.events[event]) {
      listener(...args);
    }
  }
}
