'use client';

import { useState } from 'react';
import { createCommentApi, likeCommentApi, unlikeCommentApi } from '@/lib/api';
import type { CommentNode } from '@/types/post';
import { Button } from '@/components/ui/Button';

interface CommentTreeProps {
  comments: CommentNode[];
  postId: string;
  onReplyAdded: () => void;
  depth?: number;
}

export function CommentTree({ comments, postId, onReplyAdded, depth = 0 }: CommentTreeProps) {
  return (
    <ul className="space-y-3">
      {comments.map((comment) => (
        <CommentNodeItem
          key={comment._id}
          comment={comment}
          postId={postId}
          onReplyAdded={onReplyAdded}
          depth={depth}
        />
      ))}
    </ul>
  );
}

interface CommentNodeItemProps {
  comment: CommentNode;
  postId: string;
  onReplyAdded: () => void;
  depth: number;
}

function CommentNodeItem({ comment, postId, onReplyAdded, depth }: CommentNodeItemProps) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [liking, setLiking] = useState(false);
  const [likeCount, setLikeCount] = useState(comment.likeCount);
  const [userLiked, setUserLiked] = useState(comment.userLiked);

  const handleLike = async () => {
    if (liking) return;
    setLiking(true);
    try {
      const res = userLiked
        ? await unlikeCommentApi(comment._id)
        : await likeCommentApi(comment._id);
      if (res.success && res.data) {
        setLikeCount(res.data.likeCount);
        setUserLiked(res.data.userLiked);
      }
    } finally {
      setLiking(false);
    }
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    const content = replyContent.trim();
    if (!content) return;
    setSubmitting(true);
    try {
      const res = await createCommentApi({
        postId,
        content,
        parentId: comment._id,
      });
      if (res.success) {
        setReplyContent('');
        setShowReplyForm(false);
        onReplyAdded();
      }
    } finally {
      setSubmitting(false);
    }
  };

  const depthClamp = Math.min(depth, 4);
  const marginLeft = depthClamp * 16;

  return (
    <li className="list-none" style={{ marginLeft: marginLeft ? `${marginLeft}px` : undefined }}>
      <div className={`rounded-xl border p-3 transition-colors ${
        depth === 0
          ? 'border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-800'
          : 'border-l-2 border-l-amber-200/80 bg-amber-50/30 dark:border-l-amber-800/50 dark:bg-amber-950/20 border-zinc-100 dark:border-zinc-700'
      }`}>
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
              {comment.user?.name ?? 'Unknown'}
            </span>
            <span className="ml-2 text-xs text-zinc-400 dark:text-zinc-500">
              {new Date(comment.createdAt).toLocaleString()}
            </span>
          </div>
        </div>
        <p className="mt-1 whitespace-pre-wrap text-sm text-zinc-700 dark:text-zinc-300">
          {comment.content}
        </p>
        <div className="mt-2 flex items-center gap-2">
          <button
            type="button"
            onClick={handleLike}
            disabled={liking}
            className={`rounded-full px-2 py-1 text-xs font-medium transition-colors ${
              userLiked
                ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                : 'text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-700'
            }`}
          >
            {userLiked ? '♥' : '♡'} {likeCount}
          </button>
          <button
            type="button"
            onClick={() => setShowReplyForm((s) => !s)}
            className="rounded-full px-2 py-1 text-xs font-medium text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-700"
          >
            Reply
          </button>
        </div>
      </div>

      {showReplyForm && (
        <form onSubmit={handleReply} className="mt-2 ml-2">
          <textarea
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            placeholder="Write a reply..."
            rows={2}
            className="w-full resize-none rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm focus:border-zinc-400 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            autoFocus
          />
          <div className="mt-2 flex gap-2">
            <Button type="submit" disabled={submitting || !replyContent.trim()}>
              Reply
            </Button>
            <Button type="button" variant="ghost" onClick={() => { setShowReplyForm(false); setReplyContent(''); }}>
              Cancel
            </Button>
          </div>
        </form>
      )}

      {(comment.replies && comment.replies.length > 0) && (
        <div className="mt-3 border-l-2 border-zinc-200 pl-3 dark:border-zinc-700">
          <CommentTree
            comments={comment.replies}
            postId={postId}
            onReplyAdded={onReplyAdded}
            depth={depth + 1}
          />
        </div>
      )}
    </li>
  );
}
