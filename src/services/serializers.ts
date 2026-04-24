import type { MediaAttachment, Reply } from "../types/app";

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
