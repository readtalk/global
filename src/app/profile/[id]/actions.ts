//
"use server";

import { revalidatePath } from "next/cache";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { UpdateManager } from "@/lib/update-manager";

async function getManager(id: string) {
	const { env } = await getCloudflareContext({ async: true });
	return new UpdateManager(env.UPDATE_LIST, id);
}

export async function createUpdate(id: string, formData: FormData) {
	const text = formData.get("text");
	if (typeof text !== "string" || !text.trim()) return;

	const manager = await getManager(id);
	await manager.create(text.trim());
	revalidatePath(`./${id}`);
}

export async function toggleUpdate(id: string, updateId: string) {
	const manager = await getManager(id);
	await manager.toggle(updateId);
	revalidatePath(`./${id}`);
}

export async function deleteUpdate(id: string, updateId: string) {
	const manager = await getManager(id);
	await manager.delete(updateId);
	revalidatePath(`./${id}`);
}
