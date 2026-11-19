// stores/studyRoomStore.ts
import { create } from 'zustand';

interface StudyRoomState {
  // ═══ Rooms Data ═══
  myRooms: any[];
  currentRoom: any | null;
  roomMembers: any[];
  roomName: string;
  roomAlias: string;
  roomEmoji: string;
  inviteCode: string;
  joinCodeInput: string;
  roomTick: number;
  isOnline: boolean;

  // ═══ UI Modals ═══
  creatingRoom: boolean;
  showStatusModal: boolean;
  showInviteModal: boolean;

  // ═══ Setters ═══
  setMyRooms: (rooms: any[]) => void;
  setCurrentRoom: (room: any | null) => void;
  setRoomMembers: (members: any[]) => void;
  setRoomName: (name: string) => void;
  setRoomAlias: (alias: string) => void;
  setRoomEmoji: (emoji: string) => void;
  setInviteCode: (code: string) => void;
  setJoinCodeInput: (input: string) => void;
  setRoomTick: (tick: number) => void;
  setIsOnline: (online: boolean) => void;
  setCreatingRoom: (val: boolean) => void;
  setShowStatusModal: (val: boolean) => void;
  setShowInviteModal: (val: boolean) => void;
}

export const useStudyRoomStore = create<StudyRoomState>()((set) => ({
  myRooms: [],
  currentRoom: null,
  roomMembers: [],
  roomName: '',
  roomAlias: '',
  roomEmoji: '📚',
  inviteCode: '',
  joinCodeInput: '',
  roomTick: 0,
  isOnline: true,
  
  creatingRoom: false,
  showStatusModal: false,
  showInviteModal: false,

  setMyRooms: (myRooms) => set({ myRooms }),
  setCurrentRoom: (currentRoom) => set({ currentRoom }),
  setRoomMembers: (roomMembers) => set({ roomMembers }),
  setRoomName: (roomName) => set({ roomName }),
  setRoomAlias: (roomAlias) => set({ roomAlias }),
  setRoomEmoji: (roomEmoji) => set({ roomEmoji }),
  setInviteCode: (inviteCode) => set({ inviteCode }),
  setJoinCodeInput: (joinCodeInput) => set({ joinCodeInput }),
  setRoomTick: (roomTick) => set({ roomTick }),
  setIsOnline: (isOnline) => set({ isOnline }),
  setCreatingRoom: (creatingRoom) => set({ creatingRoom }),
  setShowStatusModal: (showStatusModal) => set({ showStatusModal }),
  setShowInviteModal: (showInviteModal) => set({ showInviteModal }),
}));