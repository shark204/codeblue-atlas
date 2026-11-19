'use client';
import type { SaveStatus } from '../../../../lib/useCloudState';
import Tip from './Tip';

const LABEL: Record<SaveStatus, string> = {
  idle: '', saving: 'Saving…', saved: 'Saved', offline: 'Offline · will sync',
};
const HELP: Record<SaveStatus, string> = {
  idle: '',
  saving: 'Saving your changes to your account.',
  saved: 'Saved to your account. It syncs between your devices.',
  offline: 'No connection right now. Your changes are kept on this device and sync automatically when you are back online.',
};

export default function SaveBadge({ status }: { status: SaveStatus }) {
  if (status === 'idle') return null;
  return (
    <Tip text={HELP[status]} side="bottom">
      <span className={`sr-save ${status}`} role="status"><i />{LABEL[status]}</span>
    </Tip>
  );
}
