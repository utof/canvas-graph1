import type { Plugin } from '../../core/types';
import { registerCommand } from '../../core/state.svelte';
import { createNoteCommand, updateNoteCommand, setActiveNoteCommand } from './commands';

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
