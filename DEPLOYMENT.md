# PulNazorat'ni bepul joylashtirish (Netlify + Render + Neon)

Bu qo'llanma platformani internetga **butunlay bepul** chiqarish uchun. Uch xizmat kerak bo'ladi:

| Nima | Qayerda | Nega |
|---|---|---|
| Frontend (Next.js) | **Netlify** | Statik/SSR sahifalarni bepul joylashtiradi |
| Backend (Express API) | **Render** | Node serverini bepul ishga tushiradi |
| Baza (PostgreSQL) | **Neon** | Doimiy bepul PostgreSQL (Render'ning o'z bazasi 30 kundan keyin pullik bo'lib qoladi, shuning uchun Neon) |

**Bitta muhim eslatma:** Render'ning bepul rejasi 15 daqiqa ishlatilmasa serverni "uxlatib qo'yadi" — keyingi so'rov ~1 daqiqa kutadi. Sinov/demo uchun bemalol yetadi, lekin haqiqiy foydalanuvchilar ko'paysa pullik rejaga (~7$/oy) o'tish tavsiya etiladi.

---

## 0-qadam: Kodni GitHub'ga yuklash

Bu zip ichida git repository allaqachon tayyorlangan (boshlang'ich commit bilan) — sizga faqat GitHub'ga ulash va yuborish qoladi.

1. https://github.com/new saytida yangi **bo'sh** repository yarating (nomi, masalan, `pulnazorat`) — "Add a README" belgisini **bosmang**, repo butunlay bo'sh bo'lishi kerak
2. Zipni kompyuteringizga ochib, o'sha papkaga kiring va quyidagini bajaring:

```bash
cd pulnazorat
git remote add origin https://github.com/<username>/pulnazorat.git
git branch -M main
git push -u origin main
```

GitHub sizdan login/parol so'rasa — parol o'rniga **Personal Access Token** kerak bo'ladi (GitHub parolni endi qabul qilmaydi): Settings → Developer settings → Personal access tokens → Generate new token, "repo" huquqi bilan.

---

## 1-qadam: Neon'da bepul PostgreSQL yaratish

1. https://neon.tech ga kiring, bepul ro'yxatdan o'ting (GitHub bilan kirsa tezroq)
2. "Create a project" — nom bering (masalan `pulnazorat`)
3. Loyiha yaratilgach, **Connection string**ni nusxalang (`postgresql://...` bilan boshlanadi, oxirida `?sslmode=require` bor)

## 2-qadam: Migratsiyalarni ishga tushirish

O'zingizning kompyuteringizdan (yoki shu muhitdan), Neon'ning connection string'i bilan:

```bash
cd backend
DATABASE_URL="neon'dan olgan havola" npm run migrate
```

Bu `sql/` papkasidagi barcha migratsiyalarni (jadvallar, ustunlar) Neon bazasida yaratadi. `psql` kompyuteringizda o'rnatilgan bo'lishi kerak (yo'q bo'lsa: `brew install postgresql` yoki mos paket menejeringiz orqali).

## 3-qadam: Render'da backend'ni joylashtirish

1. https://render.com ga GitHub bilan kiring
2. **New → Blueprint** → repo'ingizni tanlang (loyiha ildizidagi `render.yaml` avtomatik topiladi)
3. "Apply" bosishdan oldin `DATABASE_URL` maydoniga Neon'dan olgan connection string'ni qo'lda kiriting (bu maxfiy qiymat, `render.yaml`da yozilmagan — xavfsizlik uchun)
4. Deploy tugagach, Render sizga backend manzilini beradi: `https://pulnazorat-backend-xxxx.onrender.com`

*(Blueprint ishlamasa: qo'lda "New → Web Service" → repo tanlang → Root Directory: `backend` → Build Command: `npm install && npm run build` → Start Command: `npm start` → Environment'ga `DATABASE_URL`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` (ikkalasini ham uzun tasodifiy satr qiling) qo'shing.)*

## 4-qadam: Netlify'da frontend'ni joylashtirish

1. https://netlify.com ga GitHub bilan kiring
2. **Add new site → Import an existing project** → repo'ingizni tanlang
3. **Base directory**: `frontend`
4. Build sozlamalari `frontend/netlify.toml`dan avtomatik olinadi
5. **Environment variables**ga qo'shing: `NEXT_PUBLIC_API_URL` = `https://pulnazorat-backend-xxxx.onrender.com/api/v1` (3-qadamda olgan Render manzilingiz + `/api/v1`)
6. Deploy qiling — Netlify sizga saytingiz manzilini beradi: `https://tasodifiy-nom.netlify.app` (keyinroq sozlamalardan o'zgartirish mumkin)

## 5-qadam: Tekshirish

Netlify bergan manzilga kiring, ro'yxatdan o'ting, tranzaksiya qo'shib ko'ring. Agar xatolik bo'lsa — birinchi navbatda Render'dagi backend "uxlab" yotgan bo'lishi mumkin (birinchi so'rov ~1 daqiqa kutadi, keyingilar tez ishlaydi).

## 6-qadam: O'zingizni admin qilib qo'yish

Kompyuteringizdan, Neon connection string bilan:

```bash
cd backend
DATABASE_URL="neon'dan olgan havola" npm run make-admin -- sizning@emailingiz.com
```

(Avval shu email bilan saytda oddiy foydalanuvchi sifatida ro'yxatdan o'tgan bo'lishingiz kerak.) Shundan so'ng saytga kirib, `/admin` manziliga o'ting.

---

## Keyingi qadamlar (haqiqiy foydalanuvchilar uchun)

- `backend/.env.example`dagi kabi emas, **chinakam tasodifiy** `JWT_ACCESS_SECRET`/`JWT_REFRESH_SECRET` ishlatilganiga ishonch hosil qiling (Render Blueprint buni `generateValue: true` bilan o'zi qiladi)
- Render'ning bepul rejasi jiddiy foydalanish uchun emas — foydalanuvchi ko'paysa Starter rejaga ($7/oy) o'ting
- Referal suiiste'molining oldini olish (bir kishi soxta hisoblar bilan o'ziga Pro berishi mumkinligi) hali tuzatilmagan
- "Parolni unutdim" funksiyasi hali yo'q
- Maxfiylik siyosati matnini (`/privacy`) yurist bilan tekshirtiring, kerak bo'lsa shaxsga doir ma'lumotlar bazasini pd.gov.uz'da ro'yxatdan o'tkazing
