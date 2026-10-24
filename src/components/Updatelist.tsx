"use client";

import Link from "next/link";

type Updatelist = {
	id: string;
	user_id: string;
	content: string;
	image_url: string | null;
	created_at: number;
	like_count: number;
	comment_count: number;
	repost_count: number;
	is_liked: boolean;
	is_reposted: boolean;
	user?: { username: string; yourname: string; avatar: string | null };
};

export default function Updatelist({ data, limit = Infinity }: { data: Updatelist[]; limit?: number }) {
	return (
		<>
			{data?.slice(0, limit)?.map((update) => (
				<article key={update.id}>
					<Link href={`/update/${update.id}`} className="block p-5 transition duration-150 ease-in-out hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-gray-50 rounded-lg">
						<div className="md:flex items-center">
							<div className="w-full">
								<div className="md:flex items-center justify-between mt-4 md:mt-0 w-full">
									<h2 className="text-gray-800 text-base font-semibold truncate">{update.content}</h2>
								</div>
								<div className="md:mt-1 mt-3 flex items-center text-gray-600">
									<p className="text-gray-600 text-xs">
										by <span className="text-blue-500">{update.user?.username || "unknown"}</span>
									</p>
									<div className="w-1 h-1 bg-gray-500 rounded-full mx-2" aria-hidden="true" />
									<time className="text-gray-600 text-xs">
										{new Date(update.created_at * 1000).toLocaleDateString()}
									</time>
								</div>
							</div>
						</div>
						
						{/* Tampilkan potongan konten jika lebih dari 100 karakter */}
						<p className="mt-3 text-gray-600 text-sm">
							{update.content.length > 100 ? update.content.substring(0, 100) + "..." : update.content}
						</p>
						
						<div className="mt-3 md:flex items-center text-gray-600">
							<div className="flex items-center md:my-0 my-2">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									className="icon icon-tabler icon-tabler-message"
									width={24}
									height={24}
									viewBox="0 0 24 24"
									strokeWidth="1.5"
									stroke="currentColor"
									fill="none"
									strokeLinecap="round"
									strokeLinejoin="round"
									aria-hidden="true"
								>
									<path stroke="none" d="M0 0h24v24H0z" />
									<path d="M4 21v-13a3 3 0 0 1 3 -3h10a3 3 0 0 1 3 3v6a3 3 0 0 1 -3 3h-9l-4 4" />
									<line x1={8} y1={9} x2={16} y2={9} />
									<line x1={8} y1={13} x2={14} y2={13} />
								</svg>
								<p className="ml-2 text-gray-600 text-xs">{update.comment_count || 0} comments</p>
							</div>
						</div>
					</Link>
				</article>
			))}
		</>
	);
}
