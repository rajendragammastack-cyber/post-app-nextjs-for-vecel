'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { getPostApi, updatePostApi, deletePostApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import type { Post } from '@/types/post';
import { getImageUrl } from '@/lib/env';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';

export default function PostDetailPage() {
  const router = useRouter();
  const params = useParams();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const id = params.id as string;
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getPostApi(id)
      .then((res) => {
        if (!cancelled && res.data) {
          setPost(res.data);
          setTitle(res.data.title);
          setContent(res.data.content);
        }
      })
      .catch(() => {
        if (!cancelled) setPost(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [id]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please select an image (JPEG, PNG, GIF, WebP).');
      return;
    }
    setError('');
    setImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const clearImage = () => {
    setImage(null);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const res = await updatePostApi(id, {
        title: title.trim(),
        content: content.trim(),
        image: image || undefined,
      });
      if (res.success && res.data) {
        setPost(res.data);
        setEditMode(false);
        setImage(null);
        clearImage();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm('Delete this post? This cannot be undone.')) return;
    setDeleting(true);
    try {
      await deletePostApi(id);
      router.push('/posts');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete');
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="size-8 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-900 dark:border-zinc-600 dark:border-t-zinc-100" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white p-8 text-center dark:border-zinc-800 dark:bg-zinc-900">
        <p className="text-zinc-600 dark:text-zinc-400">Post not found.</p>
        <Link href="/posts" className="mt-4 inline-block">
          <Button variant="secondary">Back to My Posts</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <Link href="/posts" className="text-sm text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300">
          ← Back to My Posts
        </Link>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        {editMode ? (
          <form onSubmit={handleUpdate} className="p-6 sm:p-8">
            {error && (
              <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
                {error}
              </div>
            )}
            <Input
              label="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            <div className="mt-4">
              <Textarea
                label="Content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                rows={8}
              />
            </div>
            <div className="mt-4">
              <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Change image (optional)
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                onChange={handleFileChange}
                className="block w-full text-sm text-zinc-600 file:mr-3 file:rounded-lg file:border-0 file:bg-zinc-100 file:px-3 file:py-2 dark:file:bg-zinc-700 dark:file:text-zinc-200"
              />
              {(imagePreview || post?.image) && (
                <div className="relative mt-2 inline-block">
                  <img
                    src={imagePreview || (post?.image ? getImageUrl(post.image) : '')}
                    alt=""
                    className="max-h-40 rounded-lg border border-zinc-200 object-contain dark:border-zinc-700"
                  />
                  {imagePreview && (
                    <button type="button" onClick={clearImage} className="absolute right-2 top-2 rounded bg-black/60 px-2 py-1 text-xs text-white">
                      Remove new
                    </button>
                  )}
                </div>
              )}
            </div>
            <div className="mt-6 flex gap-3">
              <Button type="submit" loading={saving}>Save changes</Button>
              <Button type="button" variant="secondary" onClick={() => { setEditMode(false); setError(''); setTitle(post.title); setContent(post.content); setImage(null); clearImage(); }}>
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <>
            <div className="border-b border-zinc-200 p-6 dark:border-zinc-800 sm:p-8">
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 sm:text-3xl">
                {post.title}
              </h1>
              <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                Updated {new Date(post.updatedAt).toLocaleDateString()}
              </p>
            </div>
            {post.image && (
              <div className="border-b border-zinc-200 p-6 dark:border-zinc-800 sm:px-8 sm:pb-8">
                <img
                  src={getImageUrl(post.image)}
                  alt=""
                  className="w-full rounded-xl border border-zinc-200 object-contain dark:border-zinc-700"
                />
              </div>
            )}
            <div className="whitespace-pre-wrap p-6 text-zinc-700 dark:text-zinc-300 sm:p-8">
              {post.content}
            </div>
            {user && post.user && String(typeof post.user === 'object' ? (post.user as { _id: string })._id : post.user) === user.id && (
              <div className="flex flex-wrap gap-3 border-t border-zinc-200 p-6 dark:border-zinc-800 sm:p-8">
                <Button variant="secondary" onClick={() => setEditMode(true)}>
                  Edit post
                </Button>
                <Button
                  variant="ghost"
                  onClick={handleDelete}
                  loading={deleting}
                  className="text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
                >
                  Delete post
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
