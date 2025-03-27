<script lang="ts">
	import { SvelteFlow, Handle, Position } from '@xyflow/svelte';
	import type { Node, Edge, NodeProps } from '@xyflow/svelte';
	import TextNode from './TextNode.svelte';

	let nodes = $state.raw<Node[]>([
		{
			id: '1',
			type: 'textNode',
			position: { x: 0, y: 0 },
			data: { label: 'Node 1' }
		}
	]);
	let edges = $state.raw<Edge[]>([]);

	const nodeTypes = {
		textNode: TextNode
	};
</script>

<div class="h-screen w-full">
	<SvelteFlow bind:nodes bind:edges fitView />
</div>
