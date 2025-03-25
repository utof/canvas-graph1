import type { EventCallback } from './types';
// i heard svelte has its' own event handler

const events: Record<string, EventCallback[]> = {};

export function on(event: string, callback: EventCallback) {
	if (!events[event]) {
		events[event] = [];
	}
	events[event].push(callback);

	return () => (events[event] = events[event].filter((cb) => cb !== callback));
}

export function emit(event: string, ...args: any[]) {
	const callbacks = events[event];

	if (callbacks) {
		callbacks.forEach((callback) => {
			try {
				callback(...args);
			} catch (error) {
				console.error(`Error in event listener for "${event}":`, error);
			}
		});
	}
}
