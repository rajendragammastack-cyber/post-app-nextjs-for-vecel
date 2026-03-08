'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getPostsApi } from '@/lib/api';
import type { Post } from '@/types/post';
import { getImageUrl } from '@/lib/env';
import { Button } from '@/components/ui/Button';

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
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

  if (authLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-900 dark:border-zinc-600 dark:border-t-zinc-100" />
      </div>
    );
  }

  const recent = posts.slice(0, 3);

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-8">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 sm:text-3xl">
          Welcome back, {user?.name}
        </h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Manage your posts from the dashboard. Create new posts or view and edit existing ones.
        </p>
        <div className="mt-6 flex flex-wrap gap-4">
          <div className="rounded-xl bg-zinc-100 px-4 py-3 dark:bg-zinc-800">
            <span className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">{posts.length}</span>
            <span className="ml-2 text-sm text-zinc-600 dark:text-zinc-400">posts</span>
          </div>
          <Link href="/posts/new">
            <Button>New Post</Button>
          </Link>
        </div>
      </div>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Recent posts</h2>
          {posts.length > 0 && (
            <Link href="/posts">
              <Button variant="ghost" className="text-sm">View all</Button>
            </Link>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="size-8 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-900 dark:border-zinc-600 dark:border-t-zinc-100" />
          </div>
        ) : recent.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-12 text-center dark:border-zinc-700 dark:bg-zinc-900">
            <p className="text-zinc-500 dark:text-zinc-400">You haven’t created any posts yet.</p>
            <Link href="/posts/new" className="mt-4 inline-block">
              <Button>Create your first post</Button>
            </Link>
          </div>
        ) : (
          <ul className="space-y-3">
            {recent.map((post) => (
              <li key={post._id}>
                <Link
                  href={`/posts/${post._id}`}
                  className="block rounded-xl border border-zinc-200 bg-white p-4 transition-colors hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700 dark:hover:bg-zinc-800"
                >
                  {post.image && (
                    <div className="mb-3 overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-700">
                      <img
                        src={getImageUrl(post.image)}
                        alt=""
                        className="h-32 w-full object-cover"
                      />
                    </div>
                  )}
                  <h3 className="font-medium text-zinc-900 dark:text-zinc-100">{post.title}</h3>
                  <p className="mt-1 line-clamp-2 text-sm text-zinc-600 dark:text-zinc-400">
                    {post.content}
                  </p>
                  <p className="mt-2 text-xs text-zinc-400 dark:text-zinc-500">
                    {new Date(post.updatedAt).toLocaleDateString()}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
