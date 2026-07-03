import { readFile } from "node:fs/promises";
import path from "node:path";
import Link from "next/link";
import { AlertTriangle, CheckCircle2, Clock3, FileText, GitBranch, ShieldCheck } from "lucide-react";

type Step = {
  id: string;
  type: string;
  agent: string;
  status: string;
  input: string;
  output: string;
  artifacts: string[];
};

type Artifact = {
  id: string;
  type: string;
  path: string;
  description: string;
};

type SampleRun = {
  run: {
    id: string;
    workflowVersion: string;
    workflowVersionId: string;
    title: string;
    status: string;
    contentDate: string;
    videoNumber: string;
    durationSeconds: number;
    steps: Step[];
    artifacts: Artifact[];
    knownIssues: string[];
  };
};

type WorkflowHistory = {
  versions: {
    id: string;
    version: string;
    date: string;
    title: string;
    summary: string;
  }[];
};

type PageProps = {
  searchParams?: Promise<{
    step?: string;
  }>;
};

const statusClassName: Record<string, string> = {
  succeeded: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  failed: "bg-red-50 text-red-700 ring-red-200",
  running: "bg-blue-50 text-blue-700 ring-blue-200",
  waiting_user: "bg-amber-50 text-amber-800 ring-amber-200",
  pending: "bg-zinc-100 text-zinc-700 ring-zinc-200",
};

export default async function RunDetailPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const sampleRun = await readJson<SampleRun>("data/sample-run-day28.json");
  const workflowHistory = await readJson<WorkflowHistory>("data/workflow-history.json");
  const selectedStep =
    sampleRun.run.steps.find((step) => step.id === params?.step) ?? sampleRun.run.steps[0];
  const selectedArtifacts = sampleRun.run.artifacts.filter((artifact) =>
    selectedStep.artifacts.includes(artifact.id),
  );
  const workflowVersion =
    workflowHistory.versions.find((version) => version.id === sampleRun.run.workflowVersionId) ??
    workflowHistory.versions.find((version) => version.version === sampleRun.run.workflowVersion);
  const complianceIssue = sampleRun.run.knownIssues.find((issue) =>
    issue.toLowerCase().includes("compliance"),
  );

  return (
    <main className="min-h-screen bg-zinc-100 text-zinc-950">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-[1500px] flex-col gap-3 px-6 py-5">
          <div className="flex flex-wrap items-center gap-2 text-sm text-zinc-500">
            <span>ClipFlow</span>
            <span>/</span>
            <span>{sampleRun.run.id}</span>
          </div>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold tracking-normal">{sampleRun.run.title}</h1>
              <p className="mt-1 text-sm text-zinc-600">
                {sampleRun.run.videoNumber} · {sampleRun.run.contentDate} ·{" "}
                {formatDuration(sampleRun.run.durationSeconds)}
              </p>
            </div>
            <span className={badgeClass(sampleRun.run.status)}>{sampleRun.run.status}</span>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1500px] gap-4 px-6 py-5 lg:grid-cols-[290px_minmax(0,1fr)_360px]">
        <aside className="rounded-lg border border-zinc-200 bg-white p-4">
          <SectionTitle icon={<Clock3 className="size-4" />} title="Step Timeline" />
          <div className="mt-4 flex flex-col gap-2">
            {sampleRun.run.steps.map((step, index) => (
              <StepLink key={step.id} index={index + 1} step={step} selected={step.id === selectedStep.id} />
            ))}
          </div>
        </aside>

        <section className="rounded-lg border border-zinc-200 bg-white p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-normal text-zinc-500">{selectedStep.agent}</p>
              <h2 className="mt-1 text-xl font-semibold capitalize">{selectedStep.type}</h2>
            </div>
            <span className={badgeClass(selectedStep.status)}>{selectedStep.status}</span>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <TextPanel label="Input" value={selectedStep.input} />
            <TextPanel label="Output" value={selectedStep.output} />
          </div>

          <div className="mt-5 rounded-lg border border-zinc-200 bg-zinc-50 p-4">
            <h3 className="text-sm font-semibold">Run Notes</h3>
            <ul className="mt-3 space-y-2 text-sm text-zinc-700">
              {sampleRun.run.knownIssues.map((issue) => (
                <li key={issue}>- {issue}</li>
              ))}
            </ul>
          </div>
        </section>

        <aside className="flex flex-col gap-4">
          <Panel title="Artifacts" icon={<FileText className="size-4" />}>
            <div className="space-y-3">
              {selectedArtifacts.map((artifact) => (
                <ArtifactRow key={artifact.id} artifact={artifact} />
              ))}
            </div>
          </Panel>

          <Panel title="Workflow Version" icon={<GitBranch className="size-4" />}>
            {workflowVersion ? (
              <div className="space-y-3 text-sm text-zinc-700">
                <div>
                  <p className="font-semibold text-zinc-950">
                    v{workflowVersion.version} · {workflowVersion.title}
                  </p>
                  <p className="mt-1 text-zinc-500">{workflowVersion.date}</p>
                </div>
                <p>{workflowVersion.summary}</p>
              </div>
            ) : (
              <p className="text-sm text-zinc-500">No version record found.</p>
            )}
          </Panel>

          <Panel title="Gate" icon={<ShieldCheck className="size-4" />}>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between gap-3">
                <span className="text-zinc-600">Output Compliance</span>
                <span className="rounded-md bg-amber-50 px-2 py-1 text-xs font-medium text-amber-800 ring-1 ring-amber-200">
                  revise
                </span>
              </div>
              <p className="text-zinc-700">
                {complianceIssue ?? "No compliance gate data in sample run."}
              </p>
              <p className="text-xs text-zinc-500">
                publish_ready=false · first-class gate event pending in data model
              </p>
            </div>
          </Panel>
        </aside>
      </div>
    </main>
  );
}

