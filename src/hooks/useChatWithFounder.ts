import { useCallback } from 'react';
import { getMatrixClient } from '../matrixClient';
import { FOUNDER_MATRIX_ID, FOUNDER_ROOM_NAME, FOUNDER_AVATAR } from '../constants/founder';

export function useChatWithFounder(onSelectRoom: (roomId: string) => void) {
  const mx = getMatrixClient();

  const handleChatWithFounder = useCallback(async () => {
    if (!mx) return;

    // Check ALL rooms from Matrix client directly (not from hook state which may be stale)
    const allRooms = mx.getVisibleRooms();
    for (const room of allRooms) {
      const founderMember = room.getMember(FOUNDER_MATRIX_ID);
      if (founderMember && founderMember.membership && founderMember.membership !== 'leave') {
        onSelectRoom(room.roomId);
        return;
      }
    }

    // No existing room found, create a new DM room
    try {
      const { room_id } = await mx.createRoom({
        name: FOUNDER_ROOM_NAME,
        is_direct: true,
        invite: [FOUNDER_MATRIX_ID],
        preset: 'trusted_private_chat' as any,
      });

      // Set room name explicitly via state event
      await mx.sendStateEvent(room_id, 'm.room.name' as any, {
        name: FOUNDER_ROOM_NAME,
      });

      onSelectRoom(room_id);
    } catch (error) {
      console.error('Failed to create room with founder:', error);
    }
  }, [mx, onSelectRoom]);

  return { handleChatWithFounder, founderAvatar: FOUNDER_AVATAR };
}
