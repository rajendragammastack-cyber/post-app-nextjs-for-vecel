'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getFeedApi } from '@/lib/api';
import type { FeedPost } from '@/types/post';
import { PostCard } from '@/components/feed/PostCard';
import { Button } from '@/components/ui/Button';

export default function FeedPage() {
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);

  const loadFeed = () => {
    setLoading(true);
    getFeedApi()
      .then((res) => {
        if (res.data) setPosts(res.data);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadFeed();
  }, []);

  const handleLikeToggle = (postId: string, likeCount: number, userLiked: boolean) => {
    setPosts((prev) =>
      prev.map((p) =>
        p._id === postId ? { ...p, likeCount, userLiked } : p
      )
    );
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          Feed
        </h1>
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
          <p className="text-zinc-500 dark:text-zinc-400">No posts in the feed yet.</p>
          <Link href="/posts/new" className="mt-4 inline-block">
            <Button>Create the first post</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {posts.map((post) => (
            <PostCard
              key={post._id}
              post={post}
              onLikeToggle={handleLikeToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
}
