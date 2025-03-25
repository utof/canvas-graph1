import { emit } from '../core/events';
import type { Plugin, Note } from '../core/types/';
import { registerCommand, app, setActiveNote } from '../core/state.svelte';

// Utility functions
function createNoteObject(content: string = '', parent?: string): Note {
	return {
		id: `note-${Date.now()}`,
		content,
		parent,
		children: []
	};
}

// Create command definitions
const createNoteCommand = {
	id: 'notes.create',
	name: 'Create Note',
	description: 'Creates a new note',
	run: (content: string = '', parent?: string) => {
		const note = createNoteObject(content, parent);

		// Add note to state
		app.notes = { ...app.notes, [note.id]: note };

		// If parent specified, update parent's children
		if (parent && app.notes[parent]) {
			const parentNote = app.notes[parent];
			app.notes[parent] = {
				...parentNote,
				children: [...(parentNote.children || []), note.id]
			};
		}

		// Set as active note
		setActiveNote(note.id);

		emit('note:created', note.id);
		return note.id;
	}
};

const updateNoteCommand = {
	id: 'notes.update',
	name: 'Update Note',
	description: 'Updates an existing note',
	run: (id: string, changes: Partial<Note>) => {
		if (!app.notes[id]) {
			return false;
		}

		app.notes[id] = { ...app.notes[id], ...changes };
		emit('note:updated', id);
		return true;
	}
};

const setActiveNoteCommand = {
	id: 'notes.setActive',
	name: 'Set Active Note',
	description: 'Sets the currently active note',
	run: (id: string) => {
		if (!app.notes[id]) {
			return false;
		}

		setActiveNote(id);
		return true;
	}
};

// Export the plugin
export const notesPlugin: Plugin = {
	id: 'notes',
	name: 'Notes',
	description: 'Core notes functionality',
	version: '1.0.0',
	init: () => {
		registerCommand(createNoteCommand);
		registerCommand(updateNoteCommand);
		registerCommand(setActiveNoteCommand);
	}
};
