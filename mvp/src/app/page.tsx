import { readFile } from "node:fs/promises";
import path from "node:path";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Clapperboard,
  Clock3,
  FolderKanban,
  ImageIcon,
  PlayCircle,
  Sparkles,
} from "lucide-react";

type DashboardKpi = {
  id: string;
  label: string;
  value: string;
  hint: string;
};

type DashboardAction = {
  id: string;
  title: string;
  detail: string;
  link: string;
};

type RecentRun = {
  id: string;
  title: string;
  dayLabel: string;
  status: string;
  durationText: string;
  productionText: string;
  snapshotStatus: string;
  coverImage: string;
  link: string;
};

type GalleryHighlight = {
  id: string;
  label: string;
  source: string;
  type: string;
  imagePath: string;
};

type DashboardSample = {
  rangeLabel: string;
  headline: {
    title: string;
    subtitle: string;
  };
  productionKpis: DashboardKpi[];
  growthKpis: DashboardKpi[];
  actionItems: DashboardAction[];
  recentRuns: RecentRun[];
  galleryHighlights: GalleryHighlight[];
};

export default async function Home() {
  const dashboard = await readJson<DashboardSample>("data/dashboard-sample.json");

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(252,211,77,0.16),_transparent_25%),radial-gradient(circle_at_top_right,_rgba(125,211,252,0.14),_transparent_24%),linear-gradient(180deg,_#faf7ef_0%,_#fffcf5_36%,_#f5f5f4_100%)] text-zinc-950">
      <div className="mx-auto max-w-[1500px] px-6 py-8">
        <header className="rounded-[28px] border border-zinc-200/70 bg-white/88 p-6 shadow-[0_30px_100px_rgba(15,23,42,0.08)] backdrop-blur">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-800 ring-1 ring-amber-200">
                <Sparkles className="size-3.5" />
                {dashboard.rangeLabel}
              </div>
              <h1 className="mt-5 text-5xl font-semibold tracking-normal text-zinc-950">
                {dashboard.headline.title}
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-600">{dashboard.headline.subtitle}</p>
            </div>

            <div className="grid min-w-[280px] gap-3">
              <Link href="/create" className="primaryButton min-w-[220px] justify-between rounded-xl px-4 py-3">
                <span className="inline-flex items-center gap-2">
                  <Clapperboard className="size-4" />
                  创建视频
                </span>
                <ArrowRight className="size-4" />
              </Link>
              <div className="grid gap-3 sm:grid-cols-2">
                <Link href="/gallery" className="secondaryButton rounded-xl px-4 py-3">
                  <ImageIcon className="size-4" />
                  封面画廊
                </Link>
                <Link href="/metrics/snapshots" className="secondaryButton rounded-xl px-4 py-3">
                  <BarChart3 className="size-4" />
                  数据看板
                </Link>
              </div>
            </div>
          </div>
        </header>

        <section className="mt-8">
          <div className="flex items-center gap-2 text-sm font-semibold text-zinc-700">
            <PlayCircle className="size-4" />
            本月增长与产出
          </div>
          <div className="mt-4 grid gap-4 lg:grid-cols-5">
            {dashboard.growthKpis.map((item) => (
              <KpiCard key={item.id} label={item.label} value={item.value} hint={item.hint} tone="dark" />
            ))}
          </div>
          <div className="mt-4 grid gap-4 lg:grid-cols-5">
            {dashboard.productionKpis.map((item) => (
              <KpiCard key={item.id} label={item.label} value={item.value} hint={item.hint} tone="light" />
            ))}
          </div>
        </section>

        <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
          <section className="rounded-2xl border border-zinc-200/80 bg-white/90 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-zinc-950">最近视频</h2>
                <p className="mt-1 text-sm text-zinc-500">从工作流结果、制作耗时和平台快照状态快速回看本月内容。</p>
              </div>
              <Link href="/runs/run_2026_06_30_day28" className="secondaryButton">
                查看 Run Detail
              </Link>
            </div>
            <div className="mt-5 grid gap-4">
              {dashboard.recentRuns.map((run) => (
                <article key={run.id} className="grid gap-4 rounded-xl border border-zinc-200 bg-zinc-50 p-4 md:grid-cols-[108px_minmax(0,1fr)_150px]">
                  <div className="aspect-[3/4] overflow-hidden rounded-lg bg-zinc-950">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={run.coverImage} alt={run.title} className="h-full w-full object-cover" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-semibold text-zinc-950">{run.title}</h3>
                      <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-600">{run.dayLabel}</span>
                    </div>
                    <div className="mt-3 grid gap-2 text-sm text-zinc-600 sm:grid-cols-3">
                      <span>状态：{statusLabel(run.status)}</span>
                      <span>视频时长：{run.durationText}</span>
                      <span>制作时长：{run.productionText}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-start gap-3 md:items-end">
                    <span className={snapshotBadgeClass(run.snapshotStatus)}>
                      {run.snapshotStatus === "ready" ? "快照已补录" : "待录入平台快照"}
                    </span>
                    <Link href={run.link} className="secondaryButton">
                      查看详情
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <div className="grid gap-6">
            <section className="rounded-2xl border border-zinc-200/80 bg-zinc-950 p-5 text-white shadow-[0_20px_60px_rgba(15,23,42,0.18)]">
              <div className="flex items-center gap-2 text-sm font-semibold text-zinc-200">
                <FolderKanban className="size-4" />
                待处理事项
              </div>
              <div className="mt-4 space-y-3">
                {dashboard.actionItems.map((item) => (
                  <Link
                    key={item.id}
                    href={item.link}
                    className="block rounded-xl border border-white/10 bg-white/5 p-4 transition hover:bg-white/10"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h2 className="text-sm font-semibold text-white">{item.title}</h2>
                        <p className="mt-2 text-sm leading-6 text-zinc-300">{item.detail}</p>
                      </div>
                      <ArrowRight className="mt-1 size-4 text-zinc-400" />
                    </div>
                  </Link>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-zinc-200/80 bg-white/90 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-zinc-950">精选封面</h2>
                  <p className="mt-1 text-sm text-zinc-500">生成封面和参考封面放在一起看，更容易判断风格方向。</p>
                </div>
                <Link href="/gallery" className="secondaryButton">
                  进入画廊
                </Link>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-4">
                {dashboard.galleryHighlights.map((item) => (
                  <article key={item.id} className="overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50">
                    <div className="aspect-[3/4] overflow-hidden bg-zinc-950">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={item.imagePath} alt={item.label} className="h-full w-full object-cover" />
                    </div>
                    <div className="space-y-2 p-3">
                      <h3 className="text-sm font-semibold text-zinc-950">{item.label}</h3>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500">
                        <span>{item.type}</span>
                        <span
                          className={`rounded-full px-2 py-1 ${
                            item.source === "generated"
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-sky-50 text-sky-700"
                          }`}
                        >
                          {item.source === "generated" ? "生成封面" : "参考封面"}
                        </span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </div>
        </div>

        <section className="mt-8 rounded-2xl border border-zinc-200/80 bg-white/90 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-sm font-semibold text-zinc-700">
                <Clock3 className="size-4" />
                数据看板入口
              </div>
              <p className="mt-2 text-sm leading-6 text-zinc-600">
                平台数据不做实时抓取。第一版通过月度截图快照补录，把播放量、点赞、评论和收藏整理成可回溯的增长证据。
              </p>
            </div>
            <Link href="/metrics/snapshots" className="primaryButton rounded-xl px-4 py-3">
              进入数据看板
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}

function KpiCard({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: string;
  hint: string;
  tone: "dark" | "light";
}) {
  return (
    <article
      className={`rounded-2xl border p-4 shadow-[0_20px_60px_rgba(15,23,42,0.05)] ${
        tone === "dark"
          ? "border-zinc-900 bg-zinc-950 text-white"
          : "border-zinc-200/80 bg-white/90 text-zinc-950"
      }`}
    >
      <p className={`text-xs font-medium ${tone === "dark" ? "text-zinc-400" : "text-zinc-500"}`}>{label}</p>
      <p className="mt-3 text-3xl font-semibold tracking-normal">{value}</p>
      <p className={`mt-2 text-xs ${tone === "dark" ? "text-zinc-400" : "text-zinc-500"}`}>{hint}</p>
    </article>
  );
}

function statusLabel(status: string) {
  if (status === "published") {
    return "已发布";
  }

  if (status === "exported") {
    return "已导出";
  }

  return status;
}

function snapshotBadgeClass(status: string) {
  return status === "ready"
    ? "rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 ring-1 ring-emerald-200"
    : "rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-800 ring-1 ring-amber-200";
}

async function readJson<T>(filePath: string): Promise<T> {
  const fullPath = path.join(process.cwd(), "..", filePath);
  const text = await readFile(fullPath, "utf8");

  return JSON.parse(text) as T;
}
