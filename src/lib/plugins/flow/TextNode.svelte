<script lang="ts">
	import { Handle, Position } from '@xyflow/svelte';
	import type { NodeProps } from '@xyflow/svelte';

	let { data } = $props() as NodeProps;
	let label = $state(data.label);
</script>

<div class="p-2 border rounded bg-white">
	<Handle type="target" position={Position.Left} />
	<input type="text" bind:value={label} class="w-full p-1 border-none focus:outline-none nodrag" />
	<Handle type="source" position={Position.Right} />
</div>
