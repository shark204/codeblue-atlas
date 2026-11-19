'use client';
import { VibeIcon } from '../../../../lib/vibeIcons';
import { hm } from '../studyRoomData';
import { useTranslations } from "@/stores/languageStore";

type Member = {
  id: string;
  name: string;
  vibe: string;
  status: string;
  seconds: number;
  me: boolean;
};

export default function PeoplePanel({ members, showHours }: { members: Member[]; showHours: boolean }) {
    const t = useTranslations('components_screens_study_room_panels_PeoplePanel');
  return (
    <div className="sr-list">
      <p className="sr-note">{members.length} in room · No chat, just focus hours</p>
      {members.map((p, i) => (
        <div key={p.id} className={`sr-person ${p.me ? 'me' : ''}`}>
          <span className="rank">{i + 1}</span>
          <span className="av">
            <VibeIcon name={p.vibe} size={22} strokeWidth={1.8} />
            <i className={p.status} />
          </span>
          <div>
            <b>{p.name}{p.me && ' (You)'}</b>
            <small>{p.status === 'focus' ? t('studying_now') : t('ready')}</small>
          </div>
          {showHours && <em>{hm(p.seconds)}</em>}
        </div>
      ))}
    </div>
  );
}
