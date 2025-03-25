import { emit } from '$lib/core/events';
import { app, setActiveNote } from '$lib/core/state.svelte';
import type { Command, Note } from '$lib/core/types';
import { createNoteObject } from './utils';

// Create command definitions
export const createNoteCommand: Command = {
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
export const updateNoteCommand: Command = {
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
export const setActiveNoteCommand: Command = {
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
