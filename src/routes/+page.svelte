<script lang="ts">
	import { onMount } from 'svelte';
	import { runCommand } from '$lib/core/state.svelte';

	interface VaultFile {
		name: string;
		handle: FileSystemFileHandle;
		type: string;
	}

	let currentDir = 'canvas-vault';
	let files: VaultFile[] = [];
	let newFileName = '';
	let isLoading = false;
	let error: string | null = null;

	// Load files from vault
	async function loadFiles(): Promise<void> {
		isLoading = true;
		try {
			files = (await runCommand('vault.list')) as VaultFile[];
			error = null;
		} catch (err) {
			error = 'Failed to load files';
			console.error(err);
		}
		isLoading = false;
	}

	// Change vault directory
	async function changeDir(newDir: string): Promise<void> {
		isLoading = true;
		try {
			await runCommand('vault.change-dir', newDir);
			currentDir = newDir;
			await loadFiles();
		} catch (err) {
			error = 'Failed to change directory';
			console.error(err);
		}
		isLoading = false;
	}

	// Create new file
	async function createFile(): Promise<void> {
		if (!newFileName) return;

		isLoading = true;
		try {
			await runCommand('vault.create', newFileName);
			newFileName = '';
			await loadFiles();
		} catch (err) {
			error = 'Failed to create file';
			console.error(err);
		}
		isLoading = false;
	}

	// Delete file
	async function deleteFile(name: string): Promise<void> {
		if (!confirm(`Delete ${name}?`)) return;

		isLoading = true;
		try {
			await runCommand('vault.delete', name);
			await loadFiles();
		} catch (err) {
			error = 'Failed to delete file';
			console.error(err);
		}
		isLoading = false;
	}

	// Initialize on mount
	onMount(async () => {
		await runCommand('vault.init');
		await loadFiles();
	});
</script>

<div class="vault-manager">
	<h2>Vault Manager</h2>

	{#if error}
		<div class="error">{error}</div>
	{/if}

	<div class="directory-controls">
		<input bind:value={currentDir} placeholder="Directory name" />
		<button on:click={() => changeDir(currentDir)}> Change Directory </button>
	</div>

	<div class="file-creation">
		<input bind:value={newFileName} placeholder="New file name" />
		<button on:click={createFile}> Create File </button>
	</div>

	{#if isLoading}
		<div>Loading...</div>
	{:else}
		<div class="file-list">
			{#each files as file}
				<div class="file-item">
					<span>{file.name}</span>
					<button class="delete-btn" on:click={() => deleteFile(file.name)}> X </button>
				</div>
			{/each}
		</div>
	{/if}
</div>

<style>
	.vault-manager {
		padding: 1rem;
		max-width: 600px;
		margin: 0 auto;
	}

	.error {
		color: red;
		margin-bottom: 1rem;
	}

	.directory-controls,
	.file-creation {
		display: flex;
		gap: 0.5rem;
		margin-bottom: 1rem;
	}

	input {
		flex-grow: 1;
		padding: 0.5rem;
	}

	.file-list {
		border: 1px solid #ddd;
		border-radius: 4px;
	}

	.file-item {
		display: flex;
		justify-content: space-between;
		padding: 0.5rem;
		border-bottom: 1px solid #eee;
	}

	.file-item:last-child {
		border-bottom: none;
	}

	.delete-btn {
		color: red;
		background: none;
		border: none;
		cursor: pointer;
	}
</style>
