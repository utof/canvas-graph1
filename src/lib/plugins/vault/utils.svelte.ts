import { emit } from '$lib/core/events';
import { app } from '$lib/core/state.svelte';

// OPFS root directory handle
let rootOpfs: FileSystemDirectoryHandle | null = null;

export async function chooseDir() {
	// @ts-expect-error - Experimental API
	rootOpfs = await window.showDirectoryPicker({ mode: 'readwrite' });
	return rootOpfs;
}

export function getDirHandle() {
	return rootOpfs;
}

export async function removeDir() {
	if (rootOpfs) {
		await rootOpfs.removeEntry(rootOpfs.name);
		rootOpfs = null;
	}
}

export async function listFiles() {
	if (!rootOpfs) {
		throw new Error('No OPFS root directory handle found. Please initialize OPFS first.');
	}

	const entries: FileSystemHandle[] = [];

	for await (const entry of rootOpfs.values()) {
		entries.push(entry);
	}

	return entries;
}
