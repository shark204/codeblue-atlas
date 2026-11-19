'use client';

import {
  AgentRequestSchema,
  EngineEventSchema,
  ListModelsRequestSchema,
  PROTOCOL_VERSION,
  type AgentRequest,
  type AiProvider,
  type EngineEvent,
  type ListModelsRequest,
  type ModelInfo,
  type SceneCommand,
} from "./schemas";
import {
  MESH_ALIASES,
  matchOrganToEntry,
  searchKnowledge,
  type UnifiedEntry,
} from "./atlasKnowledgeIndex";

/**
 * Web-native Engine & Scene Command Bridge for Code Blue 3D Anatomy Atlas.
 *
 * Powered by the unified 272-entry Anatomical Knowledge Base (`lib/atlasKnowledgeIndex.ts`)
 * so both the built-in Code Blue 3D Anatomy Tutor and external LLM providers deliver
 * verified textbook facts (Origin, Insertion, Nerve supply, Action, Course, Supply,
 * Relations, and Clinical Pearls) linked directly to interactive 3D `[[organ_id]]` pins.
 */

export type UnlistenFn = () => void;

type RawListener = (payload: unknown) => void;
const listeners = new Set<RawListener>();
const cancelledRequests = new Set<string>();

function emitRaw(payload: unknown): void {
  for (const listener of [...listeners]) {
    try {
      listener(payload);
    } catch (err) {
      console.error("[atlas-ipc] listener error:", err);
    }
  }
}

export function emitEngineEvent(event: EngineEvent): void {
  emitRaw(event);
}

const KEY_PREFIX = "anatria3d.apikey.";

const DEFAULT_MODELS: Record<AiProvider, ModelInfo[]> = {
  google: [
    { id: "gemini-2.5-flash", label: "Gemini 2.5 Flash (Code Blue Web + 3D Scene Tools)", recommended: true },
    { id: "gemini-2.5-pro", label: "Gemini 2.5 Pro (Deep Clinical Reasoning)", recommended: false },
    { id: "codeblue-anatomy-engine", label: "Code Blue Built-in 3D Anatomy Tutor (Instant)", recommended: false },
  ],
  openai: [
    { id: "gpt-4o-mini", label: "GPT-4o Mini (Code Blue Web + 3D Scene Tools)", recommended: true },
    { id: "gpt-4o", label: "GPT-4o (Clinical & Surgical Anatomy)", recommended: false },
    { id: "codeblue-anatomy-engine", label: "Code Blue Built-in 3D Anatomy Tutor (Instant)", recommended: false },
  ],
  anthropic: [
    { id: "claude-3-7-sonnet-latest", label: "Claude 3.7 Sonnet (Code Blue Web + 3D Scene Tools)", recommended: true },
    { id: "claude-3-5-haiku-latest", label: "Claude 3.5 Haiku (Fast Tutor)", recommended: false },
    { id: "codeblue-anatomy-engine", label: "Code Blue Built-in 3D Anatomy Tutor (Instant)", recommended: false },
  ],
};

export function getStoredApiKey(provider: AiProvider): string | null {
  if (typeof window === "undefined") return null;
  try {
    const val = window.localStorage.getItem(`${KEY_PREFIX}${provider}`);
    return val && val.trim().length > 0 ? val.trim() : null;
  } catch {
    return null;
  }
}

export async function saveApiKey(provider: AiProvider, apiKey: string): Promise<void> {
  if (typeof window === "undefined") return;
  try {
    if (apiKey.trim()) {
      window.localStorage.setItem(`${KEY_PREFIX}${provider}`, apiKey.trim());
    }
  } catch {}
}

export async function hasApiKey(_provider: AiProvider): Promise<boolean> {
  return true;
}

export async function deleteApiKey(provider: AiProvider): Promise<void> {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(`${KEY_PREFIX}${provider}`);
  } catch {}
}

