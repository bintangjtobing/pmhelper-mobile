import { api } from './client';
import type {
  DailyReport,
  Discussion,
  DiscussionReply,
  LoginResponse,
  Paginated,
  Project,
  Ticket,
  TicketComment,
  TicketPriority,
  TicketStatus,
  TicketType,
  User,
  WeeklyReport,
} from '../types/api';

// --- Auth ---
export async function login(email: string, password: string, deviceName?: string): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>('/auth/login', { email, password, device_name: deviceName });
  return data;
}

export async function logout(): Promise<void> {
  await api.post('/auth/logout');
}

export async function me(): Promise<User> {
  const { data } = await api.get<{ user: User }>('/auth/me');
  return data.user;
}

// --- Lookups ---
export async function fetchStatuses(projectId?: number): Promise<TicketStatus[]> {
  const { data } = await api.get<{ data: TicketStatus[] }>('/ticket-statuses', {
    params: projectId ? { project_id: projectId } : undefined,
  });
  return data.data;
}
export async function fetchTypes(): Promise<TicketType[]> {
  const { data } = await api.get<{ data: TicketType[] }>('/ticket-types');
  return data.data;
}
export async function fetchPriorities(): Promise<TicketPriority[]> {
  const { data } = await api.get<{ data: TicketPriority[] }>('/ticket-priorities');
  return data.data;
}

// --- Projects ---
export async function fetchProjects(): Promise<Project[]> {
  const { data } = await api.get<{ data: Project[] }>('/projects');
  return data.data;
}
export async function fetchProject(id: number): Promise<Project> {
  const { data } = await api.get<{ data: Project }>(`/projects/${id}`);
  return data.data;
}

// --- Tickets ---
export async function fetchProjectTickets(
  projectId: number,
  opts?: { statusId?: number; mine?: boolean; sortBy?: string; perPage?: number }
): Promise<Paginated<Ticket>> {
  const { data } = await api.get<Paginated<Ticket>>(`/projects/${projectId}/tickets`, {
    params: {
      status_id: opts?.statusId,
      mine: opts?.mine ? 1 : undefined,
      sort_by: opts?.sortBy,
      per_page: opts?.perPage ?? 100,
    },
  });
  return data;
}
export async function fetchTicket(id: number): Promise<Ticket> {
  const { data } = await api.get<{ data: Ticket }>(`/tickets/${id}`);
  return data.data;
}
export async function createTicket(payload: Partial<Ticket> & { project_id: number; name: string; content: string }): Promise<Ticket> {
  const { data } = await api.post<{ data: Ticket }>(`/tickets`, payload);
  return data.data;
}
export async function updateTicket(id: number, payload: Partial<Ticket>): Promise<Ticket> {
  const { data } = await api.patch<{ data: Ticket }>(`/tickets/${id}`, payload);
  return data.data;
}
export async function deleteTicket(id: number): Promise<void> {
  await api.delete(`/tickets/${id}`);
}
export async function moveTicket(id: number, statusId: number, order: number): Promise<Ticket> {
  const { data } = await api.post<{ data: Ticket }>(`/tickets/${id}/move`, { status_id: statusId, order });
  return data.data;
}

// --- Ticket comments ---
export async function fetchComments(ticketId: number): Promise<TicketComment[]> {
  const { data } = await api.get<{ data: TicketComment[] }>(`/tickets/${ticketId}/comments`);
  return data.data;
}
export async function createComment(ticketId: number, content: string): Promise<TicketComment> {
  const { data } = await api.post<{ data: TicketComment }>(`/tickets/${ticketId}/comments`, { content });
  return data.data;
}
export async function deleteComment(id: number): Promise<void> {
  await api.delete(`/ticket-comments/${id}`);
}

