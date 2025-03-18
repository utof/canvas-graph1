export interface Plugin {
	id: string;
	name: string;
	description?: string;
	version?: string;
	init: () => void;
	cleanup?: () => void;
}
