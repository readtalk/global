export interface Update {
	id: string;
	text: string;
	completed: boolean;
	createdAt: number;
}

export class UpdateManager {
	constructor(
		private kv: KVNamespace,
		private updatesKey: string = "updates",
	) {}

	async list(): Promise<Update[]> {
		const updates = await this.kv.get(this.updatesKey, "json");
		if (Array.isArray(updates)) {
			updates.sort((a: Update, b: Update) => b.createdAt - a.createdAt);
		}
		return (updates || []) as Update[];
	}

	async create(text: string): Promise<Update> {
		const newUpdate: Update = {
			id: crypto.randomUUID(),
			text,
			completed: false,
			createdAt: Date.now(),
		};
		const updates = await this.list();
		updates.push(newUpdate);
		await this.kv.put(this.updatesKey, JSON.stringify(updates), {
			expirationTtl: 300,
		});
		return newUpdate;
	}

	async toggle(id: string): Promise<Update> {
		const updates = await this.list();
		const index = updates.findIndex((u) => u.id === id);
		if (index === -1) {
			throw new Error(`Update with id ${id} not found`);
		}
		updates[index].completed = !updates[index].completed;
		await this.kv.put(this.updatesKey, JSON.stringify(updates), {
			expirationTtl: 300,
		});
		return updates[index];
	}

	async delete(id: string): Promise<void> {
		const updates = await this.list();
		const newUpdates = updates.filter((u) => u.id !== id);
		await this.kv.put(this.updatesKey, JSON.stringify(newUpdates), {
			expirationTtl: 300,
		});
	}
}
