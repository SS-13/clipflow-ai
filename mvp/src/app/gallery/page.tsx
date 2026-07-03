import { readFile } from "node:fs/promises";
import path from "node:path";
import Link from "next/link";
import { ArrowLeft, ImageIcon, LayoutGrid, Sparkles } from "lucide-react";

type GalleryItem = {
  id: string;
  label: string;
  source: "generated" | "reference";
  category: string;
  imagePath: string;
  note: string;
};

type GallerySection = {
  id: string;
  title: string;
  description: string;
  items: GalleryItem[];
};

type CoverGallerySample = {
  sections: GallerySection[];
};

export default async function GalleryPage() {
  const gallery = await readJson<CoverGallerySample>("data/cover-gallery-sample.json");
  const totalItems = gallery.sections.reduce((sum, section) => sum + section.items.length, 0);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(246,190,114,0.18),_transparent_28%),linear-gradient(180deg,_#f6f2e8_0%,_#fffdf8_32%,_#f5f5f4_100%)] text-zinc-950">
      <div className="mx-auto max-w-[1480px] px-6 py-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-sm text-zinc-500">
              <Link href="/" className="inline-flex items-center gap-1 hover:text-zinc-900">
                <ArrowLeft className="size-4" />
                返回工作平台
              </Link>
            </div>
            <h1 className="mt-4 text-4xl font-semibold tracking-normal text-zinc-950">封面画廊</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-600">
              这里同时收集工作流里沉淀下来的生成封面，以及你从外部保留下来的参考封面，用来做模板判断和风格选择。
            </p>
          </div>
          <div className="grid min-w-[280px] gap-3 sm:grid-cols-2">
            <StatCard icon={<ImageIcon className="size-4" />} label="封面总数" value={`${totalItems}`} hint="当前样例库" />
            <StatCard icon={<Sparkles className="size-4" />} label="风格分组" value={`${gallery.sections.length}`} hint="生成 + 参考" />
          </div>
        </div>

        <div className="mt-8 grid gap-6">
          {gallery.sections.map((section) => (
            <section key={section.id} className="rounded-xl border border-zinc-200/80 bg-white/88 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)] backdrop-blur">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-800 ring-1 ring-amber-200">
                    <LayoutGrid className="size-3.5" />
                    {section.title}
                  </div>
                  <p className="mt-3 text-sm leading-6 text-zinc-600">{section.description}</p>
                </div>
                <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-600">{section.items.length} 张</span>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {section.items.map((item) => (
                  <article key={item.id} className="overflow-hidden rounded-lg border border-zinc-200 bg-zinc-50">
                    <div className="aspect-[3/4] overflow-hidden bg-zinc-950">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={item.imagePath} alt={item.label} className="h-full w-full object-cover" />
                    </div>
                    <div className="space-y-3 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <h2 className="text-sm font-semibold text-zinc-950">{item.label}</h2>
                        <span
                          className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
                            item.source === "generated"
                              ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                              : "bg-sky-50 text-sky-700 ring-1 ring-sky-200"
                          }`}
                        >
                          {item.source === "generated" ? "生成封面" : "参考封面"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-3 text-xs text-zinc-500">
                        <span>{item.category}</span>
                        <span>{item.note}</span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}

function StatCard({
  icon,
  label,
  value,
  hint,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="rounded-xl border border-zinc-200/80 bg-white/88 p-4 shadow-[0_20px_60px_rgba(15,23,42,0.06)] backdrop-blur">
      <div className="flex items-center gap-2 text-xs font-medium text-zinc-500">
        {icon}
        <span>{label}</span>
      </div>
      <div className="mt-3 text-2xl font-semibold text-zinc-950">{value}</div>
      <div className="mt-1 text-xs text-zinc-500">{hint}</div>
    </div>
  );
}

async function readJson<T>(filePath: string): Promise<T> {
  const fullPath = path.join(process.cwd(), "..", filePath);
  const text = await readFile(fullPath, "utf8");

  return JSON.parse(text) as T;
}
