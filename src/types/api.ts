// API response types — mirror app/Http/Resources/ on the server.

export type User = {
  id: number;
  name: string;
  username: string | null;
  email: string;
  avatar_url: string | null;
  status: string | null;
  status_message: string | null;
  department?: { id: number; name: string } | null;
  position?: { id: number; name: string } | null;
};

export type Project = {
  id: number;
  name: string;
  description: string | null;
  ticket_prefix: string;
  type: string;
  status_type: string;
  owner?: User;
  status?: { id: number; name: string; color: string } | null;
  tickets_count?: number;
  members_count?: number;
  created_at?: string;
  updated_at?: string;
};

export type TicketStatus = {
  id: number;
  name: string;
  color: string;
  order?: number;
  is_default?: boolean;
};

export type TicketType = {
  id: number;
  name: string;
  color: string;
  icon: string;
  is_default?: boolean;
};

export type TicketPriority = {
  id: number;
  name: string;
  color: string;
  is_default?: boolean;
};

export type Ticket = {
  id: number;
  code: string;
  name: string;
  content: string;
  order: number;
  estimation: number | null;
  due_date: string | null;
  project?: Project;
  owner?: User | null;
  responsible?: User | null;
  status?: { id: number; name: string; color: string } | null;
  type?: { id: number; name: string; color: string; icon: string } | null;
  priority?: { id: number; name: string; color: string } | null;
  epic?: { id: number; name: string } | null;
  total_logged_hours?: number;
  created_at?: string;
  updated_at?: string;
};

export type TicketComment = {
  id: number;
  ticket_id: number;
  content: string;
  user?: User;
  created_at?: string;
  updated_at?: string;
};

export type DailyReport = {
  id: number;
  report_date: string;
  accomplished: string | null;
  plans: string | null;
  blockers: string | null;
  status: 'draft' | 'submitted';
  submitted_at: string | null;
  acknowledged_at: string | null;
  user?: User;
  project?: Project;
  acknowledged_by?: User | null;
  created_at?: string;
  updated_at?: string;
};

export type WeeklyReport = {
  id: number;
  week_start: string;
  week_end: string;
  content: string | null;
  status: 'draft' | 'submitted';
  submitted_at: string | null;
  acknowledged_at: string | null;
  user?: User;
  project?: Project;
  acknowledged_by?: User | null;
  created_at?: string;
  updated_at?: string;
};

export type Discussion = {
  id: number;
  title: string;
  content: string;
  status: string;
  priority: string | null;
  resolved_at: string | null;
  user?: User;
  project?: Project;
  ticket?: { id: number; code: string; name: string } | null;
  resolved_by?: User | null;
  replies?: DiscussionReply[];
  replies_count?: number;
  created_at?: string;
  updated_at?: string;
};

export type DiscussionReply = {
  id: number;
  discussion_id: number;
  content: string;
  user?: User;
  created_at?: string;
  updated_at?: string;
};

export type Paginated<T> = {
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
};

export type LoginResponse = {
  token: string;
  user: User;
};

export type ActivityItem = {
  kind:
    | 'ticket.status_changed'
    | 'ticket.commented'
    | 'daily_report.submitted'
    | 'weekly_report.submitted';
  id: string;
  at: string;
  actor: { id: number; name: string; avatar_url: string | null } | null;
  summary: string;
  excerpt?: string;
  target: {
    type: 'ticket' | 'daily_report' | 'weekly_report';
    id: number;
    code?: string;
    title: string;
  } | null;
};
