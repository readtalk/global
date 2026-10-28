//
"use client";
import { useState, useEffect, Suspense } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { timeAgo } from "@/lib/timer";
import LikeRepost from "@/components/LikeRepost";

type UpdatelistItem = {
  id: string;
  user_id: string;
  content: string;
  image_url: string | null;
  created_at: number;
  like_count: number;
  comment_count: number;
  repost_count: number;
  is_liked?: boolean;
  is_reposted?: boolean;
  author_username?: string;
  author_yourname?: string;
  author_avatar?: string | null;
};

type Comment = {
  id: string;
  updatelist_id: string;
  user_id: string;
  content: string;
  created_at: number;
  author_username?: string;
  author_yourname?: string;
  author_avatar?: string | null;
};

function UpdateDetailContent() {
  const params = useParams();
  const id = params.id as string;
  const [post, setPost] = useState<UpdatelistItem | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isPosting, setIsPosting] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ username: string; yourname: string; avatar: string | null } | null>(null);

  const fetchData = async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    try {
      const token = localStorage.getItem("session");
      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;
      const [resPost, resComments] = await Promise.all([
        fetch(`/api/updates/${id}`, { headers }),
        fetch(`/api/updates/${id}/comments`, { headers }),
      ]);
      const dataPost = (await resPost.json()) as { success: boolean; update?: UpdatelistItem; updates?: UpdatelistItem[] };
      if (dataPost.success) {
        const found = dataPost.update ?? dataPost.updates?.[0] ?? null;
        if (found) setPost(found);
      }
      const dataComments = (await resComments.json()) as { success: boolean; comments: Comment[] };
      if (dataComments.success) setComments(dataComments.comments);
    } catch (error) {
      console.error(error);
    } finally {
      if (showLoading) setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const session = localStorage.getItem("session");
    if (session) {
      try {
        const payload = JSON.parse(atob(session.split(".")[1]));
        const email = payload.properties?.email;
        if (email) setCurrentUser({ username: email.split("@")[0], yourname: email.split("@")[0], avatar: null });
        fetch("https://auth.readtalk.workers.dev/settings", {
          headers: { Authorization: `Bearer ${session}` },
        })
          .then((res) => res.json() as Promise<{ success: boolean; user?: any }>)
          .then((data) => {
            if (data.success && data.user) setCurrentUser(data.user);
          })
          .catch(() => {});
      } catch {}
    }
  }, [id]);

  const handlePostComment = async () => {
    if (!content.trim()) return;
    const token = localStorage.getItem("session");
    if (!token) return alert("You must be logged in to comment.");
    const commentContent = content;
    const tempComment: Comment = {
      id: crypto.randomUUID(),
      updatelist_id: id,
      user_id: currentUser?.username || "temp",
      content: commentContent,
      created_at: Math.floor(Date.now() / 1000),
      author_username: currentUser?.username,
      author_yourname: currentUser?.yourname,
      author_avatar: currentUser?.avatar,
    };
    setComments((prev) => [...prev, tempComment]);
    setContent("");
    setIsPosting(true);
    try {
      const res = await fetch(`/api/updates/${id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ content: commentContent }),
      });
      if (res.ok) {
        await fetchData(false);
      }
    } catch (error) {
      console.error(error);
      fetchData(false);
    } finally {
      setIsPosting(false);
    }
  };

  if (isLoading) return <div className="w-full flex-1 min-h-0 flex justify-center items-center"><p className="text-gray-500">Loading...</p></div>;

  return (
    <div className="w-full flex-1 min-h-0 flex flex-col overflow-hidden">
      <div className="flex-none bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-4 z-10">
        <Link href="/" className="text-gray-600 hover:text-gray-900">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5"></path><polyline points="12 19 5 12 12 5"></polyline></svg>
        </Link>
        <h1 className="text-lg font-bold text-gray-900">Post's Activity</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0 overscroll-contain">
        {post && (
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <Link href={`/profile/@${post.author_username}`} className="shrink-0">
                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold overflow-hidden">
                  {post.author_avatar ? <img src={post.author_avatar} className="w-full h-full object-cover" /> : post.author_username?.[0]?.toUpperCase()}
                </div>
              </Link>
              <div>
                <div className="flex items-center gap-2">
                  <Link href={`/profile/@${post.author_username}`} className="text-gray-900 font-semibold hover:underline">{post.author_yourname}</Link>
                  {post.created_at && (<><span className="text-gray-400 text-xs">·</span><span className="text-gray-500 text-xs">{timeAgo(post.created_at)}</span></>)}
                </div>
                <p className="text-gray-500 text-xs">@{post.author_username}</p>
              </div>
            </div>
            <p className="text-gray-800 whitespace-pre-wrap text-[15px]">{post.content}</p>
            {post.image_url && <img src={post.image_url} alt="Post Image" className="mt-3 rounded-lg max-h-80 w-full object-cover" />}
            <div className="mt-4 flex items-center gap-6 text-gray-500 text-sm border-t border-gray-200 pt-3">
              <Link href={`/update/${post.id}`} className="flex items-center gap-1 hover:text-blue-500 transition"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>{post.comment_count || 0}</Link>
              <LikeRepost
                id={post.id}
                like_count={post.like_count}
                repost_count={post.repost_count}
                is_liked={post.is_liked}
                is_reposted={post.is_reposted}
                onUpdate={() => fetchData(false)}
              />
            </div>
          </div>
        )}
        <div className="border-b border-gray-200 pb-2 mb-4"><p className="text-xs text-gray-500 text-center">Comments</p></div>
        {comments.length > 0 ? (
          comments.map((comment) => (
            <div key={comment.id} className="flex gap-3 items-start">
              <Link href={`/profile/@${comment.author_username}`} className="shrink-0">
                <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-bold text-xs overflow-hidden">
                  {comment.author_avatar ? <img src={comment.author_avatar} className="w-full h-full object-cover" /> : comment.author_username?.[0]?.toUpperCase()}
                </div>
              </Link>
              <div className="bg-gray-100 rounded-2xl px-4 py-2 max-w-[85%]">
                <div className="flex items-center gap-2">
                  <Link href={`/profile/@${comment.author_username}`} className="text-gray-900 font-semibold text-sm hover:underline">{comment.author_yourname}</Link>
                  {comment.created_at && (<><span className="text-gray-400 text-[10px]">·</span><span className="text-gray-500 text-[10px]">{timeAgo(comment.created_at)}</span></>)}
                </div>
                <p className="text-gray-800 text-[15px]">{comment.content}</p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500 text-sm mt-4">No comments yet. Be the first to reply!</p>
        )}
      </div>

      <div className="flex-none bg-white border-t border-gray-200 p-3 flex gap-2 pb-[max(12px,env(safe-area-inset-bottom))]">
        <input type="text" value={content} onChange={(e) => setContent(e.target.value)} placeholder="Write a comment..." className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" onKeyDown={(e) => e.key === "Enter" && handlePostComment()} />
        <button onClick={handlePostComment} disabled={isPosting || !content.trim()} className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-semibold disabled:opacity-50">{isPosting ? "..." : "Reply"}</button>
      </div>
    </div>
  );
}

export default function UpdateDetail() {
  return <Suspense fallback={<div className="p-4 text-center">Loading...</div>}><UpdateDetailContent /></Suspense>;
}
