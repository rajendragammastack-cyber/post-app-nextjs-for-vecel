/**
 * Client-side API: calls Next.js API routes (same origin).
 * Use for login, register, session so cookies are sent automatically.
 */

const BASE = process.env.API_URL || '';

export async function api<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include',
  });

  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(
      (json as { message?: string }).message || `Request failed: ${res.status}`
    );
  }

  return json as T;
}

export function loginApi(body: { email: string; password: string }) {
  return api<{ success: boolean; message: string; data: { id: string; name: string; email: string } }>(
    '/api/auth/login',
    { method: 'POST', body: JSON.stringify(body) }
  );
}

export function registerApi(body: {
  name: string;
  email: string;
  password: string;
}) {
  return api<{ success: boolean; message: string; data: { id: string; name: string; email: string } }>(
    '/api/auth/register',
    { method: 'POST', body: JSON.stringify(body) }
  );
}

export function sessionApi() {
  return api<{ success: boolean; data: { id: string; name: string; email: string } }>(
    '/api/auth/session'
  );
}

export function logoutApi() {
  return api<{ success: boolean }>('/api/auth/logout', { method: 'POST' });
}

// Posts (require auth via cookie)
export interface PostResponse {
  success: boolean;
  data?: import('@/types/post').Post;
  message?: string;
}

export interface PostsListResponse {
  success: boolean;
  data?: import('@/types/post').Post[];
  message?: string;
}

export function getPostsApi() {
  return api<PostsListResponse>('/api/posts');
}

export interface FeedResponse {
  success: boolean;
  data?: import('@/types/post').FeedPost[];
  message?: string;
}

export function getFeedApi() {
  return api<FeedResponse>('/api/posts/feed');
}

export function likePostApi(id: string) {
  return api<{ success: boolean; data?: { likeCount: number; userLiked: boolean } }>(
    `/api/posts/${id}/like`,
    { method: 'POST' }
  );
}

export function unlikePostApi(id: string) {
  return api<{ success: boolean; data?: { likeCount: number; userLiked: boolean } }>(
    `/api/posts/${id}/like`,
    { method: 'DELETE' }
  );
}


export interface CommentsResponse {
  success: boolean;
  data?: import('@/types/post').CommentNode[];
  message?: string;
}

export function getCommentsApi(postId: string) {
  return api<CommentsResponse>(`/api/comments/by-post/${postId}`);
}

export function createCommentApi(body: { postId: string; content: string; parentId?: string }) {
  return api<{ success: boolean; data?: import('@/types/post').CommentNode; message?: string }>(
    '/api/comments',
    { method: 'POST', body: JSON.stringify(body) }
  );
}

export function likeCommentApi(id: string) {
  return api<{ success: boolean; data?: { likeCount: number; userLiked: boolean } }>(
    `/api/comments/${id}/like`,
    { method: 'POST' }
  );
}

export function unlikeCommentApi(id: string) {
  return api<{ success: boolean; data?: { likeCount: number; userLiked: boolean } }>(
    `/api/comments/${id}/like`,
    { method: 'DELETE' }
  );
}

export function getPostApi(id: string) {
  return api<PostResponse>(`/api/posts/${id}`);
}

export function createPostApi(body: { title: string; content: string; image?: File | null }) {
  if (body.image) {
    const form = new FormData();
    form.append('title', body.title);
    form.append('content', body.content);
    form.append('image', body.image);
    return fetch(`${BASE}/api/posts`, {
      method: 'POST',
      body: form,
      credentials: 'include',
    }).then(async (res) => {
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error((json as { message?: string }).message || `Request failed: ${res.status}`);
      return json as PostResponse;
    });
  }
  return api<PostResponse>('/api/posts', { method: 'POST', body: JSON.stringify({ title: body.title, content: body.content }) });
}

export function updatePostApi(id: string, body: { title?: string; content?: string; image?: File | null }) {
  if (body.image) {
    const form = new FormData();
    if (body.title !== undefined) form.append('title', body.title);
    if (body.content !== undefined) form.append('content', body.content);
    form.append('image', body.image);
    return fetch(`${BASE}/api/posts/${id}`, {
      method: 'PUT',
      body: form,
      credentials: 'include',
    }).then(async (res) => {
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error((json as { message?: string }).message || `Request failed: ${res.status}`);
      return json as PostResponse;
    });
  }
  return api<PostResponse>(`/api/posts/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ title: body.title, content: body.content }),
  });
}

export function deletePostApi(id: string) {
  return api<{ success: boolean; message?: string }>(`/api/posts/${id}`, { method: 'DELETE' });
}
