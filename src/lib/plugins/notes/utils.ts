import type { Note } from '$lib/core/types';

// Utility functions

export function createNoteObject(content: string = '', parent?: string): Note {
	return {
		id: `note-${Date.now()}`,
		content,
		parent,
		children: []
	};
}
