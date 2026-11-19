// config/topbar.ts
export const TOPBAR_CONFIG = {
  height: 64,
  zIndex: 50,
  scrollThreshold: 8,
  paddingX: 16,
  bgColor: 'rgba(15,23,42,0.6)',
  blur: '12px',
  borderColor: 'rgba(255,255,255,0.1)',
  transitionMs: 200,
  
  // خيارات إضافية
  showSoundIndicator: true, // لو عايز النقطة اللي بتظهر لما الصوت يكتتم
  
  userMenu: {
    height: 48,
    minWidth: 200,
    maxWidth: 260,
    mobileWidth: 64,
    padding: '6px 12px',
    borderRadius: 12,
    avatarSize: 32,
    textName: '14px',
    textEmail: '12px',
    hoverScale: 1.02,
    glow: '0 0 12px rgba(34,211,238,0.4)', // cyan glow
  },
  
  dropdown: {
    width: 260,
    offsetY: 8, // المسافة تحت الزرار
    borderRadius: 14,
    padding: 8,
    itemHeight: 40,
    itemPaddingX: 12,
    itemBorderRadius: 8,
  },
  
  themeSelector: {
    height: 36,
  }
};