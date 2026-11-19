# Code Blue 3D Anatomy Atlas — دليل التشغيل السريع

هذا الموقع مستقل بالكامل للأطلس التشريحي ثلاثي الأبعاد (`3D Anatomy Atlas` + `3D Organs Atelier`) ويعمل على المنفذ `3003` محلياً.

## خطوات التشغيل على جهازك (بعد نقله إلى `F:\codeblue-atlas`)
1. انسخ ملف `.env.local` من `F:\mrcs-bank\.env.local` وضعه داخل `F:\codeblue-atlas\.env.local`.
2. لنسخ ملفات الأطلس ومجسمات الـ `.glb` تلقائياً بضغطة واحدة، افتح PowerShell داخل `F:\codeblue-atlas` ونفذ:
```powershell
.\SETUP_ATLAS.ps1
```
3. ثبّت المكتبات وشغّل الموقع:
```powershell
npm install
npm run dev
```
4. افتح المتصفح على: `http://localhost:3003`
