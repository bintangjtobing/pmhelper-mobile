import { useEffect, useRef } from 'react';
import { getPusher } from '../lib/pusher';

export type TicketMovedPayload = {
  project_id: number;
  ticket_id: number;
  old_status_id: number | null;
  new_status_id: number;
  new_index: number;
  moved_by_user_id: number;
};

/**
 * Subscribe to a project's kanban channel and fire `onMoved` when another
 * user moves a ticket. Skips echoes from the current user.
 */
export function useKanbanRealtime(
  projectId: number | null | undefined,
  currentUserId: number | null | undefined,
  onMoved: (payload: TicketMovedPayload) => void
) {
  // Keep the callback ref current so we don't re-subscribe every render.
  const handlerRef = useRef(onMoved);
  handlerRef.current = onMoved;

  useEffect(() => {
    if (!projectId) return;
    const pusher = getPusher();
    const channel = pusher.subscribe(`private-project.${projectId}.kanban`);

    const handler = (data: TicketMovedPayload) => {
      if (currentUserId && data.moved_by_user_id === currentUserId) return;
      handlerRef.current(data);
    };

    channel.bind('ticket.moved', handler);

    return () => {
      channel.unbind('ticket.moved', handler);
      pusher.unsubscribe(`private-project.${projectId}.kanban`);
    };
  }, [projectId, currentUserId]);
}