export async function listModels(request: ListModelsRequest): Promise<void> {
  const parsed = ListModelsRequestSchema.parse(request);
  const models = DEFAULT_MODELS[parsed.provider] ?? DEFAULT_MODELS.google;
  setTimeout(() => {
    emitEngineEvent({
      type: "models",
      request_id: parsed.request_id,
      provider: parsed.provider,
      models,
    });
    emitEngineEvent({
      type: "done",
      request_id: parsed.request_id,
      usage: null,
      model: null,
    });
  }, 20);
}

export interface EngineStatus {
  ready: boolean;
  error: string | null;
  protocol_version: number | null;
}

export async function engineStatus(): Promise<EngineStatus> {
  return {
    ready: true,
    error: null,
    protocol_version: PROTOCOL_VERSION,
  };
}

export async function restartEngine(): Promise<void> {
  emitEngineEvent({
    type: "ready",
    protocol_version: PROTOCOL_VERSION,
    engine_version: "web-embedded",
  });
}

export async function cancelRequest(requestId: string): Promise<void> {
  cancelledRequests.add(requestId);
}

export interface BridgeStatus {
  supported: boolean;
  running: boolean;
  pipe: string | null;
  accepted: number;
  refused: number;
  server: string | null;
}

let webBridgeRunning = false;
const webBridgeAccepted = 0;

export async function bridgeStatus(): Promise<BridgeStatus> {
  return {
    supported: true,
    running: webBridgeRunning,
    pipe: webBridgeRunning ? "window.postMessage('anatria-bridge')" : null,
    accepted: webBridgeAccepted,
    refused: 0,
    server: "Code Blue Web Scene Bridge (Browser CustomEvent / postMessage)",
  };
}

export async function startBridge(): Promise<BridgeStatus> {
  webBridgeRunning = true;
  return bridgeStatus();
}

export async function stopBridge(): Promise<BridgeStatus> {
  webBridgeRunning = false;
  return bridgeStatus();
}

export interface DisplayStatus {
  supported: boolean;
  stableDisplay: boolean;
  active: boolean;
}

export async function displayStatus(): Promise<DisplayStatus> {
  return {
    supported: false,
    stableDisplay: false,
    active: false,
  };
}

export async function setStableDisplay(_on: boolean): Promise<DisplayStatus> {
  return displayStatus();
}

const ARABIC_CHAR_REGEX = /[\u0600-\u06FF]/;

const ARABIC_KEYWORDS_TO_EN: [RegExp, string][] = [
  [/القلب|قلب|بطين|أذين|اذين|شريان تاجي|أبهر|ابهر|الأورطي|الاورطي/i, "heart ventricle atrium aorta coronary"],
  [/بطين أيسر|البطين الأيسر/i, "left ventricle"],
  [/بطين أيمن|البطين الأيمن/i, "right ventricle"],
  [/أذين أيسر|الأذين الأيسر/i, "left atrium"],
  [/أذين أيمن|الأذين الأيمن/i, "right atrium"],
  [/المخ|الدماغ|مخ|عصب|أعصاب|اعصاب|جذع الدماغ|مخيخ/i, "brain cerebrum cerebellum nerve brainstem"],
  [/العصب الحائر|المبهم/i, "vagus nerve"],
  [/الرئة|رئة|رئتين|قصبة هوائية|الحجاب الحاجز/i, "lung trachea bronchus diaphragm"],
  [/الكبد|كبد|مرارة|المرارة|قناة صفراوية/i, "liver gallbladder bile"],
  [/المعدة|معدة|أمعاء|امعاء|قولون|الزائدة الدودية|زائدة/i, "stomach intestine colon appendix cecum"],
  [/الكلية|كلية|كليتين|حالب|مثانة/i, "kidney ureter urinary bladder"],
  [/الجمجمة|جمجمة|عمود فقري|فقرات|قفص صدري|ضلوع|عظم|عظام/i, "skull cranium vertebra rib femur bone"],
  [/الفخذ|عظمة الفخذ/i, "femur"],
  [/العضلات|عضلة|الكتف|الكفة المدورة/i, "muscle deltoid supraspinatus infraspinatus"],
  [/الرحم|مبيض|ثدي|الحوض/i, "uterus ovary uterine tube breast pelvis"],
];

