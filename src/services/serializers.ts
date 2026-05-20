import {
  initialPracticeMenu,
  initialPracticeStrategy,
  todayMenuAdvancedConditionOptions,
  todayMenuConditionOptions,
} from "../constants/app";
import type {
  FeedKind,
  MediaAttachment,
  PracticeMenuTemplate,
  PracticeStrategyTemplate,
  Reply,
  TodayMenuConditionKey,
} from "../types/app";

/**
 * Firestore の生データから返信ツリーを安全な Reply 配列へ変換します。
 */
export const normalizeReplies = (value: unknown): Reply[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.reduce<Reply[]>((accumulator, reply, index) => {
    const item = reply as Partial<Reply> | undefined;
    if (!item?.author || !item?.body) {
      return accumulator;
    }

    accumulator.push({
      id: item.id ?? `reply-${index}`,
      author: item.author,
      authorHandle:
        typeof item.authorHandle === "string" ? item.authorHandle : undefined,
      createdByUid:
        typeof item.createdByUid === "string" ? item.createdByUid : undefined,
      body: item.body,
      media: normalizeMedia(item.media),
      replies: normalizeReplies(item.replies),
    });

    return accumulator;
  }, []);
};

/**
 * 配列フィールドから文字列だけを取り出します。
 */
export const toArrayOfStrings = (value: unknown) => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === "string");
};

/**
 * Firestore の添付配列を安全な MediaAttachment 配列へ変換します。
 */
export const normalizeMedia = (value: unknown): MediaAttachment[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  const normalized: MediaAttachment[] = [];

  value.forEach((item) => {
    const media = item as Partial<MediaAttachment> | undefined;
    if (
      !media ||
      (media.kind !== "image" && media.kind !== "video") ||
      typeof media.url !== "string" ||
      typeof media.fileName !== "string"
    ) {
      return;
    }

    normalized.push({
      kind: media.kind,
      url: media.url,
      fileName: media.fileName,
      mimeType: media.mimeType,
      storagePath: media.storagePath,
      width: media.width,
      height: media.height,
    });
  });

  return normalized;
};

const isTodayMenuConditionKey = (value: unknown): value is TodayMenuConditionKey =>
  typeof value === "string" &&
  [...todayMenuConditionOptions, ...todayMenuAdvancedConditionOptions].some(
    (option) => option.key === value
  );

/**
 * Firestore の練習メニューテンプレートを安全に復元します。
 */
export const normalizePracticeMenu = (
  value: unknown
): PracticeMenuTemplate | undefined => {
  if (typeof value !== "object" || value === null) {
    return undefined;
  }

  const menu = value as Partial<Record<keyof PracticeMenuTemplate, unknown>>;
  const normalized: PracticeMenuTemplate = {
    ...initialPracticeMenu,
    sport: typeof menu.sport === "string" ? menu.sport : "",
    targetLevel:
      typeof menu.targetLevel === "string" ? menu.targetLevel : "",
    grade: typeof menu.grade === "string" ? menu.grade : "",
    participants:
      typeof menu.participants === "string" ? menu.participants : "",
    durationMinutes:
      typeof menu.durationMinutes === "string" ? menu.durationMinutes : "",
    tools: typeof menu.tools === "string" ? menu.tools : "",
    purpose: typeof menu.purpose === "string" ? menu.purpose : "",
    steps: typeof menu.steps === "string" ? menu.steps : "",
    cautions: typeof menu.cautions === "string" ? menu.cautions : "",
    commonMistakes:
      typeof menu.commonMistakes === "string" ? menu.commonMistakes : "",
    arrangements:
      typeof menu.arrangements === "string" ? menu.arrangements : "",
    conditionTags: Array.isArray(menu.conditionTags)
      ? menu.conditionTags.filter(isTodayMenuConditionKey)
      : [],
  };

  return Object.values(normalized).some((item) =>
    Array.isArray(item) ? item.length > 0 : Boolean(String(item).trim())
  )
    ? normalized
    : undefined;
};

/**
 * Firestore の投稿種別を復元します。過去データはすべてメニュー投稿として扱います。
 */
export const normalizeFeedKind = (value: unknown): FeedKind =>
  value === "strategy" ? "strategy" : "menu";

/**
 * Firestore の戦術テンプレートを安全に復元します。
 */
