'use client';

import { useState, useCallback } from 'react';
import {
  getCommentsApi,
  createCommentApi,
  likePostApi,
  unlikePostApi,
} from '@/lib/api';
import type { FeedPost as FeedPostType, CommentNode } from '@/types/post';
import { getImageUrl } from '@/lib/env';
import { Button } from '@/components/ui/Button';
import { CommentTree } from './CommentTree';

interface PostCardProps {
  post: FeedPostType;
  onLikeToggle: (postId: string, likeCount: number, userLiked: boolean) => void;
}

export function PostCard({ post, onLikeToggle }: PostCardProps) {
  const [comments, setComments] = useState<CommentNode[] | null>(null);
  const [loadingComments, setLoadingComments] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [liking, setLiking] = useState(false);

  const loadComments = useCallback(async () => {
    if (comments !== null) return;
    setLoadingComments(true);
    try {
      const res = await getCommentsApi(post._id);
      if (res.data) setComments(res.data);
    } finally {
      setLoadingComments(false);
    }
  }, [post._id, comments]);

  const toggleComments = () => {
    setShowComments((s) => !s);
    if (!showComments) loadComments();
  };

  const handleLike = async () => {
    if (liking) return;
    setLiking(true);
    try {
      const res = post.userLiked
        ? await unlikePostApi(post._id)
        : await likePostApi(post._id);
      if (res.success && res.data)
        onLikeToggle(post._id, res.data.likeCount, res.data.userLiked);
    } finally {
      setLiking(false);
    }
  };

  const handleAddTopLevel = async (e: React.FormEvent) => {
    e.preventDefault();
    const content = replyContent.trim();
    if (!content) return;
    setSubmitting(true);
    try {
      const res = await createCommentApi({
        postId: post._id,
        content,
      });
      if (res.success) {
        setReplyContent('');
        await refreshComments();
      }
    } finally {
      setSubmitting(false);
    }
  };

  const refreshComments = useCallback(async () => {
    const res = await getCommentsApi(post._id);
    if (res.data) setComments(res.data);
  }, [post._id]);

  return (
    <article className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
      {post.image && (
        <div className="aspect-video w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800">
          <img
            src={getImageUrl(post.image)}
            alt=""
            className="h-full w-full object-cover"
          />
        </div>
      )}
      <div className="p-5 sm:p-6">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              {post.title}
            </h2>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              {post.user?.name ?? 'Unknown'} · {new Date(post.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        <p className="mt-3 whitespace-pre-wrap text-zinc-700 dark:text-zinc-300">
          {post.content}
        </p>

        <div className="mt-4 flex items-center gap-4 border-t border-zinc-100 pt-4 dark:border-zinc-800">
          <button
            type="button"
            onClick={handleLike}
            disabled={liking}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
              post.userLiked
                ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800'
            }`}
          >
            <span className={post.userLiked ? 'text-red-500' : ''}>
              {post.userLiked ? '♥' : '♡'}
            </span>
            <span>{post.likeCount}</span>
          </button>
          <button
            type="button"
            onClick={toggleComments}
            className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
          >
            <span>💬</span>
            <span>{post.commentCount}</span>
          </button>
        </div>
      </div>

      {showComments && (
        <div className="border-t border-zinc-200 bg-zinc-50/50 px-5 py-4 dark:border-zinc-800 dark:bg-zinc-950/50 sm:px-6">
          <form onSubmit={handleAddTopLevel} className="mb-4">
            <textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Write a comment..."
              rows={2}
              className="w-full resize-none rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            />
            <Button type="submit" disabled={submitting || !replyContent.trim()} className="mt-2">
              Comment
            </Button>
          </form>

          {loadingComments ? (
            <div className="flex justify-center py-6">
              <div className="size-6 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-600 dark:border-zinc-600 dark:border-t-zinc-300" />
            </div>
          ) : comments && comments.length > 0 ? (
            <CommentTree
              comments={comments}
              postId={post._id}
              onReplyAdded={refreshComments}
            />
          ) : comments && comments.length === 0 ? (
            <p className="py-4 text-center text-sm text-zinc-500 dark:text-zinc-400">
              No comments yet. Be the first!
            </p>
          ) : null}
        </div>
      )}
    </article>
  );
}
