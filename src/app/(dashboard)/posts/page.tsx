'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getPostsApi } from '@/lib/api';
import type { Post } from '@/types/post';
import { getImageUrl } from '@/lib/env';
import { Button } from '@/components/ui/Button';

export default function MyPostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getPostsApi()
      .then((res) => {
        if (!cancelled && res.data) setPosts(res.data);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">My Posts</h1>
        <Link href="/posts/new">
          <Button>New Post</Button>
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="size-8 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-900 dark:border-zinc-600 dark:border-t-zinc-100" />
        </div>
      ) : posts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-12 text-center dark:border-zinc-700 dark:bg-zinc-900">
          <p className="text-zinc-500 dark:text-zinc-400">No posts yet.</p>
          <Link href="/posts/new" className="mt-4 inline-block">
            <Button>Create your first post</Button>
          </Link>
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-1">
          {posts.map((post) => (
            <li key={post._id}>
              <Link
                href={`/posts/${post._id}`}
                className="block rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition-all hover:border-zinc-300 hover:shadow dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
              >
                {post.image && (
                  <div className="mb-3 overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-700">
                    <img
                      src={getImageUrl(post.image)}
                      alt=""
                      className="h-40 w-full object-cover"
                    />
                  </div>
                )}
                <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">{post.title}</h2>
                <p className="mt-2 line-clamp-3 text-sm text-zinc-600 dark:text-zinc-400">
                  {post.content}
                </p>
                <div className="mt-4 flex items-center justify-between text-xs text-zinc-400 dark:text-zinc-500">
                  <span>Updated {new Date(post.updatedAt).toLocaleDateString()}</span>
                  <span className="text-zinc-500 dark:text-zinc-400">View →</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
