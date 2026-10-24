"use client";

type Comment = {
	id: string;
	updatelist_id: string;
	user_id: string;
	content: string;
	created_at: number;
	user?: { username: string; yourname: string };
};

export default function UpdatelistComments({ data, limit = Infinity }: { data: Comment[]; limit?: number }) {
	return (
		<>
			{data?.slice(0, limit)?.map((comment) => (
				<article key={comment.id} className="flex items-center mb-7">
					<div className="w-full">
						<div className="flex items-center justify-between w-full">
							<h5 className="text-gray-800 text-sm font-semibold">{comment.user?.username || "unknown"}</h5>
							<time className="text-xs text-gray-600">
								{new Date(comment.created_at * 1000).toLocaleDateString()}
							</time>
						</div>
						<p className="mt-3 text-gray-600 text-sm">{comment.content}</p>
					</div>
				</article>
			))}
		</>
	);
}
