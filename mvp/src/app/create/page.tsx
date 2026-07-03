"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Archive,
  CheckCircle2,
  ChevronRight,
  Circle,
  Clock3,
  FileText,
  ImageIcon,
  RotateCcw,
  Scissors,
  ShieldCheck,
  Upload,
  Video,
} from "lucide-react";

type StepId =
  | "intake"
  | "safety"
  | "scriptReview"
  | "videoUpload"
  | "cover"
  | "videoSetup"
  | "editing"
  | "archive";

type SafetyStatus = "idle" | "checking" | "done";

type WorkflowStep = {
  id: StepId;
  title: string;
  owner: string;
  description: string;
};

type StepCompletion = Record<StepId, boolean>;
type CoverTemplateType = "videoDiary" | "thought" | "book";
type CoverFlowStep = "frame" | "content" | "gallery" | "preview";
type EditingRunStatus = "idle" | "running" | "blocked" | "done";
type CoverGalleryItem = {
  id: string;
  label: string;
  type: CoverTemplateType;
  title: string;
  subtitle: string;
  subtitleSecondary?: string;
  footer?: string;
  durationLabel?: string;
  source: "default" | "generated";
  imagePath?: string;
  note?: string;
};

const WORKFLOW_STEPS: WorkflowStep[] = [
  {
    id: "intake",
    title: "输入内容",
    owner: "Human",
    description: "当天想法、口述稿或粗糙文本",
  },
  {
    id: "safety",
    title: "脚本检测",
    owner: "Compliance Gate",
    description: "敏感词、平台风险、处理建议",
  },
  {
    id: "scriptReview",
    title: "人工改稿",
    owner: "Human",
    description: "保留本人语气，确认可口播",
  },
  {
    id: "videoUpload",
    title: "上传视频",
    owner: "Human",
    description: "录制完成后登记本地视频文件",
  },
  {
    id: "cover",
    title: "封面确认",
    owner: "Video Agent Mock",
    description: "生成封面预览，人工确认",
  },
  {
    id: "videoSetup",
    title: "制作参数",
    owner: "Human",
    description: "视频长度、容量、片头片尾秒数",
  },
  {
    id: "editing",
    title: "剪辑流转",
    owner: "Video Agent Mock",
    description: "去头尾、字幕、校对、导出",
  },
  {
    id: "archive",
    title: "数据归档",
    owner: "System",
    description: "保存路径、视频时长、制作时长",
  },
];

const EDITING_TASKS = [
  { id: "trim", label: "去掉片头/片尾", detail: "按参数去除片头片尾秒数" },
  { id: "subtitleGen", label: "生成字幕", detail: "完整读取视频口播并生成字幕稿" },
  { id: "subtitleReview", label: "字幕校对", detail: "校正错别字和断句" },
  { id: "scriptInspect", label: "脚本检视", detail: "检查实际口播扩展是否带来新的违规风险" },
  { id: "videoRender", label: "生成视频", detail: "合成字幕、封面和视频成片" },
  { id: "saveAssets", label: "保存封面和成片", detail: "输出本地文件并登记产物路径" },
];

const RISK_WORDS = ["下载", "推荐", "APP", "使用", "绝对", "保证", "收费"];

const DEFAULT_DATE = "2026-07-03";
const DEFAULT_COVER_GALLERY: CoverGalleryItem[] = [
  {
    id: "gallery_2026_07_02_v01",
    label: "2026-07-02 v01",
    type: "videoDiary",
    title: "高敏感和高需求的人",
    subtitle: "允许自己慢一点",
    subtitleSecondary: "不是脆弱，是感受力更强",
    footer: "15_cover_gallery/2026-07-02",
    source: "default",
    imagePath: "/cover-gallery/2026-07-02/v01_2026-07-02_cover.jpg",
    note: "真实画廊素材",
  },
  {
    id: "gallery_2026_07_01_v02",
    label: "2026-07-01 v02",
    type: "videoDiary",
    title: "别把陪伴做成KPI",
    subtitle: "有时候只是坐在一起",
    subtitleSecondary: "也已经很重要",
    footer: "15_cover_gallery/2026-07-01",
    source: "default",
    imagePath: "/cover-gallery/2026-07-01/v02_2026-07-01_cover.jpg",
    note: "真实画廊素材",
  },
  {
    id: "gallery_2026_06_27_v09",
    label: "2026-06-27 v09",
    type: "videoDiary",
    title: "弱连接里的多机位视角",
    subtitle: "把脸让出来，标题压到底部",
    subtitleSecondary: "v1.2-pil",
    footer: "15_cover_gallery/2026-06-27",
    source: "default",
    imagePath: "/cover-gallery/2026-06-27/v09_2026-06-27_cover.jpg",
    note: "真实画廊素材",
  },
  {
    id: "gallery_default_book",
    label: "默认读书分享",
    type: "book",
    title: "书名待填写",
    subtitle: "一句话讲清这本书最值得看的点",
    durationLabel: "本视频时长 03:00",
    source: "default",
  },
];
const INITIAL_STEP_COMPLETION: StepCompletion = {
  intake: false,
  safety: false,
  scriptReview: false,
  videoUpload: false,
  cover: false,
  videoSetup: false,
  editing: false,
  archive: false,
};