async function readJson<T>(filePath: string): Promise<T> {
  const fullPath = path.join(process.cwd(), "..", filePath);
  const text = await readFile(fullPath, "utf8");

  return JSON.parse(text) as T;
}

function StepLink({ index, step, selected }: { index: number; step: Step; selected: boolean }) {
  return (
    <Link
      href={`/runs/run_2026_06_30_day28?step=${step.id}`}
      className={`rounded-lg border p-3 text-left transition ${
        selected ? "border-zinc-950 bg-zinc-950 text-white" : "border-zinc-200 bg-white hover:bg-zinc-50"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-medium">0{index}</span>
        {step.status === "succeeded" ? <CheckCircle2 className="size-4" /> : <AlertTriangle className="size-4" />}
      </div>
      <p className="mt-2 text-sm font-semibold capitalize">{step.type}</p>
      <p className={`mt-1 truncate text-xs ${selected ? "text-zinc-300" : "text-zinc-500"}`}>{step.agent}</p>
    </Link>
  );
}

function Panel({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-4">
      <SectionTitle icon={icon} title={title} />
      <div className="mt-4">{children}</div>
    </section>
  );
}

function SectionTitle({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2 text-sm font-semibold">
      {icon}
      <span>{title}</span>
    </div>
  );
}

function TextPanel({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-zinc-200 p-4">
      <h3 className="text-sm font-semibold">{label}</h3>
      <p className="mt-3 text-sm leading-6 text-zinc-700">{value}</p>
    </div>
  );
}

function ArtifactRow({ artifact }: { artifact: Artifact }) {
  return (
    <div className="rounded-lg border border-zinc-200 p-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold">{artifact.type}</p>
        <span className="rounded-md bg-zinc-100 px-2 py-1 text-xs text-zinc-600">{artifact.id}</span>
      </div>
      <p className="mt-2 break-all font-mono text-xs text-zinc-600">{artifact.path}</p>
      <p className="mt-2 text-xs leading-5 text-zinc-500">{artifact.description}</p>
    </div>
  );
}

function badgeClass(status: string) {
  return `rounded-md px-2 py-1 text-xs font-medium ring-1 ${statusClassName[status] ?? statusClassName.pending}`;
}

function formatDuration(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.round(seconds % 60)
    .toString()
    .padStart(2, "0");

  return `${minutes}:${remainingSeconds}`;
}
