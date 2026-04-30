import { initialPracticeMenu, todayMenuConditionOptions } from "../constants/app";
import type {
  MediaAttachment,
  PracticeMenuTemplate,
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
  todayMenuConditionOptions.some((option) => option.key === value);

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
