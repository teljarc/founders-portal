export type VoteType = 'must_build' | 'interesting' | 'maybe' | 'skip';
export type ProjectStatus = 'live' | 'building' | 'idea';
export type NotificationType = 'new_idea' | 'new_comment';
export type UserRole = 'founder' | 'guest';
export type ContextSlug = 'claude' | 'memory' | 'todo' | 'ideas';

export interface Idea {
  id: string;
  created_at: string;
  title: string;
  description: string | null;
  tags: string[];
  created_by: string;
  created_by_name: string | null;
  votes?: Vote[];
  comments?: Comment[];
  published_ideas?: PublishedIdea[];
  guest_votes?: GuestVote[];
  guest_comments?: GuestComment[];
}

export interface Vote {
  id: string;
  idea_id: string;
  user_id: string;
  vote_type: VoteType;
}

export interface Comment {
  id: string;
  created_at: string;
  idea_id: string;
  parent_id: string | null;
  user_id: string;
  user_name: string;
  body: string;
}

export interface Notification {
  id: string;
  created_at: string;
  user_id: string;
  type: NotificationType;
  read: boolean;
  idea_id: string;
  triggered_by_name: string | null;
  ideas?: Idea;
}

export interface Project {
  id: string;
  created_at: string;
  name: string;
  description: string | null;
  url: string | null;
  status: ProjectStatus;
  created_by: string;
  created_by_name: string | null;
}

export interface ContextFile {
  id: string;
  updated_at: string;
  slug: ContextSlug;
  content: string;
  updated_by_name: string | null;
}

export interface PushSubscriptionRecord {
  id: string;
  user_id: string;
  subscription: PushSubscriptionJSON;
  created_at: string;
}

export interface PublishedIdea {
  id: string;
  idea_id: string;
  published_at: string;
  published_by: string;
}

export interface GuestVote {
  id: string;
  created_at: string;
  idea_id: string;
  user_id: string;
  score: number;
}

export interface GuestComment {
  id: string;
  created_at: string;
  idea_id: string;
  user_id: string;
  user_name: string;
  body: string;
}