// --- Daily reports ---
export async function fetchDailyReports(params?: { mine?: boolean; projectId?: number; from?: string; to?: string }): Promise<Paginated<DailyReport>> {
  const { data } = await api.get<Paginated<DailyReport>>(`/daily-reports`, {
    params: {
      mine: params?.mine ? 1 : 0,
      project_id: params?.projectId,
      from: params?.from,
      to: params?.to,
    },
  });
  return data;
}
export async function fetchDailyReport(id: number): Promise<DailyReport> {
  const { data } = await api.get<{ data: DailyReport }>(`/daily-reports/${id}`);
  return data.data;
}
export async function createDailyReport(payload: {
  project_id: number;
  report_date: string;
  accomplished?: string;
  plans?: string;
  blockers?: string;
  status?: 'draft' | 'submitted';
}): Promise<DailyReport> {
  const { data } = await api.post<{ data: DailyReport }>(`/daily-reports`, payload);
  return data.data;
}
export async function updateDailyReport(id: number, payload: Partial<DailyReport>): Promise<DailyReport> {
  const { data } = await api.patch<{ data: DailyReport }>(`/daily-reports/${id}`, payload);
  return data.data;
}
export async function deleteDailyReport(id: number): Promise<void> {
  await api.delete(`/daily-reports/${id}`);
}

// --- Weekly reports ---
export async function fetchWeeklyReports(params?: { mine?: boolean; projectId?: number }): Promise<Paginated<WeeklyReport>> {
  const { data } = await api.get<Paginated<WeeklyReport>>(`/weekly-reports`, {
    params: {
      mine: params?.mine ? 1 : 0,
      project_id: params?.projectId,
    },
  });
  return data;
}
export async function fetchWeeklyReport(id: number): Promise<WeeklyReport> {
  const { data } = await api.get<{ data: WeeklyReport }>(`/weekly-reports/${id}`);
  return data.data;
}
export async function createWeeklyReport(payload: {
  project_id: number;
  week_start: string;
  week_end: string;
  content?: string;
  status?: 'draft' | 'submitted';
}): Promise<WeeklyReport> {
  const { data } = await api.post<{ data: WeeklyReport }>(`/weekly-reports`, payload);
  return data.data;
}
export async function updateWeeklyReport(id: number, payload: Partial<WeeklyReport>): Promise<WeeklyReport> {
  const { data } = await api.patch<{ data: WeeklyReport }>(`/weekly-reports/${id}`, payload);
  return data.data;
}
export async function deleteWeeklyReport(id: number): Promise<void> {
  await api.delete(`/weekly-reports/${id}`);
}

// --- Discussions ---
export async function fetchDiscussions(params?: { projectId?: number; status?: string }): Promise<Paginated<Discussion>> {
  const { data } = await api.get<Paginated<Discussion>>(`/discussions`, {
    params: { project_id: params?.projectId, status: params?.status, per_page: 50 },
  });
  return data;
}
export async function fetchDiscussion(id: number): Promise<Discussion> {
  const { data } = await api.get<{ data: Discussion }>(`/discussions/${id}`);
  return data.data;
}
export async function createDiscussion(payload: {
  project_id: number;
  title: string;
  content: string;
  ticket_id?: number;
  priority?: string;
}): Promise<Discussion> {
  const { data } = await api.post<{ data: Discussion }>(`/discussions`, payload);
  return data.data;
}
export async function updateDiscussion(id: number, payload: Partial<Discussion>): Promise<Discussion> {
  const { data } = await api.patch<{ data: Discussion }>(`/discussions/${id}`, payload);
  return data.data;
}
export async function deleteDiscussion(id: number): Promise<void> {
  await api.delete(`/discussions/${id}`);
}
export async function replyToDiscussion(id: number, content: string): Promise<DiscussionReply> {
  const { data } = await api.post<{ data: DiscussionReply }>(`/discussions/${id}/replies`, { content });
  return data.data;
}
export async function deleteReply(id: number): Promise<void> {
  await api.delete(`/discussion-replies/${id}`);
}

// --- Users ---
export async function fetchUsers(search?: string): Promise<User[]> {
  const { data } = await api.get<Paginated<User>>(`/users`, { params: { search, per_page: 100 } });
  return data.data;
}
export async function fetchUser(id: number): Promise<User> {
  const { data } = await api.get<{ data: User }>(`/users/${id}`);
  return data.data;
}