export const normalizePracticeStrategy = (
  value: unknown
): PracticeStrategyTemplate | undefined => {
  if (typeof value !== "object" || value === null) {
    return undefined;
  }

  const strategy = value as Partial<
    Record<keyof PracticeStrategyTemplate, unknown>
  >;
  const normalized: PracticeStrategyTemplate = {
    ...initialPracticeStrategy,
    sport: typeof strategy.sport === "string" ? strategy.sport : "",
    targetLevel:
      typeof strategy.targetLevel === "string" ? strategy.targetLevel : "",
    grade: typeof strategy.grade === "string" ? strategy.grade : "",
    participants:
      typeof strategy.participants === "string" ? strategy.participants : "",
    phase: typeof strategy.phase === "string" ? strategy.phase : "",
    objective:
      typeof strategy.objective === "string" ? strategy.objective : "",
    formation:
      typeof strategy.formation === "string" ? strategy.formation : "",
    roles: typeof strategy.roles === "string" ? strategy.roles : "",
    triggers: typeof strategy.triggers === "string" ? strategy.triggers : "",
    steps: typeof strategy.steps === "string" ? strategy.steps : "",
    cautions: typeof strategy.cautions === "string" ? strategy.cautions : "",
    commonMistakes:
      typeof strategy.commonMistakes === "string"
        ? strategy.commonMistakes
        : "",
    practiceDrill:
      typeof strategy.practiceDrill === "string"
        ? strategy.practiceDrill
        : "",
  };

  return Object.values(normalized).some((item) => Boolean(String(item).trim()))
    ? normalized
    : undefined;
};

/**
 * 練習メニューテンプレートを Firestore 保存用のプレーンオブジェクトへ変換します。
 */
export const serializePracticeMenuForFirestore = (
  menu?: PracticeMenuTemplate
) => {
  if (!menu) {
    return null;
  }

  return {
    sport: menu.sport.trim(),
    targetLevel: menu.targetLevel.trim(),
    grade: menu.grade.trim(),
    participants: menu.participants.trim(),
    durationMinutes: menu.durationMinutes.trim(),
    tools: menu.tools.trim(),
    purpose: menu.purpose.trim(),
    steps: menu.steps.trim(),
    cautions: menu.cautions.trim(),
    commonMistakes: menu.commonMistakes.trim(),
    arrangements: menu.arrangements.trim(),
    conditionTags: menu.conditionTags,
  };
};

/**
 * 戦術テンプレートを Firestore 保存用のプレーンオブジェクトへ変換します。
 */
export const serializePracticeStrategyForFirestore = (
  strategy?: PracticeStrategyTemplate
) => {
  if (!strategy) {
    return null;
  }

  return {
    sport: strategy.sport.trim(),
    targetLevel: strategy.targetLevel.trim(),
    grade: strategy.grade.trim(),
    participants: strategy.participants.trim(),
    phase: strategy.phase.trim(),
    objective: strategy.objective.trim(),
    formation: strategy.formation.trim(),
    roles: strategy.roles.trim(),
    triggers: strategy.triggers.trim(),
    steps: strategy.steps.trim(),
    cautions: strategy.cautions.trim(),
    commonMistakes: strategy.commonMistakes.trim(),
    practiceDrill: strategy.practiceDrill.trim(),
  };
};

/**
 * MediaAttachment を Firestore に保存しやすいプレーンオブジェクトへ変換します。
 */
export const serializeMediaForFirestore = (media?: MediaAttachment[]) => {
  if (!media || media.length === 0) {
    return [];
  }

  return media.map((item) => {
    const serialized: Record<string, unknown> = {
      kind: item.kind,
      url: item.url,
      fileName: item.fileName,
    };

    if (item.mimeType) {
      serialized.mimeType = item.mimeType;
    }
    if (item.storagePath) {
      serialized.storagePath = item.storagePath;
    }
    if (typeof item.width === "number") {
      serialized.width = item.width;
    }
    if (typeof item.height === "number") {
      serialized.height = item.height;
    }

    return serialized;
  });
};

/**
 * 再帰的な返信ツリーを Firestore 保存用のオブジェクトへ変換します。
 */
export const serializeRepliesForFirestore = (replies: Reply[]) =>
  replies.map((reply) => {
    const serialized: Record<string, unknown> = {
      id: reply.id,
      author: reply.author,
      body: reply.body,
      media: serializeMediaForFirestore(reply.media),
      replies: serializeRepliesForFirestore(reply.replies ?? []),
    };

    if (reply.authorHandle) {
      serialized.authorHandle = reply.authorHandle;
    }
    if (reply.createdByUid) {
      serialized.createdByUid = reply.createdByUid;
    }

    return serialized;
  });
