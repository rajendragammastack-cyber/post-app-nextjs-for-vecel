export interface Post {
  _id: string;
  title: string;
  content: string;
  image?: string | null;
  user: string;
  createdAt: string;
  updatedAt: string;
}

export interface FeedPost {
  _id: string;
  title: string;
  content: string;
  image?: string | null;
  user: { _id: string; name: string };
  createdAt: string;
  updatedAt: string;
  likeCount: number;
  userLiked: boolean;
  commentCount: number;
}

export interface CommentNode {
  _id: string;
  content: string;
  user: { _id: string; name: string };
  createdAt: string;
  updatedAt: string;
  likeCount: number;
  userLiked: boolean;
  replies: CommentNode[];
}
