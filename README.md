# PulNazorat — MVP + Pro modullar

Shaxsiy kirim-chiqim boshqaruvi platformasi. Bepul (Free) qism: ro'yxatdan o'tish/kirish, kategoriyalar, tranzaksiyalar, dashboard (oylik xulosa + kategoriya bo'yicha diagramma). Pro qism: byudjet limiti, takrorlanuvchi to'lov eslatmalari, jamg'arma maqsadlari, qarz-nasiya kuzatuvi — pulsiz, **referal tizimi** orqali ochiladi (2 ta do'stingiz ro'yxatdan o'tsa, Pro sizga tekin ochiladi).

To'liq mahsulot va texnik spetsifikatsiya uchun avval yuborilgan ikki hujjatga qarang:
`PulNazorat_spec.docx` (1-qism) va `PulNazorat_texnik_qism2.docx` (2-qism).

**Platformani internetga (bepul) chiqarmoqchimisiz?** → [`DEPLOYMENT.md`](./DEPLOYMENT.md) — Netlify + Render + Neon orqali qadam-baqadam qo'llanma.

## Tuzilma

```
pulnazorat/
├── backend/     # Node.js + TypeScript + Express + PostgreSQL (pg)
└── frontend/    # Next.js + TypeScript + Tailwind + Recharts
```

## Talablar

- Node.js 18+
- PostgreSQL 14+ (mahalliy yoki server)

## Backend ishga tushirish

```bash
cd backend
npm install
cp .env.example .env     # DATABASE_URL, JWT sirlarini to'ldiring
npm run migrate          # sql/ papkasidagi migratsiyalarni qo'llaydi
npm run dev               # http://localhost:4000
```

`npm run migrate` ishlashi uchun avval PostgreSQL'da bo'sh baza yarating:

```bash
psql -U postgres -c "CREATE USER pulnazorat WITH PASSWORD 'parol';"
psql -U postgres -c "CREATE DATABASE pulnazorat OWNER pulnazorat;"
```

va `.env` faylidagi `DATABASE_URL`ni shunga mos yozing.

## Frontend ishga tushirish

```bash
cd frontend
npm install
cp .env.local.example .env.local   # kerak bo'lsa API manzilini o'zgartiring
npm run dev                         # http://localhost:3000
```

## Nima ishlaydi (Free)

- Ro'yxatdan o'tish / kirish (JWT)
- Kategoriyalar (tizim standart kategoriyalari + shaxsiy)
- Tranzaksiya qo'shish/tahrirlash/o'chirish
- Dashboard — oylik kirim/chiqim/balans va kategoriya bo'yicha doira diagramma
- Profil sahifasi

## Nima ishlaydi (Pro)

Quyidagilar `requirePro` middleware bilan himoyalangan — faqat `plan: "pro"` foydalanuvchi kira oladi, aks holda frontend `ProGate` komponenti orqali qulflangan holat va "Pro'ga o'tish" taklifi ko'rsatiladi:

- **Byudjet** (`/budgets`) — kategoriya bo'yicha oylik xarajat limiti, sarflangan summa avtomatik hisoblanadi, limitga yaqinlashganda/oshganda ogohlantirish
- **Takrorlanuvchi to'lovlar** (`/recurring`) — oyning muayyan kunida to'lanadigan xarajatlar uchun eslatma sozlamasi (necha kun oldin)
- **Jamg'arma maqsadlari** (`/goals`) — maqsad summasi, bosqichma-bosqich mablag' qo'shish, maqsadga yetganda avtomatik "erishildi" holati
- **Qarz-nasiya** (`/debts`) — "menga qarzdor" / "men qarzdorman" yozuvlari, yopish/ochiq holatlar

Byudjet/eslatma/maqsad/qarz jadvallari `sql/003_pro_modules.sql`da; referal ustunlari va eski to'lov jadvallarining olib tashlanishi `sql/004_referrals.sql`da.

### Referal tizimi — Pro qanday ochiladi

Click/Payme kabi to'lov tizimlariga ulanish uchun merchant sifatida rasmiy ro'yxatdan o'tish (yuridik hujjatlar, shartnoma) kerak bo'lgani uchun, MVP bosqichida undan voz kechildi. O'rniga — **referal tizimi**:

