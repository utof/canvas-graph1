// TODO why is it in svelte? Is it worse if TS only?
import type { Plugin, Command, Note } from './types/index';
import { emit } from './events';

export const app = $state<{
	plugins: Record<string, Plugin>;
	commands: Record<string, Command>;
	activeNoteId: string | null;
	notes: Record<string, Note>;
}>({
	plugins: {},
	commands: {},
	activeNoteId: null,
	notes: {}
}); // TODO why state?

const activeNote = $derived(app.activeNoteId ? app.notes[app.activeNoteId] : null);
export function getActiveNote() {
	return activeNote;
}

// TODO why have these functions when the methods already exist in the interfaces?
export function registerPlugin(plugin: Plugin) {
	// TODO why not plugin id?
	app.plugins[plugin.id] = plugin;
}

export function initPlugin(plugin: Plugin) {
	try {
		plugin.init();
		emit('plugin:initialized', plugin.id);
		return true;
	} catch (error) {
		console.error(`Failed to initialize plugin: ${plugin.id}`, error);
		emit('plugin:error', plugin.id, error);
		return false;
	}
}

export function registerCommand(command: Command) {
	app.commands[command.id] = command;
	emit('command:registered', command.id);
}

// TODO function to get plugin ... why?

export function runCommand(id: string, ...args: any[]) {
	const command = app.commands[id];
	if (command) {
		return command.run(...args);
	}
	return null;
}

export function setActiveNote(id: string | null) {
	app.activeNoteId = id;
	emit('note:active', id);
}
