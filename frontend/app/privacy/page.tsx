import Link from "next/link";
import { ShieldCheck } from "lucide-react";

export const metadata = {
  title: "Maxfiylik siyosati — HamyonPro",
};

export default function PrivacyPage() {
  return (
    <main className="app-container-wide py-8 sm:py-10">
      <div className="mb-6 flex items-center gap-2.5">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
          <ShieldCheck size={19} />
        </span>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Maxfiylik siyosati</h1>
          <p className="text-[12px] text-slate-500">Oxirgi yangilanish: 2026-yil 1-sentabr</p>
        </div>
      </div>

      <div className="card flex flex-col gap-6 text-[14px] leading-relaxed text-slate-700">
        <Section title="1. Umumiy qoidalar">
          <p>
            Ushbu maxfiylik siyosati HamyonPro platformasi (&quot;biz&quot;, &quot;platforma&quot;) orqali
            to&apos;planadigan shaxsiy va moliyaviy ma&apos;lumotlarning qanday yig&apos;ilishi, saqlanishi va
            ishlatilishini tushuntiradi. Platformadan foydalanish orqali siz ushbu siyosat shartlariga rozilik
            bildirasiz.
          </p>
        </Section>

        <Section title="2. Qanday ma'lumotlarni yig'amiz">
          <ul className="list-disc space-y-1.5 pl-5">
            <li>
              <b>Ro&apos;yxatdan o&apos;tish ma&apos;lumotlari:</b> to&apos;liq ism, email va/yoki telefon raqami,
              parol (bazada hech qachon ochiq holda emas, faqat bir tomonlama xeshlangan holda saqlanadi)
            </li>
            <li>
              <b>Moliyaviy ma&apos;lumotlar:</b> siz kiritgan tranzaksiyalar, kategoriyalar, byudjetlar, jamg&apos;arma
              maqsadlari, qarz-nasiya yozuvlari va takrorlanuvchi to&apos;lovlar. Bu ma&apos;lumotlar faqat sizga
              tegishli va faqat siz tizimga kirganingizda sizga ko&apos;rinadi
            </li>
            <li>
              <b>Referal ma&apos;lumotlari:</b> sizning referal kodingiz va kim sizning havolangiz orqali ro&apos;yxatdan
              o&apos;tgani (faqat son sifatida, boshqa foydalanuvchining shaxsiy ma&apos;lumotlarini sizga
              ko&apos;rsatmaydi)
            </li>
            <li>
              <b>Texnik ma&apos;lumotlar:</b> kirish tokeni (JWT) qurilmangizning brauzer xotirasida (localStorage)
              saqlanadi — bu shunchaki tizimga kirgan holatingizni eslab qolish uchun, kuzatuv yoki reklama maqsadida
              emas
            </li>
          </ul>
        </Section>

        <Section title="3. Ma'lumotlardan qanday foydalanamiz">
          <p>
            Yig&apos;ilgan ma&apos;lumotlar faqat platforma xizmatlarini ko&apos;rsatish uchun ishlatiladi: hisobingizni
            yaratish va boshqarish, moliyaviy hisobotlaringizni (dashboard, diagrammalar) tuzish, byudjet va
            eslatmalarni hisoblash, va referal orqali Pro huquqini aniqlash. Ma&apos;lumotlaringiz{" "}
            <b>hech qanday uchinchi shaxsga sotilmaydi, ijaraga berilmaydi yoki reklama maqsadida ulashilmaydi.</b>
          </p>
        </Section>

        <Section title="4. Ma'lumotlarni saqlash va xavfsizlik">
          <p>
            Parollar bcrypt algoritmi bilan xeshlanadi va hech qachon oddiy matn holida saqlanmaydi. Tizimga kirish
            JWT tokenlar orqali cheklangan va vaqti tugaydigan (muddatli) shaklda amalga oshiriladi. Ma&apos;lumotlar
            bazasiga kirish faqat autentifikatsiyadan o&apos;tgan foydalanuvchining o&apos;z ma&apos;lumotlari doirasida
            cheklangan.
          </p>
        </Section>

        <Section title="5. Sizning huquqlaringiz">
          <p>
            Siz istalgan vaqtda o&apos;z ma&apos;lumotlaringizni ko&apos;rish va tahrirlash huquqiga egasiz. Hisobingizni
            va unga tegishli barcha ma&apos;lumotlarni butunlay o&apos;chirishni so&apos;rash uchun quyidagi bo&apos;limdagi
            aloqa manzili orqali murojaat qiling.
          </p>
        </Section>

        <Section title="6. Cookie va lokal xotira">
          <p>
            Platforma kuzatuv yoki reklama cookie&apos;laridan foydalanmaydi. Brauzeringizning lokal xotirasi
            (localStorage) faqat tizimga kirish tokenini saqlash uchun ishlatiladi.
          </p>
        </Section>

        <Section title="7. Siyosatning o'zgarishi">
          <p>
            Ushbu siyosat vaqti-vaqti bilan yangilanishi mumkin. Muhim o&apos;zgarishlar haqida platforma ichida
            xabar beramiz.
          </p>
        </Section>

        <Section title="8. Bog'lanish">
          <p>Savol yoki so&apos;rovlaringiz bo&apos;lsa: support@hamyonpro.uz</p>
        </Section>
      </div>

      <p className="mt-5 text-center text-sm text-slate-500">
        <Link href="/register" className="font-semibold text-brand-700">
          Ro&apos;yxatdan o&apos;tishga qaytish
        </Link>
      </p>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-1.5 text-[15px] font-semibold text-slate-900">{title}</h2>
      {children}
    </section>
  );
}
