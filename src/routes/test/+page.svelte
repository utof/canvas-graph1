<script lang="ts">
	import { chooseDir, getDirHandle, removeDir, listFiles } from '$lib/plugins/vault/utils.svelte';

	let dirHandle = getDirHandle();

	async function handleChoose() {
		dirHandle = await chooseDir();
		if (dirHandle) {
			await loadFiles();
		}
	}

	let files: any[] = [];

	async function loadFiles() {
		if (dirHandle) {
			files = await listFiles();
		} else {
			files = [];
		}
	}
</script>

<div class="m-10 text-2xl">
	<button class="btn" on:click={handleChoose}>Select Directory</button>
	<button
		class="btn"
		on:click={async () => {
			await removeDir();
			dirHandle = null;
		}}
	>
		Remove Directory
	</button>
	<div class="m-10 text-2xl">
		{#each files as file}
			<span>{file.name}</span>
			{console.log(file)} File
		{/each}
		<span>Files loaded: {files.length}</span>
	</div>

	{#if dirHandle}
		{dirHandle.name}
	{:else}
		No directory selected
	{/if}
</div>