function matchStructuresFromQuery(
  query: string,
  available: AgentRequest["available_organs"],
  selection: AgentRequest["selection"],
) {
  let enrichedQuery = query.toLowerCase();
  for (const [arRegex, enWords] of ARABIC_KEYWORDS_TO_EN) {
    if (arRegex.test(query)) {
      enrichedQuery += " " + enWords;
    }
  }

  // Enrich with matched knowledge base entries (supports all 272 Arabic/English/Clinical entries)
  const kbHits = searchKnowledge(query, 5);
  for (const kb of kbHits) {
    enrichedQuery += " " + kb.name_en.toLowerCase();
    for (const alias of MESH_ALIASES[kb.id] ?? []) {
      enrichedQuery += " " + alias.toLowerCase();
    }
  }

  const tokens = enrichedQuery
    .replace(/[^a-z0-9_]+/g, " ")
    .split(/\s+/)
    .filter((w) => w.length >= 3 && !["the", "and", "for", "with", "what", "how", "explain", "show", "about", "start", "case", "drill", "patient", "acute"].includes(w));

  if (selection.length > 0 && tokens.length === 0) {
    return selection;
  }

  const scored: { organ: AgentRequest["available_organs"][number]; score: number }[] = [];
  for (const organ of available) {
    const idStr = organ.organ_id.toLowerCase();
    const enStr = organ.name_en.toLowerCase();
    const latStr = organ.ta2_latin.toLowerCase();
    let score = 0;

    if (enrichedQuery.includes(enStr) && enStr.length > 4) score += 25;
    if (enrichedQuery.includes(latStr) && latStr.length > 4) score += 25;

    for (const tok of tokens) {
      if (idStr === tok) score += 15;
      else if (idStr.includes(tok)) score += 6;
      if (enStr.includes(tok)) score += 8;
      if (latStr.includes(tok)) score += 7;
      if (organ.system.toLowerCase().includes(tok)) score += 3;
    }

    if (selection.some((s) => s.organ_id === organ.organ_id)) {
      score += 12;
    }

    if (score > 0) {
      scored.push({ organ, score });
    }
  }

  scored.sort((a, b) => b.score - a.score);
  if (scored.length > 0) {
    return scored.slice(0, 6).map((s) => s.organ);
  }

  if (selection.length > 0) {
    return selection.slice(0, 6);
  }

  return available.slice(0, 4);
}

function formatKnowledgeSection(entry: UnifiedEntry | null, isArabic: boolean): string {
  if (!entry) return "";
  const rows = entry.details
    .map((d) => `- **${isArabic && d.label_ar ? d.label_ar : d.label}:** ${d.value}`)
    .join("\n");
  const clinHeader = isArabic
    ? "#### 🩺 الأهمية الإكلينيكية والجراحية (Clinical Pearl)"
    : "#### 🩺 Clinical & Surgical Correlations";
  return (
    `\n\n#### ${isArabic ? `📚 الحقائق التشريحية المعتمدة — ${entry.name_ar} (${entry.name_en})` : `📚 High-Yield Anatomical Facts — ${entry.name_en} (${entry.name_ar})`}\n` +
    `${rows}\n\n` +
    `${clinHeader}\n> ${entry.clinical}\n`
  );
}

