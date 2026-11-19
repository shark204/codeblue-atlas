'use client';

import { useEffect, useState } from 'react';
import { Home as HomeIcon } from 'lucide-react';
import StudyWithMe from '../../StudyWithMe';
import { supabase } from '../../../lib/supabase';
import { useTranslations, useLanguageStore } from '@/stores/languageStore';

type Props = {
  isDark: boolean;
  roomAlias: string;
  setRoomAlias: (v: string) => void;
  roomEmoji: string;
  setRoomEmoji: (v: string) => void;
  roomName: string;
  setRoomName: (v: string) => void;
  joinCodeInput: string;
  setJoinCodeInput: (v: string) => void;
  creatingRoom: boolean;
  myRooms: any[];
  onBack: () => void;
  onCreateRoom: (data?: { name: string; alias: string; emoji: string; focus: number }) => void;
  onJoinRoom: (data?: { code: string; alias: string; emoji: string }) => void;
  onOpenRoom: (room: any) => void;
  onDeleteRoom: (id: string) => void;
};

interface RecentRoom {
  name: string;
  code: string;
  people: number;
}

export default function StudyRoomLobby({
  isDark,
  roomAlias, setRoomAlias,
  roomEmoji, setRoomEmoji,
  roomName, setRoomName,
  joinCodeInput, setJoinCodeInput,
  creatingRoom,
  myRooms,
  onBack,
  onCreateRoom, onJoinRoom,
  onOpenRoom, onDeleteRoom,
}: Props) {
  const t = useTranslations('components_screens_study_room_StudyRoomLobby');
  const locale = useLanguageStore((s) => s.locale);
  const [studyingNow, setStudyingNow] = useState(0);
  const [recentRooms, setRecentRooms] = useState<RecentRoom[]>([]);
  const [needNameFor, setNeedNameFor] = useState<any | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchCount = async () => {
      const { count } = await supabase
        .from('room_members')
        .select('*', { count: 'exact', head: true })
        .eq('is_studying', true);
      if (mounted) setStudyingNow(count ?? 0);
    };

    fetchCount();

    const channel = supabase
      .channel('lobby-studying-count')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'room_members' },
        fetchCount
      )
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    if (!myRooms.length) {
      setRecentRooms([]);
      return;
    }
    setRecentRooms(
      myRooms.slice(0, 5).map((r: any) => ({
        name: r.name,
        code: r.invite_code,
        people: r.member_count ?? 0,
      }))
    );
  }, [myRooms]);

  const handleCreate = ({
    name,
    vibe,
    room,
    focus,
  }: {
    name: string;
    vibe: string;
    room: string;
    focus: number;
  }) => {
    try { localStorage.setItem('sr-pending-focus', String(focus)); } catch {}
    
    setRoomAlias(name);
    setRoomEmoji(vibe);
    setRoomName(room);
    onCreateRoom({ name: room, alias: name, emoji: vibe, focus });
  };

  const handleJoin = ({
    name,
    vibe,
    code,
  }: {
    name: string;
    vibe: string;
    code: string;
  }) => {
    if (typeof setRoomAlias === 'function') setRoomAlias(name);
    if (typeof setRoomEmoji === 'function') setRoomEmoji(vibe);
    if (typeof setJoinCodeInput === 'function') setJoinCodeInput(code);
    if (typeof onJoinRoom === 'function') {
      onJoinRoom({ code, alias: name, emoji: vibe });
    }
  };

  const handleOpenRoom = (room: any) => {
    if (typeof roomAlias !== 'string' || !roomAlias.trim()) {
      setNeedNameFor(room);
      return;
    }
    if (typeof onOpenRoom === 'function') onOpenRoom(room);
  };

  const handleDeleteRoom = (id: string) => {
    if (typeof window !== 'undefined' && window.confirm(locale === 'ar' ? 'هل تريد حذف هذه الغرفة؟ سيتم إخراج جميع الأعضاء.' : 'Delete this room? All members will be removed.')) {
      onDeleteRoom(id);
    }
  };

  if (needNameFor) {
    return (
      <div className={`srl-need-name ${isDark ? 'dark' : 'light'}`}>
        <style>{srlCss}</style>
        <div className="srl-need-name-card">
          <h2>{t('enter_your_display_name_first')}</h2>
          <p>{t('so_your_roommates_can_recognize')}</p>
          <input
            autoFocus
            value={roomAlias}
            onChange={(e) => setRoomAlias(e.target.value)}
            placeholder={t('dr_ahmed')}
            maxLength={24}
          />
          <div className="srl-need-name-actions">
            <button
              onClick={() => {
                if (!roomAlias.trim()) return;
                onOpenRoom(needNameFor);
                setNeedNameFor(null);
              }}
            >
              {t('enter_room')}
            </button>
            <button onClick={() => setNeedNameFor(null)}>{t('cancel')}</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`srl-wrap ${isDark ? 'dark' : 'light'}`}>
      <style>{srlCss}</style>

      {/* ✅ تمرير اللغة الحالية ديناميكياً بدلاً من تثبيتها على "en" */}
      <StudyWithMe
        lang={locale}
        showSky={false}
        isDark={isDark}
        studyingNow={studyingNow}
        recentRooms={recentRooms}
        onBack={onBack}
        onCreate={handleCreate}
        onJoin={handleJoin}
      />

      {myRooms.length > 0 && (
        <section className="srl-rooms">
          <h3 className="srl-rooms-title">
            <HomeIcon size={15} /> {t('my_rooms')}
          </h3>
          <div className="srl-rooms-list">
            {myRooms.map((room) => (
              <div key={room.id} className="srl-room">
                <div className="srl-room-info">
                  <b>{room.name}</b>
                  <small>{t('code')} <span dir="ltr">{room.invite_code}</span></small>
                </div>
                <div className="srl-room-actions">
                  <button
                    onClick={() => handleOpenRoom(room)}
                    className="srl-btn-enter"
                  >
                    {t('enter')}
                  </button>
                  <button
                    onClick={() => handleDeleteRoom(room.id)}
                    className="srl-btn-del"
                    aria-label={t('delete_room')}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

/* ----------------------------- CSS ------------------------------ */
const srlCss = `
.srl-wrap{
  position:relative;
  min-height:calc(100vh - 64px);
  font-family:'Manrope','IBM Plex Sans Arabic',system-ui,sans-serif;
}

.srl-rooms{
  position:relative;
  z-index:1;
  max-width:560px;
  margin:0 auto 60px;
  padding:0 16px;
}

.srl-rooms-title{
  display:flex;
  align-items:center;
  gap:8px;
  margin:0 0 12px;
  font-size:12.5px;
  font-weight:700;
  text-transform:uppercase;
  letter-spacing:.08em;
  color:#94a3b8;
}
.srl-wrap.light .srl-rooms-title{ color:#475569; }

.srl-rooms-list{
  display:flex;
  flex-direction:column;
  gap:10px;
}

.srl-room{
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:12px;
  padding:14px 18px;
  border-radius:18px;
  background:rgba(15,23,42,.62);
  border:1px solid rgba(255,255,255,.1);
  backdrop-filter:blur(18px);
}
.srl-wrap.light .srl-room{
  background:rgba(255,255,255,.82);
  border-color:rgba(15,23,42,.1);
  box-shadow:0 8px 24px -12px rgba(14,116,144,.18);
}

.srl-room-info{
  display:flex;
  flex-direction:column;
  gap:2px;
}
.srl-room-info b{
  font-size:14.5px;
  color:#f8fafc;
}
.srl-wrap.light .srl-room-info b{ color:#0f172a; }
.srl-room-info small{
  font-size:12px;
  color:#94a3b8;
}
.srl-wrap.light .srl-room-info small{ color:#64748b; }

.srl-room-actions{
  display:flex;
  align-items:center;
  gap:8px;
}

.srl-btn-enter{
  padding:8px 16px;
  border-radius:11px;
  border:0;
  font-size:13px;
  font-weight:700;
  color:#fff;
  background:linear-gradient(135deg,#0284c7,#2563eb);
  cursor:pointer;
}
.srl-btn-del{
  width:34px;
  height:34px;
  border-radius:10px;
  border:1px solid rgba(244,63,94,.25);
  background:rgba(244,63,94,.1);
  cursor:pointer;
}

.srl-need-name{
  position:fixed;
  inset:0;
  z-index:100;
  display:grid;
  place-items:center;
  padding:16px;
  background:rgba(2,6,23,.75);
  backdrop-filter:blur(12px);
}
.srl-need-name-card{
  width:100%;
  max-width:400px;
  padding:28px 24px;
  border-radius:24px;
  background:#0f172a;
  border:1px solid rgba(255,255,255,.12);
  color:#fff;
  text-align:center;
}
.srl-need-name.light .srl-need-name-card{
  background:#fff;
  color:#0f172a;
  border-color:rgba(15,23,42,.12);
}
.srl-need-name-card h2{ margin:0 0 6px; font-size:18px; }
.srl-need-name-card p{ margin:0 0 16px; font-size:13px; color:#94a3b8; }
.srl-need-name-card input{
  width:100%;
  height:46px;
  padding:0 14px;
  border-radius:12px;
  border:1px solid rgba(255,255,255,.16);
  background:rgba(255,255,255,.06);
  color:inherit;
  margin-bottom:14px;
}
.srl-need-name.light .srl-need-name-card input{
  border-color:rgba(15,23,42,.16);
  background:#f8fafc;
}
.srl-need-name-actions{
  display:flex;
  gap:8px;
}
.srl-need-name-actions button{
  flex:1;
  height:42px;
  border-radius:12px;
  border:0;
  font-weight:700;
  cursor:pointer;
}
.srl-need-name-actions button:first-child{
  background:#0284c7;
  color:#fff;
}
.srl-need-name-actions button:last-child{
  background:rgba(148,163,184,.15);
  color:inherit;
}
`;