export default function CreateVideoDiaryPage() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [contentDate, setContentDate] = useState(DEFAULT_DATE);
  const [title, setTitle] = useState("今天的视频日记");
  const [rawText, setRawText] = useState("");
  const [script, setScript] = useState("");
  const [durationSeconds, setDurationSeconds] = useState(0);
  const [fileSizeMb, setFileSizeMb] = useState(0);
  const [trimStartSeconds, setTrimStartSeconds] = useState(0);
  const [trimEndSeconds, setTrimEndSeconds] = useState(0);
  const [editingIndex, setEditingIndex] = useState(0);
  const [editingRunStatus, setEditingRunStatus] = useState<EditingRunStatus>("idle");
  const [editingBlockedMessage, setEditingBlockedMessage] = useState("");
  const [subtitleDraft, setSubtitleDraft] = useState("");
  const [subtitleRiskWords, setSubtitleRiskWords] = useState<string[]>([]);
  const [simulateInspectionIssue, setSimulateInspectionIssue] = useState(true);
  const [manualFrameName, setManualFrameName] = useState("");
  const [productionMinutes, setProductionMinutes] = useState(45);
  const [safetyStatus, setSafetyStatus] = useState<SafetyStatus>("idle");
  const [uploadedVideoName, setUploadedVideoName] = useState("");
  const [scriptCopied, setScriptCopied] = useState(false);
  const [showRevisionHint, setShowRevisionHint] = useState(false);
  const [detectedRiskWords, setDetectedRiskWords] = useState<string[]>([]);
  const [completedSteps, setCompletedSteps] = useState<StepCompletion>(INITIAL_STEP_COMPLETION);
  const [coverTemplateType, setCoverTemplateType] = useState<CoverTemplateType>("videoDiary");
  const [coverMainTitle, setCoverMainTitle] = useState("今天的视频日记");
  const [coverSubtitle, setCoverSubtitle] = useState("记录今天的重要瞬间");
  const [coverSubtitleSecondary, setCoverSubtitleSecondary] = useState("把想法留在视频里");
  const [coverFooter, setCoverFooter] = useState("一天一条，持续更新");
  const [coverDurationLabel, setCoverDurationLabel] = useState("本视频时长 03:00");
  const [coverGallery, setCoverGallery] = useState<CoverGalleryItem[]>(DEFAULT_COVER_GALLERY);
  const [selectedCoverId, setSelectedCoverId] = useState<string>(DEFAULT_COVER_GALLERY[0].id);
  const [selectedFrameId, setSelectedFrameId] = useState("frame_03");
  const [coverFlowStep, setCoverFlowStep] = useState<CoverFlowStep>("gallery");
  const [coverPreviewStatus, setCoverPreviewStatus] = useState<"idle" | "loading" | "ready">("idle");
  const [coverGalleryOpen, setCoverGalleryOpen] = useState(false);
  const [isRunPanelOpen, setIsRunPanelOpen] = useState(true);
  const [debugStepJumpEnabled] = useState(true);
  const safetyRunIdRef = useRef(0);
  const coverRunIdRef = useRef(0);
  const editingTimerRef = useRef<number | null>(null);

  const activeStep = WORKFLOW_STEPS[activeIndex];
  const riskWords = useMemo(
    () => RISK_WORDS.filter((word) => rawText.toLowerCase().includes(word.toLowerCase())),
    [rawText],
  );
  const remainingDetectedRiskWords = useMemo(
    () => detectedRiskWords.filter((word) => rawText.toLowerCase().includes(word.toLowerCase())),
    [detectedRiskWords, rawText],
  );
  const safetySummary =
    safetyStatus === "checking"
      ? "检测中"
      : showRevisionHint && detectedRiskWords.length
        ? "待复检"
      : safetyStatus === "done" && detectedRiskWords.length && remainingDetectedRiskWords.length
        ? `命中：${remainingDetectedRiskWords.join(" / ")}`
        : safetyStatus === "done" && detectedRiskWords.length
          ? "已清除"
        : safetyStatus === "done"
          ? "通过"
          : "未检测";
  const exportFolder = `05_exports/${contentDate}`;
  const finalVideoPath = `${exportFolder}/${contentDate}_video-diary_demo.mp4`;
  const finalCoverPath = `${exportFolder}/${contentDate}_cover_demo.jpg`;
  const layoutColumnsClass = isRunPanelOpen
    ? "lg:grid-cols-[220px_minmax(0,1fr)_300px]"
    : "lg:grid-cols-[220px_minmax(0,1fr)_72px]";
  const progressPercent = Math.round(((activeIndex + 1) / WORKFLOW_STEPS.length) * 100);
  const frameOptions = useMemo(
    () => [
      { id: "frame_01", label: "候选主图 01", imagePath: "/cover-gallery/2026-06-21/v04_2026-06-21_cover.jpg" },
      { id: "frame_02", label: "候选主图 02", imagePath: "/cover-gallery/2026-06-30/v02_2026-06-30_cover.jpg" },
      { id: "frame_03", label: "候选主图 03", imagePath: "/cover-gallery/2026-07-02/v01_2026-07-02_cover.jpg" },
      { id: "frame_04", label: "候选主图 04", imagePath: "/cover-gallery/2026-07-01/v01_2026-07-01_cover.jpg" },
      { id: "frame_05", label: "候选主图 05", imagePath: "/cover-gallery/2026-06-29/v01_2026-06-29_cover.jpg" },
      { id: "frame_06", label: "候选主图 06", imagePath: "/cover-gallery/2026-06-28/v01_2026-06-28_cover.jpg" },
      { id: "frame_07", label: "候选主图 07", imagePath: "/cover-gallery/2026-06-27/v07_2026-06-27_cover.jpg" },
      { id: "frame_08", label: "候选主图 08", imagePath: "/cover-gallery/2026-06-25/v03_2026-06-25_cover.jpg" },
      { id: "frame_09", label: "候选主图 09", imagePath: "/cover-gallery/2026-06-24/v02_2026-06-24_cover.jpg" },
    ],
    [],
  );
  const selectedFrame = frameOptions.find((item) => item.id === selectedFrameId) ?? frameOptions[0];
  const selectedStyle = coverGallery.find((item) => item.id === selectedCoverId) ?? coverGallery[0];
  const selectedFrameLabel = selectedFrameId === "manual_upload" ? `手动上传 · ${manualFrameName || "待选择"}` : selectedFrame.label;
  const currentCoverPreview: CoverGalleryItem = {
    id: "current_cover_preview",
    label: "当前封面",
    type: coverTemplateType,
    title: coverMainTitle,
    subtitle: coverSubtitle,
    subtitleSecondary: coverTemplateType === "videoDiary" ? coverSubtitleSecondary : undefined,
    footer: coverTemplateType === "thought" ? coverSubtitle : coverFooter,
    durationLabel: coverTemplateType === "book" ? coverDurationLabel : undefined,
    source: "generated",
    imagePath: selectedFrameId === "manual_upload" ? undefined : selectedFrame.imagePath,
  };

  useEffect(() => {
    if (editingTimerRef.current) {
      window.clearTimeout(editingTimerRef.current);
      editingTimerRef.current = null;
    }

    if (activeStep.id !== "editing") {
      return;
    }

    if (editingRunStatus !== "running") {
      return;
    }

    if (editingIndex >= EDITING_TASKS.length) {
      return;
    }

    const currentTask = EDITING_TASKS[editingIndex];

    editingTimerRef.current = window.setTimeout(() => {
      if (currentTask.id === "subtitleGen") {
        const nextSubtitle = buildSubtitleDraft(script, simulateInspectionIssue);

        setSubtitleDraft(nextSubtitle);
        setSubtitleRiskWords(findRiskWords(nextSubtitle));
        setEditingIndex((value) => value + 1);
        return;
      }

      if (currentTask.id === "scriptInspect") {
        const nextRiskWords = findRiskWords(subtitleDraft);

        setSubtitleRiskWords(nextRiskWords);

        if (nextRiskWords.length) {
          setEditingBlockedMessage(`检视命中：${nextRiskWords.join(" / ")}。需要人工确认是否继续。`);
          setEditingRunStatus("blocked");
          return;
        }

        setEditingIndex((value) => value + 1);
        return;
      }

      if (currentTask.id === "saveAssets") {
        setEditingIndex(EDITING_TASKS.length);
        setEditingRunStatus("done");
        setCompletedSteps((previous) => ({
          ...previous,
          editing: true,
        }));
        return;
      }

      setEditingIndex((value) => value + 1);
    }, 1400);

    return () => {
      if (editingTimerRef.current) {
        window.clearTimeout(editingTimerRef.current);
        editingTimerRef.current = null;
      }
    };
  }, [activeStep.id, editingIndex, editingRunStatus, script, simulateInspectionIssue, subtitleDraft]);

  function resetDemo() {
    setActiveIndex(0);
    setRawText("");
    setScript("");
    resetEditingFlow();
    setProductionMinutes(45);
    setSafetyStatus("idle");
    setUploadedVideoName("");
    setScriptCopied(false);
    setShowRevisionHint(false);
    setDetectedRiskWords([]);
    setCompletedSteps(INITIAL_STEP_COMPLETION);
    setCoverTemplateType("videoDiary");
    setCoverMainTitle("今天的视频日记");
    setCoverSubtitle("记录今天的重要瞬间");
    setCoverSubtitleSecondary("把想法留在视频里");
    setCoverFooter("一天一条，持续更新");
    setCoverDurationLabel("本视频时长 03:00");
    setCoverGallery(DEFAULT_COVER_GALLERY);
    setSelectedCoverId(DEFAULT_COVER_GALLERY[0].id);
    setSelectedFrameId("frame_03");
    setCoverFlowStep("gallery");
    setCoverPreviewStatus("idle");
    setCoverGalleryOpen(false);
    setManualFrameName("");
  }

  function moveNext() {
    setActiveIndex((index) => Math.min(index + 1, WORKFLOW_STEPS.length - 1));
  }

  function canAccessStep(index: number) {
    if (index === 0) {
      return true;
    }

    return WORKFLOW_STEPS.slice(0, index).every((step) => completedSteps[step.id]);
  }

  function markStepComplete(stepId: StepId) {
    setCompletedSteps((previous) => ({
      ...previous,
      [stepId]: true,
    }));
  }

  function resetStepsFrom(stepId: StepId) {
    const startIndex = stepIndex(stepId);

    setCompletedSteps((previous) => {
      const next = { ...previous };

      WORKFLOW_STEPS.slice(startIndex).forEach((step) => {
        next[step.id] = false;
      });

      return next;
    });
  }

  function invalidateWorkflowAfterIntakeChange() {
    resetStepsFrom("safety");
    setSafetyStatus("idle");
    setScript("");
    setScriptCopied(false);
    setUploadedVideoName("");
    resetEditingFlow();
    setCoverFlowStep("gallery");
    setCoverPreviewStatus("idle");
  }

  function resetEditingFlow() {
    setEditingIndex(0);
    setEditingRunStatus("idle");
    setEditingBlockedMessage("");
    setSubtitleDraft("");
    setSubtitleRiskWords([]);
    setSimulateInspectionIssue(true);
  }

  function applyCoverTemplate(type: CoverTemplateType) {
    setCoverTemplateType(type);

    if (type === "videoDiary") {
      setCoverMainTitle(title || "今天的视频日记");
      setCoverSubtitle("记录今天的重要瞬间");
      setCoverSubtitleSecondary("把想法留在视频里");
      setCoverFooter("一天一条，持续更新");
      return;
    }

    if (type === "thought") {
      setCoverMainTitle("碎碎念");
      setCoverSubtitle("一个随手记下的小想法");
      setCoverSubtitleSecondary("");
      setCoverFooter("想到什么说什么");
      return;
    }

    setCoverMainTitle("书名待填写");
    setCoverSubtitle("一句话讲清这本书最值得看的点");
    setCoverSubtitleSecondary("");
    setCoverFooter("读书分享");
    setCoverDurationLabel(`本视频时长 ${formatDuration(durationSeconds)}`);
  }

  function saveCoverToGallery() {
    const coverId = `gallery_generated_${Date.now()}`;
    const nextItem: CoverGalleryItem = {
      id: coverId,
      label: `${coverTypeLabel(coverTemplateType)} ${coverGallery.filter((item) => item.source === "generated").length + 1}`,
      type: coverTemplateType,
      title: coverMainTitle,
      subtitle: coverSubtitle,
      subtitleSecondary: coverTemplateType === "videoDiary" ? coverSubtitleSecondary : undefined,
      footer: coverTemplateType === "thought" ? coverSubtitle : coverFooter,
      durationLabel: coverTemplateType === "book" ? coverDurationLabel : undefined,
      source: "generated",
      imagePath: frameOptions.find((item) => item.id === selectedFrameId)?.imagePath,
      note: "本次流程生成",
    };

    setCoverGallery((previous) => [nextItem, ...previous]);
    setSelectedCoverId(coverId);
  }

  function selectCoverItem(item: CoverGalleryItem) {
    setSelectedCoverId(item.id);
    setCoverPreviewStatus("idle");
    setCoverFlowStep("frame");
    setCoverGalleryOpen(false);
  }

  function generateScript() {
    const baseText = rawText.trim() || "今天我想记录一个关于创作流程的小观察。";

    setScript(
      [
        `标题：${title}`,
        "",
        "开头 2 秒：今天这条视频，我想讲一个我刚刚意识到的创作问题。",
        "",
        `正文：${baseText}`,
        "",
        "我以前会把录制当成最后一步，但现在发现，录制本身也是给 AI 留上下文。",
        "当我把想法、脚本、录制、字幕和封面都放进同一条管道里，每一步就能被检查，也能被复盘。",
        "",
        "结尾：所以今天的重点不是做得多完整，而是让这条流程可以每天稳定跑完。",
      ].join("\n"),
    );
    setCoverMainTitle(title || "今天的视频日记");
    saveGeneratedCoverDraft(title || "今天的视频日记");
  }

  function saveGeneratedCoverDraft(nextTitle: string) {
    const coverId = `gallery_generated_${Date.now()}`;
    const nextItem: CoverGalleryItem = {
      id: coverId,
      label: `脚本生成封面 ${coverGallery.filter((item) => item.source === "generated").length + 1}`,
      type: "videoDiary",
      title: nextTitle,
      subtitle: contentDate,
      subtitleSecondary: `Day ${String(coverGallery.filter((item) => item.source === "generated").length + 1).padStart(2, "0")}`,
      footer: "由脚本生成自动沉淀",
      source: "generated",
      imagePath: frameOptions[2].imagePath,
      note: "脚本生成自动沉淀",
    };

    setCoverGallery((previous) => [nextItem, ...previous]);
    setSelectedCoverId(coverId);
  }

  function completeSafetyAndContinue() {
    generateScript();
    markStepComplete("safety");
    setActiveIndex(stepIndex("scriptReview"));
  }

  function generateCoverPreview() {
    const runId = coverRunIdRef.current + 1;

    coverRunIdRef.current = runId;
    setCoverPreviewStatus("loading");
    window.setTimeout(() => {
      if (coverRunIdRef.current !== runId) {
        return;
      }

      saveCoverToGallery();
      setCoverPreviewStatus("ready");
      setCoverFlowStep("preview");
    }, 1800);
  }

  function startSafetyCheck() {
    const runId = safetyRunIdRef.current + 1;
    const matchedWords = riskWords;

    safetyRunIdRef.current = runId;
    setShowRevisionHint(false);
    markStepComplete("intake");
    setActiveIndex(stepIndex("safety"));
    setSafetyStatus("checking");
    window.setTimeout(() => {
      if (safetyRunIdRef.current === runId) {
        setDetectedRiskWords(matchedWords);
        setSafetyStatus("done");
      }
    }, 2600);
  }

  function handleRawTextChange(value: string) {
    setRawText(value);
    invalidateWorkflowAfterIntakeChange();
  }

  async function copyScript() {
    await navigator.clipboard.writeText(script);
    setScriptCopied(true);
  }

  function continueBlockedEditing() {
    setEditingBlockedMessage("");
    setEditingRunStatus("running");
    setEditingIndex((value) => value + 1);
  }

  function returnToScriptReviewWithSubtitle() {
    const nextScript = subtitleDraft.trim() || script;

    setScript(nextScript);
    setRawText(nextScript);
    setUploadedVideoName("");
    setCoverPreviewStatus("idle");
    setCoverFlowStep("gallery");
    resetStepsFrom("scriptReview");
    resetEditingFlow();
    setShowRevisionHint(false);
    setActiveIndex(stepIndex("scriptReview"));
  }

  return (
    <main className="min-h-screen bg-zinc-100 text-zinc-950">
      <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-none items-center justify-between gap-4 px-6 py-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500">
              <span>ClipFlow</span>
              <span>/</span>
              <span>创建新视频日记</span>
              <span>/</span>
              <span>{activeStep.title}</span>
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-3">
              <h1 className="text-lg font-semibold tracking-normal">视频日记创建管道</h1>
              <span className="text-sm text-zinc-600">
                Step {activeIndex + 1}/{WORKFLOW_STEPS.length}
              </span>
              <span className="rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-blue-200">
                demo_run_draft
              </span>
            </div>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
              <Link
                href="/runs/run_2026_06_30_day28"
                className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
              >
                查看 Day 28
              </Link>
              <button
                type="button"
                onClick={resetDemo}
                className="inline-flex items-center gap-1.5 rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
              >
                <RotateCcw className="size-4" />
                重置
              </button>
          </div>
        </div>
      </header>

      <div className={`grid w-full max-w-none gap-4 px-6 py-4 ${layoutColumnsClass}`}>
        <aside className="sticky top-[76px] h-[calc(100vh-96px)] rounded-lg border border-zinc-200 bg-white p-3">
          <SectionTitle icon={<Clock3 className="size-4" />} title="Pipeline" />
          <div className="mt-3 flex flex-col gap-2">
            {WORKFLOW_STEPS.map((step, index) => (
              <button
                key={step.id}
                type="button"
                onClick={() => {
                  if (debugStepJumpEnabled || canAccessStep(index)) {
                    setActiveIndex(index);
                  }
                }}
                className={`rounded-lg border p-2 text-left ${
                  index === activeIndex
                    ? "border-zinc-950 bg-zinc-950 text-white"
                    : index < activeIndex
                      ? "border-emerald-200 bg-emerald-50 text-emerald-950"
                      : canAccessStep(index)
                        ? "border-zinc-200 bg-white text-zinc-950"
                        : "border-zinc-200 bg-zinc-50 text-zinc-400"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs font-medium">{String(index + 1).padStart(2, "0")}</span>
                  <StepIcon done={index < activeIndex} active={index === activeIndex} />
                </div>
                <p className="mt-1 text-sm font-semibold">{step.title}</p>
              </button>
            ))}
          </div>
        </aside>

        <section className="rounded-lg border border-zinc-200 bg-white p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-normal text-zinc-500">{activeStep.owner}</p>
              <h2 className="mt-1 text-xl font-semibold">{activeStep.title}</h2>
              <p className="mt-1 text-sm text-zinc-600">{activeStep.description}</p>
            </div>
            <span className={statusBadge(activeIndex, WORKFLOW_STEPS.length)}>{stepStatusLabel(activeIndex)}</span>
          </div>

          <div className="mt-5">{renderStepBody()}</div>
        </section>

        <aside className="self-stretch">
          <div className="sticky top-[76px] h-full">
            <button
              type="button"
              onClick={() => setIsRunPanelOpen((value) => !value)}
              className="mb-3 flex w-full items-center justify-center rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700"
            >
              {isRunPanelOpen ? "收起状态" : "展开"}
            </button>
            {isRunPanelOpen ? (
              <div className="flex flex-col gap-4">
                <Panel title="Run State" icon={<ShieldCheck className="size-4" />}>
                  <dl className="space-y-3 text-sm">
                    <MetaRow label="内容日期" value={contentDate} />
                    <MetaRow label="脚本检测" value={safetySummary} />
                    <MetaRow label="脚本状态" value={script ? "已生成 / 改稿中" : "待生成"} />
                    <MetaRow label="录制文件" value={uploadedVideoName || "待上传"} />
                    <MetaRow label="剪辑进度" value={`${Math.min(editingIndex, EDITING_TASKS.length)}/${EDITING_TASKS.length}`} />
                    <MetaRow label="剪辑状态" value={editingStatusLabel(editingRunStatus)} />
                  </dl>
                </Panel>

                <Panel title="Artifacts" icon={<FileText className="size-4" />}>
                  <div className="space-y-3">
                    <ArtifactRow title="脚本" path={`02_scripts/${contentDate}.md`} done={Boolean(script)} />
                    <ArtifactRow
                      title="录制"
                      path={uploadedVideoName ? `03_recordings/${contentDate}/${uploadedVideoName}` : `03_recordings/${contentDate}/`}
                      done={Boolean(uploadedVideoName)}
                    />
                    <ArtifactRow title="封面" path={finalCoverPath} done={activeIndex > stepIndex("cover")} />
                    <ArtifactRow title="成片" path={finalVideoPath} done={activeIndex === WORKFLOW_STEPS.length - 1} />
                    <ArtifactRow title="日志" path={`06_logs/${contentDate}.md`} done={activeIndex === WORKFLOW_STEPS.length - 1} />
                  </div>
                </Panel>

                <Panel title="Archive" icon={<Archive className="size-4" />}>
                  <dl className="space-y-3 text-sm">
                    <MetaRow label="视频时长" value={formatDuration(durationSeconds)} />
                    <MetaRow label="制作时长" value={`${productionMinutes} 分钟`} />
                    <MetaRow label="保存位置" value={exportFolder} />
                  </dl>
                </Panel>
              </div>
            ) : (
              <div className="flex h-full min-h-[320px] flex-col items-center rounded-lg border border-zinc-200 bg-white p-3">
                <ShieldCheck className="size-4 text-zinc-500" />
                <div className="mt-4 h-full w-2 rounded-full bg-zinc-100">
                  <div className="w-2 rounded-full bg-zinc-950" style={{ height: `${progressPercent}%` }} />
                </div>
                <span className="mt-3 text-xs font-medium text-zinc-600">{progressPercent}%</span>
              </div>
            )}
          </div>
        </aside>
      </div>
    </main>
  );

  function renderStepBody() {
    switch (activeStep.id) {
      case "intake":
        return (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-[180px_minmax(0,1fr)]">
              <Field label="内容日期">
                <input
                  type="date"
                  value={contentDate}
                  onChange={(event) => setContentDate(event.target.value)}
                  className="input"
                />
              </Field>
              <Field label="视频标题">
                <input value={title} onChange={(event) => setTitle(event.target.value)} className="input" />
              </Field>
            </div>
            <Field label="文本内容">
              <textarea
                value={rawText}
                onChange={(event) => handleRawTextChange(event.target.value)}
                rows={10}
                className="input min-h-[240px] resize-y"
                placeholder="粘贴当天想法、口述稿、视频主题，或直接写一段粗糙文本。"
              />
            </Field>
            {showRevisionHint && (
              <RevisionRiskPreview value={rawText} detectedWords={detectedRiskWords} words={remainingDetectedRiskWords} />
            )}
            <ActionBar>
              {showRevisionHint ? (
                <button type="button" onClick={startSafetyCheck} disabled={!rawText.trim()} className="primaryButton">
                  重新进入脚本检测
                  <ChevronRight className="size-4" />
                </button>
              ) : (
                <button type="button" onClick={startSafetyCheck} disabled={!rawText.trim()} className="primaryButton">
                  进入脚本检测
                  <ChevronRight className="size-4" />
                </button>
              )}
            </ActionBar>
          </div>
        );
      case "safety":
        return (
          <div className="space-y-4">
            <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
              <h3 className="text-sm font-semibold">检测结果</h3>
              {safetyStatus === "checking" ? (
                <div className="mt-3 flex items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-900">
                  <span className="size-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-700" />
                  正在查询本地敏感词库和平台规则...
                </div>
              ) : safetyStatus === "done" && detectedRiskWords.length ? (
                <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                  命中：{detectedRiskWords.join(" / ")}。建议在脚本生成后改成个人经历表达，避免像广告或承诺。
                </div>
              ) : safetyStatus === "done" ? (
                <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
                  未命中当前演示敏感词。
                </div>
              ) : (
                <div className="mt-3 rounded-lg border border-zinc-200 bg-white p-3 text-sm text-zinc-600">
                  等待检测。演示版会模拟 Agent 查询后再返回标注结果。
                </div>
              )}
            </div>
            <HighlightedPreview
              title="待处理文本"
              value={rawText}
              words={safetyStatus === "done" ? detectedRiskWords : []}
            />
            <ActionBar>
              {safetyStatus === "done" && detectedRiskWords.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    invalidateWorkflowAfterIntakeChange();
                    setShowRevisionHint(true);
                    setActiveIndex(stepIndex("intake"));
                  }}
                  className="secondaryButton"
                >
                  退回修改
                </button>
              )}
              {safetyStatus !== "checking" && (
                <button type="button" onClick={startSafetyCheck} className="secondaryButton">
                  重新检测
                </button>
              )}
              <button
                type="button"
                onClick={completeSafetyAndContinue}
                disabled={safetyStatus !== "done"}
                className="primaryButton"
              >
                进入人工改稿
                <ChevronRight className="size-4" />
              </button>
            </ActionBar>
          </div>
        );
      case "scriptReview":
        return (
          <div className="space-y-4">
            <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
              <h3 className="text-sm font-semibold">脚本已根据检测结果生成</h3>
              <p className="mt-2 text-sm text-zinc-600">这里直接进入人工改稿，不再单独保留“生成脚本”按钮步骤。</p>
            </div>
            <Field label="人工修改脚本">
              <textarea
                value={script}
                onChange={(event) => setScript(event.target.value)}
                rows={15}
                className="input min-h-[360px] resize-y font-mono text-xs leading-6"
              />
            </Field>
            <ActionBar>
              <button type="button" onClick={copyScript} disabled={!script.trim()} className="secondaryButton">
                {scriptCopied ? "已复制" : "复制脚本"}
              </button>
              <button
                type="button"
                onClick={() => {
                  markStepComplete("scriptReview");
                  moveNext();
                }}
                disabled={!script.trim()}
                className="primaryButton"
              >
                确认脚本并上传视频
                <ChevronRight className="size-4" />
              </button>
            </ActionBar>
          </div>
        );
      case "videoUpload":
        return (
          <div className="space-y-4">
            <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
              <h3 className="text-sm font-semibold">录制文件</h3>
              <p className="mt-2 text-sm text-zinc-600">
                Demo 版只登记文件名，不会上传或复制本地文件。后续这里可以接 Video Agent 的导入动作。
              </p>
              <div className="mt-4 grid gap-4 md:grid-cols-[minmax(0,1fr)_220px]">
                <Field label="选择视频">
                  <input
                    type="file"
                    accept="video/*"
                    onChange={(event) => {
                      const file = event.target.files?.[0];

                      if (!file) {
                        return;
                      }

                      setUploadedVideoName(file.name);
                      setFileSizeMb(Math.max(1, Math.round(file.size / 1024 / 1024)));
                    }}
                    className="input"
                  />
                </Field>
                <Field label="视频文件名">
                  <input
                    value={uploadedVideoName}
                    onChange={(event) => setUploadedVideoName(event.target.value)}
                    className="input"
                    placeholder="Detail_20260703.MP4"
                  />
                </Field>
              </div>
            </div>
            <ActionBar>
              <button
                type="button"
                onClick={() => {
                  markStepComplete("videoUpload");
                  moveNext();
                }}
                disabled={!uploadedVideoName.trim()}
                className="primaryButton"
              >
                确认视频并生成封面
                <Upload className="size-4" />
              </button>
            </ActionBar>
          </div>
        );
      case "cover":
        return (
          <div className="space-y-4">
            <div className="grid gap-4 xl:grid-cols-[minmax(0,420px)_minmax(360px,1fr)]">
              <div className="rounded-lg border border-zinc-200 bg-white p-4">
                <FlowSteps current={coverFlowStep} onChange={setCoverFlowStep} />
                <div className="mt-4 min-h-[560px]">
                  {coverFlowStep === "gallery" && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <h3 className="text-sm font-semibold">01 选择封面模板</h3>
                          <p className="mt-1 text-xs text-zinc-500">这里选的是版式和规则，不是主图本身。</p>
                        </div>
                        <button type="button" onClick={() => setCoverGalleryOpen(true)} className="secondaryButton">
                          <FileText className="size-4" />
                          更多
                        </button>
                      </div>
                      <div className="grid gap-3">
                        {coverGallery.slice(0, 4).map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => selectCoverItem(item)}
                            className={`flex items-center gap-3 rounded-lg border p-3 text-left ${
                              selectedCoverId === item.id ? "border-zinc-950 bg-zinc-50 ring-2 ring-zinc-950/10" : "border-zinc-200"
                            }`}
                          >
                            <div className="h-20 w-16 shrink-0 overflow-hidden rounded-md bg-zinc-950">
                              {item.imagePath ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={item.imagePath} alt={item.label} className="h-full w-full object-cover" />
                              ) : (
                                <div className="h-full p-2 text-white">
                                  <CoverCard item={item} contentDate={contentDate} compact />
                                </div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold">{item.label}</p>
                              <p className="mt-1 text-xs text-zinc-500">{item.note ?? item.source}</p>
                              <p className="mt-1 text-xs text-zinc-400">模板类型：{coverTypeLabel(item.type)}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                      <ActionBar>
                        <button type="button" onClick={() => setCoverFlowStep("frame")} className="primaryButton">
                          选择主图
                          <ChevronRight className="size-4" />
                        </button>
                      </ActionBar>
                    </div>
                  )}

                  {coverFlowStep === "frame" && (
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-semibold">02 选择主图</h3>
                        <p className="mt-1 text-xs text-zinc-500">主图来自上传视频后的九张正面候选图，和模板选择独立。</p>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        {frameOptions.map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => {
                              setSelectedFrameId(item.id);
                              setCoverPreviewStatus("idle");
                            }}
                            className={`rounded-lg border p-2 text-left ${
                              selectedFrameId === item.id ? "border-zinc-950 ring-2 ring-zinc-950/10" : "border-zinc-200"
                            }`}
                          >
                            <div className="aspect-square overflow-hidden rounded-md bg-zinc-200">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={item.imagePath} alt={item.label} className="h-full w-full object-cover" />
                            </div>
                            <p className="mt-2 truncate text-xs font-medium text-zinc-700">{item.label}</p>
                          </button>
                        ))}
                      </div>
                      <div className="rounded-lg border border-dashed border-zinc-300 bg-zinc-50 p-4">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-medium text-zinc-900">手动上传主图</p>
                            <p className="mt-1 text-xs text-zinc-500">如果九张候选都不合适，可以补一张封面主图。</p>
                          </div>
                          <label className="secondaryButton cursor-pointer">
                            <Upload className="size-4" />
                            上传主图
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(event) => {
                                const file = event.target.files?.[0];

                                if (!file) {
                                  return;
                                }

                                setManualFrameName(file.name);
                                setSelectedFrameId("manual_upload");
                                setCoverPreviewStatus("idle");
                              }}
                            />
                          </label>
                        </div>
                        {manualFrameName ? (
                          <div className="mt-3 rounded-lg border border-zinc-200 bg-white p-3 text-sm text-zinc-700">
                            当前手动主图：{manualFrameName}
                          </div>
                        ) : null}
                      </div>
                      <ActionBar>
                        <button type="button" onClick={() => setCoverFlowStep("content")} className="primaryButton">
                          填写文案
                          <ChevronRight className="size-4" />
                        </button>
                      </ActionBar>
                    </div>
                  )}

                  {coverFlowStep === "content" && (
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-semibold">03 视频类型与文案</h3>
                        <p className="mt-1 text-xs text-zinc-500">这里整理标题文案，视频类型决定需要填写哪些字段。</p>
                      </div>
                      <div className="grid gap-2 sm:grid-cols-3">
                        {[
                          { id: "videoDiary", label: "视频日记" },
                          { id: "thought", label: "碎碎念" },
                          { id: "book", label: "读书分享" },
                        ].map((option) => (
                          <button
                            key={option.id}
                            type="button"
                            onClick={() => {
                              applyCoverTemplate(option.id as CoverTemplateType);
                              setCoverPreviewStatus("idle");
                            }}
                            className={`rounded-lg border p-3 text-left ${
                              coverTemplateType === option.id ? "border-zinc-950 bg-zinc-950 text-white" : "border-zinc-200 bg-white"
                            }`}
                          >
                            <p className="text-sm font-semibold">{option.label}</p>
                          </button>
                        ))}
                      </div>
                      <Field label={coverTemplateType === "book" ? "书名" : "主标题"}>
                        <input
                          value={coverMainTitle}
                          onChange={(event) => {
                            setCoverMainTitle(event.target.value);
                            setCoverPreviewStatus("idle");
                          }}
                          className="input"
                        />
                      </Field>
                      <Field label={coverTemplateType === "book" ? "分享描述" : "副标题"}>
                        <input
                          value={coverSubtitle}
                          onChange={(event) => {
                            setCoverSubtitle(event.target.value);
                            setCoverPreviewStatus("idle");
                          }}
                          className="input"
                        />
                      </Field>
                      {coverTemplateType === "videoDiary" && (
                        <div className="grid gap-4 sm:grid-cols-2">
                          <Field label="副标题 2">
                            <input
                              value={coverSubtitleSecondary}
                              onChange={(event) => {
                                setCoverSubtitleSecondary(event.target.value);
                                setCoverPreviewStatus("idle");
                              }}
                              className="input"
                            />
                          </Field>
                          <Field label="底部描述">
                            <input
                              value={coverFooter}
                              onChange={(event) => {
                                setCoverFooter(event.target.value);
                                setCoverPreviewStatus("idle");
                              }}
                              className="input"
                            />
                          </Field>
                        </div>
                      )}
                      {coverTemplateType === "book" && (
                        <Field label="视频时长文案">
                          <input
                            value={coverDurationLabel}
                            onChange={(event) => {
                              setCoverDurationLabel(event.target.value);
                              setCoverPreviewStatus("idle");
                            }}
                            className="input"
                          />
                        </Field>
                      )}
                      <ActionBar>
                        <button type="button" onClick={generateCoverPreview} disabled={!coverMainTitle.trim()} className="primaryButton">
                          生成封面预览
                          <ImageIcon className="size-4" />
                        </button>
                      </ActionBar>
                    </div>
                  )}

                  {coverFlowStep === "preview" && (
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-semibold">04 确认封面</h3>
                        <p className="mt-1 text-xs text-zinc-500">确认后进入制作参数。</p>
                      </div>
                      <SummaryBox label="模板" value={selectedStyle.label} />
                      <SummaryBox label="主图" value={selectedFrameLabel} />
                      <SummaryBox label="类型" value={coverTypeLabel(coverTemplateType)} />
                      <ActionBar>
                        <button
                          type="button"
                          onClick={() => {
                            markStepComplete("cover");
                            moveNext();
                          }}
                          disabled={coverPreviewStatus !== "ready"}
                          className="primaryButton"
                        >
                          确认封面
                          <ImageIcon className="size-4" />
                        </button>
                      </ActionBar>
                    </div>
                  )}
                </div>
              </div>

              <div className="sticky top-[92px] rounded-lg border border-zinc-200 bg-zinc-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-sm font-semibold">封面预览</h3>
                  <span className="rounded-md bg-zinc-100 px-2 py-1 text-xs text-zinc-600">
                    {coverPreviewStatus === "loading" ? "生成中" : coverPreviewStatus === "ready" ? "已生成" : "待生成"}
                  </span>
                </div>
                <div className="mt-4 aspect-[3/4] max-h-[68vh] overflow-hidden rounded-lg border border-zinc-200 bg-zinc-950">
                  {coverPreviewStatus === "loading" ? (
                    <div className="flex h-full flex-col items-center justify-center gap-3 text-white">
                      <span className="size-6 animate-spin rounded-full border-2 border-zinc-500 border-t-white" />
                      <p className="text-sm text-zinc-300">正在根据主图、模板和文案生成封面预览...</p>
                    </div>
                  ) : coverPreviewStatus === "idle" ? (
                    <div className="flex h-full flex-col items-center justify-center gap-3 text-white">
                      <ImageIcon className="size-8 text-zinc-500" />
                      <p className="text-sm text-zinc-300">先选模板、主图和文案，再生成预览</p>
                    </div>
                  ) : (
                    <div className="relative h-full">
                      {selectedFrameId === "manual_upload" ? (
                        <div className="absolute inset-0 flex items-center justify-center bg-zinc-900 text-center text-white">
                          <div>
                            <Upload className="mx-auto size-8 text-zinc-400" />
                            <p className="mt-3 text-sm text-zinc-300">{manualFrameName || "手动上传主图"}</p>
                          </div>
                        </div>
                      ) : (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={selectedFrame.imagePath} alt={selectedFrame.label} className="absolute inset-0 h-full w-full object-cover opacity-70" />
                      )}
                      <div className="absolute inset-0 bg-black/45 p-4 text-white">
                        <CoverCard item={currentCoverPreview} contentDate={contentDate} />
                      </div>
                    </div>
                  )}
                </div>
                <div className="mt-4 rounded-lg border border-zinc-200 bg-white p-3 text-sm text-zinc-600">
                  当前模板：{selectedStyle.label} · 当前主图：{selectedFrameLabel}
                </div>
              </div>
            </div>

            {coverGalleryOpen && (
              <GalleryDialog onClose={() => setCoverGalleryOpen(false)}>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-base font-semibold">封面画廊</h3>
                    <p className="mt-1 text-sm text-zinc-500">这里直接复用了 `06_video-diary/15_cover_gallery` 的真实素材，作为模板参考库。</p>
                  </div>
                  <button type="button" onClick={() => setCoverGalleryOpen(false)} className="secondaryButton">
                    关闭
                  </button>
                </div>
                <div className="mt-4 grid gap-3 md:grid-cols-3">
                  {coverGallery.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => selectCoverItem(item)}
                      className={`rounded-lg border p-3 text-left ${
                        selectedCoverId === item.id ? "border-zinc-950 ring-2 ring-zinc-950/10" : "border-zinc-200"
                      }`}
                    >
                      <div className="aspect-[3/4] overflow-hidden rounded-md bg-zinc-950">
                        {item.imagePath ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={item.imagePath} alt={item.label} className="h-full w-full object-cover" />
                        ) : (
                          <div className="h-full p-3 text-white" aria-label={item.label}>
                            <CoverCard item={item} contentDate={contentDate} />
                          </div>
                        )}
                      </div>
                      <p className="mt-3 text-sm font-semibold">{item.label}</p>
                      <p className="mt-1 text-xs text-zinc-500">{item.note ?? item.source}</p>
                      <p className="mt-1 text-xs text-zinc-400">模板类型：{coverTypeLabel(item.type)}</p>
                    </button>
                  ))}
                </div>
              </GalleryDialog>
            )}
          </div>
        );
      case "videoSetup":
        return (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="视频长度（秒）">
                <input
                  type="number"
                  min="0"
                  value={durationSeconds}
                  onChange={(event) => setDurationSeconds(Number(event.target.value))}
                  className="input"
                  placeholder="后续根据视频时长自动填入"
                />
              </Field>
              <Field label="文件容量（MB）">
                <input
                  type="number"
                  min="0"
                  value={fileSizeMb}
                  onChange={(event) => setFileSizeMb(Number(event.target.value))}
                  className="input"
                  placeholder="后续根据视频容量自动填入"
                />
              </Field>
              <Field label="去掉片头（秒）">
                <input
                  type="number"
                  min="0"
                  value={trimStartSeconds}
                  onChange={(event) => setTrimStartSeconds(Number(event.target.value))}
                  className="input"
                />
              </Field>
              <Field label="去掉片尾（秒）">
                <input
                  type="number"
                  min="0"
                  value={trimEndSeconds}
                  onChange={(event) => setTrimEndSeconds(Number(event.target.value))}
                  className="input"
                />
              </Field>
            </div>
            <ActionBar>
              <button
                type="button"
                onClick={() => {
                  markStepComplete("videoSetup");
                  setEditingRunStatus("running");
                  moveNext();
                }}
                className="primaryButton"
              >
                开始剪辑
                <Scissors className="size-4" />
              </button>
            </ActionBar>
          </div>
        );
      case "editing":
        return (
          <div className="space-y-4">
            <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
              <h3 className="text-sm font-semibold">剪辑任务</h3>
              <p className="mt-2 text-sm text-zinc-600">这一段按 Agent 自动流转模拟，每一步先 Loading，再进入下一步。</p>
              <div className="mt-4 space-y-3">
                {EDITING_TASKS.map((task, index) => (
                  <div key={task.id} className="flex items-center justify-between rounded-lg border border-zinc-200 bg-white p-3">
                    <div className="flex items-center gap-2">
                      {index < editingIndex ? (
                        <CheckCircle2 className="size-4 text-emerald-600" />
                      ) : editingRunStatus === "running" && index === editingIndex ? (
                        <span className="size-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-700" />
                      ) : editingRunStatus === "blocked" && index === editingIndex ? (
                        <span className="size-4 rounded-full border-2 border-amber-400 bg-amber-100" />
                      ) : (
                        <Circle className="size-4 text-zinc-400" />
                      )}
                      <div>
                        <span className="text-sm font-medium">{task.label}</span>
                        <p className="text-xs text-zinc-500">{task.detail}</p>
                      </div>
                    </div>
                    <span className="text-xs text-zinc-500">{editingTaskStateLabel(index, editingIndex, editingRunStatus)}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_280px]">
              <div className="rounded-lg border border-zinc-200 bg-white p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 className="text-sm font-semibold">生成字幕</h3>
                  <span className="rounded-md bg-zinc-100 px-2 py-1 text-xs text-zinc-600">
                    {subtitleRiskWords.length ? `命中 ${subtitleRiskWords.join(" / ")}` : "未命中风险词"}
                  </span>
                </div>
                <p className="mt-3 whitespace-pre-wrap rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-sm leading-6 text-zinc-700">
                  {subtitleDraft || "等待字幕生成..."}
                </p>
              </div>
              <div className="space-y-4">
                <div className="rounded-lg border border-zinc-200 bg-white p-4">
                  <h3 className="text-sm font-semibold">检视模拟</h3>
                  <p className="mt-2 text-sm text-zinc-600">默认模拟口播扩展带来一次风险，方便演示人工确认分支。</p>
                  <label className="mt-3 flex items-center gap-2 text-sm text-zinc-700">
                    <input
                      type="checkbox"
                      checked={simulateInspectionIssue}
                      onChange={(event) => setSimulateInspectionIssue(event.target.checked)}
                    />
                    首次脚本检视命中风险
                  </label>
                </div>
                {editingRunStatus === "blocked" ? (
                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                    <h3 className="text-sm font-semibold text-amber-900">脚本检视需要人工确认</h3>
                    <p className="mt-2 text-sm text-amber-900">{editingBlockedMessage}</p>
                    <p className="mt-2 text-sm text-amber-800">返回时会把字幕稿贴回人工改稿，后续重新走上传视频、封面和剪辑流程。</p>
                    <ActionBar>
                      <button type="button" onClick={returnToScriptReviewWithSubtitle} className="secondaryButton whitespace-nowrap">
                        返回人工改稿
                      </button>
                      <button type="button" onClick={continueBlockedEditing} className="primaryButton whitespace-nowrap">
                        人工确认继续
                        <ChevronRight className="size-4" />
                      </button>
                    </ActionBar>
                  </div>
                ) : null}
                {editingRunStatus === "done" ? (
                  <ActionBar>
                    <button
                      type="button"
                      onClick={() => {
                        moveNext();
                      }}
                      className="primaryButton"
                    >
                      导出并归档
                      <Video className="size-4" />
                    </button>
                  </ActionBar>
                ) : null}
              </div>
            </div>
          </div>
        );
      case "archive":
        return (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="制作时长（分钟）">
                <input
                  type="number"
                  min="1"
                  value={productionMinutes}
                  onChange={(event) => setProductionMinutes(Number(event.target.value))}
                  className="input"
                />
              </Field>
              <Field label="导出目录">
                <input value={exportFolder} readOnly className="input bg-zinc-50" />
              </Field>
            </div>
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
              工作流完成：脚本、封面、成片和日志已进入演示归档状态。
            </div>
            <div className="grid gap-3 text-sm md:grid-cols-2">
              <SummaryBox label="视频时长" value={formatDuration(durationSeconds)} />
              <SummaryBox label="文件容量" value={`${fileSizeMb} MB`} />
              <SummaryBox label="成片路径" value={finalVideoPath} />
              <SummaryBox label="封面路径" value={finalCoverPath} />
            </div>
          </div>
        );
    }
  }
}

function SectionTitle({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2 text-sm font-semibold">
      {icon}
      <span>{title}</span>
    </div>
  );
}

function StepIcon({ done, active }: { done: boolean; active: boolean }) {
  if (done) {
    return <CheckCircle2 className="size-4" />;
  }

  if (active) {
    return <Clock3 className="size-4" />;
  }

  return <Circle className="size-4" />;
}

function Panel({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-4">
      <SectionTitle icon={icon} title={title} />
      <div className="mt-4">{children}</div>
    </section>
  );
}

function FlowSteps({ current, onChange }: { current: CoverFlowStep; onChange: (step: CoverFlowStep) => void }) {
  const steps: { id: CoverFlowStep; label: string }[] = [
    { id: "gallery", label: "风格" },
    { id: "frame", label: "主图" },
    { id: "content", label: "文案" },
    { id: "preview", label: "预览" },
  ];

  return (
    <div className="grid grid-cols-4 gap-2">
      {steps.map((step) => (
        <button
          key={step.id}
          type="button"
          onClick={() => onChange(step.id)}
          className={`rounded-lg border px-3 py-2 text-center text-xs font-medium ${
            current === step.id ? "border-zinc-950 bg-zinc-950 text-white" : "border-zinc-200 bg-zinc-50 text-zinc-600"
          }`}
        >
          {step.label}
        </button>
      ))}
    </div>
  );
}

function GalleryDialog({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={onClose}>
      <div className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-lg bg-white p-5 shadow-2xl" onClick={(event) => event.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-zinc-700">{label}</span>
      {children}
    </label>
  );
}

function ActionBar({ children }: { children: React.ReactNode }) {
  return <div className="flex justify-end gap-2 border-t border-zinc-200 pt-4">{children}</div>;
}

function RevisionRiskPreview({
  value,
  detectedWords,
  words,
}: {
  value: string;
  detectedWords: string[];
  words: string[];
}) {
  if (!value.trim()) {
    return null;
  }

  return (
    <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold">本次检测命中</h3>
          <p className="mt-1 text-xs text-zinc-500">
            原始命中：{detectedWords.join(" / ")}。你可以直接继续，也可以修改后重新检测。
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {words.length ? (
            words.map((word) => (
              <span
                key={word}
                className="rounded-md bg-amber-100 px-2 py-1 text-xs font-medium text-amber-900 ring-1 ring-amber-200"
              >
                {word}
              </span>
            ))
          ) : (
            <span className="rounded-md bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 ring-1 ring-emerald-200">
              当前已无命中
            </span>
          )}
        </div>
      </div>
      <div className="mt-3">
        <HighlightedPreview title="当前文本预览" value={value} words={words} />
      </div>
    </div>
  );
}

function HighlightedPreview({ title, value, words }: { title: string; value: string; words: string[] }) {
  const parts = splitByWords(value, words);

  return (
    <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
      <h3 className="text-sm font-semibold">{title}</h3>
      <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-zinc-700">
        {parts.length
          ? parts.map((part, index) =>
              part.hit ? (
                <mark key={`${part.text}-${index}`} className="rounded bg-amber-200 px-1 text-amber-950">
                  {part.text}
                </mark>
              ) : (
                <span key={`${part.text}-${index}`}>{part.text}</span>
              ),
            )
          : "暂无内容"}
      </p>
    </div>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="text-zinc-500">{label}</dt>
      <dd className="break-all text-right font-medium text-zinc-900">{value}</dd>
    </div>
  );
}

function ArtifactRow({ title, path, done }: { title: string; path: string; done: boolean }) {
  return (
    <div className="rounded-lg border border-zinc-200 p-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold">{title}</p>
        <span
          className={`rounded-md px-2 py-1 text-xs font-medium ${
            done ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200" : "bg-zinc-100 text-zinc-600"
          }`}
        >
          {done ? "ready" : "pending"}
        </span>
      </div>
      <p className="mt-2 break-all font-mono text-xs leading-5 text-zinc-600">{path}</p>
    </div>
  );
}

function SummaryBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-zinc-200 p-3">
      <p className="text-xs text-zinc-500">{label}</p>
      <p className="mt-2 break-all text-sm font-semibold text-zinc-950">{value}</p>
    </div>
  );
}

function CoverCard({ item, contentDate, compact = false }: { item: CoverGalleryItem; contentDate: string; compact?: boolean }) {
  const titleClass = compact ? "text-lg font-semibold leading-tight" : "text-3xl font-semibold leading-tight";
  const thoughtTitleClass = compact ? "text-2xl font-semibold leading-tight" : "text-4xl font-semibold leading-tight";

  if (item.type === "videoDiary") {
    return (
      <div className="flex h-full flex-col justify-between">
        <div className="flex items-start justify-between gap-3 text-xs text-zinc-300">
          <span>视频日记</span>
          <span>
            {contentDate}
            <br />
            {item.durationLabel ?? "持续更新"}
          </span>
        </div>
        <div>
          <div className={titleClass}>{item.title}</div>
          <div className="mt-4 text-sm text-zinc-200">{item.subtitle}</div>
          <div className="mt-1 text-sm text-zinc-400">{item.subtitleSecondary}</div>
        </div>
        <div className="text-sm text-white">{item.footer}</div>
      </div>
    );
  }

  if (item.type === "thought") {
    return (
      <div className="flex h-full flex-col justify-center text-center">
        <div className={thoughtTitleClass}>{item.title}</div>
        <div className="mt-4 text-sm text-zinc-300">{item.subtitle}</div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col justify-between">
      <div className="text-xs text-zinc-300">{item.durationLabel}</div>
      <div>
        <div className={titleClass}>{item.title}</div>
        <div className="mt-4 text-sm text-zinc-300">{item.subtitle}</div>
      </div>
      <div className="text-sm text-white">读书分享</div>
    </div>
  );
}

function stepIndex(id: StepId) {
  return WORKFLOW_STEPS.findIndex((step) => step.id === id);
}

function coverTypeLabel(type: CoverTemplateType) {
  if (type === "videoDiary") {
    return "视频日记";
  }

  if (type === "thought") {
    return "碎碎念";
  }

  return "读书分享";
}

function editingStatusLabel(status: EditingRunStatus) {
  if (status === "running") {
    return "自动执行中";
  }

  if (status === "blocked") {
    return "待人工确认";
  }

  if (status === "done") {
    return "已完成";
  }

  return "待开始";
}

function editingTaskStateLabel(index: number, editingIndex: number, editingRunStatus: EditingRunStatus) {
  if (index < editingIndex) {
    return "done";
  }

  if (index === editingIndex && editingRunStatus === "running") {
    return "running";
  }

  if (index === editingIndex && editingRunStatus === "blocked") {
    return "blocked";
  }

  if (editingRunStatus === "done" && index === editingIndex) {
    return "done";
  }

  return "pending";
}

function statusBadge(activeIndex: number, total: number) {
  const done = activeIndex === total - 1;

  return `rounded-md px-2 py-1 text-xs font-medium ring-1 ${
    done ? "bg-emerald-50 text-emerald-700 ring-emerald-200" : "bg-blue-50 text-blue-700 ring-blue-200"
  }`;
}

function stepStatusLabel(activeIndex: number) {
  return activeIndex === WORKFLOW_STEPS.length - 1 ? "completed" : "in_progress";
}

function formatDuration(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.max(0, Math.round(seconds % 60))
    .toString()
    .padStart(2, "0");

  return `${minutes}:${remainingSeconds}`;
}

function splitByWords(value: string, words: string[]) {
  if (!value || words.length === 0) {
    return value ? [{ text: value, hit: false }] : [];
  }

  const pattern = new RegExp(`(${words.map(escapeRegExp).join("|")})`, "gi");

  return value.split(pattern).map((text) => ({
    text,
    hit: words.some((word) => word.toLowerCase() === text.toLowerCase()),
  }));
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function findRiskWords(value: string) {
  return RISK_WORDS.filter((word) => value.toLowerCase().includes(word.toLowerCase()));
}

function buildSubtitleDraft(script: string, includeExtraRisk: boolean) {
  const normalizedScript = script.trim() || "今天我想记录一个关于创作流程的小观察。";

  if (!includeExtraRisk) {
    return normalizedScript;
  }

  return `${normalizedScript}\n\n口播扩展：我今天特别想推荐大家去下载这个 APP 试试看。`;
}
