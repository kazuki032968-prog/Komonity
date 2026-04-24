import { Platform } from "react-native";

import {
  DEFAULT_PUBLIC_SITE_URL,
  IMAGE_FILE_SIZE_LIMIT_BYTES,
  LIST_BODY_COLLAPSE_LENGTH,
  SUPPORT_EMAIL_ADDRESS,
  VIDEO_FILE_SIZE_LIMIT_BYTES,
} from "../constants/app";
import type {
  ActivityBadge,
  AdvisorFormState,
  CoachFormState,
  ProfileState,
  ResolvedWebRoute,
  RichFormatAction,
  SearchAccountItem,
  SearchContentFilterKey,
  TextSelectionRange,
} from "../types/app";

export const URL_REGEX = /(https?:\/\/[^\s)]+)(?![^[]*\])/giu;
export const MARKDOWN_LINK_REGEX = /\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/giu;

export const createHandleFromName = (name: string) =>
  `@${name.replace(/\s+/g, "_").replace(/[^\p{L}\p{N}_]/gu, "").toLowerCase()}`;

export const normalizeHandle = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) {
    return "";
  }

  const sanitized = trimmed
    .replace(/^@+/u, "")
    .replace(/\s+/g, "_")
    .replace(/[^\p{L}\p{N}_]/gu, "")
    .toLowerCase();

  return sanitized ? `@${sanitized}` : "";
};

