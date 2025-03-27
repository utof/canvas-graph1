// TODO why is it in svelte? Is it worse if TS only?
import type { Plugin, Command } from './types/index';
import { emit } from './events';

export const app = $state<{
	plugins: Record<string, Plugin>;
	commands: Record<string, Command>;
	contextStack: Array<{
		type: string;
		id: string;
		meta?: Record<string, unknown>;
	}>;
	dataStores: Record<string, Record<string, unknown>>;
	vaultConfig: {
		baseDir: string;
		defaultExtensions: Record<string, string>;
	};
}>({
	plugins: {},
	commands: {},
	contextStack: [],
	dataStores: {},
	vaultConfig: {
		baseDir: 'canvas-vault',
		defaultExtensions: {
			note: 'json',
			flow: 'json',
			image: 'png'
		}
	}
});

// New context system
const currentContext = $derived(
	app.contextStack.length > 0 ? app.contextStack[app.contextStack.length - 1] : null
);

export function getCurrentContext() {
	return currentContext;
}

export function pushContext(type: string, id: string, meta?: Record<string, unknown>) {
	app.contextStack.push({ type, id, meta });
	emit('context:changed', { type, id, action: 'push' });
}

export function popContext() {
	if (app.contextStack.length > 0) {
		const popped = app.contextStack.pop();
		emit('context:changed', {
			type: popped?.type,
			id: popped?.id,
			action: 'pop'
		});
	}
}

export function getContextsOfType(type: string) {
	return app.contextStack.filter((ctx) => ctx.type === type);
}

// Vault configuration helpers
export function setVaultLocation(path: string) {
	app.vaultConfig.baseDir = path;
	emit('vault:location-changed', path);
}

export function getVaultLocation() {
	return app.vaultConfig.baseDir;
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
