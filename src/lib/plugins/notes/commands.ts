import { emit } from '$lib/core/events';
import { app, pushContext } from '$lib/core/state.svelte';
import type { Command, Note } from '$lib/core/types';
import { createNoteObject } from './utils';
import { runCommand } from '$lib/core/state.svelte';

// Create command definitions
export const createNoteCommand: Command = {
	id: 'notes.create',
	name: 'Create Note',
	description: 'Creates a new note',
	run: async (content: string = '', parent?: string) => {
		const note = createNoteObject(content, parent);

		// Initialize typed notes data store if needed
		if (!app.dataStores.notes) {
			app.dataStores.notes = {} as Record<string, Note>;
		}

		// Add note to data store with proper typing
		app.dataStores.notes = {
			...app.dataStores.notes,
			[note.id]: note
		};

		// If parent specified, update parent's children
		if (parent && app.dataStores.notes?.[parent]) {
			const parentNote = app.dataStores.notes[parent] as Note;
			app.dataStores.notes[parent] = {
				...parentNote,
				children: [...(parentNote.children || []), note.id]
			};
			await runCommand('vault.saveFile', 'note', parent, app.dataStores.notes[parent]);
		}

		// Save to vault
		await runCommand('vault.saveFile', 'note', note.id, note);

		// Set as active context
		pushContext('note', note.id);

		emit('note:created', note.id);
		return note.id;
	}
};
export const updateNoteCommand: Command = {
	id: 'notes.update',
	name: 'Update Note',
	description: 'Updates an existing note',
	run: async (id: string, changes: Partial<Note>) => {
		if (!app.dataStores.notes?.[id]) {
			return false;
		}

		app.dataStores.notes[id] = { ...app.dataStores.notes[id], ...changes };
		await runCommand('vault.saveFile', 'note', id, app.dataStores.notes[id]);
		emit('note:updated', id);
		return true;
	}
};

export const setActiveNoteCommand: Command = {
	id: 'notes.setActive',
	name: 'Set Active Note',
	description: 'Sets the currently active note',
	run: (id: string) => {
		if (!app.dataStores.notes?.[id]) {
			return false;
		}

		pushContext('note', id);
		return true;
	}
};