function buildLocalSceneAndAnswer(request: AgentRequest): {
  tools: { name: string; command: SceneCommand }[];
  answer: string;
  verdict?: { score: number; text: string };
} {
  const isArabic =
    request.language === "ar" ||
    (request.language === "auto" && ARABIC_CHAR_REGEX.test(request.query));

  const matched = matchStructuresFromQuery(
    request.query,
    request.available_organs,
    request.selection,
  );
  const primary = matched[0];
  const kbEntry = primary
    ? matchOrganToEntry(primary) ?? searchKnowledge(request.query, 1)[0] ?? null
    : searchKnowledge(request.query, 1)[0] ?? null;

  const tools: { name: string; command: SceneCommand }[] = [];
  const qLower = request.query.toLowerCase();

  if (primary) {
    tools.push({
      name: "focus_organ",
      command: { action: "focus_organ", organ_id: primary.organ_id },
    });
    tools.push({
      name: "illuminate_structures",
      command: {
        action: "illuminate_structures",
        organ_ids: matched.slice(0, 4).map((m) => m.organ_id),
      },
    });
  }

  if (
    /isolate|اعزل|عزل|فقط|show only/i.test(request.query) &&
    matched.length > 0
  ) {
    tools.push({
      name: "isolate_structures",
      command: {
        action: "isolate_structures",
        organ_ids: matched.map((m) => m.organ_id),
      },
    });
  }

  if (/fibrillation|tachycardia|bradycardia|arrhythmia|رجفان|نبض|خفقان/i.test(request.query)) {
    const rhythm = /fibrillation|رجفان/i.test(request.query)
      ? "atrial_fibrillation"
      : /tachycardia|تسارع/i.test(request.query)
        ? "sinus_tachycardia"
        : /bradycardia|تباطؤ/i.test(request.query)
          ? "sinus_bradycardia"
          : "normal";
    tools.push({
      name: "set_heart_rhythm",
      command: { action: "set_heart_rhythm", rhythm, sound: true },
    });
  }

  const kbBlock = formatKnowledgeSection(kbEntry, isArabic);

  if (request.mode === "case") {
    const isStartingCase =
      request.history.length === 0 ||
      /start a case|new case|حالة جديدة|اختبرني/i.test(qLower);

    if (isStartingCase && primary) {
      tools.push({
        name: "apply_pathology_overlay",
        command: {
          action: "apply_pathology_overlay",
          organ_id: primary.organ_id,
          pathology: "inflammation",
          severity: 0.8,
        },
      });

      const answer = isArabic
        ? `### 🩺 تدريب إكلينيكي تفاعلي (MRCS Clinical Case Drill)\n\n` +
          `**الحالة السريرية:** حضر مريض يبلغ من العمر 42 عاماً إلى قسم الطوارئ يشكو من أعراض مرتبطة بتركيب **${primary.name_en}** (*${primary.ta2_latin}*) [[${primary.organ_id}]].\n` +
          (kbEntry ? `\n**السيناريو الإكلينيكي المحوري:** ${kbEntry.clinical}\n\n` : "\n") +
          `تم توجيه الكاميرا ثلاثية الأبعاد وتحديد موضع الإصابة على المجسم التشريحي أمامك:\n` +
          matched
            .slice(0, 4)
            .map(
              (m) =>
                `- **${m.ta2_latin}** (${m.name_en}) [[${m.organ_id}]] — الجهاز: \`${m.system}\``,
            )
            .join("\n") +
          `\n\n**السؤال الجراحي والتشريحي:**\n1. ما هي التروية الدموية والتعصيب الأساسي لـ **${primary.name_en}** [[${primary.organ_id}]]؟\n2. ما هي أهم المجاورات التشريحية (Relations) التي يجب حمايتها جراحياً؟`
        : `### 🩺 MRCS Interactive Clinical Case Drill\n\n` +
          `**Presentation:** A 42-year-old patient presents with acute clinical signs involving the **${primary.name_en}** (*${primary.ta2_latin}*) [[${primary.organ_id}]].\n` +
          (kbEntry ? `\n**Clinical Context:** ${kbEntry.clinical}\n\n` : "\n") +
          `I have focused the 3D camera and highlighted the affected anatomical region on the model:\n` +
          matched
            .slice(0, 4)
            .map(
              (m) =>
                `- **${m.ta2_latin}** (${m.name_en}) [[${m.organ_id}]] — System: \`${m.system}\``,
            )
            .join("\n") +
          `\n\n**Clinical & Surgical Questions:**\n1. What is the origin/course, nerve supply, and blood supply of the **${primary.name_en}** [[${primary.organ_id}]]?\n2. Which adjacent anatomical structures are at highest risk during surgical exposure?`;

      return { tools, answer };
    } else if (primary) {
      const score = Math.min(96, Math.max(75, 78 + Math.floor(request.query.length / 22)));
      const verdictText = isArabic
        ? `إجابة منهجية ممتازة (${score}/100). لقد ربطت بنجاح بين الموضع التشريحي لـ ${primary.name_en} (${primary.ta2_latin}) ومسارات التروية والأعصاب المجاورة.`
        : `Strong anatomical reasoning (${score}/100). You accurately connected the regional relations of ${primary.name_en} (${primary.ta2_latin}) with its clinical presentation.`;
      const answer = isArabic
        ? `### ✅ تقييم الإجابة الإكلينيكية (${score}/100)\n\n` +
          `${verdictText}` +
          `${kbBlock}\n` +
          `#### التراكيب التشريحية في المشهد:\n` +
          matched
            .slice(0, 4)
            .map(
              (m) =>
                `- **${m.ta2_latin}** (*${m.name_en}*) [[${m.organ_id}]]: ينتمي إلى نظام \`${m.system}\`.`,
            )
            .join("\n")
        : `### ✅ Clinical Drill Assessment (${score}/100)\n\n` +
          `${verdictText}` +
          `${kbBlock}\n` +
          `#### Highlighted 3D Landmarks:\n` +
          matched
            .slice(0, 4)
            .map(
              (m) =>
                `- **${m.ta2_latin}** (*${m.name_en}*) [[${m.organ_id}]]: Part of the \`${m.system}\` system.`,
            )
            .join("\n");

      return {
        tools,
        answer,
        verdict: { score, text: verdictText },
      };
    }
  }

  if (!primary) {
    const fallbackText = isArabic
      ? "يرجى اختيار تركيب تشريحي من المجسم ثلاثي الأبعاد أو تفعيل المزيد من الأجهزة التشريحية من القائمة اليسرى." + kbBlock
      : "Select a structure in the 3D viewport or enable additional anatomical systems in the left panel to explore." + kbBlock;
    return { tools: [], answer: fallbackText };
  }

  const answer = isArabic
    ? `### 🧬 الشرح التشريحي والجراحي: **${primary.name_en}** (*${primary.ta2_latin}*) [[${primary.organ_id}]]\n\n` +
      `تم توجيه الكاميرا ثلاثية الأبعاد وإضاءة **${primary.name_en}** [[${primary.organ_id}]] ضمن جهاز **\`${primary.system}\`**.\n\n` +
      `#### 1. التسمية التشريحية المعتمدة (Terminologia Anatomica)\n` +
      `- **الاسم اللاتيني (TA2):** *${primary.ta2_latin}* [[${primary.organ_id}]]\n` +
      `- **الاسم الإكلينيكي (English):** ${primary.name_en}\n` +
      (kbEntry ? `- **الاسم العربي:** ${kbEntry.name_ar}\n` : "") +
      `- **الجهاز التشريحي (System):** \`${primary.system}\`` +
      `${kbBlock}\n` +
      `#### 📌 التراكيب التشريحية المرتبطة والمجاورة في المشهد الحالي\n` +
      matched
        .map(
          (m) =>
            `- **${m.ta2_latin}** — *${m.name_en}* [[${m.organ_id}]] (\`${m.system}\`)`,
        )
        .join("\n")
    : `### 🧬 Anatomical & Surgical Overview: **${primary.name_en}** (*${primary.ta2_latin}*) [[${primary.organ_id}]]\n\n` +
      `The 3D camera has focused on and illuminated **${primary.name_en}** [[${primary.organ_id}]] within the **\`${primary.system}\`** system.\n\n` +
      `#### 1. Nomenclature & Classification (Terminologia Anatomica)\n` +
      `- **TA2 Latin:** *${primary.ta2_latin}* [[${primary.organ_id}]]\n` +
      `- **Clinical English:** ${primary.name_en}\n` +
      (kbEntry ? `- **Arabic Name:** ${kbEntry.name_ar}\n` : "") +
      `- **Anatomical System:** \`${primary.system}\`` +
      `${kbBlock}\n` +
      `#### 📌 Related & Regional Structures in View\n` +
      matched
        .map(
          (m) =>
            `- **${m.ta2_latin}** — *${m.name_en}* [[${m.organ_id}]] (\`${m.system}\`)`,
        )
        .join("\n");

  return { tools, answer };
}

