export interface Note {
	id: string;
	content: string;
	parent?: string;
	children?: string[];
}
