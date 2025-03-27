/* eslint-disable @typescript-eslint/ban-ts-comment */
import type { Plugin } from '$lib/core/types';
import { registerCommand } from '$lib/core/state.svelte';
import { emit } from '$lib/core/events';
import {
	initVaultCommand,
	listFilesCommand,
	createFileCommand,
	deleteFileCommand,
	changeDirectoryCommand
} from './commands';
import { initOPFS } from './utils.svelte';

export const vaultPlugin: Plugin = {
	id: 'vault',
	name: 'Vault Storage',
	description: 'Manages loading and saving data to OPFS',
	version: '1.0.0',
	init: () => {
		registerCommand(initVaultCommand);
		registerCommand(listFilesCommand);
		registerCommand(createFileCommand);
		registerCommand(deleteFileCommand);
		registerCommand(changeDirectoryCommand);

		// Auto-initialize on startup
		initOPFS().then((success) => {
			if (success) emit('vault:initialized');
		});
	},
	cleanup: () => {
		// Cleanup if needed
	}
};
