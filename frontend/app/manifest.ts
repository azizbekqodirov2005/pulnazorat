import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "HamyonPro — Shaxsiy moliya",
    short_name: "HamyonPro",
    description:
      "Kirim va chiqimlaringizni oson kuzatish, byudjet, maqsad va qarzlarni boshqarish uchun shaxsiy moliya platformasi.",
    start_url: "/dashboard",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#f6faf7",
    theme_color: "#27824e",
    lang: "uz",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
