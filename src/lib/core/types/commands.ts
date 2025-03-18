export interface Command {
	id: string;
	name?: string;
	run: (...args: any[]) => any;
	contexts?: string[];
}
