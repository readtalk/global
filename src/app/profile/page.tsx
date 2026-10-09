import { getCloudflareContext } from "@opennextjs/cloudflare";
import { UpdateManager } from "@/lib/update-manager";
import { createUpdate, toggleUpdate, deleteUpdate } from "./actions";

export const dynamic = "force-dynamic";

export default async function UpdatePage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;
	const { env } = await getCloudflareContext({ async: true });
	const manager = new UpdateManager(env.UPDATE_LIST, id);
	const updates = await manager.list();

	return (
		<div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-8 px-4">
			<div className="max-w-md mx-auto">
				<h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-8">
					READTalk
				</h1>

				<form
					action={createUpdate.bind(null, id)}
					className="mb-8 flex gap-2"
				>
					<input
						type="text"
						name="text"
						placeholder="Update-List"
						className="flex-1 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white shadow-sm px-4 py-2"
					/>
					<button
						type="submit"
						className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
					>
						+
					</button>
				</form>

				<ul className="space-y-2">
					{updates.map((u) => (
						<li
							key={u.id}
							className="flex items-center gap-2 bg-white dark:bg-gray-800 p-4 rounded-lg shadow"
						>
							<form
								action={toggleUpdate.bind(null, id, u.id)}
								className="flex-1 flex items-center gap-2"
							>
								<button
									type="submit"
									className="text-blue-500 hover:text-gray-500 text-left w-full"
								>
									<span
										className={
											u.completed ? "line-through text-gray-400" : ""
										}
									>
										{u.text}
									</span>
								</button>
							</form>

							<form action={deleteUpdate.bind(null, id, u.id)}>
								<button
									type="submit"
									className="text-red-500 hover:text-red-700"
								>
									❌
								</button>
							</form>
						</li>
					))}
				</ul>
			</div>
		</div>
	);
}
