<script lang="ts">
	import { onMount } from 'svelte';
	import {
		registerPlugin,
		initPlugin,
		runCommand,
		app,
		getActiveNote
	} from '$lib/core/state.svelte';
	import { notesPlugin } from '$lib/plugins/notes';
	import { vaultPlugin } from '$lib/plugins/vault/index.svelte.ts';
	import type { Note } from '$lib/core/types';

	let noteContent: string = $state('');

	onMount(() => {
		// Register and initialize plugins
		registerPlugin(notesPlugin);
		registerPlugin(vaultPlugin);

		initPlugin(notesPlugin);
		initPlugin(vaultPlugin);

		// Create a default note if there are no notes
		if (Object.keys(app.notes).length === 0) {
			runCommand('notes.create', 'Welcome to your new note!');
		}
	});

	// Keep the textarea in sync with the active note
	$effect(() => {
		const active = getActiveNote();
		if (active) {
			noteContent = active.content;
		}
	});
</script>

<main class="container mx-auto p-4">
	<h1 class="text-2xl font-bold mb-4">Information Manipulation Environment</h1>

	<div class="flex h-screen-minus-header">
		<!-- Sidebar -->
		<div class="w-64 border-r p-4">
			<button
				class="w-full bg-blue-500 text-white rounded px-4 py-2 mb-4"
				onclick={() => runCommand('notes.create')}
			>
				New Note
			</button>

			<div class="mt-4">
				<h3 class="text-sm font-semibold uppercase text-gray-500 mb-2">Notes</h3>
				<ul class="space-y-1">
					{#each Object.values(app.notes) as note: Note (note.id)}
						<li>
							<button
								class="w-full text-left p-2 rounded hover:bg-gray-100"
								class:bg-gray-200={note.id === app.activeNoteId}
								onclick={() => runCommand('notes.setActive', note.id)}
							>
								{note.content.split('\n')[0] || 'Untitled'}
							</button>
						</li>
					{/each}
				</ul>
			</div>
		</div>

		<!-- Main Content -->
		<div class="flex-1 flex flex-col">
			{#if getActiveNote()}
				<textarea
					class="flex-1 p-2 border-0"
					bind:value={noteContent}
					oninput={() => {
						if (app.activeNoteId) {
							runCommand('notes.update', app.activeNoteId, {
								content: noteContent
							});
						}
					}}
					placeholder="Start writing..."
				></textarea>
			{:else}
				<div class="flex h-full items-center justify-center text-gray-400">
					Select a note or create a new one
				</div>
			{/if}
		</div>
	</div>
</main>

<style>
	.h-screen-minus-header {
		height: calc(100vh - 120px);
	}
</style>