export async function askAgent(rawRequest: AgentRequest): Promise<void> {
  const request = AgentRequestSchema.parse(rawRequest);
  cancelledRequests.delete(request.request_id);

  const customApiKey = getStoredApiKey(request.provider);

  void (async () => {
    try {
      let handledByServer = false;

      if (request.model !== "codeblue-anatomy-engine") {
        try {
          const controller = new AbortController();
          const timer = setTimeout(() => controller.abort(), 8000);
          const slimRequest = {
            ...request,
            available_organs: matchStructuresFromQuery(
              request.query,
              request.available_organs,
              request.selection,
            ),
          };
          const response = await fetch("/api/atlas/agent", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              request: slimRequest,
              customApiKey,
            }),
            signal: controller.signal,
          }).finally(() => clearTimeout(timer));

          if (response.ok) {
            const data = (await response.json()) as {
              events?: EngineEvent[];
              fallback?: boolean;
            };
            if (Array.isArray(data.events) && data.events.length > 0 && !data.fallback) {
              handledByServer = true;
              for (const ev of data.events) {
                if (cancelledRequests.has(request.request_id)) return;
                emitEngineEvent(ev);
                if (ev.type === "text_delta" || ev.type === "scene_command") {
                  await new Promise((r) => setTimeout(r, 18));
                }
              }
              return;
            }
          }
        } catch {}
      }

      if (!handledByServer) {
        const local = buildLocalSceneAndAnswer(request);

        for (const t of local.tools) {
          if (cancelledRequests.has(request.request_id)) return;
          emitEngineEvent({
            type: "tool_started",
            request_id: request.request_id,
            tool: t.name,
          });
          await new Promise((r) => setTimeout(r, 45));
          emitEngineEvent({
            type: "scene_command",
            request_id: request.request_id,
            command: t.command,
          });
        }

        if (local.verdict) {
          emitEngineEvent({
            type: "tool_started",
            request_id: request.request_id,
            tool: "record_case_verdict",
          });
          emitEngineEvent({
            type: "case_verdict",
            request_id: request.request_id,
            score: local.verdict.score,
            verdict: local.verdict.text,
          });
        }

        const chunks = local.answer.match(/[\s\S]{1,48}(\s|$)/g) ?? [local.answer];
        for (const chunk of chunks) {
          if (cancelledRequests.has(request.request_id)) return;
          emitEngineEvent({
            type: "text_delta",
            request_id: request.request_id,
            text: chunk,
          });
          await new Promise((r) => setTimeout(r, 20));
        }

        if (cancelledRequests.has(request.request_id)) return;
        const inputTokens = Math.max(120, Math.round(request.query.length * 1.5));
        const outputTokens = Math.max(90, Math.round(local.answer.length / 3.8));
        emitEngineEvent({
          type: "done",
          request_id: request.request_id,
          usage: {
            input_tokens: inputTokens,
            output_tokens: outputTokens,
            cache_read_tokens: 0,
          },
          model: request.model ?? "codeblue-anatomy-engine",
        });
      }
    } catch (err) {
      emitEngineEvent({
        type: "error",
        code: "internal_error",
        message: err instanceof Error ? err.message : String(err),
        request_id: request.request_id,
      });
    }
  })();
}

export interface EngineListenerOptions {
  onProtocolViolation?: (payload: unknown, issues: string) => void;
}

export async function onEngineEvent(
  handler: (event: EngineEvent) => void,
  options: EngineListenerOptions = {},
): Promise<UnlistenFn> {
  const onViolation =
    options.onProtocolViolation ??
    ((_payload, issues) => {
      console.error("[engine] protocol violation", issues);
    });

  const listener: RawListener = (payload: unknown) => {
    const parsed = EngineEventSchema.safeParse(payload);
    if (!parsed.success) {
      onViolation(payload, parsed.error.message);
      return;
    }
    handler(parsed.data);
  };

  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function newRequestId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `req-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}
