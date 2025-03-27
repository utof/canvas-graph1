import { initVaultDir, listFiles, createFile, deleteFile, chooseDir } from './utils.svelte';

// Vault Commands
export const initVaultCommand = {
	id: 'vault.init',
	name: 'Initialize Vault',
	description: 'Initializes the OPFS storage',
	run: async () => {
		return await initVaultDir();
	}
};

export const listFilesCommand = {
	id: 'vault.list',
	name: 'List Files',
	description: 'Lists all files in the vault directory',
	run: async () => {
		return await listFiles();
	}
};

export const createFileCommand = {
	id: 'vault.create',
	name: 'Create File',
	description: 'Creates a new file in the vault',
	run: async (name: string, content: string = '') => {
		return await createFile(name, content);
	}
};

export const deleteFileCommand = {
	id: 'vault.delete',
	name: 'Delete File',
	description: 'Deletes a file from the vault',
	run: async (name: string) => {
		return await deleteFile(name);
	}
};

export const changeDirectoryCommand = {
	id: 'vault.change-dir',
	name: 'Change Directory',
	description: 'Changes the vault storage directory',
	run: async (newDir: string) => {
		return await chooseDir(newDir);
	}
};
