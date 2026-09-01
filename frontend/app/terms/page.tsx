import Link from "next/link";
import { FileText } from "lucide-react";

export const metadata = {
  title: "Foydalanish shartlari — PulNazorat",
};

export default function TermsPage() {
  return (
    <main className="app-container-wide py-8 sm:py-10">
      <div className="mb-6 flex items-center gap-2.5">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
          <FileText size={19} />
        </span>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Foydalanish shartlari</h1>
          <p className="text-[12px] text-slate-500">Oxirgi yangilanish: 2026-yil 1-sentabr</p>
        </div>
      </div>

      <div className="card flex flex-col gap-6 text-[14px] leading-relaxed text-slate-700">
        <Section title="1. Xizmat tavsifi">
          <p>
            PulNazorat — shaxsiy kirim-chiqimni kuzatish uchun mo&apos;ljallangan veb-platforma. Bepul (Free) va Pro
            darajalari mavjud; Pro imkoniyatlari (byudjet, jamg&apos;arma maqsadlari, qarz-nasiya kuzatuvi,
            takrorlanuvchi to&apos;lov eslatmalari) referal tizimi orqali, pulsiz ochiladi.
          </p>
        </Section>

        <Section title="2. Hisob yaratish">
          <p>
            Ro&apos;yxatdan o&apos;tish uchun to&apos;g&apos;ri email yoki telefon raqami va haqiqiy ism kiritishingiz
            so&apos;raladi. Hisobingiz va parolingiz xavfsizligi uchun siz javobgarsiz — parolingizni boshqalarga
            bermang.
          </p>
        </Section>

        <Section title="3. Foydalanuvchi majburiyatlari">
          <ul className="list-disc space-y-1.5 pl-5">
            <li>Platformadan qonuniy maqsadlarda foydalaning</li>
            <li>Boshqa foydalanuvchining hisobiga ruxsatsiz kirishga urinmang</li>
            <li>
              Referal tizimini suiiste&apos;mol qilmang — masalan, o&apos;zingizga tegishli soxta hisoblar yaratib,
              o&apos;zingizni-o&apos;zingiz &quot;taklif qilib&quot; Pro huquqini olishga urinish taqiqlanadi. Bunday
              holat aniqlansa, tegishli hisoblar va berilgan Pro huquqi bekor qilinishi mumkin
            </li>
          </ul>
        </Section>

        <Section title="4. Javobgarlikni cheklash">
          <p>
            PulNazorat — shaxsiy hisob-kitob yuritish vositasi, moliyaviy, soliq yoki investitsiya bo&apos;yicha
            professional maslahat emas. Platformada ko&apos;rsatilgan hisob-kitoblar siz kiritgan ma&apos;lumotlarga
            asoslanadi; ularning to&apos;g&apos;riligi uchun javobgarlik foydalanuvchiga tegishli.
          </p>
        </Section>

        <Section title="5. Xizmatni to'xtatish huquqi">
          <p>
            Ushbu shartlarni buzgan yoki platformani suiiste&apos;mol qilgan hisoblarni ogohlantirishsiz bloklash
            huquqini o&apos;zimizda saqlab qolamiz.
          </p>
        </Section>

        <Section title="6. Shartlarning o'zgarishi">
          <p>Ushbu shartlar vaqti-vaqti bilan yangilanishi mumkin. Muhim o&apos;zgarishlar haqida xabar beramiz.</p>
        </Section>

        <Section title="7. Bog'lanish">
          <p>Savol yoki so&apos;rovlaringiz bo&apos;lsa: support@pulnazorat.uz</p>
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