export const normalizeHashtagLabel = (value: string) =>
  value
    .trim()
    .replace(/^#+/u, "")
    .replace(/[!-/:-@[-`{-~]+$/u, "");

export const formatFileSizeLabel = (bytes: number) => {
  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  }

  return `${Math.ceil(bytes / 1024)}KB`;
};

export const getMediaSizeLimit = (kind: "image" | "video") =>
  kind === "video" ? VIDEO_FILE_SIZE_LIMIT_BYTES : IMAGE_FILE_SIZE_LIMIT_BYTES;

export const extractFirstUrl = (content: string) => {
  const markdownMatch = MARKDOWN_LINK_REGEX.exec(content);
  MARKDOWN_LINK_REGEX.lastIndex = 0;
  if (markdownMatch?.[2]) {
    return markdownMatch[2];
  }

  const urlMatch = URL_REGEX.exec(content);
  URL_REGEX.lastIndex = 0;
  return urlMatch?.[1] ?? null;
};

export const removeUrlsForPreviewLabel = (value: string) =>
  value
    .replace(MARKDOWN_LINK_REGEX, "$1")
    .replace(URL_REGEX, "")
    .trim();

export const buildUrlPreviewLabel = (url: string) => {
  try {
    const hostname = new URL(url).hostname.replace(/^www\./u, "");
    return hostname;
  } catch {
    return "外部サイト";
  }
};

export const shouldCollapseBody = (content: string) =>
  content.length > LIST_BODY_COLLAPSE_LENGTH;

export const getCollapsedBody = (content: string) =>
  `${content.slice(0, LIST_BODY_COLLAPSE_LENGTH).trimEnd()}...`;

/**
 * 本文中のハッシュタグだけを抽出し、表示用本文とタグ一覧を返します。
 */
export const extractDisplayBodyAndTags = (body: string) => {
  const inlineTags: string[] = [];
  const bodyText = body
    .split("\n")
    .map((line) =>
      line
        .split(/\s+/)
        .filter((token) => {
          if (!token.startsWith("#")) {
            return true;
          }

          const normalized = normalizeHashtagLabel(token);
          if (!normalized) {
            return true;
          }

          inlineTags.push(normalized);
          return false;
        })
        .join(" ")
        .trim()
    )
    .join("\n")
    .trim();

  return {
    bodyText,
    tags: Array.from(
      new Set(inlineTags.map((tag) => normalizeHashtagLabel(tag)).filter(Boolean))
    ),
  };
};

export const getDaysSinceTimestamp = (timestampMs?: number) => {
  if (!timestampMs) {
    return 0;
  }

  return Math.max(0, (Date.now() - timestampMs) / (1000 * 60 * 60 * 24));
};

export const getDecayMultiplier = (
  source: SearchContentFilterKey,
  timestampMs?: number
) => {
  const days = getDaysSinceTimestamp(timestampMs);

  if (days <= 1) {
    return 1;
  }
  if (days <= 3) {
    return source === "questions" ? 0.9 : 0.8;
  }
  if (days <= 7) {
    return source === "questions" ? 0.75 : 0.6;
  }

  return source === "questions" ? 0.55 : 0.3;
};

/**
 * 話題度スコアを、投稿種別と経過日数を踏まえて減衰込みで算出します。
 */
export const getTrendingScore = ({
  source,
  baseScore,
  createdAtMs,
  hasBestAnswer,
}: {
  source: SearchContentFilterKey;
  baseScore: number;
  createdAtMs?: number;
  hasBestAnswer?: boolean;
}) => {
  const decayMultiplier = getDecayMultiplier(source, createdAtMs);
  const bestAnswerBonus = source === "questions" && hasBestAnswer ? 1.15 : 1;

  return baseScore * decayMultiplier * bestAnswerBonus;
};

export const formatCount = (value: number) => value.toLocaleString("ja-JP");

export const parseFollowerCount = (value: string) => {
  const normalized = value.replace(/,/g, "").trim();
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
};

/**
 * アカウント検索の表示順を決めるための一致度スコアを返します。
 */
export const getAccountSearchScore = (
  account: Pick<SearchAccountItem, "name" | "handle" | "bio">,
  query: string
) => {
  if (!query) {
    return 0;
  }

  const name = account.name.toLowerCase();
  const handle = account.handle.toLowerCase();
  const bio = account.bio.toLowerCase();

  if (name === query || handle === query) {
    return 100;
  }
  if (name.startsWith(query) || handle.startsWith(query)) {
    return 80;
  }
  if (name.includes(query) || handle.includes(query)) {
    return 60;
  }
  if (bio.startsWith(query)) {
    return 40;
  }
  if (bio.includes(query)) {
    return 20;
  }

  return 0;
};

export const getTrendingCoachScore = ({
  followers,
  likes,
  reposts,
  bookmarks,
  bestAnswers,
  lastActivityDays,
}: {
  followers: number;
  likes: number;
  reposts: number;
  bookmarks: number;
  bestAnswers: number;
  lastActivityDays: number;
}) =>
  followers * 1 +
  likes * 2 +
  reposts * 3 +
  bookmarks * 3 +
  bestAnswers * 8 -
  lastActivityDays * 5;

export const countRepliesRecursively = (replies: Array<{ replies?: unknown[] }>): number =>
  replies.reduce(
    (total, reply) => total + 1 + countRepliesRecursively((reply.replies as Array<{ replies?: unknown[] }>) ?? []),
    0
  );

/**
 * 投稿日一覧から連続投稿日数を計算します。
 */
export const getPostingStreakDays = (timestamps: number[]) => {
  if (timestamps.length === 0) {
    return 0;
  }

  const uniqueDays = Array.from(
    new Set(
      timestamps
        .filter(Boolean)
        .map((timestamp) => {
          const date = new Date(timestamp);
          return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
        })
    )
  ).sort((left, right) => right - left);

  if (uniqueDays.length === 0) {
    return 0;
  }

  let streak = 1;
  for (let index = 1; index < uniqueDays.length; index += 1) {
    const previousDay = uniqueDays[index - 1];
    const currentDay = uniqueDays[index];
    const diffDays = (previousDay - currentDay) / (1000 * 60 * 60 * 24);

    if (diffDays === 1) {
      streak += 1;
      continue;
    }

    break;
  }

  return streak;
};

export const getProfileCompletionScore = (
  profile: Pick<ProfileState, "bio" | "link" | "selectedSports" | "handle">
) => {
  let score = 0;

  if (profile.handle.trim()) {
    score += 1;
  }
  if (profile.bio.trim()) {
    score += 1;
  }
  if (profile.link.trim()) {
    score += 1;
  }
  if (profile.selectedSports.length >= 1) {
    score += 1;
  }
  if (profile.selectedSports.length >= 2 || profile.bio.trim().length >= 80) {
    score += 1;
  }

  return score;
};

export const createTieredBadge = ({
  id,
  label,
  description,
  value,
  bronze,
  silver,
  gold,
}: {
  id: string;
  label: string;
  description: string;
  value: number;
  bronze: number;
  silver: number;
  gold: number;
}): ActivityBadge | null => {
  if (value >= gold) {
    return { id, label, description, tier: "gold" };
  }
  if (value >= silver) {
    return { id, label, description, tier: "silver" };
  }
  if (value >= bronze) {
    return { id, label, description, tier: "bronze" };
  }

  return null;
};

export const applyRichFormatting = (
  value: string,
  selection: TextSelectionRange,
  action: RichFormatAction
) => {
  const start = Math.max(0, Math.min(selection.start, selection.end, value.length));
  const end = Math.max(0, Math.max(selection.start, selection.end, 0));
  const selectedText = value.slice(start, Math.min(end, value.length));

  const insertOrWrap = (replacement: string) => ({
    value: `${value.slice(0, start)}${replacement}${value.slice(Math.min(end, value.length))}`,
    selection: {
      start: start + replacement.length,
      end: start + replacement.length,
    },
  });

  if (action === "bold") {
    return insertOrWrap(selectedText ? `**${selectedText}**` : "****");
  }

  const sourceText = selectedText || "";
  const lines = sourceText.split("\n");

  if (action === "quote") {
    return insertOrWrap(lines.map((line) => `> ${line}`).join("\n") || "> ");
  }

  return insertOrWrap(lines.map((line) => `- ${line}`).join("\n") || "- ");
};

export const createCoverToneFromName = (name: string) => {
  const tones = ["#d8c7ad", "#d6d9c4", "#c8ddd7", "#dfc6c0"];
  const total = Array.from(name).reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return tones[total % tones.length];
};

export const userMatchesProfile = ({
  uid,
  name,
  targetUid,
  targetName,
}: {
  uid?: string;
  name: string;
  targetUid?: string;
  targetName: string;
}) => {
  if (targetUid) {
    return uid === targetUid || (!uid && name === targetName);
  }

  return name === targetName;
};

export const replyMatchesProfile = ({
  author,
  targetName,
}: {
  author: string;
  targetName: string;
}) => author === targetName;

export const toTimestampMs = (value: unknown) => {
  if (
    typeof value === "object" &&
    value !== null &&
    "toDate" in value &&
    typeof value.toDate === "function"
  ) {
    return (value.toDate() as Date).getTime();
  }

  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Date.parse(value);
    return Number.isNaN(parsed) ? undefined : parsed;
  }

  return undefined;
};

/**
 * 同じ id を持つ項目を後勝ちでまとめ、表示順を保った配列を返します。
 */
export const mergeItemsById = <T extends { id: string }>(base: T[], incoming: T[]) => {
  const merged = new Map<string, T>();

  [...base, ...incoming].forEach((item) => {
    merged.set(item.id, item);
  });

  return Array.from(merged.values());
};

export const formatDateTimeWithSeconds = (timestampMs?: number) => {
  if (!timestampMs) {
    return "日時未設定";
  }

  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(new Date(timestampMs));
};

export const getPublicSiteUrl = () => {
  if (Platform.OS === "web" && typeof window !== "undefined") {
    return window.location.origin;
  }

  return DEFAULT_PUBLIC_SITE_URL;
};

export const getHandleSlug = (handle: string) =>
  handle.replace(/^@+/, "").trim().toLowerCase();

export const buildProfilePath = (handle: string) =>
  `/profile/${encodeURIComponent(getHandleSlug(handle))}`;

export const buildPostPath = (source: SearchContentFilterKey, id: string) =>
  `/posts/${encodeURIComponent(source)}/${encodeURIComponent(id)}`;

export const buildReplyPath = (
  source: SearchContentFilterKey,
  rootPostId: string,
  path: string[]
) =>
  `${buildPostPath(source, rootPostId)}/replies/${path
    .map((segment) => encodeURIComponent(segment))
    .join("/")}`;

export const buildProfileUrl = (handle: string) =>
  `${getPublicSiteUrl()}${buildProfilePath(handle)}`;

export const buildSearchPath = (query: string) => {
  const normalizedQuery = query.trim();
  if (!normalizedQuery) {
    return "/search";
  }

  return `/search?q=${encodeURIComponent(normalizedQuery)}`;
};

/**
 * 現在のブラウザ URL をアプリ内画面の状態へ変換します。
 */
export const parseWebRoute = (pathname: string, search: string): ResolvedWebRoute => {
  const normalizedPathname = pathname.replace(/\/+$/, "") || "/";
  const searchParams = new URLSearchParams(search);

  if (normalizedPathname === "/" || normalizedPathname === "/timeline") {
    return { kind: "screen", screen: "top", timelineSection: "all" };
  }

  if (normalizedPathname === "/timeline/menu-strategy") {
    return { kind: "screen", screen: "top", timelineSection: "feed" };
  }

  if (normalizedPathname === "/timeline/questions") {
    return { kind: "screen", screen: "top", timelineSection: "questions" };
  }

  if (normalizedPathname === "/timeline/community") {
    return { kind: "screen", screen: "top", timelineSection: "community" };
  }

  if (normalizedPathname === "/timeline/following") {
    return { kind: "screen", screen: "top", timelineSection: "following" };
  }

  if (normalizedPathname === "/service-detail") {
    return { kind: "screen", screen: "service-detail" };
  }

  if (normalizedPathname === "/compose") {
    return { kind: "screen", screen: "post-compose" };
  }

  if (normalizedPathname === "/search") {
    return {
      kind: "screen",
      screen: "search",
      searchQuery: searchParams.get("q") ?? "",
    };
  }

  if (normalizedPathname === "/notifications") {
    return { kind: "screen", screen: "notifications" };
  }

  if (normalizedPathname === "/featured-coaches") {
    return { kind: "screen", screen: "experts" };
  }

  if (normalizedPathname === "/mypage") {
    return { kind: "screen", screen: "mypage" };
  }

  if (normalizedPathname === "/mypage/edit") {
    return { kind: "screen", screen: "profile-edit" };
  }

  if (normalizedPathname === "/register") {
    return { kind: "screen", screen: "registration-role" };
  }

  if (normalizedPathname === "/register/advisor") {
    return { kind: "screen", screen: "advisor-registration" };
  }

  if (normalizedPathname === "/register/coach") {
    return { kind: "screen", screen: "coach-registration" };
  }

  if (normalizedPathname === "/login") {
    return { kind: "screen", screen: "login" };
  }

  if (normalizedPathname === "/forgot-password") {
    return { kind: "screen", screen: "forgot-password" };
  }

  if (normalizedPathname === "/contact") {
    return { kind: "screen", screen: "contact" };
  }

  if (normalizedPathname === "/privacy-policy") {
    return { kind: "screen", screen: "privacy-policy" };
  }

  if (normalizedPathname === "/terms") {
    return { kind: "screen", screen: "terms" };
  }

  if (normalizedPathname === "/connections") {
    return { kind: "screen", screen: "relationship-list" };
  }

  const profileMatch = normalizedPathname.match(/^\/profile\/([^/]+)$/);
  if (profileMatch) {
    return {
      kind: "profile",
      handleSlug: decodeURIComponent(profileMatch[1] ?? "").toLowerCase(),
    };
  }

  const replyMatch = normalizedPathname.match(
    /^\/posts\/(feed|questions|community)\/([^/]+)\/replies\/(.+)$/
  );
  if (replyMatch) {
    return {
      kind: "reply",
      source: replyMatch[1] as SearchContentFilterKey,
      rootPostId: decodeURIComponent(replyMatch[2] ?? ""),
      path: replyMatch[3]
        .split("/")
        .map((segment) => decodeURIComponent(segment))
        .filter(Boolean),
    };
  }

  const postMatch = normalizedPathname.match(/^\/posts\/(feed|questions|community)\/([^/]+)$/);
  if (postMatch) {
    return {
      kind: "post",
      source: postMatch[1] as SearchContentFilterKey,
      id: decodeURIComponent(postMatch[2] ?? ""),
    };
  }

  return { kind: "screen", screen: "top", timelineSection: "all" };
};

export const createLinkRow = (id: number) => ({
  id: `link-${id}`,
  label: "",
  url: "",
});

export const getAdvisorFieldKey = (label: string): keyof AdvisorFormState => {
  switch (label) {
    case "ニックネーム":
      return "nickname";
    case "表示ID":
      return "handle";
    case "担当部活":
      return "club";
    case "担当歴":
      return "experience";
    case "ログイン用メールアドレス":
      return "loginEmail";
    case "ログイン用パスワード":
      return "loginPassword";
    default:
      return "nickname";
  }
};

export const getAdvisorFieldValue = (
  label: string,
  form: AdvisorFormState
): string => String(form[getAdvisorFieldKey(label)]);

export const getCoachFieldKey = (label: string): keyof CoachFormState => {
  switch (label) {
    case "ニックネーム":
      return "nickname";
    case "表示ID":
      return "handle";
    case "専門種目":
      return "specialty";
    case "指導歴":
      return "experience";
    case "今までの経歴や功績":
      return "achievements";
    case "電話番号":
      return "phone";
    case "メールアドレス":
      return "publicEmail";
    case "ログイン用メールアドレス":
      return "loginEmail";
    case "ログイン用パスワード":
      return "loginPassword";
    default:
      return "nickname";
  }
};

export const getCoachFieldValue = (
  label: string,
  form: CoachFormState
): string => String(form[getCoachFieldKey(label)]);

export const toAuthErrorMessage = (error: unknown) => {
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof error.code === "string"
  ) {
    switch (error.code) {
      case "auth/email-already-in-use":
        return "このメールアドレスはすでに使用されています。";
      case "auth/invalid-email":
        return "メールアドレスの形式が正しくありません。";
      case "auth/weak-password":
        return "パスワードが弱すぎます。8文字以上を目安に設定してください。";
      case "auth/invalid-credential":
        return "メールアドレスまたはパスワードが正しくありません。";
      case "auth/api-key-not-valid":
        return "認証設定に問題があります。管理者へお問い合わせください。";
      case "auth/requires-recent-login":
        return "安全のため、この操作の前に一度ログインし直してください。";
      default:
        return "認証処理に失敗しました。時間をおいて再度お試しください。";
    }
  }

  return "処理に失敗しました。入力内容を確認して、時間をおいて再度お試しください。";
};

export const toSaveErrorMessage = (error: unknown) => {
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof error.code === "string"
  ) {
    switch (error.code) {
      case "permission-denied":
        return "この操作は現在許可されていません。";
      case "storage/unauthorized":
        return "画像または動画の追加が現在許可されていません。";
      case "storage/canceled":
        return "画像または動画の追加がキャンセルされました。";
      case "storage/unknown":
        return "画像または動画の追加に失敗しました。";
      case "unavailable":
        return "現在接続しにくくなっています。時間をおいて再度お試しください。";
      case "not-found":
        return "必要なデータが見つかりませんでした。";
      default:
        return "保存処理に失敗しました。時間をおいて再度お試しください。";
    }
  }

  if (error instanceof Error && error.message === "firestore-save-timeout") {
    return "保存処理が混み合っています。時間をおいて再度お試しください。";
  }

  return "保存処理に失敗しました。時間をおいて再度お試しください。";
};

export const getAvailablePostTargets = (role: string) => {
  if (role.includes("指導員")) {
    return [{ key: "feed" as const, label: "メニュー・戦術" }];
  }

  return [
    { key: "questions" as const, label: "相談広場" },
    { key: "community" as const, label: "コミュニティ" },
  ];
};

export const getContactSupportText = () =>
  `ご不明点がある場合は、${SUPPORT_EMAIL_ADDRESS} までお問い合わせください。`;
