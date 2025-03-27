import type { Plugin } from '$lib/core/types';
import { registerCommand, app } from '$lib/core/state.svelte';
import { emit, on } from '$lib/core/events';

// OPFS root directory handle
let opfsRoot = $state<FileSystemDirectoryHandle | null>(null);
let notesDirHandle = $state<FileSystemDirectoryHandle | null>(null);

// Initialize OPFS
async function initOPFS() {
	try {
		opfsRoot = await navigator.storage.getDirectory();
		notesDirHandle = await opfsRoot.getDirectoryHandle('notes', { create: true });
		emit('vault:ready');
		return true;
	} catch (err) {
		console.error('Failed to initialize OPFS:', err);
		emit('vault:error', 'Failed to initialize file system');
		return false;
	}
}

// --- Commands ---

const initVaultCommand = {
	id: 'vault.init',
	name: 'Initialize Vault',
	description: 'Initializes the OPFS storage for notes',
	run: async () => {
		return await initOPFS();
	}
};

const loadNotesCommand = {
	id: 'vault.loadNotes',
	name: 'Load Notes',
	description: 'Loads all notes from OPFS storage',
	run: async () => {
		if (!notesDirHandle) {
			const success = await initOPFS();
			if (!success) return false;
		}

		try {
			const loadedNotes: Record<string, any> = {};
			let loadedCount = 0;

			// @ts-ignore - entries() is available in Chrome
			for await (const [name, handle] of notesDirHandle.entries()) {
				if (handle.kind === 'file' && name.endsWith('.json')) {
					try {
						const file = await handle.getFile();
						const content = await file.text();
						const noteData = JSON.parse(content);
						const noteId = name.replace('.json', '');

						if (noteData?.id && noteData?.content) {
							loadedNotes[noteId] = {
								id: noteData.id,
								content: noteData.content,
								...(noteData.parent && { parent: noteData.parent }),
								...(noteData.children && { children: noteData.children })
							};
							loadedCount++;
						}
					} catch (err) {
						console.error(`Error loading note ${name}:`, err);
					}
				}
			}

			app.notes = loadedNotes;
			emit('notes:loaded', Object.keys(loadedNotes));
			return true;
		} catch (error) {
			console.error('Error loading notes:', error);
			emit('vault:error', 'Error loading notes');
			return false;
		}
	}
};

const saveNoteCommand = {
	id: 'vault.saveNote',
	name: 'Save Note',
	description: 'Saves a note to OPFS storage',
	run: async (noteId: string) => {
		if (!notesDirHandle) {
			const success = await initOPFS();
			if (!success) return false;
		}

		const note = app.notes[noteId];
		if (!note) {
			console.warn(`Note ${noteId} not found`);
			return false;
		}

		try {
			const noteData = JSON.stringify(
				{
					...note,
					updatedAt: Date.now()
				},
				null,
				2
			);

			const fileName = `${noteId}.json`;
			// @ts-ignore - getFileHandle is available in Chrome
			const fileHandle = await notesDirHandle.getFileHandle(fileName, { create: true });
			// @ts-ignore - createWritable is available in Chrome
			const writable = await fileHandle.createWritable();
			await writable.write(noteData);
			await writable.close();

			emit('note:saved', noteId);
			return true;
		} catch (error) {
			console.error(`Error saving note ${noteId}:`, error);
			emit('vault:error', `Error saving note ${noteId}`);
			return false;
		}
	}
};

const saveAllNotesCommand = {
	id: 'vault.saveAll',
	name: 'Save All Notes',
	description: 'Saves all notes to OPFS storage',
	run: async () => {
		if (!notesDirHandle) {
			const success = await initOPFS();
			if (!success) return false;
		}

		const noteIds = Object.keys(app.notes);
		let successCount = 0;

		await Promise.all(
			noteIds.map(async (noteId) => {
				const saved = await saveNoteCommand.run(noteId);
				if (saved) successCount++;
				return saved;
			})
		);

		emit('notes:savedAll', successCount);
		return successCount === noteIds.length;
	}
};

// --- Plugin Definition ---

export const vaultPlugin: Plugin = {
	id: 'vault',
	name: 'Vault Storage',
	description: 'Manages loading and saving notes to OPFS',
	version: '1.0.0',
	init: () => {
		registerCommand(initVaultCommand);
		registerCommand(loadNotesCommand);
		registerCommand(saveNoteCommand);
		registerCommand(saveAllNotesCommand);

		// Auto-initialize on startup
		initOPFS().then((success) => {
			if (success) loadNotesCommand.run();
		});
	},
	cleanup: () => {
		// Cleanup if needed
	}
};
