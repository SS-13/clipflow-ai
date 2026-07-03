import { readFile } from "node:fs/promises";
import path from "node:path";
import Link from "next/link";
import { ArrowLeft, Camera, CircleAlert, Database, PencilLine } from "lucide-react";

type Snapshot = {
  snapshotId: string;
  contentId: string;
  title: string;
  dayLabel: string;
  snapshotDate: string;
  snapshotType: string;
  views: number | null;
  likes: number | null;
  comments: number | null;
  favorites: number | null;
  shares: number | null;
  ocrStatus: "pending" | "parsed" | "verified";
  screenshotPath: string;
  notes: string;
};

type MetricsSample = {
  rangeLabel: string;
  platform: string;
  snapshots: Snapshot[];
};

export default async function MetricsSnapshotsPage() {
  const sample = await readJson<MetricsSample>("data/platform-metrics-snapshots.json");
  const completedCount = sample.snapshots.filter((item) => item.ocrStatus === "verified").length;
  const pendingCount = sample.snapshots.length - completedCount;

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,_#f4f7f5_0%,_#fbfcfb_28%,_#f5f5f4_100%)] text-zinc-950">
      <div className="mx-auto max-w-[1480px] px-6 py-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <Link href="/" className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-900">
              <ArrowLeft className="size-4" />
              返回工作平台
            </Link>
            <h1 className="mt-4 text-4xl font-semibold tracking-normal">平台数据看板</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-600">
              这里展示月度平台快照，不做实时抓取。第一版依赖人工截图或手动录入，录入后作为月度复盘的增长证据。
            </p>
          </div>
          <div className="grid min-w-[320px] gap-3 sm:grid-cols-3">
            <MetricStat label="统计范围" value={sample.rangeLabel} icon={<Database className="size-4" />} />
            <MetricStat label="已校对快照" value={`${completedCount}`} icon={<PencilLine className="size-4" />} />
            <MetricStat label="待补录" value={`${pendingCount}`} icon={<CircleAlert className="size-4" />} />
          </div>
        </div>

        <section className="mt-8 rounded-xl border border-zinc-200/80 bg-white/90 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.05)]">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-zinc-950">月度平台快照</h2>
              <p className="mt-2 text-sm text-zinc-600">
                平台：{sample.platform}。没有快照的数据视为未录入，不按 `0` 参与聚合。
              </p>
            </div>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 ring-1 ring-emerald-200">
              平台数据来自手动月度快照
            </span>
          </div>

          <div className="mt-5 overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-y-2">
              <thead>
                <tr className="text-left text-xs uppercase tracking-normal text-zinc-500">
                  <th className="px-3 py-2">视频</th>
                  <th className="px-3 py-2">播放量</th>
                  <th className="px-3 py-2">点赞</th>
                  <th className="px-3 py-2">评论</th>
                  <th className="px-3 py-2">收藏</th>
                  <th className="px-3 py-2">分享</th>
                  <th className="px-3 py-2">状态</th>
                  <th className="px-3 py-2">截图</th>
                </tr>
              </thead>
              <tbody>
                {sample.snapshots.map((snapshot) => (
                  <tr key={snapshot.snapshotId} className="rounded-lg bg-zinc-50 text-sm text-zinc-700">
                    <td className="rounded-l-lg px-3 py-3">
                      <div className="font-medium text-zinc-950">{snapshot.title}</div>
                      <div className="mt-1 text-xs text-zinc-500">
                        {snapshot.dayLabel} · {snapshot.snapshotType || "monthly"}
                      </div>
                    </td>
                    <td className="px-3 py-3">{formatMetric(snapshot.views)}</td>
                    <td className="px-3 py-3">{formatMetric(snapshot.likes)}</td>
                    <td className="px-3 py-3">{formatMetric(snapshot.comments)}</td>
                    <td className="px-3 py-3">{formatMetric(snapshot.favorites)}</td>
                    <td className="px-3 py-3">{formatMetric(snapshot.shares)}</td>
                    <td className="px-3 py-3">
                      <span className={statusClassName(snapshot.ocrStatus)}>{statusLabel(snapshot.ocrStatus)}</span>
                    </td>
                    <td className="rounded-r-lg px-3 py-3 text-xs text-zinc-500">
                      {snapshot.screenshotPath ? snapshot.screenshotPath : "待录入平台快照"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="rounded-xl border border-zinc-200/80 bg-white/90 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.05)]">
            <h2 className="text-lg font-semibold text-zinc-950">录入方式</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <StepCard
                title="上传截图"
                detail="按视频上传平台后台或作品列表截图。"
                icon={<Camera className="size-4" />}
              />
              <StepCard
                title="OCR 识别"
                detail="系统尝试提取播放量、点赞、评论、收藏和分享。"
                icon={<Database className="size-4" />}
              />
              <StepCard
                title="人工校对"
                detail="确认后才进入月度汇总，缺失值不会被当成 0。"
                icon={<PencilLine className="size-4" />}
              />
            </div>
          </div>
          <div className="rounded-xl border border-zinc-200/80 bg-zinc-950 p-5 text-white shadow-[0_20px_60px_rgba(15,23,42,0.18)]">
            <p className="text-xs uppercase tracking-[0.18em] text-zinc-400">Monthly Review</p>
            <h2 className="mt-3 text-2xl font-semibold">这块数据是为了复盘，不是为了实时盯盘。</h2>
            <p className="mt-4 text-sm leading-6 text-zinc-300">
              生产数据来自 `00_state`，平台表现来自月度快照。两者放在一起，才能判断哪条视频值得继续做、哪种封面风格更有延续价值。
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

function MetricStat({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-zinc-200/80 bg-white/88 p-4 shadow-[0_20px_60px_rgba(15,23,42,0.05)]">
      <div className="flex items-center gap-2 text-xs font-medium text-zinc-500">
        {icon}
        <span>{label}</span>
      </div>
      <div className="mt-3 text-2xl font-semibold text-zinc-950">{value}</div>
    </div>
  );
}

function StepCard({ title, detail, icon }: { title: string; detail: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-zinc-900">
        {icon}
        <span>{title}</span>
      </div>
      <p className="mt-2 text-sm leading-6 text-zinc-600">{detail}</p>
    </div>
  );
}

function statusClassName(status: Snapshot["ocrStatus"]) {
  if (status === "verified") {
    return "rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 ring-1 ring-emerald-200";
  }

  if (status === "parsed") {
    return "rounded-full bg-sky-50 px-2.5 py-1 text-xs font-medium text-sky-700 ring-1 ring-sky-200";
  }

  return "rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-800 ring-1 ring-amber-200";
}

function statusLabel(status: Snapshot["ocrStatus"]) {
  if (status === "verified") {
    return "已校对";
  }

  if (status === "parsed") {
    return "待确认";
  }

  return "待录入";
}

function formatMetric(value: number | null) {
  if (value == null) {
    return "待录入";
  }

  return value.toLocaleString("zh-CN");
}

async function readJson<T>(filePath: string): Promise<T> {
  const fullPath = path.join(process.cwd(), "..", filePath);
  const text = await readFile(fullPath, "utf8");

  return JSON.parse(text) as T;
}
