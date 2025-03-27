export interface Command {
	id: string;
	name?: string;
	description: string;
	run: (...args: any[]) => any;
	context?: string;
}