- Har bir foydalanuvchida shaxsiy referal kodi (`users.referral_code`) va havolasi bor: `/register?ref=KOD` (profil sahifasidagi "Do'stlaringizni taklif qiling" kartochkasida ko'rinadi, bittа tugma bilan nusxalanadi)
- Do'sti shu havola orqali ro'yxatdan o'tsa, `users.referred_by` orqali bog'lanadi
- **2 ta** do'st ro'yxatdan o'tgach (`backend/src/modules/referrals/referrals.service.ts`dagi `REFERRALS_REQUIRED`), referrer'ning `plan` ustuni avtomatik `'pro'`ga o'zgaradi — **muddatsiz**, hech qanday to'lov yoki obunani yangilash shart emas
- `GET /api/v1/referrals/me` — joriy foydalanuvchining kodi, necha do'st qo'shganligi va Pro ochilgan-ochilmaganligini qaytaradi

**Muhim texnik nozik joy:** Pro ilgari o'z harakati (to'lov) bilan ochilardi, endi esa boshqa birovning (do'stining) harakati bilan ochiladi — ya'ni referrer login qilib turmasa ham uning bazadagi holati o'zgarishi mumkin. Shuning uchun `requirePro` middleware endi JWT ichidagi eski `plan` claim'iga emas, balki har safar bazadan real vaqtda tekshiradi (`backend/src/common/auth-middleware.ts`) — aks holda referrer yangi token olmaguncha (qayta kirmaguncha) Pro funksiyalarga kira olmay qolardi.

Sinovdan real oqim orqali o'tkazilgan (curl + Playwright, mobil 390px + desktop 1440px): referrer ro'yxatdan o'tadi → o'z havolasini nusxalaydi → 2 ta "do'st" o'sha havola orqali ro'yxatdan o'tadi → referrer'ning **eski** (yangilanmagan) tokeni bilan ham Pro sahifalar ochilishi tasdiqlangan.

## Admin panel

`/admin` — statistika (jami/Free/Pro foydalanuvchilar, referal orqali va admin bergan Pro sonlari, jami tranzaksiyalar, oxirgi 7 kunlik ro'yxatdan o'tishlar) va foydalanuvchilar ro'yxati (qidiruv bilan), har biriga **referalsiz to'g'ridan-to'g'ri Pro berish yoki bekor qilish** tugmasi bilan.

- Asosiy navigatsiyada ko'rinmaydi — faqat admin akkaunt bilan kirib, to'g'ridan-to'g'ri `/admin` manziliga o'tilsa ochiladi; oddiy foydalanuvchi shu manzilga kirsa avtomatik `/dashboard`ga qaytariladi
- Admin huquqi `users.role` ustunida (`'user'` | `'admin'`) saqlanadi va **API orqali hech qachon berilmaydi** — faqat serverga to'g'ridan-to'g'ri kirish huquqi bor odam terminal orqali beradi:
  ```bash
  cd backend
  npm run make-admin -- email@misol.com   # avval shu email bilan oddiy ro'yxatdan o'tgan bo'lishi kerak
  ```
- `requirePro`ga o'xshab, `requireAdmin` ham JWT'ga emas, bazadagi `role`ga real vaqtda tekshiradi
- Barcha `/admin/*` endpointlar (`backend/src/modules/admin/`) `requireAuth + requireAdmin` bilan himoyalangan; rol ustuni `sql/005_admin.sql`da

Sinovdan real oqim orqali o'tkazilgan: admin bo'lmagan foydalanuvchi `/admin/*`ga 401 oladi va UI'da `/dashboard`ga qaytariladi; admin orqali berilgan Pro foydalanuvchining **eski** tokeni bilan ham darhol ishlaydi (curl + Playwright, mobil va desktop).

## Maxfiylik siyosati va foydalanish shartlari

`/privacy` va `/terms` sahifalari qo'shildi, ro'yxatdan o'tish formasidan havola beriladi. **Muhim:** bu — boshlang'ich qoralama matn, professional yuridik tekshiruvdan o'tmagan. O'zbekistonda moliyaviy/shaxsiy ma'lumot yig'uvchi xizmatlar odatda "Shaxsga doir ma'lumotlar bazasi"ni davlat reyestrida (pd.gov.uz) ro'yxatdan o'tkazishi talab qilinadi — platformani haqiqiy foydalanuvchilar uchun ochishdan oldin buni va matnning huquqiy to'g'riligini yurist bilan tekshirib chiqish tavsiya etiladi.

## Keyingi qadam

Hali qo'shilmagan (spetsifikatsiyada bor, lekin bu bosqichda ataylab qoldirilgan) — **oilaviy/umumiy hisob** (family accounts): bir nechta foydalanuvchi bitta hisobni birga ko'rishi/boshqarishi. Foydalanuvchi bilan kelishilgan holda hozircha scope'dan butunlay olib tashlandi.

## Dizayn

Bitta izchil brend uslubi — och yashil (`brand` rang palitrasi, `tailwind.config.ts`da), mobil ilovaga o'xshash interfeys:

- Mobil (< 640px): pastki tab navigatsiya (Bosh sahifa / Tranzaksiyalar / Profil), yuqorida ixcham header
- Desktop/planshet: yuqori navbar, lekin kontent hamon ixcham (markazlashgan, cho'zilmagan) — har qanday ekranda "ilova" hissi saqlanadi
- Ikonlar: `lucide-react`; kategoriya ikonlari — emoji (baza darajasida saqlanadi, `sql/002_seed_categories.sql`)
- Umumiy komponentlar (`.card`, `.btn-primary`, `.input` va h.k.) `app/globals.css`da — yangi sahifa qo'shganda shu klasslardan foydalaning, uslub avtomatik izchil bo'ladi

## Muhim eslatma

`backend/.env` fayli dev muhiti uchun namunaviy sirlar (JWT_ACCESS_SECRET va h.k.) bilan yozilgan — production'ga chiqarishdan oldin albatta o'zgartiring.
