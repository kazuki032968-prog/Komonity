import { StatusBar } from "expo-status-bar";
import * as ImagePicker from "expo-image-picker";
import { useEffect, useState } from "react";
import {
  Image,
  Linking,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from "firebase/auth";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  type DocumentData,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";

import {
  advisorRegistrationFields,
  coachRegistrationFields,
  communityItems,
  experts,
  feedPosts,
  myPageProfile,
  myPageTabs,
  questions,
  registrationOptions,
  searchTabs,
  sportGroups,
} from "./src/data/mockData";
import { auth, db, hasFirebaseConfig as hasAuthConfig, storage } from "./src/lib/firebase";

type ScreenKey =
  | "top"
  | "feed"
  | "post-detail"
  | "reply-detail"
  | "following-feed"
  | "relationship-list"
  | "questions"
  | "experts"
  | "community"
  | "mypage"
  | "user-profile"
  | "notifications"
  | "search"
  | "post-compose"
  | "profile-edit"
  | "registration-role"
  | "advisor-registration"
  | "coach-registration"
  | "login";

type ExternalLink = {
  id: string;
  label: string;
  url: string;
};

type AdvisorFormState = {
  nickname: string;
  handle: string;
  club: string;
  experience: string;
  loginEmail: string;
  loginPassword: string;
  selectedSports: string[];
};

type CoachFormState = {
  nickname: string;
  handle: string;
  specialty: string;
  experience: string;
  achievements: string;
  phone: string;
  publicEmail: string;
  loginEmail: string;
  loginPassword: string;
  selectedSports: string[];
};

type LoginFormState = {
  email: string;
  password: string;
};

type ProfileState = {
  name: string;
  handle: string;
  role: string;
  bio: string;
  link: string;
  externalLinks: ExternalLink[];
  joined: string;
  following: string;
  followers: string;
  posts: string;
  selectedSports: string[];
};
type UserProfileState = ProfileState & {
  uid?: string;
  avatarLabel: string;
  verified?: boolean;
  coverTone: string;
};

type SearchTabKey = "trending-posts" | "recent" | "accounts";
type SearchContentFilterKey = "all" | "feed" | "questions" | "community";
type Reply = {
  id: string;
  author: string;
  authorHandle?: string;
  createdByUid?: string;
  body: string;
  media?: MediaAttachment[];
  replies?: Reply[];
};
type MediaKind = "image" | "video";
type MediaAttachment = {
  kind: MediaKind;
  url: string;
  fileName: string;
  mimeType?: string;
  storagePath?: string;
  width?: number;
  height?: number;
};
type LocalMediaAsset = {
  id: string;
  uri: string;
  kind: MediaKind;
  fileName: string;
  mimeType?: string;
  width?: number;
  height?: number;
  sizeBytes?: number;
};
type FeedPost = (typeof feedPosts)[number] & {
  media?: MediaAttachment[];
  createdByUid?: string;
  authorHandle?: string;
  createdAtMs?: number;
};
type QuestionPost = (typeof questions)[number] & {
  media?: MediaAttachment[];
  createdByUid?: string;
  authorHandle?: string;
  bestAnswerReplyId?: string;
  createdAtMs?: number;
};
type CommunityPost = (typeof communityItems)[number] & {
  media?: MediaAttachment[];
  createdByUid?: string;
  authorHandle?: string;
  createdAtMs?: number;
};
type FollowRecord = {
  id: string;
  followerUid: string;
  followingUid: string;
};
type BlockRecord = {
  id: string;
  blockerUid: string;
  blockedUid: string;
};
type PostAlertRecord = {
  id: string;
  watcherUid: string;
  targetUid: string;
};
type InteractionRecord = {
  id: string;
  userUid: string;
  postId: string;
  source: SearchContentFilterKey;
  createdAtMs?: number;
};
type ComposeTarget = "feed" | "questions" | "community";
type ComposeState = {
  target: ComposeTarget;
  title: string;
  body: string;
  selectedSports: string[];
};
type SearchContentItem = {
  id: string;
  source: SearchContentFilterKey;
  sourceLabel: string;
  author: string;
  authorHandle?: string;
  createdByUid?: string;
  role: string;
  title: string;
  body: string;
  sports: string[];
  tags: string[];
  replies: Reply[];
  media?: MediaAttachment[];
  score: number;
  createdAtMs?: number;
};
type SearchAccountItem = {
  id: string;
  name: string;
  handle: string;
  bio: string;
  followers: string;
  featured: boolean;
  role: string;
  selectedSports: string[];
};
type UserDirectoryMeta = {
  externalLinks: ExternalLink[];
  pinnedPostId?: string;
  pinnedPostSource?: SearchContentFilterKey;
};
type ProfileTabKey = "posts" | "answers" | "best_answers";
type PostDetailState = {
  id: string;
  source: SearchContentFilterKey;
  sourceLabel: string;
  author: string;
  authorHandle?: string;
  createdByUid?: string;
  role: string;
  title: string;
  body: string;
  media?: MediaAttachment[];
  replies: Reply[];
  likes?: number;
  reposts?: number;
  comments?: number;
  answers?: number;
  bestAnswer?: string;
  bestAnswerReplyId?: string;
  sports: string[];
  tags: string[];
  createdAtMs?: number;
};
type RelationshipListState = {
  mode: "following" | "followers";
  title: string;
  accounts: SearchAccountItem[];
  backScreen: "mypage" | "user-profile";
};
type ReplyDetailState = {
  rootPostId: string;
  source: SearchContentFilterKey;
  sourceLabel: string;
  path: string[];
  reply: Reply;
  backScreen: ScreenKey;
};

type TextSelectionRange = {
  start: number;
  end: number;
};

type RichFormatAction = "bold" | "bullet" | "quote";

type ProfilePostItem = SearchContentItem & {
  displayRole?: string;
  sortTimestampMs?: number;
};
type ProfileAnswerItem = {
  id: string;
  sourceLabel: string;
  parentTitle: string;
  body: string;
};

type TrendingCoachItem = SearchAccountItem & {
  likes: number;
  reposts: number;
  bookmarks: number;
  bestAnswers: number;
  lastActivityDays: number;
  score: number;
};

type BadgeTier = "bronze" | "silver" | "gold";
type ActivityBadge = {
  id: string;
  label: string;
  tier: BadgeTier;
  description: string;
};
type BadgeModalState = {
  title: string;
  badges: ActivityBadge[];
};
type ExternalLinkModalState = {
  visible: boolean;
  url: string;
  label: string;
};
type NotificationItem = {
  id: string;
  kind: "like" | "reply" | "bookmark" | "repost" | "new-post";
  title: string;
  body: string;
  createdAtMs: number;
  postDetail?: PostDetailState;
};
type UserActivitySummary = {
  postCount: number;
  postingStreakDays: number;
  followerCount: number;
  likesReceived: number;
  repostsReceived: number;
  bookmarksReceived: number;
  repliesReceived: number;
  repliesSent: number;
  bestAnswers: number;
  profileCompletionScore: number;
  badges: ActivityBadge[];
};

const getAvailablePostTargets = (role: string) => {
  if (role.includes("指導員")) {
    return [{ key: "feed" as const, label: "タイムライン" }];
  }

  return [
    { key: "questions" as const, label: "相談広場" },
    { key: "community" as const, label: "コミュニティ" },
  ];
};

const COLLECTIONS = {
  feed: "timeline_posts",
  questions: "question_posts",
  community: "community_posts",
  follows: "follows",
  blocks: "blocks",
  likes: "post_likes",
  reposts: "post_reposts",
  bookmarks: "post_bookmarks",
  alerts: "post_alerts",
  reports: "spam_reports",
} as const;

const POST_TITLE_MAX_LENGTH = 100;
const POST_BODY_MAX_LENGTH = 2000;
const REPLY_BODY_MAX_LENGTH = 2000;
const INITIAL_SELECTION: TextSelectionRange = { start: 0, end: 0 };
const INITIAL_BADGE_MODAL_STATE: BadgeModalState = {
  title: "",
  badges: [],
};
const INITIAL_EXTERNAL_LINK_MODAL_STATE: ExternalLinkModalState = {
  visible: false,
  url: "",
  label: "",
};

const mergeItemsById = <T extends { id: string }>(baseItems: T[], cloudItems: T[]) => {
  const merged = new Map<string, T>();

  cloudItems.forEach((item) => {
    merged.set(item.id, item);
  });
  baseItems.forEach((item) => {
    if (!merged.has(item.id)) {
      merged.set(item.id, item);
    }
  });

  return Array.from(merged.values());
};

const normalizeReplies = (value: unknown): Reply[] => {
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

const toArrayOfStrings = (value: unknown) => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === "string");
};

const normalizeMedia = (value: unknown): MediaAttachment[] => {
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

const serializeMediaForFirestore = (media?: MediaAttachment[]) => {
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

const serializeRepliesForFirestore = (replies: Reply[]) =>
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

const createHandleFromName = (name: string) =>
  `@${name.replace(/\s+/g, "_").replace(/[^\p{L}\p{N}_]/gu, "").toLowerCase()}`;

const normalizeHandle = (value: string) => {
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

const normalizeHashtagLabel = (value: string) =>
  value
    .trim()
    .replace(/^#+/u, "")
    .replace(/[!-/:-@[-`{-~]+$/u, "");

const URL_REGEX = /(https?:\/\/[^\s)]+)(?![^[]*\])/giu;
const MARKDOWN_LINK_REGEX = /\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/giu;
const LIST_BODY_COLLAPSE_LENGTH = 220;

const formatFileSizeLabel = (bytes: number) => {
  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  }

  return `${Math.ceil(bytes / 1024)}KB`;
};

const getMediaSizeLimit = (kind: MediaKind) =>
  kind === "video" ? VIDEO_FILE_SIZE_LIMIT_BYTES : IMAGE_FILE_SIZE_LIMIT_BYTES;

const extractFirstUrl = (content: string) => {
  const markdownMatch = MARKDOWN_LINK_REGEX.exec(content);
  MARKDOWN_LINK_REGEX.lastIndex = 0;
  if (markdownMatch?.[2]) {
    return markdownMatch[2];
  }

  const urlMatch = URL_REGEX.exec(content);
  URL_REGEX.lastIndex = 0;
  return urlMatch?.[1] ?? null;
};

const removeUrlsForPreviewLabel = (value: string) =>
  value
    .replace(MARKDOWN_LINK_REGEX, "$1")
    .replace(URL_REGEX, "")
    .trim();

const buildUrlPreviewLabel = (url: string) => {
  try {
    const hostname = new URL(url).hostname.replace(/^www\./u, "");
    return hostname;
  } catch {
    return "外部サイト";
  }
};

const shouldCollapseBody = (content: string) => content.length > LIST_BODY_COLLAPSE_LENGTH;

const getCollapsedBody = (content: string) =>
  `${content.slice(0, LIST_BODY_COLLAPSE_LENGTH).trimEnd()}...`;

const extractDisplayBodyAndTags = (body: string) => {
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

const getDaysSinceTimestamp = (timestampMs?: number) => {
  if (!timestampMs) {
    return 0;
  }

  return Math.max(0, (Date.now() - timestampMs) / (1000 * 60 * 60 * 24));
};

const getDecayMultiplier = (
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

const getTrendingScore = ({
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

const formatCount = (value: number) => value.toLocaleString("ja-JP");

const parseFollowerCount = (value: string) => {
  const normalized = value.replace(/,/g, "").trim();
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
};

const getAccountSearchScore = (account: Pick<SearchAccountItem, "name" | "handle" | "bio">, query: string) => {
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

const getTrendingCoachScore = ({
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

const countRepliesRecursively = (replies: Reply[]): number =>
  replies.reduce(
    (total, reply) => total + 1 + countRepliesRecursively(reply.replies ?? []),
    0
  );

const getPostingStreakDays = (timestamps: number[]) => {
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

const getProfileCompletionScore = (profile: Pick<ProfileState, "bio" | "link" | "selectedSports" | "handle">) => {
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

const createTieredBadge = ({
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

const applyRichFormatting = (
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

const renderLinkableTextSegments = ({
  text,
  baseStyle,
  boldStyle,
  linkStyle,
  onOpenUrl,
}: {
  text: string;
  baseStyle: object;
  boldStyle: object;
  linkStyle: object;
  onOpenUrl: (url: string, label?: string) => void;
}) => {
  const output: React.ReactNode[] = [];
  let cursor = 0;

  const pushPlainText = (segment: string, keyPrefix: string, isBold: boolean) => {
    if (!segment) {
      return;
    }

    let plainCursor = 0;
    const markdownMatches = Array.from(segment.matchAll(MARKDOWN_LINK_REGEX));
    markdownMatches.forEach((match, index) => {
      const full = match[0] ?? "";
      const label = match[1] ?? "";
      const url = match[2] ?? "";
      const matchIndex = match.index ?? 0;

      if (matchIndex > plainCursor) {
        const before = segment.slice(plainCursor, matchIndex);
        if (before) {
          output.push(
            <Text
              key={`${keyPrefix}-plain-${index}-${plainCursor}`}
              style={isBold ? [baseStyle, boldStyle] : baseStyle}
            >
              {before}
            </Text>
          );
        }
      }

      output.push(
        <Text
          key={`${keyPrefix}-markdown-${index}`}
          style={isBold ? [baseStyle, boldStyle, linkStyle] : [baseStyle, linkStyle]}
          onPress={() => onOpenUrl(url, label)}
        >
          {label}
        </Text>
      );
      plainCursor = matchIndex + full.length;
    });

    const remainingText = segment.slice(plainCursor);
    let rawCursor = 0;
    const rawMatches = Array.from(remainingText.matchAll(URL_REGEX));
    rawMatches.forEach((match, index) => {
      const url = match[1] ?? "";
      const matchIndex = match.index ?? 0;
      if (matchIndex > rawCursor) {
        const before = remainingText.slice(rawCursor, matchIndex);
        if (before) {
          output.push(
            <Text
              key={`${keyPrefix}-raw-plain-${index}-${rawCursor}`}
              style={isBold ? [baseStyle, boldStyle] : baseStyle}
            >
              {before}
            </Text>
          );
        }
      }

      output.push(
        <Text
          key={`${keyPrefix}-raw-link-${index}`}
          style={isBold ? [baseStyle, boldStyle, linkStyle] : [baseStyle, linkStyle]}
          onPress={() => onOpenUrl(url)}
        >
          {url}
        </Text>
      );
      rawCursor = matchIndex + url.length;
    });

    const tail = remainingText.slice(rawCursor);
    if (tail) {
      output.push(
        <Text
          key={`${keyPrefix}-tail-${rawCursor}`}
          style={isBold ? [baseStyle, boldStyle] : baseStyle}
        >
          {tail}
        </Text>
      );
    }
  };

  text.split(/(\*\*[^*]+\*\*)/g).filter(Boolean).forEach((segment, index) => {
    const isBold = segment.startsWith("**") && segment.endsWith("**");
    const displayText = isBold ? segment.slice(2, -2) : segment;
    pushPlainText(displayText, `seg-${index}`, isBold);
    cursor += displayText.length;
  });

  return output;
};

const createCoverToneFromName = (name: string) => {
  const tones = ["#d8c7ad", "#d6d9c4", "#c8ddd7", "#dfc6c0"];
  const total = Array.from(name).reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return tones[total % tones.length];
};

const getRoleLabel = (roleKeyOrLabel: string) => {
  if (roleKeyOrLabel === "advisor" || roleKeyOrLabel.includes("顧問")) {
    return "顧問アカウント";
  }

  if (roleKeyOrLabel === "coach" || roleKeyOrLabel.includes("指導員")) {
    return "指導員アカウント";
  }

  return roleKeyOrLabel || "Komonityユーザー";
};

const formatJoinedLabel = (value: unknown) => {
  if (
    typeof value === "object" &&
    value !== null &&
    "toDate" in value &&
    typeof value.toDate === "function"
  ) {
    const date = value.toDate() as Date;
    return `${date.getFullYear()}年${date.getMonth() + 1}月からKomonityを利用`;
  }

  if (typeof value === "string" && value) {
    return value;
  }

  return myPageProfile.joined;
};

const mapUserDocumentToProfileState = (data: DocumentData): ProfileState => {
  const profile = typeof data.profile === "object" && data.profile ? data.profile : {};
  const profileData = profile as Record<string, unknown>;
  const roleLabel = getRoleLabel(
    typeof data.roleLabel === "string" ? data.roleLabel : String(data.role ?? "")
  );
  const name =
    typeof profileData.nickname === "string" && profileData.nickname
      ? profileData.nickname
      : myPageProfile.name;
  const rawExternalLinks = Array.isArray(profileData.externalLinks)
    ? profileData.externalLinks
    : [];
  const externalLinks = rawExternalLinks.reduce<ExternalLink[]>((accumulator, item, index) => {
    if (typeof item !== "object" || item === null) {
      return accumulator;
    }

    const link = item as { label?: unknown; url?: unknown };
    accumulator.push({
      id: String(index + 1),
      label: typeof link.label === "string" ? link.label : "",
      url: typeof link.url === "string" ? link.url : "",
    });
    return accumulator;
  }, []);

  return {
    name,
    handle:
      typeof profileData.handle === "string" && profileData.handle
        ? profileData.handle
        : createHandleFromName(name),
    role: roleLabel,
    bio:
      typeof profileData.bio === "string" && profileData.bio
        ? profileData.bio
        : myPageProfile.bio,
    link:
      typeof profileData.link === "string" && profileData.link
        ? profileData.link
        : myPageProfile.link,
    externalLinks:
      externalLinks.length > 0 ? externalLinks : myPageProfile.externalLinks,
    joined: formatJoinedLabel(data.createdAt),
    following:
      typeof profileData.following === "string" && profileData.following
        ? profileData.following
        : myPageProfile.following,
    followers:
      typeof profileData.followers === "string" && profileData.followers
        ? profileData.followers
        : myPageProfile.followers,
    posts:
      typeof profileData.posts === "string" && profileData.posts
        ? profileData.posts
        : myPageProfile.posts,
    selectedSports:
      toArrayOfStrings(profileData.selectedSports).length > 0
        ? toArrayOfStrings(profileData.selectedSports)
        : myPageProfile.selectedSports,
  };
};

const userMatchesProfile = ({
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

const replyMatchesProfile = ({
  author,
  targetName,
}: {
  author: string;
  targetName: string;
}) => author === targetName;

const buildFeedDetail = (post: FeedPost): PostDetailState => ({
  id: post.id,
  source: "feed",
  sourceLabel: "タイムライン",
  author: post.author,
  authorHandle: post.authorHandle,
  createdByUid: post.createdByUid,
  role: post.role,
  title: post.title,
  body: post.body,
  media: post.media,
  replies: post.replies,
  likes: post.likes,
  reposts: post.reposts,
  comments: post.comments,
  sports: post.sports,
  tags: post.tags,
  createdAtMs: post.createdAtMs,
});

const buildQuestionDetail = (question: QuestionPost): PostDetailState => ({
  id: question.id,
  source: "questions",
  sourceLabel: "相談広場",
  author: question.author,
  authorHandle: question.authorHandle,
  createdByUid: question.createdByUid,
  role: "顧問アカウント",
  title: question.title,
  body: question.body,
  media: question.media,
  replies: question.replies,
  answers: question.answers,
  bestAnswer: question.bestAnswer,
  bestAnswerReplyId: question.bestAnswerReplyId,
  sports: [question.category],
  tags: ["相談", question.category],
  createdAtMs: question.createdAtMs,
});

const buildCommunityDetail = (item: CommunityPost): PostDetailState => ({
  id: item.id,
  source: "community",
  sourceLabel: "コミュニティ",
  author: item.author,
  authorHandle: item.authorHandle,
  createdByUid: item.createdByUid,
  role: "コミュニティ投稿",
  title: item.title,
  body: item.body,
  media: item.media,
  replies: item.replies,
  sports: [],
  tags: ["コミュニティ"],
  createdAtMs: item.createdAtMs,
});

const buildInteractionRecord = ({
  id,
  userUid,
  postId,
  source,
  createdAtMs,
}: InteractionRecord) => ({
  id,
  userUid,
  postId,
  source,
  createdAtMs,
});

const getPostCollectionFromSource = (source: SearchContentFilterKey) => {
  if (source === "feed") {
    return COLLECTIONS.feed;
  }

  if (source === "questions") {
    return COLLECTIONS.questions;
  }

  return COLLECTIONS.community;
};

const getBestAnswerReplyForQuestion = (question: QuestionPost) => {
  if (question.bestAnswerReplyId) {
    return question.replies.find((reply) => reply.id === question.bestAnswerReplyId);
  }

  if (!question.bestAnswer || question.bestAnswer === "まだベストアンサーはありません。") {
    return undefined;
  }

  return question.replies.find((reply) => reply.body === question.bestAnswer);
};

const buildReplyInteractionPostId = (rootPostId: string, path: string[]) =>
  `reply:${rootPostId}:${path.join(":")}`;

const findReplyByPath = (replies: Reply[], path: string[]): Reply | undefined => {
  if (path.length === 0) {
    return undefined;
  }

  const [currentId, ...rest] = path;
  const currentReply = replies.find((reply) => reply.id === currentId);
  if (!currentReply) {
    return undefined;
  }

  if (rest.length === 0) {
    return currentReply;
  }

  return findReplyByPath(currentReply.replies ?? [], rest);
};

const appendReplyToPath = (
  replies: Reply[],
  path: string[],
  nextReply: Reply
): Reply[] => {
  if (path.length === 0) {
    return [...replies, nextReply];
  }

  const [currentId, ...rest] = path;
  return replies.map((reply) => {
    if (reply.id !== currentId) {
      return reply;
    }

    const currentChildren = reply.replies ?? [];
    return {
      ...reply,
      replies:
        rest.length === 0
          ? [...currentChildren, nextReply]
          : appendReplyToPath(currentChildren, rest, nextReply),
    };
  });
};

const mergeProfilePostItems = (baseItems: ProfilePostItem[], extraItems: ProfilePostItem[]) => {
  const merged = new Map<string, ProfilePostItem>();

  baseItems.forEach((item) => {
    merged.set(item.id, item);
  });
  extraItems.forEach((item) => {
    merged.set(item.id, item);
  });

  return Array.from(merged.values());
};

const flattenReplyItems = ({
  replies,
  source,
  sourceLabel,
  parentTitle,
  rootPostId,
  path = [],
}: {
  replies: Reply[];
  source: SearchContentFilterKey;
  sourceLabel: string;
  parentTitle: string;
  rootPostId: string;
  path?: string[];
}): Array<{
  interactionPostId: string;
  rootPostId: string;
  source: SearchContentFilterKey;
  sourceLabel: string;
  parentTitle: string;
  path: string[];
  reply: Reply;
}> =>
  replies.flatMap((reply) => {
    const nextPath = [...path, reply.id];
    const interactionPostId = buildReplyInteractionPostId(rootPostId, nextPath);
    const currentItem = {
      interactionPostId,
      rootPostId,
      source,
      sourceLabel,
      parentTitle,
      path: nextPath,
      reply,
    };

    return [
      currentItem,
      ...flattenReplyItems({
        replies: reply.replies ?? [],
        source,
        sourceLabel,
        parentTitle,
        rootPostId,
        path: nextPath,
      }),
    ];
  });

const toTimestampMs = (value: unknown) => {
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

const formatDateTimeWithSeconds = (timestampMs?: number) => {
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

const createLinkRow = (id: number): ExternalLink => ({
  id: `link-${id}`,
  label: "",
  url: "",
});

const initialAdvisorForm: AdvisorFormState = {
  nickname: "",
  handle: "",
  club: "",
  experience: "",
  loginEmail: "",
  loginPassword: "",
  selectedSports: [],
};

const initialCoachForm: CoachFormState = {
  nickname: "",
  handle: "",
  specialty: "",
  experience: "",
  achievements: "",
  phone: "",
  publicEmail: "",
  loginEmail: "",
  loginPassword: "",
  selectedSports: [],
};

const initialLoginForm: LoginFormState = {
  email: "",
  password: "",
};

const FIRESTORE_SAVE_TIMEOUT_MS = 8000;
const IMAGE_FILE_SIZE_LIMIT_BYTES = 10 * 1024 * 1024;
const VIDEO_FILE_SIZE_LIMIT_BYTES = 100 * 1024 * 1024;
const initialComposeState: ComposeState = {
  target: "feed",
  title: "",
  body: "",
  selectedSports: [],
};
const searchContentFilters: Array<{
  key: SearchContentFilterKey;
  label: string;
}> = [
  { key: "all", label: "全て" },
  { key: "feed", label: "タイムライン" },
  { key: "questions", label: "相談広場" },
  { key: "community", label: "コミュニティ" },
];
const initialSelectedUserProfile: UserProfileState = {
  ...myPageProfile,
  avatarLabel: myPageProfile.name.slice(0, 1),
  coverTone: "#d8c7ad",
};
const initialRelationshipListState: RelationshipListState = {
  mode: "following",
  title: "フォロー一覧",
  accounts: [],
  backScreen: "user-profile",
};
const initialPostDetailState: PostDetailState = {
  id: "",
  source: "feed",
  sourceLabel: "タイムライン",
  author: "",
  role: "",
  title: "",
  body: "",
  replies: [],
  sports: [],
  tags: [],
};
const initialReplyDetailState: ReplyDetailState = {
  rootPostId: "",
  source: "feed",
  sourceLabel: "タイムライン",
  path: [],
  reply: {
    id: "",
    author: "",
    body: "",
    replies: [],
  },
  backScreen: "post-detail",
};

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenKey>("top");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [advisorIconUri, setAdvisorIconUri] = useState<string | null>(null);
  const [coachIconUri, setCoachIconUri] = useState<string | null>(null);
  const [coachLinks, setCoachLinks] = useState<ExternalLink[]>([
    createLinkRow(1),
  ]);
  const [advisorForm, setAdvisorForm] =
    useState<AdvisorFormState>(initialAdvisorForm);
  const [coachForm, setCoachForm] = useState<CoachFormState>(initialCoachForm);
  const [loginForm, setLoginForm] = useState<LoginFormState>(initialLoginForm);
  const [profileState, setProfileState] = useState<ProfileState>(myPageProfile);
  const [profileDraft, setProfileDraft] = useState<ProfileState>(myPageProfile);
  const [selectedUserProfile, setSelectedUserProfile] =
    useState<UserProfileState>(initialSelectedUserProfile);
  const [relationshipListState, setRelationshipListState] =
    useState<RelationshipListState>(initialRelationshipListState);
  const [postDetail, setPostDetail] = useState<PostDetailState>(initialPostDetailState);
  const [postDetailBackScreen, setPostDetailBackScreen] =
    useState<ScreenKey>("feed");
  const [replyDetail, setReplyDetail] = useState<ReplyDetailState>(initialReplyDetailState);
  const [replyDraft, setReplyDraft] = useState("");
  const [replyMedia, setReplyMedia] = useState<LocalMediaAsset[]>([]);
  const [replySelection, setReplySelection] = useState<TextSelectionRange>(INITIAL_SELECTION);
  const [bestAnswerCandidate, setBestAnswerCandidate] = useState<Reply | null>(null);
  const [badgeModalState, setBadgeModalState] =
    useState<BadgeModalState>(INITIAL_BADGE_MODAL_STATE);
  const [externalLinkModalState, setExternalLinkModalState] =
    useState<ExternalLinkModalState>(INITIAL_EXTERNAL_LINK_MODAL_STATE);
  const [directoryAccounts, setDirectoryAccounts] = useState<SearchAccountItem[]>([]);
  const [directoryMetaMap, setDirectoryMetaMap] = useState<Record<string, UserDirectoryMeta>>({});
  const [followRecords, setFollowRecords] = useState<FollowRecord[]>([]);
  const [blockRecords, setBlockRecords] = useState<BlockRecord[]>([]);
  const [postAlertRecords, setPostAlertRecords] = useState<PostAlertRecord[]>([]);
  const [likeRecords, setLikeRecords] = useState<InteractionRecord[]>([]);
  const [repostRecords, setRepostRecords] = useState<InteractionRecord[]>([]);
  const [bookmarkRecords, setBookmarkRecords] = useState<InteractionRecord[]>([]);
  const [feedTimeline, setFeedTimeline] = useState<FeedPost[]>(feedPosts);
  const [questionBoard, setQuestionBoard] = useState<QuestionPost[]>(questions);
  const [communityBoard, setCommunityBoard] =
    useState<CommunityPost[]>(communityItems);
  const [composeState, setComposeState] = useState<ComposeState>(initialComposeState);
  const [composeMedia, setComposeMedia] = useState<LocalMediaAsset[]>([]);
  const [composeBodySelection, setComposeBodySelection] =
    useState<TextSelectionRange>(INITIAL_SELECTION);
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSearchTab, setActiveSearchTab] =
    useState<SearchTabKey>("trending-posts");
  const [activeSearchContentFilter, setActiveSearchContentFilter] =
    useState<SearchContentFilterKey>("all");
  const [activeProfileTab, setActiveProfileTab] = useState<ProfileTabKey>("posts");
  const [authMessage, setAuthMessage] = useState("");
  const [authError, setAuthError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isReplySubmitting, setIsReplySubmitting] = useState(false);
  const [expandedBodyIds, setExpandedBodyIds] = useState<string[]>([]);
  const [pinnedPostKey, setPinnedPostKey] = useState<string | null>(null);

  useEffect(() => {
    if (!auth) {
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAuthUser(user);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!authUser || !db) {
      if (!authUser) {
        setProfileState(myPageProfile);
        setProfileDraft(myPageProfile);
      }
      return;
    }

    const unsubscribeUser = onSnapshot(
      doc(db, "users", authUser.uid),
      (snapshot) => {
        if (!snapshot.exists()) {
          return;
        }

        const data = snapshot.data();
        const nextProfile = mapUserDocumentToProfileState(data);
        setProfileState(nextProfile);
        setProfileDraft(nextProfile);
        const profile =
          typeof data.profile === "object" && data.profile ? data.profile : {};
        const profileData = profile as Record<string, unknown>;
        if (
          typeof profileData.pinnedPostId === "string" &&
          (profileData.pinnedPostSource === "feed" ||
            profileData.pinnedPostSource === "questions" ||
            profileData.pinnedPostSource === "community")
        ) {
          setPinnedPostKey(`${profileData.pinnedPostSource}:${profileData.pinnedPostId}`);
        } else {
          setPinnedPostKey(null);
        }
      },
      (error) => {
        setAuthError(
          `プロフィール読込に失敗しました。${toSaveErrorMessage(error)}`
        );
      }
    );

    return unsubscribeUser;
  }, [authUser, db]);

  useEffect(() => {
    if (!db) {
      setDirectoryAccounts([]);
      return;
    }

    const unsubscribeUsers = onSnapshot(
      collection(db, "users"),
      (snapshot) => {
        const nextMetaMap: Record<string, UserDirectoryMeta> = {};
        const firestoreAccounts: SearchAccountItem[] = snapshot.docs.map((entry) => {
          const data = entry.data();
          const profile =
            typeof data.profile === "object" && data.profile ? data.profile : {};
          const profileData = profile as Record<string, unknown>;
          const name =
            typeof profileData.nickname === "string" && profileData.nickname
              ? profileData.nickname
              : "Komonityユーザー";
          const externalLinks = Array.isArray(profileData.externalLinks)
            ? profileData.externalLinks
                .map((item, index) => {
                  if (typeof item !== "object" || item === null) {
                    return null;
                  }
                  const link = item as { label?: unknown; url?: unknown };
                  return {
                    id: `link-${index + 1}`,
                    label: typeof link.label === "string" ? link.label : "",
                    url: typeof link.url === "string" ? link.url : "",
                  };
                })
                .filter((item): item is ExternalLink => Boolean(item))
            : [];

          nextMetaMap[entry.id] = {
            externalLinks,
            pinnedPostId:
              typeof profileData.pinnedPostId === "string"
                ? profileData.pinnedPostId
                : undefined,
            pinnedPostSource:
              profileData.pinnedPostSource === "feed" ||
              profileData.pinnedPostSource === "questions" ||
              profileData.pinnedPostSource === "community"
                ? profileData.pinnedPostSource
                : undefined,
          };

          return {
            id: entry.id,
            name,
            handle:
              typeof profileData.handle === "string" && profileData.handle
                ? profileData.handle
                : createHandleFromName(name),
            bio:
              typeof profileData.bio === "string" && profileData.bio
                ? profileData.bio
                : typeof profileData.achievements === "string" &&
                    profileData.achievements
                  ? profileData.achievements
                  : typeof profileData.club === "string" && profileData.club
                    ? `${profileData.club} を中心に活動しています。`
                    : "Komonity で活動中です。",
            followers:
              typeof profileData.followers === "string" && profileData.followers
                ? profileData.followers
                : "0",
            featured: false,
            role: getRoleLabel(
              typeof data.roleLabel === "string"
                ? data.roleLabel
                : String(data.role ?? "")
            ),
            selectedSports: toArrayOfStrings(profileData.selectedSports),
          };
        });

        setDirectoryAccounts(firestoreAccounts);
        setDirectoryMetaMap(nextMetaMap);
      },
      (error) => {
        setDirectoryAccounts([]);
        setDirectoryMetaMap({});
        setAuthError(
          `公開プロフィールの読込に失敗しました。${toSaveErrorMessage(error)}`
        );
      }
    );

    return unsubscribeUsers;
  }, [db]);

  useEffect(() => {
    if (!db || !authUser) {
      setFollowRecords([]);
      return;
    }

    const unsubscribeFollows = onSnapshot(
      collection(db, COLLECTIONS.follows),
      (snapshot) => {
        const nextFollows: FollowRecord[] = snapshot.docs
          .map((entry) => {
            const data = entry.data();
            if (
              typeof data.followerUid !== "string" ||
              typeof data.followingUid !== "string"
            ) {
              return null;
            }

            return {
              id: entry.id,
              followerUid: data.followerUid,
              followingUid: data.followingUid,
            };
          })
          .filter((item): item is FollowRecord => Boolean(item));

        setFollowRecords(nextFollows);
      },
      () => {
        setFollowRecords([]);
      }
    );

    return unsubscribeFollows;
  }, [authUser, db]);

  useEffect(() => {
    if (!db || !authUser) {
      setBlockRecords([]);
      setPostAlertRecords([]);
      return;
    }

    const unsubscribeBlocks = onSnapshot(
      collection(db, COLLECTIONS.blocks),
      (snapshot) => {
        const nextBlocks = snapshot.docs.reduce<BlockRecord[]>((accumulator, entry) => {
          const data = entry.data();
          if (
            typeof data.blockerUid !== "string" ||
            typeof data.blockedUid !== "string"
          ) {
            return accumulator;
          }

          accumulator.push({
            id: entry.id,
            blockerUid: data.blockerUid,
            blockedUid: data.blockedUid,
          });
          return accumulator;
        }, []);

        setBlockRecords(nextBlocks);
      },
      () => {
        setBlockRecords([]);
      }
    );

    const unsubscribeAlerts = onSnapshot(
      collection(db, COLLECTIONS.alerts),
      (snapshot) => {
        const nextAlerts = snapshot.docs.reduce<PostAlertRecord[]>((accumulator, entry) => {
          const data = entry.data();
          if (
            typeof data.watcherUid !== "string" ||
            typeof data.targetUid !== "string"
          ) {
            return accumulator;
          }

          accumulator.push({
            id: entry.id,
            watcherUid: data.watcherUid,
            targetUid: data.targetUid,
          });
          return accumulator;
        }, []);

        setPostAlertRecords(nextAlerts);
      },
      () => {
        setPostAlertRecords([]);
      }
    );

    return () => {
      unsubscribeBlocks();
      unsubscribeAlerts();
    };
  }, [authUser, db]);

  useEffect(() => {
    if (!db) {
      setLikeRecords([]);
      setRepostRecords([]);
      if (!authUser) {
        setBookmarkRecords([]);
      }
      return;
    }

    const unsubscribeLikes = onSnapshot(
      collection(db, COLLECTIONS.likes),
      (snapshot) => {
        const nextRecords = snapshot.docs.reduce<InteractionRecord[]>((accumulator, entry) => {
            const data = entry.data();
            if (
              typeof data.userUid !== "string" ||
              typeof data.postId !== "string" ||
              (data.source !== "feed" &&
                data.source !== "questions" &&
                data.source !== "community")
            ) {
              return accumulator;
            }

            accumulator.push({
              id: entry.id,
              userUid: data.userUid,
              postId: data.postId,
              source: data.source,
              createdAtMs: toTimestampMs(data.createdAt),
            });

            return accumulator;
          }, []);

        setLikeRecords(nextRecords);
      },
      () => {
        setLikeRecords([]);
      }
    );

    const unsubscribeReposts = onSnapshot(
      collection(db, COLLECTIONS.reposts),
      (snapshot) => {
        const nextRecords = snapshot.docs.reduce<InteractionRecord[]>((accumulator, entry) => {
            const data = entry.data();
            if (
              typeof data.userUid !== "string" ||
              typeof data.postId !== "string" ||
              (data.source !== "feed" &&
                data.source !== "questions" &&
                data.source !== "community")
            ) {
              return accumulator;
            }

            accumulator.push({
              id: entry.id,
              userUid: data.userUid,
              postId: data.postId,
              source: data.source,
              createdAtMs: toTimestampMs(data.createdAt),
            });

            return accumulator;
          }, []);

        setRepostRecords(nextRecords);
      },
      () => {
        setRepostRecords([]);
      }
    );

    const unsubscribeBookmarks = authUser
      ? onSnapshot(
          collection(db, COLLECTIONS.bookmarks),
          (snapshot) => {
            const nextRecords = snapshot.docs.reduce<InteractionRecord[]>(
              (accumulator, entry) => {
                const data = entry.data();
                if (
                  typeof data.userUid !== "string" ||
                  data.userUid !== authUser.uid ||
                  typeof data.postId !== "string" ||
                  (data.source !== "feed" &&
                    data.source !== "questions" &&
                    data.source !== "community")
                ) {
                  return accumulator;
                }

                accumulator.push({
                  id: entry.id,
                  userUid: data.userUid,
                  postId: data.postId,
                  source: data.source,
                  createdAtMs: toTimestampMs(data.createdAt),
                });

                return accumulator;
              },
              []
            );

            setBookmarkRecords(nextRecords);
          },
          () => {
            setBookmarkRecords([]);
          }
        )
      : () => {
          setBookmarkRecords([]);
        };

    return () => {
      unsubscribeLikes();
      unsubscribeReposts();
      unsubscribeBookmarks();
    };
  }, [authUser, db]);

  useEffect(() => {
    if (!db) {
      return;
    }

    const feedQuery = query(
      collection(db, COLLECTIONS.feed),
      orderBy("createdAt", "desc")
    );
    const questionQuery = query(
      collection(db, COLLECTIONS.questions),
      orderBy("createdAt", "desc")
    );
    const communityQuery = query(
      collection(db, COLLECTIONS.community),
      orderBy("createdAt", "desc")
    );

    const unsubscribeFeed = onSnapshot(feedQuery, (snapshot) => {
      const firestorePosts: FeedPost[] = snapshot.docs.map((entry) => {
        const data = entry.data();

        return {
          id: entry.id,
          author:
            typeof data.author === "string" ? data.author : "Komonityユーザー",
          authorHandle:
            typeof data.authorHandle === "string" ? data.authorHandle : undefined,
          createdByUid:
            typeof data.createdByUid === "string" ? data.createdByUid : undefined,
          role:
            typeof data.role === "string" ? data.role : "一般アカウント",
          title: typeof data.title === "string" ? data.title : "",
          body: typeof data.body === "string" ? data.body : "",
          tags: toArrayOfStrings(data.tags),
          sports: toArrayOfStrings(data.sports),
          likes: typeof data.likes === "number" ? data.likes : 0,
          reposts: typeof data.reposts === "number" ? data.reposts : 0,
          comments: typeof data.comments === "number" ? data.comments : 0,
          replies: normalizeReplies(data.replies),
          media: normalizeMedia(data.media),
          createdAtMs: toTimestampMs(data.createdAt),
        };
      });

      setFeedTimeline(mergeItemsById(feedPosts, firestorePosts));
    });

    const unsubscribeQuestions = onSnapshot(questionQuery, (snapshot) => {
      const firestoreQuestions: QuestionPost[] = snapshot.docs.map((entry) => {
        const data = entry.data();

        return {
          id: entry.id,
          category:
            typeof data.category === "string" ? data.category : "その他",
          authorHandle:
            typeof data.authorHandle === "string" ? data.authorHandle : undefined,
          createdByUid:
            typeof data.createdByUid === "string" ? data.createdByUid : undefined,
          title: typeof data.title === "string" ? data.title : "",
          body: typeof data.body === "string" ? data.body : "",
          author:
            typeof data.author === "string" ? data.author : "Komonityユーザー",
          answers: typeof data.answers === "number" ? data.answers : 0,
          bestAnswer:
            typeof data.bestAnswer === "string"
              ? data.bestAnswer
              : "まだベストアンサーはありません。",
          bestAnswerReplyId:
            typeof data.bestAnswerReplyId === "string"
              ? data.bestAnswerReplyId
              : undefined,
          replies: normalizeReplies(data.replies),
          media: normalizeMedia(data.media),
          createdAtMs: toTimestampMs(data.createdAt),
        };
      });

      setQuestionBoard(mergeItemsById(questions, firestoreQuestions));
    });

    const unsubscribeCommunity = onSnapshot(communityQuery, (snapshot) => {
      const firestoreCommunities: CommunityPost[] = snapshot.docs.map((entry) => {
        const data = entry.data();

        return {
          id: entry.id,
          title: typeof data.title === "string" ? data.title : "",
          author:
            typeof data.author === "string" ? data.author : "Komonityユーザー",
          authorHandle:
            typeof data.authorHandle === "string" ? data.authorHandle : undefined,
          createdByUid:
            typeof data.createdByUid === "string" ? data.createdByUid : undefined,
          body: typeof data.body === "string" ? data.body : "",
          cta: typeof data.cta === "string" ? data.cta : "スレッドを見る",
          replies: normalizeReplies(data.replies),
          media: normalizeMedia(data.media),
          createdAtMs: toTimestampMs(data.createdAt),
        };
      });

      setCommunityBoard(mergeItemsById(communityItems, firestoreCommunities));
    });

    return () => {
      unsubscribeFeed();
      unsubscribeQuestions();
      unsubscribeCommunity();
    };
  }, []);

  const clearAuthFeedback = () => {
    setAuthError("");
    setAuthMessage("");
  };

  const goToScreen = (screen: ScreenKey) => {
    if (screen === "profile-edit") {
      setProfileDraft(profileState);
    }
    if (screen === "post-compose") {
      setComposeState({
        ...initialComposeState,
        target: profileState.role.includes("指導員") ? "feed" : "questions",
      });
      setComposeMedia([]);
      setComposeBodySelection(INITIAL_SELECTION);
    }
    setCurrentScreen(screen);
    setIsMenuOpen(false);
  };

  const openSearchWithQuery = (query: string) => {
    setSearchQuery(query);
    setActiveSearchTab("trending-posts");
    setActiveSearchContentFilter("all");
    setCurrentScreen("search");
    setIsMenuOpen(false);
  };

  const renderHashtagChips = (tags: string[]) => {
    if (tags.length === 0) {
      return null;
    }

    return (
      <View style={styles.tagRow}>
        {tags.map((tag) => (
          <Pressable
            key={tag}
            style={styles.tag}
            onPress={() => openSearchWithQuery(tag)}
          >
            <Text style={styles.tagText}>#{tag}</Text>
          </Pressable>
        ))}
      </View>
    );
  };

  const completeAuthSuccess = (message: string) => {
    setAuthMessage(message);
    setCurrentScreen("mypage");
    setIsSubmitting(false);
  };

  const saveProfileDocument = async (uid: string, data: object) => {
    if (!db) {
      return;
    }

    await Promise.race([
      setDoc(doc(db, "users", uid), data, { merge: true }),
      new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error("firestore-save-timeout"));
        }, FIRESTORE_SAVE_TIMEOUT_MS);
      }),
    ]);
  };

  const updateAdvisorForm = (key: keyof AdvisorFormState, value: string) => {
    clearAuthFeedback();
    setAdvisorForm((current) => ({ ...current, [key]: value }));
  };

  const updateCoachForm = (key: keyof CoachFormState, value: string) => {
    clearAuthFeedback();
    setCoachForm((current) => ({ ...current, [key]: value }));
  };

  const updateLoginForm = (key: keyof LoginFormState, value: string) => {
    clearAuthFeedback();
    setLoginForm((current) => ({ ...current, [key]: value }));
  };

  const toggleExpandedBody = (id: string) => {
    setExpandedBodyIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    );
  };

  const requestOpenExternalUrl = (url: string, label?: string) => {
    clearAuthFeedback();
    const nextUrl = /^https?:\/\//u.test(url) ? url : `https://${url}`;
    setExternalLinkModalState({
      visible: true,
      url: nextUrl,
      label: label ?? buildUrlPreviewLabel(nextUrl),
    });
  };

  const closeExternalLinkModal = () => {
    setExternalLinkModalState(INITIAL_EXTERNAL_LINK_MODAL_STATE);
  };

  const confirmOpenExternalUrl = async () => {
    const { url } = externalLinkModalState;
    if (!url) {
      closeExternalLinkModal();
      return;
    }

    try {
      if (Platform.OS === "web" && typeof window !== "undefined") {
        window.open(url, "_blank", "noopener,noreferrer");
      } else {
        await Linking.openURL(url);
      }
    } catch {
      setAuthError("外部サイトを開けませんでした。URLを確認してください。");
    } finally {
      closeExternalLinkModal();
    }
  };

  const pickImage = async (target: "advisor" | "coach") => {
    clearAuthFeedback();

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setAuthError("画像ライブラリへのアクセス権限が必要です。");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (result.canceled) {
      return;
    }

    const selectedAsset = result.assets[0];
    if (
      selectedAsset?.fileSize &&
      selectedAsset.fileSize > IMAGE_FILE_SIZE_LIMIT_BYTES
    ) {
      setAuthError(
        `画像は10MB以下のファイルを選択してください。現在のサイズ: ${formatFileSizeLabel(
          selectedAsset.fileSize
        )}`
      );
      return;
    }

    const assetUri = selectedAsset?.uri ?? null;
    if (target === "advisor") {
      setAdvisorIconUri(assetUri);
      return;
    }

    setCoachIconUri(assetUri);
  };

  const pickMediaAssets = async ({
    onPicked,
    limit,
  }: {
    onPicked: (assets: LocalMediaAsset[]) => void;
    limit: number;
  }) => {
    clearAuthFeedback();

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setAuthError("画像・動画ライブラリへのアクセス権限が必要です。");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: false,
      quality: 0.8,
    });

    if (result.canceled) {
      return;
    }

    const pickedAssets: LocalMediaAsset[] = [];
    const skippedAssets: string[] = [];

    (result.assets ?? []).forEach((asset, index) => {
      if (!asset.uri) {
        return;
      }

      const kind: MediaKind = asset.type === "video" ? "video" : "image";
      const sizeLimit = getMediaSizeLimit(kind);
      if (asset.fileSize && asset.fileSize > sizeLimit) {
        skippedAssets.push(
          `${asset.fileName ?? `${kind}-${index + 1}`} (${kind === "video" ? "100MB" : "10MB"}超過)`
        );
        return;
      }

      pickedAssets.push({
        id: `${Date.now()}-${index}`,
        uri: asset.uri,
        kind,
        fileName:
          asset.fileName ??
          `${asset.type === "video" ? "video" : "image"}-${Date.now()}-${index}`,
        mimeType: asset.mimeType,
        width: asset.width,
        height: asset.height,
        sizeBytes: asset.fileSize,
      });
    });

    if (pickedAssets.length === 0 && skippedAssets.length > 0) {
      setAuthError(
        "選択したファイルはサイズ上限を超えています。画像は10MB以下、動画は100MB以下にしてください。"
      );
      return;
    }

    if (skippedAssets.length > 0) {
      setAuthError(
        `一部のファイルは追加されませんでした。画像は10MB以下、動画は100MB以下にしてください。対象: ${skippedAssets.join(
          "、"
        )}`
      );
    }

    onPicked(pickedAssets.slice(0, limit));
  };

  const pickComposeMedia = async () => {
    await pickMediaAssets({
      limit: 4,
      onPicked: (assets) => {
        setComposeMedia((current) => [...current, ...assets].slice(0, 4));
      },
    });
  };

  const pickReplyMedia = async () => {
    await pickMediaAssets({
      limit: 4,
      onPicked: (assets) => {
        setReplyMedia((current) => [...current, ...assets].slice(0, 4));
      },
    });
  };

  const removeComposeMedia = (id: string) => {
    setComposeMedia((current) => current.filter((item) => item.id !== id));
  };

  const removeReplyMedia = (id: string) => {
    setReplyMedia((current) => current.filter((item) => item.id !== id));
  };

  const uploadMediaAssets = async ({
    uid,
    media,
    folder,
  }: {
    uid: string;
    media: LocalMediaAsset[];
    folder: "post-media" | "reply-media";
  }) => {
    if (!storage || media.length === 0) {
      return [];
    }

    const currentStorage = storage;

    const uploads = await Promise.all(
      media.map(async (asset, index) => {
        const response = await fetch(asset.uri);
        const blob = await response.blob();
        const safeName = asset.fileName.replace(/\s+/g, "-");
        const storagePath = `${folder}/${uid}/${Date.now()}-${index}-${safeName}`;
        const mediaRef = ref(currentStorage, storagePath);

        await uploadBytes(mediaRef, blob, {
          contentType: asset.mimeType ?? undefined,
        });

        const url = await getDownloadURL(mediaRef);

        return {
          kind: asset.kind,
          url,
          fileName: asset.fileName,
          mimeType: asset.mimeType,
          storagePath,
          width: asset.width,
          height: asset.height,
        } satisfies MediaAttachment;
      })
    );

    return uploads;
  };

  const uploadComposeMedia = async (uid: string) =>
    uploadMediaAssets({ uid, media: composeMedia, folder: "post-media" });

  const uploadReplyMedia = async (uid: string) =>
    uploadMediaAssets({ uid, media: replyMedia, folder: "reply-media" });

  const addCoachLink = () => {
    setCoachLinks((current) => [...current, createLinkRow(current.length + 1)]);
  };

  const updateCoachLink = (
    id: string,
    key: keyof Omit<ExternalLink, "id">,
    value: string
  ) => {
    clearAuthFeedback();
    setCoachLinks((current) =>
      current.map((link) => (link.id === id ? { ...link, [key]: value } : link))
    );
  };

  const toggleAdvisorSport = (sport: string) => {
    clearAuthFeedback();
    setAdvisorForm((current) => ({
      ...current,
      selectedSports: current.selectedSports.includes(sport)
        ? current.selectedSports.filter((item) => item !== sport)
        : [...current.selectedSports, sport],
    }));
  };

  const toggleCoachSport = (sport: string) => {
    clearAuthFeedback();
    setCoachForm((current) => ({
      ...current,
      selectedSports: current.selectedSports.includes(sport)
        ? current.selectedSports.filter((item) => item !== sport)
        : [...current.selectedSports, sport],
    }));
  };

  const toggleProfileSport = (sport: string) => {
    setProfileDraft((current) => ({
      ...current,
      selectedSports: current.selectedSports.includes(sport)
        ? current.selectedSports.filter((item) => item !== sport)
        : [...current.selectedSports, sport],
    }));
  };

  const updateProfileDraft = (
    key: Exclude<keyof ProfileState, "selectedSports" | "externalLinks">,
    value: string
  ) => {
    setProfileDraft((current) => ({ ...current, [key]: value }));
  };

  const registerAdvisor = async () => {
    clearAuthFeedback();

    if (!hasAuthConfig || !auth || !db) {
      setAuthError("認証設定が未完了です。管理者に設定状況を確認してください。");
      return;
    }

    if (
      !advisorForm.nickname ||
      !advisorForm.handle ||
      !advisorForm.club ||
      !advisorForm.experience ||
      !advisorForm.loginEmail ||
      !advisorForm.loginPassword ||
      advisorForm.selectedSports.length === 0
    ) {
      setAuthError("顧問登録に必要な必須項目と表示したい種目を入力してください。");
      return;
    }

    const normalizedAdvisorHandle = normalizeHandle(advisorForm.handle);
    if (!normalizedAdvisorHandle) {
      setAuthError("表示IDは @ を含む英数字ベースで入力してください。");
      return;
    }

    setIsSubmitting(true);
    try {
      const credential = await createUserWithEmailAndPassword(
        auth,
        advisorForm.loginEmail,
        advisorForm.loginPassword
      );

      completeAuthSuccess(
        "顧問アカウントを登録し、ログイン済みの状態でマイページへ移動しました。"
      );
      const nextProfile = {
        ...profileState,
        name: advisorForm.nickname,
        handle: normalizedAdvisorHandle,
        role: "顧問アカウント",
        bio: `${advisorForm.club} を担当中。必要な種目を横断して情報収集しながら運営しています。`,
        link: `komonity.jp/profile/${advisorForm.nickname
          .replace(/\s+/g, "-")
          .toLowerCase()}`,
        externalLinks: [],
        selectedSports: advisorForm.selectedSports,
      };
      setProfileState(nextProfile);
      setProfileDraft(nextProfile);

      try {
        await saveProfileDocument(credential.user.uid, {
          role: "advisor",
          roleLabel: "顧問アカウント",
          profile: {
            nickname: advisorForm.nickname,
            handle: nextProfile.handle,
            club: advisorForm.club,
            experience: advisorForm.experience,
            bio: nextProfile.bio,
            link: nextProfile.link,
            following: nextProfile.following,
            followers: nextProfile.followers,
            posts: nextProfile.posts,
            selectedSports: advisorForm.selectedSports,
            iconPreviewEnabled: Boolean(advisorIconUri),
          },
          auth: {
            loginEmail: advisorForm.loginEmail,
          },
          createdAt: serverTimestamp(),
        });
      } catch (error) {
        setAuthError(
          `ログインは完了しましたが、プロフィール保存に失敗しました。${toSaveErrorMessage(
            error
          )}`
        );
      }

      setAdvisorForm(initialAdvisorForm);
      setAdvisorIconUri(null);
    } catch (error) {
      setAuthError(toAuthErrorMessage(error));
      setIsSubmitting(false);
    }
  };

  const registerCoach = async () => {
    clearAuthFeedback();

    if (!hasAuthConfig || !auth || !db) {
      setAuthError("認証設定が未完了です。管理者に設定状況を確認してください。");
      return;
    }

    if (
      !coachForm.nickname ||
      !coachForm.handle ||
      !coachForm.specialty ||
      !coachForm.experience ||
      !coachForm.achievements ||
      !coachForm.loginEmail ||
      !coachForm.loginPassword ||
      coachForm.selectedSports.length === 0
    ) {
      setAuthError("指導員登録に必要な必須項目と表示したい種目を入力してください。");
      return;
    }

    const filteredLinks = coachLinks.filter((link) => link.label && link.url);
    const normalizedCoachHandle = normalizeHandle(coachForm.handle);
    if (!normalizedCoachHandle) {
      setAuthError("表示IDは @ を含む英数字ベースで入力してください。");
      return;
    }

    setIsSubmitting(true);
    try {
      const credential = await createUserWithEmailAndPassword(
        auth,
        coachForm.loginEmail,
        coachForm.loginPassword
      );

      completeAuthSuccess(
        "指導員アカウントを登録し、ログイン済みの状態でマイページへ移動しました。"
      );
      const nextProfile = {
        ...profileState,
        name: coachForm.nickname,
        handle: normalizedCoachHandle,
        role: "指導員アカウント",
        bio: coachForm.achievements,
        link: `komonity.jp/profile/${coachForm.nickname
          .replace(/\s+/g, "-")
          .toLowerCase()}`,
        externalLinks: filteredLinks,
        selectedSports: coachForm.selectedSports,
      };
      setProfileState(nextProfile);
      setProfileDraft(nextProfile);

      try {
        await saveProfileDocument(credential.user.uid, {
          role: "coach",
          roleLabel: "指導員アカウント",
          profile: {
            nickname: coachForm.nickname,
            handle: nextProfile.handle,
            specialty: coachForm.specialty,
            experience: coachForm.experience,
            achievements: coachForm.achievements,
            phone: coachForm.phone,
            publicEmail: coachForm.publicEmail,
            bio: nextProfile.bio,
            link: nextProfile.link,
            following: nextProfile.following,
            followers: nextProfile.followers,
            posts: nextProfile.posts,
            selectedSports: coachForm.selectedSports,
            iconPreviewEnabled: Boolean(coachIconUri),
            externalLinks: filteredLinks,
          },
          visibility: {
            phonePublic: Boolean(coachForm.phone),
            emailPublic: Boolean(coachForm.publicEmail),
          },
          auth: {
            loginEmail: coachForm.loginEmail,
          },
          createdAt: serverTimestamp(),
        });
      } catch (error) {
        setAuthError(
          `ログインは完了しましたが、プロフィール保存に失敗しました。${toSaveErrorMessage(
            error
          )}`
        );
      }

      setCoachForm(initialCoachForm);
      setCoachIconUri(null);
      setCoachLinks([createLinkRow(1)]);
    } catch (error) {
      setAuthError(toAuthErrorMessage(error));
      setIsSubmitting(false);
    }
  };

  const handleLogin = async () => {
    clearAuthFeedback();

    if (!hasAuthConfig || !auth) {
      setAuthError("認証設定が未完了です。管理者に設定状況を確認してください。");
      return;
    }

    if (!loginForm.email || !loginForm.password) {
      setAuthError("ログイン用メールアドレスとパスワードを入力してください。");
      return;
    }

    setIsSubmitting(true);
    try {
      await signInWithEmailAndPassword(auth, loginForm.email, loginForm.password);
      setAuthMessage("ログインしました。");
      setLoginForm(initialLoginForm);
      setCurrentScreen("mypage");
    } catch (error) {
      setAuthError(toAuthErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    clearAuthFeedback();

    if (!auth) {
      return;
    }

    try {
      await signOut(auth);
      setAuthMessage("ログアウトしました。");
      setCurrentScreen("top");
    } catch (error) {
      setAuthError(toAuthErrorMessage(error));
    }
  };

  const currentFollowingUserIds = authUser
    ? followRecords
        .filter((record) => record.followerUid === authUser.uid)
        .map((record) => record.followingUid)
    : [];
  const currentBlockedUserIds = authUser
    ? blockRecords
        .filter((record) => record.blockerUid === authUser.uid)
        .map((record) => record.blockedUid)
    : [];
  const currentPostAlertUserIds = authUser
    ? postAlertRecords
        .filter((record) => record.watcherUid === authUser.uid)
        .map((record) => record.targetUid)
    : [];
  const filteredFeedPosts = feedTimeline.filter(
    (post) =>
      !post.createdByUid || !currentBlockedUserIds.includes(post.createdByUid)
  );
  const visibleQuestionBoard = questionBoard.filter(
    (question) =>
      !question.createdByUid || !currentBlockedUserIds.includes(question.createdByUid)
  );
  const visibleCommunityBoard = communityBoard.filter(
    (item) => !item.createdByUid || !currentBlockedUserIds.includes(item.createdByUid)
  );
  const likeCountMap = likeRecords.reduce<Record<string, number>>((accumulator, record) => {
    const key = `${record.source}:${record.postId}`;
    accumulator[key] = (accumulator[key] ?? 0) + 1;
    return accumulator;
  }, {});
  const repostCountMap = repostRecords.reduce<Record<string, number>>(
    (accumulator, record) => {
      const key = `${record.source}:${record.postId}`;
      accumulator[key] = (accumulator[key] ?? 0) + 1;
      return accumulator;
    },
    {}
  );
  const bookmarkMap = bookmarkRecords.reduce<Record<string, boolean>>(
    (accumulator, record) => {
      accumulator[`${record.source}:${record.postId}`] = true;
      return accumulator;
    },
    {}
  );
  const bookmarkCountMap = bookmarkRecords.reduce<Record<string, number>>(
    (accumulator, record) => {
      const key = `${record.source}:${record.postId}`;
      accumulator[key] = (accumulator[key] ?? 0) + 1;
      return accumulator;
    },
    {}
  );

  const followerCountMap = followRecords.reduce<Record<string, number>>(
    (accumulator, record) => {
      accumulator[record.followingUid] =
        (accumulator[record.followingUid] ?? 0) + 1;
      return accumulator;
    },
    {}
  );

  const followingCountMap = followRecords.reduce<Record<string, number>>(
    (accumulator, record) => {
      accumulator[record.followerUid] = (accumulator[record.followerUid] ?? 0) + 1;
      return accumulator;
    },
    {}
  );

  const followingFeedPosts = feedTimeline.filter(
    (post) =>
      post.createdByUid &&
      currentFollowingUserIds.includes(post.createdByUid) &&
      !currentBlockedUserIds.includes(post.createdByUid)
  );
  const isAdvisorUser = Boolean(authUser && profileState.role.includes("顧問"));
  const now = new Date();
  const startOfCurrentMonth = new Date(
    now.getFullYear(),
    now.getMonth(),
    1
  ).getTime();
  const monthlyQuestions = visibleQuestionBoard.filter(
    (question) => (question.createdAtMs ?? 0) >= startOfCurrentMonth
  );
  const monthlyBestAnsweredQuestions = monthlyQuestions.filter((question) =>
    Boolean(question.bestAnswerReplyId)
  );
  const monthlyBestAnswerRate = monthlyQuestions.length
    ? Math.round(
        (monthlyBestAnsweredQuestions.length / monthlyQuestions.length) * 100
      )
    : 0;
  const registeredExpertsCount = directoryAccounts.filter((account) =>
    account.role.includes("指導員")
  ).length;
  const overviewStats = [
    {
      label: "月間相談数",
      value: formatCount(monthlyQuestions.length),
      note: `ベストアンサー率 ${monthlyBestAnswerRate}%`,
    },
    {
      label: "登録指導者",
      value: formatCount(registeredExpertsCount),
      note: "登録済みの指導員アカウント数",
    },
    {
      label: "公開ナレッジ投稿",
      value: formatCount(feedTimeline.length),
      note: "タイムラインに公開されている投稿数",
    },
  ];

  const currentProfileFollowingValue = authUser
    ? String(followingCountMap[authUser.uid] ?? 0)
    : profileState.following;
  const currentProfileFollowersValue = authUser
    ? String(followerCountMap[authUser.uid] ?? 0)
    : profileState.followers;
  const selectedProfileFollowingValue = selectedUserProfile.uid
    ? String(followingCountMap[selectedUserProfile.uid] ?? 0)
    : selectedUserProfile.following;
  const selectedProfileFollowersValue = selectedUserProfile.uid
    ? String(followerCountMap[selectedUserProfile.uid] ?? 0)
    : selectedUserProfile.followers;
  const normalizedSearchQuery = searchQuery.trim().toLowerCase();
  const allSearchContentItems: SearchContentItem[] = [
    ...feedTimeline.map((post) => ({
      createdAtMs: post.createdAtMs,
      id: post.id,
      source: "feed" as const,
      sourceLabel: "タイムライン",
      author: post.author,
      authorHandle: post.authorHandle,
      createdByUid: post.createdByUid,
      role: post.role,
      title: post.title,
      body: post.body,
      sports: post.sports,
      tags: post.tags,
      replies: post.replies,
      media: post.media,
      score: getTrendingScore({
        source: "feed",
        baseScore: post.likes + post.reposts * 2 + post.comments,
        createdAtMs: post.createdAtMs,
      }),
    })),
    ...visibleQuestionBoard.map((question) => ({
      createdAtMs: question.createdAtMs,
      id: question.id,
      source: "questions" as const,
      sourceLabel: "相談広場",
      author: question.author,
      authorHandle: question.authorHandle,
      createdByUid: question.createdByUid,
      role: "顧問アカウント",
      title: question.title,
      body: question.body,
      sports: [question.category],
      tags: ["相談", question.category],
      replies: question.replies,
      media: question.media,
      score: getTrendingScore({
        source: "questions",
        baseScore: question.answers * 3 + question.replies.length,
        createdAtMs: question.createdAtMs,
        hasBestAnswer: Boolean(question.bestAnswerReplyId),
      }),
    })),
    ...visibleCommunityBoard.map((item) => ({
      createdAtMs: item.createdAtMs,
      id: item.id,
      source: "community" as const,
      sourceLabel: "コミュニティ",
      author: item.author,
      authorHandle: item.authorHandle,
      createdByUid: item.createdByUid,
      role: "コミュニティ投稿",
      title: item.title,
      body: item.body,
      sports: [],
      tags: ["コミュニティ"],
      replies: item.replies,
      media: item.media,
      score: getTrendingScore({
        source: "community",
        baseScore: item.replies.length * 2 + 4,
        createdAtMs: item.createdAtMs,
      }),
    })),
  ].filter(
    (item) => !item.createdByUid || !currentBlockedUserIds.includes(item.createdByUid)
  );
  const allReplyItems = allSearchContentItems.flatMap((item) =>
    flattenReplyItems({
      replies: item.replies,
      source: item.source,
      sourceLabel: item.sourceLabel,
      parentTitle: item.title,
      rootPostId: item.id,
    })
  );
  const trendingCoaches: TrendingCoachItem[] = directoryAccounts
    .filter(
      (account) =>
        !currentBlockedUserIds.includes(account.id) &&
        account.role.includes("指導員")
    )
    .map((account) => {
      const authoredItems = allSearchContentItems.filter((item) =>
        userMatchesProfile({
          uid: item.createdByUid,
          name: item.author,
          targetUid: account.id,
          targetName: account.name,
        })
      );
      const authoredReplyItems = allReplyItems.filter((item) =>
        userMatchesProfile({
          uid: item.reply.createdByUid,
          name: item.reply.author,
          targetUid: account.id,
          targetName: account.name,
        })
      );
      const authoredInteractionKeys = new Set([
        ...authoredItems.map((item) => `${item.source}:${item.id}`),
        ...authoredReplyItems.map(
          (item) => `${item.source}:${item.interactionPostId}`
        ),
      ]);
      const likes = likeRecords.filter((record) =>
        authoredInteractionKeys.has(`${record.source}:${record.postId}`)
      ).length;
      const reposts = repostRecords.filter((record) =>
        authoredInteractionKeys.has(`${record.source}:${record.postId}`)
      ).length;
      const bookmarks = bookmarkRecords.filter((record) =>
        authoredInteractionKeys.has(`${record.source}:${record.postId}`)
      ).length;
      const bestAnswers = questionBoard.filter((question) => {
        const bestReply = getBestAnswerReplyForQuestion(question) as Reply | undefined;

        return bestReply
          ? userMatchesProfile({
              uid: bestReply.createdByUid,
              name: bestReply.author,
              targetUid: account.id,
              targetName: account.name,
            })
          : false;
      }).length;
      const latestPostMs = authoredItems.reduce(
        (latest, item) => Math.max(latest, item.createdAtMs ?? 0),
        0
      );
      const lastActivityDays = latestPostMs
        ? Math.floor(getDaysSinceTimestamp(latestPostMs))
        : 365;
      const followers = followerCountMap[account.id] ?? parseFollowerCount(account.followers);

      return {
        ...account,
        followers: String(followers),
        likes,
        reposts,
        bookmarks,
        bestAnswers,
        lastActivityDays,
        score: getTrendingCoachScore({
          followers,
          likes,
          reposts,
          bookmarks,
          bestAnswers,
          lastActivityDays,
        }),
      };
    })
    .sort((left, right) => right.score - left.score);

  const buildRepostedItemsForUser = (uid?: string, name?: string): ProfilePostItem[] => {
    if (!uid) {
      return [];
    }

    return repostRecords.reduce<ProfilePostItem[]>((accumulator, record) => {
      if (record.userUid !== uid) {
        return accumulator;
      }

        const original = allSearchContentItems.find(
          (item) => item.id === record.postId && item.source === record.source
        );
        if (original) {
          accumulator.push({
            ...original,
            id: `repost:${uid}:${record.source}:${record.postId}`,
            author: name ?? original.author,
            authorHandle: name ? createHandleFromName(name) : original.authorHandle,
            createdByUid: uid,
            role: original.role,
            displayRole: `${original.sourceLabel}を再投稿`,
            sortTimestampMs: record.createdAtMs ?? original.createdAtMs ?? 0,
          } satisfies ProfilePostItem);

          return accumulator;
        }

        const originalReply = allReplyItems.find(
          (item) =>
            item.interactionPostId === record.postId && item.source === record.source
        );
        if (!originalReply) {
          return accumulator;
        }

        accumulator.push({
          id: `repost:${uid}:${record.source}:${record.postId}`,
          source: record.source,
          sourceLabel: originalReply.sourceLabel,
          author: name ?? originalReply.reply.author,
          authorHandle: name
            ? createHandleFromName(name)
            : originalReply.reply.authorHandle,
          createdByUid: uid,
          role: "返信を再投稿",
          title: originalReply.parentTitle,
          body: originalReply.reply.body,
          sports: [],
          tags: ["返信", "再投稿"],
          replies: originalReply.reply.replies ?? [],
          media: originalReply.reply.media,
          score: 0,
          displayRole: `${originalReply.sourceLabel}の返信を再投稿`,
          sortTimestampMs: record.createdAtMs ?? 0,
        });

        return accumulator;
      }, []);
  };

  const authoredPostCountForUser = (uid?: string, name?: string) =>
    allSearchContentItems.filter((item) =>
      uid ? item.createdByUid === uid : item.author === name
    ).length;

  const accountDirectory = new Map<string, SearchAccountItem>();
  directoryAccounts.forEach((account) => {
    if (currentBlockedUserIds.includes(account.id)) {
      return;
    }
    accountDirectory.set(account.id, {
      ...account,
      followers: String(followerCountMap[account.id] ?? 0),
    });
  });
  if (authUser) {
    accountDirectory.set(authUser.uid, {
      id: authUser.uid,
      name: profileState.name,
      handle: profileState.handle,
      bio: profileState.bio,
      followers: String(followerCountMap[authUser.uid] ?? 0),
      featured: false,
      role: profileState.role,
      selectedSports: profileState.selectedSports,
    });
  }

  const currentProfilePostsValue = authUser
    ? String(authoredPostCountForUser(authUser.uid, profileState.name))
    : profileState.posts;
  const selectedProfilePostsValue = selectedUserProfile.uid
    ? String(authoredPostCountForUser(selectedUserProfile.uid, selectedUserProfile.name))
    : selectedUserProfile.posts;
  const selectedUserQuestions = questionBoard.filter((question) =>
    userMatchesProfile({
      uid: question.createdByUid,
      name: question.author,
      targetUid: selectedUserProfile.uid,
      targetName: selectedUserProfile.name,
    })
  );
  const selectedUserBestAnswers = questionBoard
    .map((question) => ({
      question,
      bestReply: getBestAnswerReplyForQuestion(question),
    }))
    .filter(({ bestReply }) =>
      bestReply
        ? userMatchesProfile({
            name: bestReply.author,
            targetUid: selectedUserProfile.uid,
            targetName: selectedUserProfile.name,
          })
        : false
    );
  const selectedUserBestAnswerCount = selectedUserBestAnswers.length;
  const selectedUserAuthoredPosts = allSearchContentItems.filter((item) =>
    userMatchesProfile({
      uid: item.createdByUid,
      name: item.author,
      targetUid: selectedUserProfile.uid,
      targetName: selectedUserProfile.name,
    })
  );
  const selectedUserAllPosts = mergeProfilePostItems(
    selectedUserAuthoredPosts,
    buildRepostedItemsForUser(selectedUserProfile.uid, selectedUserProfile.name)
  ).sort(
    (left, right) =>
      (right.sortTimestampMs ?? right.createdAtMs ?? 0) -
      (left.sortTimestampMs ?? left.createdAtMs ?? 0)
  );
  const selectedUserPinnedKey =
    selectedUserProfile.uid && directoryMetaMap[selectedUserProfile.uid]?.pinnedPostId
      ? `${directoryMetaMap[selectedUserProfile.uid]?.pinnedPostSource}:${directoryMetaMap[selectedUserProfile.uid]?.pinnedPostId}`
      : null;
  const selectedUserPinnedPost = selectedUserPinnedKey
    ? selectedUserAllPosts.find(
        (post) => `${post.source}:${post.id}` === selectedUserPinnedKey
      ) ?? null
    : null;
  const selectedUserVisiblePosts = selectedUserPinnedPost
    ? [
        selectedUserPinnedPost,
        ...selectedUserAllPosts.filter(
          (post) =>
            `${post.source}:${post.id}` !== `${selectedUserPinnedPost.source}:${selectedUserPinnedPost.id}`
        ),
      ]
    : selectedUserAllPosts;
  const selectedUserAnswers = allReplyItems.reduce<ProfileAnswerItem[]>(
    (accumulator, item) => {
      if (
        replyMatchesProfile({
          author: item.reply.author,
          targetName: selectedUserProfile.name,
        })
      ) {
        accumulator.push({
          id: `${item.interactionPostId}`,
          sourceLabel: item.sourceLabel,
          parentTitle: item.parentTitle,
          body: item.reply.body,
        });
      }

      return accumulator;
    },
    []
  );
  const currentUserAuthoredPosts = allSearchContentItems.filter((item) =>
    authUser
      ? item.createdByUid === authUser.uid || (!item.createdByUid && item.author === profileState.name)
      : item.author === profileState.name
  );
  const currentUserAllPosts = mergeProfilePostItems(
    currentUserAuthoredPosts,
    buildRepostedItemsForUser(authUser?.uid, profileState.name)
  ).sort(
    (left, right) =>
      (right.sortTimestampMs ?? right.createdAtMs ?? 0) -
      (left.sortTimestampMs ?? left.createdAtMs ?? 0)
  );
  const currentUserPinnedPost = pinnedPostKey
    ? currentUserAllPosts.find((post) => `${post.source}:${post.id}` === pinnedPostKey) ?? null
    : null;
  const currentUserVisiblePosts = currentUserPinnedPost
    ? [
        currentUserPinnedPost,
        ...currentUserAllPosts.filter(
          (post) => `${post.source}:${post.id}` !== `${currentUserPinnedPost.source}:${currentUserPinnedPost.id}`
        ),
      ]
    : currentUserAllPosts;
  const currentUserAnswers = allReplyItems.reduce<ProfileAnswerItem[]>(
    (accumulator, item) => {
      if (
        replyMatchesProfile({
          author: item.reply.author,
          targetName: profileState.name,
        })
      ) {
        accumulator.push({
          id: `${item.interactionPostId}`,
          sourceLabel: item.sourceLabel,
          parentTitle: item.parentTitle,
          body: item.reply.body,
        });
      }

      return accumulator;
    },
    []
  );
  const currentUserBestAnswers = questionBoard
    .map((question) => ({
      question,
      bestReply: getBestAnswerReplyForQuestion(question),
    }))
    .filter(({ bestReply }) =>
      bestReply
        ? userMatchesProfile({
            name: bestReply.author,
            targetUid: authUser?.uid,
            targetName: profileState.name,
          })
        : false
    );

  const buildDetailFromSearchItem = (item: SearchContentItem): PostDetailState => ({
    id: item.id,
    source: item.source,
    sourceLabel: item.sourceLabel,
    author: item.author,
    authorHandle: item.authorHandle,
    createdByUid: item.createdByUid,
    role: item.role,
    title: item.title,
    body: item.body,
    media: item.media,
    replies: item.replies,
    sports: item.sports,
    tags: item.tags,
    createdAtMs: item.createdAtMs,
  });

  const notificationItems: NotificationItem[] = authUser
    ? [
        ...likeRecords.flatMap((record) => {
          const post = allSearchContentItems.find(
            (item) =>
              item.id === record.postId &&
              item.source === record.source &&
              currentUserAuthoredPosts.some(
                (authored) =>
                  authored.id === record.postId && authored.source === record.source
              )
          );
          return post
            ? [{
                id: `like-${record.id}`,
                kind: "like" as const,
                title: "いいねされました",
                body: `${post.title} にいいねが付きました。`,
                createdAtMs: record.createdAtMs ?? 0,
                postDetail: buildDetailFromSearchItem(post),
              }]
            : [];
        }),
        ...repostRecords.flatMap((record) => {
          const post = allSearchContentItems.find(
            (item) =>
              item.id === record.postId &&
              item.source === record.source &&
              currentUserAuthoredPosts.some(
                (authored) =>
                  authored.id === record.postId && authored.source === record.source
              )
          );
          return post
            ? [{
                id: `repost-${record.id}`,
                kind: "repost" as const,
                title: "再投稿されました",
                body: `${post.title} が再投稿されました。`,
                createdAtMs: record.createdAtMs ?? 0,
                postDetail: buildDetailFromSearchItem(post),
              }]
            : [];
        }),
        ...bookmarkRecords.flatMap((record) => {
          const post = allSearchContentItems.find(
            (item) =>
              item.id === record.postId &&
              item.source === record.source &&
              currentUserAuthoredPosts.some(
                (authored) =>
                  authored.id === record.postId && authored.source === record.source
              )
          );
          return post
            ? [{
                id: `bookmark-${record.id}`,
                kind: "bookmark" as const,
                title: "保存されました",
                body: `${post.title} が保存されました。`,
                createdAtMs: record.createdAtMs ?? 0,
                postDetail: buildDetailFromSearchItem(post),
              }]
            : [];
        }),
        ...allReplyItems.flatMap((item) => {
          const post = allSearchContentItems.find(
            (candidate) => candidate.id === item.rootPostId && candidate.source === item.source
          );
          return post &&
            currentUserAuthoredPosts.some(
              (authored) => authored.id === item.rootPostId && authored.source === item.source
            )
            ? [{
                id: `reply-${item.interactionPostId}`,
                kind: "reply" as const,
                title: "返信が届きました",
                body: `${item.parentTitle} に新しい返信があります。`,
                createdAtMs: 0,
                postDetail: buildDetailFromSearchItem(post),
              }]
            : [];
        }),
        ...feedTimeline
          .filter(
            (post) =>
              post.createdByUid &&
              currentPostAlertUserIds.includes(post.createdByUid) &&
              post.createdByUid !== authUser.uid
          )
          .map((post) => ({
            id: `alert-${post.id}`,
            kind: "new-post" as const,
            title: "見逃し防止の投稿通知",
            body: `${post.author} さんが新しい投稿を公開しました。`,
            createdAtMs: post.createdAtMs ?? 0,
            postDetail: buildFeedDetail(post),
          })),
      ].sort((left, right) => right.createdAtMs - left.createdAtMs)
    : [];

  const buildUserActivitySummary = ({
    uid,
    name,
    role,
    profile,
  }: {
    uid?: string;
    name: string;
    role: string;
    profile: Pick<ProfileState, "bio" | "link" | "selectedSports" | "handle">;
  }): UserActivitySummary | null => {
    if (!role.includes("指導員")) {
      return null;
    }

    const authoredPosts = allSearchContentItems.filter((item) =>
      userMatchesProfile({
        uid: item.createdByUid,
        name: item.author,
        targetUid: uid,
        targetName: name,
      })
    );
    const authoredReplies = allReplyItems.filter((item) =>
      userMatchesProfile({
        uid: item.reply.createdByUid,
        name: item.reply.author,
        targetUid: uid,
        targetName: name,
      })
    );
    const authoredInteractionKeys = new Set([
      ...authoredPosts.map((item) => `${item.source}:${item.id}`),
      ...authoredReplies.map((item) => `${item.source}:${item.interactionPostId}`),
    ]);
    const likesReceived = likeRecords.filter((record) =>
      authoredInteractionKeys.has(`${record.source}:${record.postId}`)
    ).length;
    const repostsReceived = repostRecords.filter((record) =>
      authoredInteractionKeys.has(`${record.source}:${record.postId}`)
    ).length;
    const bookmarksReceived = bookmarkRecords.filter((record) =>
      authoredInteractionKeys.has(`${record.source}:${record.postId}`)
    ).length;
    const repliesReceived = authoredPosts.reduce(
      (total, item) => total + countRepliesRecursively(item.replies),
      0
    );
    const repliesSent = authoredReplies.length;
    const bestAnswers = questionBoard.filter((question) => {
      const bestReply = getBestAnswerReplyForQuestion(question) as Reply | undefined;

      return bestReply
        ? userMatchesProfile({
            uid: bestReply.createdByUid,
            name: bestReply.author,
            targetUid: uid,
            targetName: name,
          })
        : false;
    }).length;
    const followerCount = uid ? followerCountMap[uid] ?? 0 : 0;
    const postingStreakDays = getPostingStreakDays(
      authoredPosts.map((item) => item.createdAtMs ?? 0)
    );
    const profileCompletionScore = getProfileCompletionScore(profile);

    const badges = [
      createTieredBadge({
        id: "posts",
        label: "投稿実績",
        description: `${authoredPosts.length}件の投稿を達成`,
        value: authoredPosts.length,
        bronze: 5,
        silver: 50,
        gold: 300,
      }),
      createTieredBadge({
        id: "streak",
        label: "継続投稿",
        description: `${postingStreakDays}日連続で投稿`,
        value: postingStreakDays,
        bronze: 7,
        silver: 30,
        gold: 365,
      }),
      createTieredBadge({
        id: "followers",
        label: "フォロワー",
        description: `${followerCount}人のフォロワーを獲得`,
        value: followerCount,
        bronze: 10,
        silver: 100,
        gold: 1000,
      }),
      createTieredBadge({
        id: "likes",
        label: "いいね獲得",
        description: `${likesReceived}件のいいねを獲得`,
        value: likesReceived,
        bronze: 10,
        silver: 500,
        gold: 10000,
      }),
      createTieredBadge({
        id: "reposts",
        label: "再投稿獲得",
        description: `${repostsReceived}件の再投稿を獲得`,
        value: repostsReceived,
        bronze: 5,
        silver: 100,
        gold: 1000,
      }),
      createTieredBadge({
        id: "bookmarks",
        label: "保存獲得",
        description: `${bookmarksReceived}件の保存を獲得`,
        value: bookmarksReceived,
        bronze: 5,
        silver: 40,
        gold: 200,
      }),
      createTieredBadge({
        id: "replies_received",
        label: "会話を生んだ",
        description: `${repliesReceived}件の返信を受信`,
        value: repliesReceived,
        bronze: 10,
        silver: 100,
        gold: 1000,
      }),
      createTieredBadge({
        id: "replies_sent",
        label: "回答参加",
        description: `${repliesSent}件の返信を投稿`,
        value: repliesSent,
        bronze: 10,
        silver: 100,
        gold: 1000,
      }),
      createTieredBadge({
        id: "best_answers",
        label: "ベストアンサー",
        description: `${bestAnswers}件のベストアンサーを獲得`,
        value: bestAnswers,
        bronze: 1,
        silver: 5,
        gold: 15,
      }),
      profileCompletionScore >= 5
        ? {
            id: "profile",
            label: "プロフィール完成",
            description: "プロフィールの主要項目をすべて整備",
            tier: "gold" as const,
          }
        : null,
    ].filter((badge): badge is ActivityBadge => Boolean(badge));

    return {
      postCount: authoredPosts.length,
      postingStreakDays,
      followerCount,
      likesReceived,
      repostsReceived,
      bookmarksReceived,
      repliesReceived,
      repliesSent,
      bestAnswers,
      profileCompletionScore,
      badges,
    };
  };

  const currentUserActivitySummary = buildUserActivitySummary({
    uid: authUser?.uid,
    name: profileState.name,
    role: profileState.role,
    profile: profileState,
  });
  const selectedUserActivitySummary = buildUserActivitySummary({
    uid: selectedUserProfile.uid,
    name: selectedUserProfile.name,
    role: selectedUserProfile.role,
    profile: selectedUserProfile,
  });

  const searchMatchedPosts = allSearchContentItems.filter((item) => {
    if (
      activeSearchContentFilter !== "all" &&
      item.source !== activeSearchContentFilter
    ) {
      return false;
    }

    if (!normalizedSearchQuery) {
      return true;
    }

    const haystack = [
      item.author,
      item.role,
      item.title,
      item.body,
      item.sourceLabel,
      ...item.tags,
      ...item.sports,
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(normalizedSearchQuery);
  });

  const trendingSearchPosts = [...searchMatchedPosts].sort(
    (left, right) => right.score - left.score
  );

  const recentSearchPosts = [...searchMatchedPosts].sort(
    (left, right) => (right.createdAtMs ?? 0) - (left.createdAtMs ?? 0)
  );

  const searchAccounts = [
    ...experts.map((expert, index) => ({
      id: expert.id,
      name: expert.name,
      handle: `@${expert.name.replace(/\s+/g, "_").toLowerCase()}`,
      bio: expert.headline,
      followers: expert.followers,
      featured: index === 0,
      role: "指導員アカウント",
      selectedSports: [] as string[],
    })),
    ...directoryAccounts.map((account) => ({
      ...account,
      followers: String(followerCountMap[account.id] ?? 0),
    })),
  ]
    .filter((account) => !currentBlockedUserIds.includes(account.id))
    .filter(
      (account, index, array) =>
        index ===
        array.findIndex(
          (candidate) =>
            candidate.id === account.id ||
            candidate.handle === account.handle ||
            candidate.name === account.name
        )
    )
    .filter((account) => {
      if (!normalizedSearchQuery) {
        return true;
      }

      return [account.name, account.handle, account.bio]
        .join(" ")
        .toLowerCase()
        .includes(normalizedSearchQuery);
    })
    .sort((left, right) => {
      const scoreDiff =
        getAccountSearchScore(right, normalizedSearchQuery) -
        getAccountSearchScore(left, normalizedSearchQuery);

      if (scoreDiff !== 0) {
        return scoreDiff;
      }

      const followerDiff =
        parseFollowerCount(right.followers) - parseFollowerCount(left.followers);
      if (followerDiff !== 0) {
        return followerDiff;
      }

      return left.name.localeCompare(right.name, "ja");
    });
  const postDetailInteractionKey = `${postDetail.source}:${postDetail.id}`;
  const isPostDetailLiked = authUser
    ? likeRecords.some(
        (record) =>
          record.userUid === authUser.uid &&
          record.postId === postDetail.id &&
          record.source === postDetail.source
      )
    : false;
  const isPostDetailReposted = authUser
    ? repostRecords.some(
        (record) =>
          record.userUid === authUser.uid &&
          record.postId === postDetail.id &&
          record.source === postDetail.source
      )
    : false;
  const isPostDetailBookmarked = Boolean(bookmarkMap[postDetailInteractionKey]);
  const postDetailLikeCount = likeCountMap[postDetailInteractionKey] ?? postDetail.likes ?? 0;
  const postDetailRepostCount =
    repostCountMap[postDetailInteractionKey] ?? postDetail.reposts ?? 0;
  const postDetailBookmarkCount = bookmarkCountMap[postDetailInteractionKey] ?? 0;
  const isPostDetailQuestionOwner =
    postDetail.source === "questions" &&
    ((postDetail.createdByUid && postDetail.createdByUid === authUser?.uid) ||
      postDetail.author === profileState.name);

  const getReplyInteractionSummary = ({
    rootPostId,
    source,
    path,
    reply,
  }: {
    rootPostId: string;
    source: SearchContentFilterKey;
    path: string[];
    reply: Reply;
  }) => {
    const interactionPostId = buildReplyInteractionPostId(rootPostId, path);
    const interactionKey = `${source}:${interactionPostId}`;
    const liked = authUser
      ? likeRecords.some(
          (record) =>
            record.userUid === authUser.uid &&
            record.postId === interactionPostId &&
            record.source === source
        )
      : false;
    const reposted = authUser
      ? repostRecords.some(
          (record) =>
            record.userUid === authUser.uid &&
            record.postId === interactionPostId &&
            record.source === source
        )
      : false;
    const bookmarked = Boolean(bookmarkMap[interactionKey]);

    return {
      interactionPostId,
      liked,
      reposted,
      bookmarked,
      likeCount: likeCountMap[interactionKey] ?? 0,
      repostCount: repostCountMap[interactionKey] ?? 0,
      bookmarkCount: bookmarkCountMap[interactionKey] ?? 0,
      replyCount: reply.replies?.length ?? 0,
    };
  };

  useEffect(() => {
    if (currentScreen !== "post-detail" || !postDetail.id) {
      return;
    }

    if (postDetail.source === "feed") {
      const match = feedTimeline.find((item) => item.id === postDetail.id);
      if (match) {
        setPostDetail(buildFeedDetail(match));
      }
      return;
    }

    if (postDetail.source === "questions") {
      const match = questionBoard.find((item) => item.id === postDetail.id);
      if (match) {
        setPostDetail(buildQuestionDetail(match));
      }
      return;
    }

    const match = communityBoard.find((item) => item.id === postDetail.id);
    if (match) {
      setPostDetail(buildCommunityDetail(match));
    }
  }, [communityBoard, currentScreen, feedTimeline, postDetail.id, postDetail.source, questionBoard]);

  useEffect(() => {
    if (currentScreen !== "reply-detail" || !replyDetail.rootPostId || replyDetail.path.length === 0) {
      return;
    }

    const rootReplies =
      replyDetail.source === "feed"
        ? feedTimeline.find((item) => item.id === replyDetail.rootPostId)?.replies
        : replyDetail.source === "questions"
          ? questionBoard.find((item) => item.id === replyDetail.rootPostId)?.replies
          : communityBoard.find((item) => item.id === replyDetail.rootPostId)?.replies;

    if (!rootReplies) {
      return;
    }

    const nextReply = findReplyByPath(rootReplies, replyDetail.path);
    if (nextReply) {
      setReplyDetail((current) => ({
        ...current,
        reply: nextReply,
      }));
    }
  }, [
    communityBoard,
    currentScreen,
    feedTimeline,
    questionBoard,
    replyDetail.path,
    replyDetail.rootPostId,
    replyDetail.source,
  ]);

  const saveProfileEdits = async () => {
    clearAuthFeedback();

    if (!profileDraft.name || !profileDraft.handle || profileDraft.selectedSports.length === 0) {
      setAuthError("プロフィール名、表示ID、表示したい種目は入力してください。");
      return;
    }

    setProfileState(profileDraft);
    setCurrentScreen("mypage");

    if (!authUser || !db) {
      setAuthMessage("プロフィールを更新しました。");
      return;
    }

    try {
      const filteredLinks = profileDraft.externalLinks.filter(
        (link) => link.label.trim() && link.url.trim()
      );
      await saveProfileDocument(authUser.uid, {
        role: profileDraft.role.includes("顧問") ? "advisor" : "coach",
        roleLabel: profileDraft.role,
        profile: {
          nickname: profileDraft.name,
          handle: profileDraft.handle,
          bio: profileDraft.bio,
          link: profileDraft.link,
          following: profileDraft.following,
          followers: profileDraft.followers,
          posts: profileDraft.posts,
          selectedSports: profileDraft.selectedSports,
          externalLinks: filteredLinks,
        },
        updatedAt: serverTimestamp(),
      });
      setAuthMessage("プロフィールを更新しました。");
    } catch (error) {
      setAuthError(
        `画面上のプロフィールは更新しましたが、保存に失敗しました。${toSaveErrorMessage(
          error
        )}`
      );
    }
  };

  const updateComposeState = (
    key: Exclude<keyof ComposeState, "selectedSports">,
    value: string
  ) => {
    setComposeState((current) => ({ ...current, [key]: value }));
  };

  const toggleComposeSport = (sport: string) => {
    setComposeState((current) => ({
      ...current,
      selectedSports: current.selectedSports.includes(sport)
        ? current.selectedSports.filter((item) => item !== sport)
        : [...current.selectedSports, sport],
    }));
  };

  const addProfileLink = () => {
    setProfileDraft((current) => ({
      ...current,
      externalLinks: [...current.externalLinks, createLinkRow(current.externalLinks.length + 1)],
    }));
  };

  const updateProfileLink = (
    id: string,
    key: keyof Omit<ExternalLink, "id">,
    value: string
  ) => {
    setProfileDraft((current) => ({
      ...current,
      externalLinks: current.externalLinks.map((link) =>
        link.id === id ? { ...link, [key]: value } : link
      ),
    }));
  };

  const applyComposeFormatting = (action: RichFormatAction) => {
    setComposeState((current) => {
      const next = applyRichFormatting(current.body, composeBodySelection, action);
      setComposeBodySelection(next.selection);
      return {
        ...current,
        body: next.value,
      };
    });
  };

  const applyReplyFormatting = (action: RichFormatAction) => {
    const next = applyRichFormatting(replyDraft, replySelection, action);
    setReplyDraft(next.value);
    setReplySelection(next.selection);
  };

  const openUserProfile = ({
    uid,
    name,
    role,
    bio,
    handle,
    selectedSports,
    followers,
  }: {
    uid?: string;
    name: string;
    role: string;
    bio?: string;
    handle?: string;
    selectedSports?: string[];
    followers?: string;
  }) => {
    const authoredPosts = allSearchContentItems.filter((item) =>
      uid
        ? item.createdByUid === uid || (!item.createdByUid && item.author === name)
        : item.author === name
    );
    const primarySports =
      selectedSports && selectedSports.length > 0
        ? selectedSports
        : Array.from(new Set(authoredPosts.flatMap((post) => post.sports))).slice(0, 3);
    const expertMatch = experts.find((expert) => expert.name === name);

    setSelectedUserProfile({
      uid,
      name,
      handle: handle ?? createHandleFromName(name),
      role,
      bio:
        bio ??
        expertMatch?.headline ??
        `${role}としてKomonityで知見共有や相談対応を行っています。`,
      link:
        expertMatch?.promotions
          ? `komonity.jp/${name.replace(/\s+/g, "-").toLowerCase()}`
          : `komonity.jp/profile/${name.replace(/\s+/g, "-").toLowerCase()}`,
      externalLinks: uid ? directoryMetaMap[uid]?.externalLinks ?? [] : [],
      joined: "2026年4月からKomonityを利用",
      following:
        uid && followingCountMap[uid] !== undefined
          ? String(followingCountMap[uid])
          : expertMatch
            ? "84"
            : "32",
      followers:
        uid && followerCountMap[uid] !== undefined
          ? String(followerCountMap[uid])
          : followers ?? expertMatch?.followers ?? `${Math.max(authoredPosts.length, 0) * 128}`,
      posts: String(authoredPosts.length),
      selectedSports: primarySports.length > 0 ? primarySports : ["その他"],
      avatarLabel: name.slice(0, 1),
      coverTone: createCoverToneFromName(name),
    });
    setActiveProfileTab("posts");
    setCurrentScreen("user-profile");
    setIsMenuOpen(false);
  };

  const isFollowingSelectedProfile = selectedUserProfile.uid
    ? currentFollowingUserIds.includes(selectedUserProfile.uid)
    : false;

  const toggleFollowProfile = async ({
    targetUid,
    targetName,
  }: {
    targetUid: string;
    targetName: string;
  }) => {
    clearAuthFeedback();

    if (!authUser || !db) {
      setAuthError("フォローするにはログインが必要です。");
      return;
    }

    if (authUser.uid === targetUid) {
      setAuthError("自分自身をフォローすることはできません。");
      return;
    }

    const followDocId = `${authUser.uid}__${targetUid}`;
    const followDocRef = doc(db, COLLECTIONS.follows, followDocId);
    const alreadyFollowing = currentFollowingUserIds.includes(targetUid);

    try {
      if (alreadyFollowing) {
        await deleteDoc(followDocRef);
        setAuthMessage(`${targetName} のフォローを解除しました。`);
      } else {
        await setDoc(followDocRef, {
          followerUid: authUser.uid,
          followerName: profileState.name,
          followingUid: targetUid,
          followingName: targetName,
          createdAt: serverTimestamp(),
        });
        setAuthMessage(`${targetName} をフォローしました。`);
      }
    } catch (error) {
      setAuthError(`フォロー操作に失敗しました。${toSaveErrorMessage(error)}`);
    }
  };

  const toggleBlockUser = async ({
    targetUid,
    targetName,
  }: {
    targetUid?: string;
    targetName: string;
  }) => {
    clearAuthFeedback();

    if (!authUser || !db || !targetUid) {
      setAuthError("この操作にはログインが必要です。");
      return;
    }

    if (authUser.uid === targetUid) {
      setAuthError("自分自身をブロックすることはできません。");
      return;
    }

    const blockId = `${authUser.uid}__${targetUid}`;
    const blockRef = doc(db, COLLECTIONS.blocks, blockId);
    const blocked = currentBlockedUserIds.includes(targetUid);

    try {
      if (blocked) {
        await deleteDoc(blockRef);
        setAuthMessage(`${targetName} のブロックを解除しました。`);
      } else {
        await setDoc(blockRef, {
          blockerUid: authUser.uid,
          blockedUid: targetUid,
          createdAt: serverTimestamp(),
        });
        setAuthMessage(`${targetName} をブロックしました。`);
      }
    } catch (error) {
      setAuthError(`ブロック操作に失敗しました。${toSaveErrorMessage(error)}`);
    }
  };

  const reportUserAsSpam = async ({
    targetUid,
    targetName,
  }: {
    targetUid?: string;
    targetName: string;
  }) => {
    clearAuthFeedback();

    if (!authUser || !db || !targetUid) {
      setAuthError("この操作にはログインが必要です。");
      return;
    }

    try {
      await addDoc(collection(db, COLLECTIONS.reports), {
        reporterUid: authUser.uid,
        targetUid,
        targetName,
        createdAt: serverTimestamp(),
        reason: "spam",
      });
      setAuthMessage(`${targetName} をスパムとして報告しました。`);
    } catch (error) {
      setAuthError(`報告に失敗しました。${toSaveErrorMessage(error)}`);
    }
  };

  const togglePostAlertsForUser = async ({
    targetUid,
    targetName,
  }: {
    targetUid?: string;
    targetName: string;
  }) => {
    clearAuthFeedback();

    if (!authUser || !db || !targetUid) {
      setAuthError("この操作にはログインが必要です。");
      return;
    }

    const alertId = `${authUser.uid}__${targetUid}`;
    const alertRef = doc(db, COLLECTIONS.alerts, alertId);
    const enabled = currentPostAlertUserIds.includes(targetUid);

    try {
      if (enabled) {
        await deleteDoc(alertRef);
        setAuthMessage(`${targetName} の投稿通知を解除しました。`);
      } else {
        await setDoc(alertRef, {
          watcherUid: authUser.uid,
          targetUid,
          createdAt: serverTimestamp(),
        });
        setAuthMessage(`${targetName} の新しい投稿を通知一覧で確認できるようにしました。`);
      }
    } catch (error) {
      setAuthError(`通知設定に失敗しました。${toSaveErrorMessage(error)}`);
    }
  };

  const togglePinnedPost = async (post: ProfilePostItem) => {
    clearAuthFeedback();

    if (!authUser || !db) {
      setAuthError("固定投稿の設定にはログインが必要です。");
      return;
    }

    const nextPinnedKey =
      pinnedPostKey === `${post.source}:${post.id}` ? null : `${post.source}:${post.id}`;

    setPinnedPostKey(nextPinnedKey);

    try {
      await setDoc(
        doc(db, "users", authUser.uid),
        {
          profile: {
            pinnedPostId: nextPinnedKey ? post.id : "",
            pinnedPostSource: nextPinnedKey ? post.source : "",
          },
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
      setAuthMessage(nextPinnedKey ? "投稿をプロフィール上部に固定しました。" : "固定投稿を解除しました。");
    } catch (error) {
      setPinnedPostKey(pinnedPostKey);
      setAuthError(`固定投稿の設定に失敗しました。${toSaveErrorMessage(error)}`);
    }
  };

  const openRelationshipList = ({
    mode,
    targetUid,
    title,
    backScreen,
  }: {
    mode: "following" | "followers";
    targetUid?: string;
    title: string;
    backScreen: "mypage" | "user-profile";
  }) => {
    if (!targetUid) {
      return;
    }

    const targetIds =
      mode === "following"
        ? followRecords
            .filter((record) => record.followerUid === targetUid)
            .map((record) => record.followingUid)
        : followRecords
            .filter((record) => record.followingUid === targetUid)
            .map((record) => record.followerUid);

    const accounts = targetIds
      .map((uid) => accountDirectory.get(uid))
      .filter((account): account is SearchAccountItem => Boolean(account));

    setRelationshipListState({
      mode,
      title,
      accounts,
      backScreen,
    });
    setCurrentScreen("relationship-list");
  };

  const openPostDetail = ({
    detail,
    backScreen,
  }: {
    detail: PostDetailState;
    backScreen: ScreenKey;
  }) => {
    setPostDetail(detail);
    setPostDetailBackScreen(backScreen);
    setReplyDraft("");
    setReplyMedia([]);
    setCurrentScreen("post-detail");
    setIsMenuOpen(false);
  };

  const openReplyDetail = ({
    rootPostId,
    source,
    sourceLabel,
    path,
    reply,
    backScreen,
  }: ReplyDetailState) => {
    setReplyDetail({
      rootPostId,
      source,
      sourceLabel,
      path,
      reply,
      backScreen,
    });
    setReplyDraft("");
    setReplyMedia([]);
    setCurrentScreen("reply-detail");
    setIsMenuOpen(false);
  };

  const goBackFromReplyDetail = () => {
    if (replyDetail.path.length <= 1) {
      setCurrentScreen(replyDetail.backScreen);
      return;
    }

    const parentPath = replyDetail.path.slice(0, -1);
    const rootReplies =
      replyDetail.source === "feed"
        ? feedTimeline.find((item) => item.id === replyDetail.rootPostId)?.replies
        : replyDetail.source === "questions"
          ? questionBoard.find((item) => item.id === replyDetail.rootPostId)?.replies
          : communityBoard.find((item) => item.id === replyDetail.rootPostId)?.replies;

    const parentReply = rootReplies ? findReplyByPath(rootReplies, parentPath) : undefined;
    if (!parentReply) {
      setCurrentScreen("post-detail");
      return;
    }

    setReplyDetail((current) => ({
      ...current,
      path: parentPath,
      reply: parentReply,
      backScreen: parentPath.length > 1 ? "reply-detail" : "post-detail",
    }));
  };

  const updatePostRepliesLocally = ({
    source,
    rootPostId,
    replies,
  }: {
    source: SearchContentFilterKey;
    rootPostId: string;
    replies: Reply[];
  }) => {
    if (source === "feed") {
      setFeedTimeline((current) =>
        current.map((item) =>
          item.id === rootPostId
            ? {
                ...item,
                replies,
                comments: replies.length,
              }
            : item
        )
      );
      return;
    }

    if (source === "questions") {
      setQuestionBoard((current) =>
        current.map((item) =>
          item.id === rootPostId
            ? {
                ...item,
                replies,
                answers: replies.length,
              }
            : item
        )
      );
      return;
    }

    setCommunityBoard((current) =>
      current.map((item) => (item.id === rootPostId ? { ...item, replies } : item))
    );
  };

  const togglePostInteraction = async ({
    collectionName,
    detail,
  }: {
    collectionName:
      | typeof COLLECTIONS.likes
      | typeof COLLECTIONS.reposts
      | typeof COLLECTIONS.bookmarks;
    detail: PostDetailState;
  }) => {
    clearAuthFeedback();

    if (!authUser || !db) {
      setAuthError("この操作にはログインが必要です。");
      return;
    }

    const recordId = `${authUser.uid}__${detail.source}__${detail.id}`;
    const recordRef = doc(db, collectionName, recordId);
    const nextRecord = buildInteractionRecord({
      id: recordId,
      userUid: authUser.uid,
      postId: detail.id,
      source: detail.source,
      createdAtMs: Date.now(),
    });
    const existingRecords =
      collectionName === COLLECTIONS.likes
        ? likeRecords
        : collectionName === COLLECTIONS.reposts
          ? repostRecords
          : bookmarkRecords;
    const alreadyExists = existingRecords.some((record) => record.id === recordId);

    const applyLocalChange = (shouldAdd: boolean) => {
      if (collectionName === COLLECTIONS.likes) {
        setLikeRecords((current) =>
          shouldAdd
            ? [...current, nextRecord]
            : current.filter((record) => record.id !== recordId)
        );
        return;
      }

      if (collectionName === COLLECTIONS.reposts) {
        setRepostRecords((current) =>
          shouldAdd
            ? [...current, nextRecord]
            : current.filter((record) => record.id !== recordId)
        );
        return;
      }

      setBookmarkRecords((current) =>
        shouldAdd
          ? [...current, nextRecord]
          : current.filter((record) => record.id !== recordId)
      );
    };

    applyLocalChange(!alreadyExists);

    try {
      if (alreadyExists) {
        await deleteDoc(recordRef);
      } else {
        await setDoc(recordRef, {
          userUid: authUser.uid,
          postId: detail.id,
          source: detail.source,
          createdAt: serverTimestamp(),
        });
      }
    } catch (error) {
      applyLocalChange(alreadyExists);
      setAuthError(`操作に失敗しました。${toSaveErrorMessage(error)}`);
    }
  };

  const submitReply = async () => {
    clearAuthFeedback();

    if (!authUser || !db) {
      setAuthError("返信するにはログインが必要です。");
      return;
    }

    if (!replyDraft.trim()) {
      setAuthError("返信内容を入力してください。");
      return;
    }

    if (replyDraft.length > REPLY_BODY_MAX_LENGTH) {
      setAuthError(`返信本文は${REPLY_BODY_MAX_LENGTH}文字以内で入力してください。`);
      return;
    }

    const isReplyTarget = currentScreen === "reply-detail";
    const rootPostId = isReplyTarget ? replyDetail.rootPostId : postDetail.id;
    const replyPath = isReplyTarget ? replyDetail.path : [];
    const replySource = isReplyTarget ? replyDetail.source : postDetail.source;
    const previousReplies =
      replySource === "feed"
        ? feedTimeline.find((item) => item.id === rootPostId)?.replies ?? []
        : replySource === "questions"
          ? questionBoard.find((item) => item.id === rootPostId)?.replies ?? []
          : communityBoard.find((item) => item.id === rootPostId)?.replies ?? [];
    const collectionName = getPostCollectionFromSource(replySource);
    const docRef = doc(db, collectionName, rootPostId);

    setIsReplySubmitting(true);

    try {
      const uploadedReplyMedia = await uploadReplyMedia(authUser.uid);
      const nextReply: Reply = {
        id: `reply-${Date.now()}`,
        author: profileState.name,
        authorHandle: profileState.handle,
        createdByUid: authUser.uid,
        body: replyDraft.trim(),
        media: uploadedReplyMedia,
        replies: [],
      };
      const nextReplies = appendReplyToPath(previousReplies, replyPath, nextReply);
      const payload: Record<string, unknown> = {
        replies: serializeRepliesForFirestore(nextReplies),
        updatedAt: serverTimestamp(),
      };

      if (replySource === "feed") {
        payload.comments = nextReplies.length;
      }

      if (replySource === "questions") {
        payload.answers = nextReplies.length;
      }

      updatePostRepliesLocally({
        source: replySource,
        rootPostId,
        replies: nextReplies,
      });
      if (!isReplyTarget) {
        setPostDetail((current) => ({
          ...current,
          replies: nextReplies,
          comments: current.source === "feed" ? nextReplies.length : current.comments,
          answers: current.source === "questions" ? nextReplies.length : current.answers,
        }));
      }

      await setDoc(docRef, payload, { merge: true });
      setReplyDraft("");
      setReplyMedia([]);
      setReplySelection(INITIAL_SELECTION);
      setAuthMessage("返信を投稿しました。");
    } catch (error) {
      updatePostRepliesLocally({
        source: replySource,
        rootPostId,
        replies: previousReplies,
      });
      if (!isReplyTarget) {
        setPostDetail((current) => ({
          ...current,
          replies: previousReplies,
          comments: current.source === "feed" ? previousReplies.length : current.comments,
          answers: current.source === "questions" ? previousReplies.length : current.answers,
        }));
      }
      setAuthError(`返信に失敗しました。${toSaveErrorMessage(error)}`);
    } finally {
      setIsReplySubmitting(false);
    }
  };

  const confirmBestAnswer = async () => {
    if (!bestAnswerCandidate || !authUser || !db || postDetail.source !== "questions") {
      return;
    }

    clearAuthFeedback();

    if (postDetail.bestAnswerReplyId) {
      setBestAnswerCandidate(null);
      setAuthError("ベストアンサーはすでに登録されています。");
      return;
    }

    const isQuestionOwner =
      (postDetail.createdByUid && postDetail.createdByUid === authUser.uid) ||
      postDetail.author === profileState.name;

    if (!isQuestionOwner) {
      setBestAnswerCandidate(null);
      setAuthError("ベストアンサーを登録できるのは相談投稿者のみです。");
      return;
    }

    const previousBestAnswer =
      postDetail.bestAnswer ?? "まだベストアンサーはありません。";
    const previousBestAnswerReplyId = postDetail.bestAnswerReplyId;
    const payload = {
      bestAnswer: bestAnswerCandidate.body,
      bestAnswerReplyId: bestAnswerCandidate.id,
      updatedAt: serverTimestamp(),
    };

    setBestAnswerCandidate(null);
    setPostDetail((current) => ({
      ...current,
      bestAnswer: bestAnswerCandidate.body,
      bestAnswerReplyId: bestAnswerCandidate.id,
    }));
    setQuestionBoard((current) =>
      current.map((question) =>
        question.id === postDetail.id
          ? {
              ...question,
              bestAnswer: bestAnswerCandidate.body,
              bestAnswerReplyId: bestAnswerCandidate.id,
            }
          : question
      )
    );

    try {
      await setDoc(doc(db, COLLECTIONS.questions, postDetail.id), payload, {
        merge: true,
      });
      setAuthMessage("ベストアンサーを登録しました。");
    } catch (error) {
      setPostDetail((current) => ({
        ...current,
        bestAnswer: previousBestAnswer,
        bestAnswerReplyId: previousBestAnswerReplyId,
      }));
      setQuestionBoard((current) =>
        current.map((question) =>
          question.id === postDetail.id
            ? {
                ...question,
                bestAnswer: previousBestAnswer,
                bestAnswerReplyId: previousBestAnswerReplyId,
              }
            : question
        )
      );
      setAuthError(`ベストアンサー登録に失敗しました。${toSaveErrorMessage(error)}`);
    }
  };

  const submitPost = async () => {
    clearAuthFeedback();

    if (!authUser) {
      setAuthError("投稿するにはログインが必要です。");
      return;
    }

    if (!composeState.title || !composeState.body) {
      setAuthError("タイトルと本文を入力してください。");
      return;
    }

    if (composeState.title.length > POST_TITLE_MAX_LENGTH) {
      setAuthError(`タイトルは${POST_TITLE_MAX_LENGTH}文字以内で入力してください。`);
      return;
    }

    if (composeState.body.length > POST_BODY_MAX_LENGTH) {
      setAuthError(`本文は${POST_BODY_MAX_LENGTH}文字以内で入力してください。`);
      return;
    }

    const selectedComposeSports =
      composeState.target === "feed"
        ? composeState.selectedSports
        : profileState.selectedSports;

    if (profileState.role.includes("指導員") && selectedComposeSports.length === 0) {
      setAuthError("投稿する種目を1つ以上選択してください。");
      return;
    }

    if (!db || !storage) {
      setAuthError(
        "投稿設定が未完了です。管理者に設定状況を確認してください。"
      );
      return;
    }

    const starterReplies: Reply[] = [
      {
        id: `reply-${Date.now()}`,
        author: "Komonity Bot",
        body: "投稿ありがとうございます。ここから全員がリプライできます。",
      },
    ];

    setIsPublishing(true);

    try {
      const uploadedMedia = await uploadComposeMedia(authUser.uid);

      if (composeState.target === "feed") {
        await addDoc(collection(db, COLLECTIONS.feed), {
          type: "feed",
          author: profileState.name,
          authorHandle: profileState.handle,
          role: profileState.role,
          title: composeState.title,
          body: composeState.body,
          tags: ["新規投稿"],
          sports: selectedComposeSports.length > 0 ? selectedComposeSports : ["その他"],
          likes: 0,
          reposts: 0,
          comments: 0,
          replies: starterReplies,
          media: uploadedMedia,
          createdByUid: authUser.uid,
          visibility: "public",
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        setCurrentScreen("feed");
      }

      if (composeState.target === "questions") {
        await addDoc(collection(db, COLLECTIONS.questions), {
          type: "question",
          category: profileState.selectedSports[0] ?? "その他",
          title: composeState.title,
          body: composeState.body,
          author: profileState.name,
          authorHandle: profileState.handle,
          role: profileState.role,
          answers: 0,
          bestAnswer: "まだベストアンサーはありません。",
          replies: starterReplies,
          media: uploadedMedia,
          sports: selectedComposeSports.length > 0 ? selectedComposeSports : ["その他"],
          createdByUid: authUser.uid,
          visibility: "public",
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        setCurrentScreen("questions");
      }

      if (composeState.target === "community") {
        await addDoc(collection(db, COLLECTIONS.community), {
          type: "community",
          title: composeState.title,
          author: profileState.name,
          authorHandle: profileState.handle,
          role: profileState.role,
          body: composeState.body,
          cta: "スレッドを見る",
          replies: starterReplies,
          media: uploadedMedia,
          sports: selectedComposeSports.length > 0 ? selectedComposeSports : ["その他"],
          createdByUid: authUser.uid,
          visibility: "public",
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        setCurrentScreen("community");
      }

      setComposeState(initialComposeState);
      setComposeMedia([]);
      setComposeBodySelection(INITIAL_SELECTION);
      setAuthMessage("投稿を作成しました。公開一覧にも反映されます。");
    } catch (error) {
      setAuthError(`投稿保存に失敗しました。${toSaveErrorMessage(error)}`);
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <View style={styles.globalHeader}>
        <Pressable onPress={() => goToScreen("top")} style={styles.logoButton}>
          <KomonityLogo />
        </Pressable>
        <Pressable
          style={styles.menuButton}
          onPress={() => setIsMenuOpen((current) => !current)}
        >
          <View style={styles.menuLine} />
          <View style={styles.menuLine} />
          <View style={styles.menuLine} />
        </Pressable>
      </View>

      {currentScreen === "top" ? (
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.heroCard}>
            <Text style={styles.eyebrow}>Komonity</Text>
            <Text style={styles.heroTitle}>
              顧問の先生と指導者をつなぐ、相談と実践共有のサービス
            </Text>
            <Text style={styles.heroText}>
              練習メニューの相談、ベストアンサー、毎日の知見投稿、顧問同士の相互支援、
              指導者の実績可視化までをひとつにまとめたプロトタイプです。
            </Text>
            <View style={styles.heroActions}>
              <Pressable
                style={styles.primaryButton}
                onPress={() => goToScreen("post-compose")}
              >
                <Text style={styles.primaryButtonText}>投稿する</Text>
              </Pressable>
              {!authUser ? (
                <Pressable
                  style={styles.secondaryButton}
                  onPress={() => setCurrentScreen("registration-role")}
                >
                  <Text style={styles.secondaryButtonText}>登録する</Text>
                </Pressable>
              ) : null}
              {authUser ? (
                <Pressable style={styles.ghostButton} onPress={handleLogout}>
                  <Text style={styles.ghostButtonText}>ログアウト</Text>
                </Pressable>
              ) : (
                <Pressable
                  style={styles.ghostButton}
                  onPress={() => setCurrentScreen("login")}
                >
                  <Text style={styles.ghostButtonText}>ログイン</Text>
                </Pressable>
              )}
            </View>
            <View style={styles.flowCard}>
              <Text style={styles.flowTitle}>登録フロー</Text>
              <Text style={styles.flowText}>
                まず役割を選ぶページへ進み、その後に顧問用または指導員用の専用登録ページへ遷移する流れです。
              </Text>
              <Text style={styles.flowHint}>
                ホーム → 役割選択 → 専用登録ページ → アカウント登録
              </Text>
            </View>

            <View style={styles.authPanel}>
              <Text style={styles.authPanelTitle}>認証状態</Text>
              <Text style={styles.authPanelText}>
                {authUser
                  ? `ログイン中: ${authUser.email ?? "メール未設定"}`
                  : "未ログインです"}
              </Text>
              {!hasAuthConfig ? (
                <Text style={styles.warningText}>
                  現在、認証設定が未完了です。管理者へお問い合わせください。
                </Text>
              ) : null}
              {authUser ? (
                <Pressable style={styles.secondaryButton} onPress={handleLogout}>
                  <Text style={styles.secondaryButtonText}>ログアウト</Text>
                </Pressable>
              ) : null}
            </View>
          </View>

          {authMessage ? <FeedbackBanner kind="success" message={authMessage} /> : null}
          {authError ? <FeedbackBanner kind="error" message={authError} /> : null}

          <View style={styles.statsRow}>
            {overviewStats.map((stat) => (
              <View key={stat.label} style={styles.statCard}>
                <Text style={styles.statLabel}>{stat.label}</Text>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statNote}>{stat.note}</Text>
              </View>
            ))}
          </View>
          <View style={styles.topShortcutGrid}>
            <Pressable style={styles.shortcutCard} onPress={() => goToScreen("feed")}>
              <Text style={styles.shortcutTitle}>タイムライン</Text>
              <Text style={styles.shortcutText}>
                指導者の毎日投稿や注目ナレッジを一覧で確認できます。
              </Text>
            </Pressable>
            <Pressable
              style={styles.shortcutCard}
              onPress={() => goToScreen("questions")}
            >
              <Text style={styles.shortcutTitle}>相談広場</Text>
              <Text style={styles.shortcutText}>
                顧問の先生の悩みとベストアンサーをまとめて見られます。
              </Text>
            </Pressable>
            <Pressable
              style={styles.shortcutCard}
              onPress={() => goToScreen("experts")}
            >
              <Text style={styles.shortcutTitle}>話題の指導者</Text>
              <Text style={styles.shortcutText}>
                全種目の指導者を、反応と更新頻度をもとに確認できます。
              </Text>
            </Pressable>
            <Pressable
              style={styles.shortcutCard}
              onPress={() => goToScreen("community")}
            >
              <Text style={styles.shortcutTitle}>コミュニティ</Text>
              <Text style={styles.shortcutText}>
                顧問同士の公開相談や資料共有の場に移動します。
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      ) : null}

      {currentScreen === "feed" ? (
        <ScrollView contentContainerStyle={styles.pageContainer}>
          <PageIntro
            title="タイムライン"
            description="すべての種目の投稿を一覧で確認できます。"
          />
          <View style={styles.stack}>
            {filteredFeedPosts.length === 0 ? (
              <View style={styles.communityCard}>
                <Text style={styles.cardTitle}>該当する投稿がまだありません</Text>
                <Text style={styles.cardBody}>
                  指導者の投稿が増えると、ここに最新の内容が表示されます。
                </Text>
              </View>
            ) : null}
            {filteredFeedPosts.map((post) => {
              const interactionKey = `feed:${post.id}`;
              const liked = authUser
                ? likeRecords.some(
                    (record) =>
                      record.userUid === authUser.uid &&
                      record.postId === post.id &&
                      record.source === "feed"
                  )
                : false;
              const feedDisplay = extractDisplayBodyAndTags(post.body);
              return (
                <View key={post.id} style={styles.postCard}>
                  <View style={styles.postHeader}>
                    <Pressable
                      style={styles.authorRow}
                      onPress={() =>
                        openUserProfile({
                          uid: post.createdByUid,
                          name: post.author,
                          role: post.role,
                          handle: post.authorHandle,
                          selectedSports: post.sports,
                        })
                      }
                    >
                      <View style={styles.authorAvatar}>
                        <DefaultAvatarIcon size={28} />
                      </View>
                      <View style={styles.authorTextBlock}>
                        <Text style={styles.cardTitle}>{post.title}</Text>
                        <Text style={styles.cardMeta}>
                          {post.author} ・ {post.role}
                        </Text>
                      </View>
                    </Pressable>
                    <View style={styles.pill}>
                      <Text style={styles.pillText}>毎日投稿</Text>
                    </View>
                  </View>
                  <Pressable
                    style={styles.detailTapArea}
                    onPress={() =>
                      openPostDetail({
                        detail: buildFeedDetail(post),
                        backScreen: "feed",
                      })
                    }
                  >
                    <View style={styles.sportChipRow}>
                      {post.sports.map((sport) => (
                        <View key={sport} style={styles.sportChip}>
                          <Text style={styles.sportChipText}>{sport}</Text>
                        </View>
                      ))}
                    </View>
                    {feedDisplay.bodyText ? (
                      <ExpandableBody
                        id={`feed:${post.id}`}
                        content={feedDisplay.bodyText}
                        expanded={expandedBodyIds.includes(`feed:${post.id}`)}
                        onToggle={toggleExpandedBody}
                        onOpenUrl={requestOpenExternalUrl}
                      />
                    ) : null}
                    <MediaGallery media={post.media} />
                    {renderHashtagChips(feedDisplay.tags)}
                  </Pressable>
                  <View style={styles.metricRow}>
                    <Pressable
                      onPress={() =>
                        void togglePostInteraction({
                          collectionName: COLLECTIONS.likes,
                          detail: buildFeedDetail(post),
                        })
                      }
                      style={[
                        styles.metricButton,
                        liked && styles.metricButtonActive,
                      ]}
                    >
                      <Text
                        style={[styles.metricText, liked && styles.metricTextActive]}
                      >
                        いいね {likeCountMap[interactionKey] ?? post.likes}
                      </Text>
                    </Pressable>
                    <View style={styles.metricChip}>
                      <Text style={styles.metricText}>
                        再投稿 {repostCountMap[interactionKey] ?? post.reposts}
                      </Text>
                    </View>
                    <View style={styles.metricChip}>
                      <Text style={styles.metricText}>コメント {post.comments}</Text>
                    </View>
                  </View>
                  <ReplyList replies={post.replies} />
                </View>
              );
            })}
          </View>
        </ScrollView>
      ) : null}

      {currentScreen === "questions" ? (
        <ScrollView contentContainerStyle={styles.pageContainer}>
          <PageIntro
            title="相談広場"
            description="顧問の先生の悩みと、評価の高い回答をまとめて確認できます。"
          />
          <View style={styles.stack}>
            {visibleQuestionBoard.map((question) => {
              const questionDisplay = extractDisplayBodyAndTags(question.body);
              return (
              <View key={question.id} style={styles.questionCard}>
                <Pressable
                  style={styles.detailTapArea}
                  onPress={() =>
                    openPostDetail({
                      detail: buildQuestionDetail(question),
                      backScreen: "questions",
                    })
                  }
                >
                  <Text style={styles.categoryText}>{question.category}</Text>
                  <Text style={styles.cardTitle}>{question.title}</Text>
                  <Pressable
                    onPress={() =>
                      openUserProfile({
                        uid: question.createdByUid,
                        name: question.author,
                        role: "顧問アカウント",
                        handle: question.authorHandle,
                        selectedSports: [question.category],
                      })
                    }
                  >
                    <Text style={styles.cardMeta}>
                      投稿者: {question.author} ・ 回答数 {question.answers}
                    </Text>
                  </Pressable>
                  {questionDisplay.bodyText ? (
                    <ExpandableBody
                      id={`questions:${question.id}`}
                      content={questionDisplay.bodyText}
                      expanded={expandedBodyIds.includes(`questions:${question.id}`)}
                      onToggle={toggleExpandedBody}
                      onOpenUrl={requestOpenExternalUrl}
                    />
                  ) : null}
                  <MediaGallery media={question.media} />
                  {renderHashtagChips(questionDisplay.tags)}
                  <View style={styles.bestAnswerBox}>
                    <Text style={styles.bestAnswerLabel}>ベストアンサー</Text>
                    <RichTextRenderer content={question.bestAnswer} onOpenUrl={requestOpenExternalUrl} />
                  </View>
                </Pressable>
                <ReplyList replies={question.replies} />
              </View>
            )})}
          </View>
        </ScrollView>
      ) : null}

      {currentScreen === "experts" ? (
        <ScrollView contentContainerStyle={styles.pageContainer}>
          <PageIntro
            title="話題の指導者"
            description="全種目の指導者を、反応量と更新頻度をもとに並べています。"
          />
          <View style={styles.stack}>
            {trendingCoaches.length === 0 ? (
              <View style={styles.communityCard}>
                <Text style={styles.cardTitle}>該当する指導者がまだいません</Text>
                <Text style={styles.cardBody}>
                  指導者が登録されると、ここに話題のアカウントが表示されます。
                </Text>
              </View>
            ) : null}
            {trendingCoaches.map((coach) => (
              <View key={coach.id} style={styles.expertCard}>
                <View style={styles.postHeader}>
                  <Pressable
                    style={styles.authorRow}
                    onPress={() =>
                      openUserProfile({
                        uid: coach.id,
                        name: coach.name,
                        role: "指導員アカウント",
                        bio: coach.bio,
                        handle: coach.handle,
                        followers: coach.followers,
                        selectedSports: coach.selectedSports,
                      })
                    }
                  >
                    <View style={styles.authorAvatar}>
                      <DefaultAvatarIcon size={28} />
                    </View>
                    <View style={styles.authorTextBlock}>
                      <Text style={styles.cardTitle}>{coach.name}</Text>
                      <Text style={styles.cardMeta}>{coach.role} ・ {coach.bio}</Text>
                    </View>
                  </Pressable>
                  <View style={styles.scoreCard}>
                    <Text style={styles.scoreValue}>{coach.followers}</Text>
                    <Text style={styles.scoreLabel}>フォロワー</Text>
                  </View>
                </View>
                <View style={styles.sportChipRow}>
                  {coach.selectedSports.map((sport) => (
                    <View key={sport} style={styles.sportChipActive}>
                      <Text style={styles.sportChipActiveText}>{sport}</Text>
                    </View>
                  ))}
                </View>
                <View style={styles.expertMetrics}>
                  <View style={styles.expertMetricBox}>
                    <Text style={styles.expertMetricValue}>{coach.likes}</Text>
                    <Text style={styles.expertMetricLabel}>累計いいね</Text>
                  </View>
                  <View style={styles.expertMetricBox}>
                    <Text style={styles.expertMetricValue}>{coach.reposts}</Text>
                    <Text style={styles.expertMetricLabel}>累計再投稿</Text>
                  </View>
                  <View style={styles.expertMetricBox}>
                    <Text style={styles.expertMetricValue}>{coach.bookmarks}</Text>
                    <Text style={styles.expertMetricLabel}>累計保存</Text>
                  </View>
                  <View style={styles.expertMetricBox}>
                    <Text style={styles.expertMetricValue}>{coach.bestAnswers}</Text>
                    <Text style={styles.expertMetricLabel}>ベストアンサー</Text>
                  </View>
                </View>
                <Text style={styles.promoText}>
                  最終投稿から {coach.lastActivityDays} 日
                </Text>
              </View>
            ))}
          </View>
        </ScrollView>
      ) : null}

      {currentScreen === "community" ? (
        <ScrollView contentContainerStyle={styles.pageContainer}>
          <PageIntro
            title="コミュニティ"
            description="顧問同士の公開相談、資料共有、運営ノウハウ交換のためのページです。"
          />
          <View style={styles.stack}>
            {visibleCommunityBoard.map((item) => {
              const communityDisplay = extractDisplayBodyAndTags(item.body);
              return (
              <View key={item.id} style={styles.communityCard}>
                <Pressable
                  style={styles.detailTapArea}
                  onPress={() =>
                    openPostDetail({
                      detail: buildCommunityDetail(item),
                      backScreen: "community",
                    })
                  }
                >
                  <Text style={styles.cardTitle}>{item.title}</Text>
                  <Pressable
                    onPress={() =>
                      openUserProfile({
                        uid: item.createdByUid,
                        name: item.author,
                        role: "コミュニティ運営",
                        handle: item.authorHandle,
                      })
                    }
                  >
                    <Text style={styles.cardMeta}>投稿者: {item.author}</Text>
                  </Pressable>
                  {communityDisplay.bodyText ? (
                    <ExpandableBody
                      id={`community:${item.id}`}
                      content={communityDisplay.bodyText}
                      expanded={expandedBodyIds.includes(`community:${item.id}`)}
                      onToggle={toggleExpandedBody}
                      onOpenUrl={requestOpenExternalUrl}
                    />
                  ) : null}
                  <MediaGallery media={item.media} />
                  {renderHashtagChips(communityDisplay.tags)}
                </Pressable>
                <Pressable style={styles.communityButton}>
                  <Text style={styles.communityButtonText}>{item.cta}</Text>
                </Pressable>
                <ReplyList replies={item.replies} />
              </View>
            )})}
          </View>
        </ScrollView>
      ) : null}

      {currentScreen === "post-detail" ? (
        <ScrollView contentContainerStyle={styles.searchPageContainer}>
          <View style={styles.postDetailShell}>
            <View style={styles.postDetailHeaderBar}>
              <Pressable
                style={styles.searchBackButton}
                onPress={() => setCurrentScreen(postDetailBackScreen)}
              >
                <Text style={styles.searchBackButtonText}>戻る</Text>
              </Pressable>
              <Text style={styles.postDetailHeaderTitle}>投稿の詳細</Text>
              <View style={styles.postDetailHeaderSpacer} />
            </View>
            {authMessage ? <FeedbackBanner kind="success" message={authMessage} /> : null}
            {authError ? <FeedbackBanner kind="error" message={authError} /> : null}

            <View style={styles.postDetailCard}>
              <View style={styles.postDetailAuthorRow}>
                <Pressable
                  style={styles.postDetailAvatar}
                  onPress={() =>
                    openUserProfile({
                      uid: postDetail.createdByUid,
                      name: postDetail.author,
                      role: postDetail.role,
                      handle: postDetail.authorHandle,
                      selectedSports: postDetail.sports,
                    })
                  }
                >
                  <DefaultAvatarIcon size={32} />
                </Pressable>
                <View style={styles.postDetailAuthorText}>
                  <Pressable
                    onPress={() =>
                      openUserProfile({
                        uid: postDetail.createdByUid,
                        name: postDetail.author,
                        role: postDetail.role,
                        handle: postDetail.authorHandle,
                        selectedSports: postDetail.sports,
                      })
                    }
                  >
                    <Text style={styles.postDetailAuthorName}>{postDetail.author}</Text>
                    <Text style={styles.postDetailAuthorMeta}>
                      {postDetail.authorHandle ?? createHandleFromName(postDetail.author)} ・{" "}
                      {postDetail.role}
                    </Text>
                  </Pressable>
                </View>
                <View style={styles.profileSourceBadge}>
                  <Text style={styles.profileSourceBadgeText}>
                    {postDetail.sourceLabel}
                  </Text>
                </View>
              </View>

              {(() => {
                const postDetailDisplay = extractDisplayBodyAndTags(postDetail.body);

                return (
                  <>
                    <Text style={styles.postDetailTitle}>{postDetail.title}</Text>
                    {postDetailDisplay.bodyText ? (
                      <RichTextRenderer content={postDetailDisplay.bodyText} variant="detail" onOpenUrl={requestOpenExternalUrl} />
                    ) : null}
                    {extractFirstUrl(postDetailDisplay.bodyText) ? (
                      <LinkPreviewCard
                        url={extractFirstUrl(postDetailDisplay.bodyText)!}
                        onOpenUrl={requestOpenExternalUrl}
                      />
                    ) : null}
                    <MediaGallery media={postDetail.media} />

                    {renderHashtagChips(postDetailDisplay.tags)}
                  </>
                );
              })()}

              {postDetail.source === "questions" &&
              postDetail.bestAnswer &&
              postDetail.bestAnswer !== "まだベストアンサーはありません。" ? (
                <View style={styles.bestAnswerBox}>
                  <Text style={styles.bestAnswerLabel}>ベストアンサー</Text>
                  <RichTextRenderer content={postDetail.bestAnswer} onOpenUrl={requestOpenExternalUrl} />
                </View>
              ) : null}

              <Text style={styles.postDetailMetaLine}>
                {formatDateTimeWithSeconds(postDetail.createdAtMs)}
              </Text>

              <View style={styles.postDetailMetricRow}>
                <View style={styles.metricChip}>
                  <Text style={styles.metricText}>
                    返信 {postDetail.comments ?? postDetail.answers ?? postDetail.replies.length}
                  </Text>
                </View>
                <Pressable
                  style={[
                    styles.metricButton,
                    isPostDetailLiked && styles.metricButtonActive,
                  ]}
                  onPress={() =>
                    void togglePostInteraction({
                      collectionName: COLLECTIONS.likes,
                      detail: postDetail,
                    })
                  }
                >
                  <Text
                    style={[
                      styles.metricText,
                      isPostDetailLiked && styles.metricTextActive,
                    ]}
                  >
                    いいね {postDetailLikeCount}
                  </Text>
                </Pressable>
                <Pressable
                  style={[
                    styles.metricButton,
                    isPostDetailReposted && styles.metricButtonActive,
                  ]}
                  onPress={() =>
                    void togglePostInteraction({
                      collectionName: COLLECTIONS.reposts,
                      detail: postDetail,
                    })
                  }
                >
                  <Text
                    style={[
                      styles.metricText,
                      isPostDetailReposted && styles.metricTextActive,
                    ]}
                  >
                    再投稿 {postDetailRepostCount}
                  </Text>
                </Pressable>
                <Pressable
                  style={[
                    styles.metricButton,
                    isPostDetailBookmarked && styles.metricButtonActive,
                  ]}
                  onPress={() =>
                    void togglePostInteraction({
                      collectionName: COLLECTIONS.bookmarks,
                      detail: postDetail,
                    })
                  }
                >
                  <Text
                    style={[
                      styles.metricText,
                      isPostDetailBookmarked && styles.metricTextActive,
                    ]}
                  >
                    保存 {postDetailBookmarkCount}
                  </Text>
                </Pressable>
              </View>
            </View>

            <View style={styles.postDetailReplyComposer}>
              <View style={styles.postDetailReplyAvatar}>
                <DefaultAvatarIcon size={28} />
              </View>
              <View style={styles.postDetailReplyComposerBody}>
                <TextInput
                  style={styles.postDetailReplyInput}
                  placeholder="返信を投稿"
                  placeholderTextColor="#8a8f99"
                  value={replyDraft}
                  onChangeText={setReplyDraft}
                  onSelectionChange={(event) =>
                    setReplySelection(event.nativeEvent.selection)
                  }
                  selection={replySelection}
                  maxLength={REPLY_BODY_MAX_LENGTH}
                />
                <Text style={styles.inlineCountText}>
                  {replyDraft.length}/{REPLY_BODY_MAX_LENGTH}
                </Text>
                <RichTextToolbar onFormat={applyReplyFormatting} />
                <View style={styles.postDetailReplyActionRow}>
                  <Pressable
                    style={styles.secondaryButton}
                    onPress={() => void pickReplyMedia()}
                  >
                    <Text style={styles.secondaryButtonText}>画像・動画を追加</Text>
                  </Pressable>
                  <Pressable
                    style={[
                      styles.postDetailReplyButton,
                      isReplySubmitting && styles.disabledButton,
                    ]}
                    onPress={() => {
                      void submitReply();
                    }}
                    disabled={isReplySubmitting}
                  >
                    <Text style={styles.postDetailReplyButtonText}>
                      {isReplySubmitting ? "送信中..." : "返信"}
                    </Text>
                  </Pressable>
                </View>
                <Text style={styles.mediaWarningText}>
                  画像や動画を添付する際は、肖像権・著作権・学校や個人が特定される情報に十分注意してください。
                </Text>
                <ComposeMediaPreview media={replyMedia} onRemove={removeReplyMedia} />
              </View>
            </View>

            <View style={styles.postDetailReplies}>
              {postDetail.replies.length === 0 ? (
                <View style={styles.searchTopicCard}>
                  <Text style={styles.searchTopicTitle}>返信はまだありません</Text>
                  <Text style={styles.searchTopicMeta}>
                    最初の返信を投稿すると、ここに会話が表示されます。
                  </Text>
                </View>
              ) : null}
              {postDetail.replies.map((reply, index) => (
                <View key={reply.id} style={styles.postDetailReplyCard}>
                  {index < postDetail.replies.length - 1 ? (
                    <View style={styles.postDetailThreadLine} />
                  ) : null}
                  {(() => {
                    const replyStats = getReplyInteractionSummary({
                      rootPostId: postDetail.id,
                      source: postDetail.source,
                      path: [reply.id],
                      reply,
                    });

                    return (
                      <View style={styles.postDetailReplyRow}>
                        <Pressable
                          style={styles.postDetailReplyAvatar}
                          onPress={() =>
                            openUserProfile({
                              uid: reply.createdByUid,
                              name: reply.author,
                              role: "Komonityユーザー",
                              handle: reply.authorHandle,
                              selectedSports: postDetail.sports,
                            })
                          }
                        >
                          <DefaultAvatarIcon size={28} />
                        </Pressable>
                        <View style={styles.postDetailReplyContent}>
                          <Pressable
                            onPress={() =>
                              openUserProfile({
                                uid: reply.createdByUid,
                                name: reply.author,
                                role: "Komonityユーザー",
                                handle: reply.authorHandle,
                                selectedSports: postDetail.sports,
                              })
                            }
                          >
                            <Text style={styles.postDetailReplyAuthor}>{reply.author}</Text>
                          </Pressable>
                          <Pressable
                            style={styles.detailTapArea}
                            onPress={() =>
                              openReplyDetail({
                                rootPostId: postDetail.id,
                                source: postDetail.source,
                                sourceLabel: postDetail.sourceLabel,
                                path: [reply.id],
                                reply,
                                backScreen: "post-detail",
                              })
                            }
                          >
                            <RichTextRenderer content={reply.body} variant="reply" onOpenUrl={requestOpenExternalUrl} />
                            {extractFirstUrl(reply.body) ? (
                              <LinkPreviewCard
                                url={extractFirstUrl(reply.body)!}
                                onOpenUrl={requestOpenExternalUrl}
                              />
                            ) : null}
                            <MediaGallery media={reply.media} compact={true} />
                          </Pressable>
                          <View style={styles.replyMetricRow}>
                            <View style={styles.metricChip}>
                              <Text style={styles.metricText}>返信 {replyStats.replyCount}</Text>
                            </View>
                            <Pressable
                              style={[
                                styles.metricButton,
                                replyStats.liked && styles.metricButtonActive,
                              ]}
                              onPress={() =>
                                void togglePostInteraction({
                                  collectionName: COLLECTIONS.likes,
                                  detail: {
                                    ...postDetail,
                                    id: replyStats.interactionPostId,
                                  },
                                })
                              }
                            >
                              <Text
                                style={[
                                  styles.metricText,
                                  replyStats.liked && styles.metricTextActive,
                                ]}
                              >
                                いいね {replyStats.likeCount}
                              </Text>
                            </Pressable>
                            <Pressable
                              style={[
                                styles.metricButton,
                                replyStats.reposted && styles.metricButtonActive,
                              ]}
                              onPress={() =>
                                void togglePostInteraction({
                                  collectionName: COLLECTIONS.reposts,
                                  detail: {
                                    ...postDetail,
                                    id: replyStats.interactionPostId,
                                  },
                                })
                              }
                            >
                              <Text
                                style={[
                                  styles.metricText,
                                  replyStats.reposted && styles.metricTextActive,
                                ]}
                              >
                                再投稿 {replyStats.repostCount}
                              </Text>
                            </Pressable>
                            <Pressable
                              style={[
                                styles.metricButton,
                                replyStats.bookmarked && styles.metricButtonActive,
                              ]}
                              onPress={() =>
                                void togglePostInteraction({
                                  collectionName: COLLECTIONS.bookmarks,
                                  detail: {
                                    ...postDetail,
                                    id: replyStats.interactionPostId,
                                  },
                                })
                              }
                            >
                              <Text
                                style={[
                                  styles.metricText,
                                  replyStats.bookmarked && styles.metricTextActive,
                                ]}
                              >
                                保存 {replyStats.bookmarkCount}
                              </Text>
                            </Pressable>
                          </View>
                          {postDetail.source === "questions" &&
                          postDetail.bestAnswerReplyId === reply.id ? (
                            <View style={styles.bestAnswerInlineBadge}>
                              <Text style={styles.bestAnswerInlineBadgeText}>
                                ベストアンサー
                              </Text>
                            </View>
                          ) : null}
                          {postDetail.source === "questions" &&
                          isPostDetailQuestionOwner &&
                          !postDetail.bestAnswerReplyId &&
                          reply.author !== "Komonity Bot" ? (
                            <Pressable
                              style={styles.bestAnswerSelectButton}
                              onPress={() => setBestAnswerCandidate(reply)}
                            >
                              <Text style={styles.bestAnswerSelectButtonText}>
                                ベストアンサーにする
                              </Text>
                            </Pressable>
                          ) : null}
                        </View>
                      </View>
                    );
                  })()}
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      ) : null}

      {currentScreen === "reply-detail" ? (
        <ScrollView contentContainerStyle={styles.searchPageContainer}>
          <View style={styles.postDetailShell}>
            <View style={styles.postDetailHeaderBar}>
              <Pressable
                style={styles.searchBackButton}
                onPress={goBackFromReplyDetail}
              >
                <Text style={styles.searchBackButtonText}>戻る</Text>
              </Pressable>
              <Text style={styles.postDetailHeaderTitle}>返信の詳細</Text>
              <View style={styles.postDetailHeaderSpacer} />
            </View>
            {authMessage ? <FeedbackBanner kind="success" message={authMessage} /> : null}
            {authError ? <FeedbackBanner kind="error" message={authError} /> : null}
            {(() => {
              const replyStats = getReplyInteractionSummary({
                rootPostId: replyDetail.rootPostId,
                source: replyDetail.source,
                path: replyDetail.path,
                reply: replyDetail.reply,
              });

              return (
                <>
                  <View style={styles.postDetailCard}>
                    <View style={styles.postDetailAuthorRow}>
                      <Pressable
                        style={styles.postDetailAvatar}
                        onPress={() =>
                          openUserProfile({
                            uid: replyDetail.reply.createdByUid,
                            name: replyDetail.reply.author,
                            role: "Komonityユーザー",
                            handle: replyDetail.reply.authorHandle,
                            selectedSports: postDetail.sports,
                          })
                        }
                      >
                          <DefaultAvatarIcon size={32} />
                      </Pressable>
                      <View style={styles.postDetailAuthorText}>
                        <Pressable
                          onPress={() =>
                            openUserProfile({
                              uid: replyDetail.reply.createdByUid,
                              name: replyDetail.reply.author,
                              role: "Komonityユーザー",
                              handle: replyDetail.reply.authorHandle,
                              selectedSports: postDetail.sports,
                            })
                          }
                        >
                          <Text style={styles.postDetailAuthorName}>
                            {replyDetail.reply.author}
                          </Text>
                          <Text style={styles.postDetailAuthorMeta}>
                            {replyDetail.reply.authorHandle ??
                              createHandleFromName(replyDetail.reply.author)}
                          </Text>
                        </Pressable>
                      </View>
                      <View style={styles.profileSourceBadge}>
                        <Text style={styles.profileSourceBadgeText}>
                          {replyDetail.sourceLabel}
                        </Text>
                      </View>
                    </View>
                    <RichTextRenderer content={replyDetail.reply.body} variant="detail" onOpenUrl={requestOpenExternalUrl} />
                    {extractFirstUrl(replyDetail.reply.body) ? (
                      <LinkPreviewCard
                        url={extractFirstUrl(replyDetail.reply.body)!}
                        onOpenUrl={requestOpenExternalUrl}
                      />
                    ) : null}
                    <MediaGallery media={replyDetail.reply.media} />
                    <View style={styles.postDetailMetricRow}>
                      <View style={styles.metricChip}>
                        <Text style={styles.metricText}>
                          返信 {replyStats.replyCount}
                        </Text>
                      </View>
                      <Pressable
                        style={[
                          styles.metricButton,
                          replyStats.liked && styles.metricButtonActive,
                        ]}
                        onPress={() =>
                          void togglePostInteraction({
                            collectionName: COLLECTIONS.likes,
                            detail: { ...postDetail, id: replyStats.interactionPostId },
                          })
                        }
                      >
                        <Text
                          style={[
                            styles.metricText,
                            replyStats.liked && styles.metricTextActive,
                          ]}
                        >
                          いいね {replyStats.likeCount}
                        </Text>
                      </Pressable>
                      <Pressable
                        style={[
                          styles.metricButton,
                          replyStats.reposted && styles.metricButtonActive,
                        ]}
                        onPress={() =>
                          void togglePostInteraction({
                            collectionName: COLLECTIONS.reposts,
                            detail: { ...postDetail, id: replyStats.interactionPostId },
                          })
                        }
                      >
                        <Text
                          style={[
                            styles.metricText,
                            replyStats.reposted && styles.metricTextActive,
                          ]}
                        >
                          再投稿 {replyStats.repostCount}
                        </Text>
                      </Pressable>
                      <Pressable
                        style={[
                          styles.metricButton,
                          replyStats.bookmarked && styles.metricButtonActive,
                        ]}
                        onPress={() =>
                          void togglePostInteraction({
                            collectionName: COLLECTIONS.bookmarks,
                            detail: { ...postDetail, id: replyStats.interactionPostId },
                          })
                        }
                      >
                        <Text
                          style={[
                            styles.metricText,
                            replyStats.bookmarked && styles.metricTextActive,
                          ]}
                        >
                          保存 {replyStats.bookmarkCount}
                        </Text>
                      </Pressable>
                    </View>
                  </View>

                  <View style={styles.postDetailReplyComposer}>
                    <View style={styles.postDetailReplyAvatar}>
                      <DefaultAvatarIcon size={28} />
                    </View>
                    <View style={styles.postDetailReplyComposerBody}>
                      <TextInput
                        style={styles.postDetailReplyInput}
                        placeholder="返信に返信する"
                        placeholderTextColor="#8a8f99"
                        value={replyDraft}
                        onChangeText={setReplyDraft}
                        onSelectionChange={(event) =>
                          setReplySelection(event.nativeEvent.selection)
                        }
                        selection={replySelection}
                        maxLength={REPLY_BODY_MAX_LENGTH}
                      />
                      <Text style={styles.inlineCountText}>
                        {replyDraft.length}/{REPLY_BODY_MAX_LENGTH}
                      </Text>
                      <RichTextToolbar onFormat={applyReplyFormatting} />
                      <View style={styles.postDetailReplyActionRow}>
                        <Pressable
                          style={styles.secondaryButton}
                          onPress={() => void pickReplyMedia()}
                        >
                          <Text style={styles.secondaryButtonText}>画像・動画を追加</Text>
                        </Pressable>
                        <Pressable
                          style={[
                            styles.postDetailReplyButton,
                            isReplySubmitting && styles.disabledButton,
                          ]}
                          onPress={() => {
                            void submitReply();
                          }}
                          disabled={isReplySubmitting}
                        >
                          <Text style={styles.postDetailReplyButtonText}>
                            {isReplySubmitting ? "送信中..." : "返信"}
                          </Text>
                        </Pressable>
                      </View>
                      <Text style={styles.mediaWarningText}>
                        画像や動画を添付する際は、肖像権・著作権・学校や個人が特定される情報に十分注意してください。
                      </Text>
                      <ComposeMediaPreview media={replyMedia} onRemove={removeReplyMedia} />
                    </View>
                  </View>

                  <View style={styles.postDetailReplies}>
                    {(replyDetail.reply.replies ?? []).map((nestedReply, index) => {
                      const nestedPath = [...replyDetail.path, nestedReply.id];
                      const nestedStats = getReplyInteractionSummary({
                        rootPostId: replyDetail.rootPostId,
                        source: replyDetail.source,
                        path: nestedPath,
                        reply: nestedReply,
                      });

                      return (
                        <View key={nestedReply.id} style={styles.postDetailReplyCard}>
                          {index < (replyDetail.reply.replies ?? []).length - 1 ? (
                            <View style={styles.postDetailThreadLine} />
                          ) : null}
                          <View style={styles.postDetailReplyRow}>
                            <Pressable
                              style={styles.postDetailReplyAvatar}
                              onPress={() =>
                                openUserProfile({
                                  uid: nestedReply.createdByUid,
                                  name: nestedReply.author,
                                  role: "Komonityユーザー",
                                  handle: nestedReply.authorHandle,
                                  selectedSports: postDetail.sports,
                                })
                              }
                            >
                                <DefaultAvatarIcon size={28} />
                            </Pressable>
                            <View style={styles.postDetailReplyContent}>
                              <Pressable
                                onPress={() =>
                                  openUserProfile({
                                    uid: nestedReply.createdByUid,
                                    name: nestedReply.author,
                                    role: "Komonityユーザー",
                                    handle: nestedReply.authorHandle,
                                    selectedSports: postDetail.sports,
                                  })
                                }
                              >
                                <Text style={styles.postDetailReplyAuthor}>
                                  {nestedReply.author}
                                </Text>
                              </Pressable>
                              <Pressable
                                style={styles.detailTapArea}
                                onPress={() =>
                                  openReplyDetail({
                                    rootPostId: replyDetail.rootPostId,
                                    source: replyDetail.source,
                                    sourceLabel: replyDetail.sourceLabel,
                                    path: nestedPath,
                                    reply: nestedReply,
                                    backScreen: "reply-detail",
                                  })
                                }
                              >
                                <RichTextRenderer
                                  content={nestedReply.body}
                                  variant="reply"
                                  onOpenUrl={requestOpenExternalUrl}
                                />
                                {extractFirstUrl(nestedReply.body) ? (
                                  <LinkPreviewCard
                                    url={extractFirstUrl(nestedReply.body)!}
                                    onOpenUrl={requestOpenExternalUrl}
                                  />
                                ) : null}
                                <MediaGallery media={nestedReply.media} compact={true} />
                              </Pressable>
                              <View style={styles.replyMetricRow}>
                                <View style={styles.metricChip}>
                                  <Text style={styles.metricText}>
                                    返信 {nestedStats.replyCount}
                                  </Text>
                                </View>
                                <Pressable
                                  style={[
                                    styles.metricButton,
                                    nestedStats.liked && styles.metricButtonActive,
                                  ]}
                                  onPress={() =>
                                    void togglePostInteraction({
                                      collectionName: COLLECTIONS.likes,
                                      detail: {
                                        ...postDetail,
                                        id: nestedStats.interactionPostId,
                                      },
                                    })
                                  }
                                >
                                  <Text
                                    style={[
                                      styles.metricText,
                                      nestedStats.liked && styles.metricTextActive,
                                    ]}
                                  >
                                    いいね {nestedStats.likeCount}
                                  </Text>
                                </Pressable>
                                <Pressable
                                  style={[
                                    styles.metricButton,
                                    nestedStats.reposted && styles.metricButtonActive,
                                  ]}
                                  onPress={() =>
                                    void togglePostInteraction({
                                      collectionName: COLLECTIONS.reposts,
                                      detail: {
                                        ...postDetail,
                                        id: nestedStats.interactionPostId,
                                      },
                                    })
                                  }
                                >
                                  <Text
                                    style={[
                                      styles.metricText,
                                      nestedStats.reposted && styles.metricTextActive,
                                    ]}
                                  >
                                    再投稿 {nestedStats.repostCount}
                                  </Text>
                                </Pressable>
                                <Pressable
                                  style={[
                                    styles.metricButton,
                                    nestedStats.bookmarked &&
                                      styles.metricButtonActive,
                                  ]}
                                  onPress={() =>
                                    void togglePostInteraction({
                                      collectionName: COLLECTIONS.bookmarks,
                                      detail: {
                                        ...postDetail,
                                        id: nestedStats.interactionPostId,
                                      },
                                    })
                                  }
                                >
                                  <Text
                                    style={[
                                      styles.metricText,
                                      nestedStats.bookmarked &&
                                        styles.metricTextActive,
                                    ]}
                                  >
                                    保存 {nestedStats.bookmarkCount}
                                  </Text>
                                </Pressable>
                              </View>
                            </View>
                          </View>
                        </View>
                      );
                    })}
                    {(replyDetail.reply.replies ?? []).length === 0 ? (
                      <View style={styles.searchTopicCard}>
                        <Text style={styles.searchTopicTitle}>返信はまだありません</Text>
                        <Text style={styles.searchTopicMeta}>
                          この返信への最初の返信を投稿すると、ここに表示されます。
                        </Text>
                      </View>
                    ) : null}
                  </View>
                </>
              );
            })()}
          </View>
        </ScrollView>
      ) : null}

      <Modal
        transparent={true}
        visible={bestAnswerCandidate !== null}
        animationType="fade"
        onRequestClose={() => setBestAnswerCandidate(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>ベストアンサーを登録しますか</Text>
            <Text style={styles.modalBody}>
              ベストアンサーは一度登録すると、削除や別の回答への変更はできません。
              内容を確認して問題なければ登録してください。
            </Text>
            <View style={styles.modalButtonRow}>
              <Pressable
                style={styles.modalSecondaryButton}
                onPress={() => setBestAnswerCandidate(null)}
              >
                <Text style={styles.modalSecondaryButtonText}>キャンセル</Text>
              </Pressable>
              <Pressable
                style={styles.modalPrimaryButton}
                onPress={() => {
                  void confirmBestAnswer();
                }}
              >
                <Text style={styles.modalPrimaryButtonText}>OK</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        transparent={true}
        visible={badgeModalState.badges.length > 0}
        animationType="fade"
        onRequestClose={() => setBadgeModalState(INITIAL_BADGE_MODAL_STATE)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{badgeModalState.title}</Text>
            <Text style={styles.modalBody}>
              活動実績に応じて獲得したバッジです。ブロンズ、シルバー、ゴールドの順で成長します。
            </Text>
            <View style={styles.badgeModalStack}>
              {badgeModalState.badges.map((badge) => (
                <View
                  key={`${badge.id}-${badge.tier}`}
                  style={[
                    styles.badgeModalCard,
                    badge.tier === "bronze"
                      ? styles.badgeModalCardBronze
                      : badge.tier === "silver"
                        ? styles.badgeModalCardSilver
                        : styles.badgeModalCardGold,
                  ]}
                >
                  <View style={styles.badgeStackedWrap}>
                    <View
                      style={[
                        styles.kBadge,
                        styles.kBadgeLarge,
                        badge.tier === "bronze"
                          ? styles.badgeBronze
                          : badge.tier === "silver"
                            ? styles.badgeSilver
                            : styles.badgeGold,
                      ]}
                    >
                      <View style={styles.kBadgeInner}>
                        <Text style={styles.kBadgeText}>K</Text>
                      </View>
                    </View>
                    <View style={[styles.badgeRibbon, styles.badgeRibbonLarge]}>
                      <Text style={styles.badgeRibbonText}>
                        {badge.tier === "bronze"
                          ? "BRONZE"
                          : badge.tier === "silver"
                            ? "SILVER"
                            : "GOLD"}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.badgeModalTextWrap}>
                    <Text style={styles.badgeTierText}>
                      {badge.tier === "bronze"
                        ? "ブロンズ"
                        : badge.tier === "silver"
                          ? "シルバー"
                          : "ゴールド"}
                    </Text>
                    <Text style={styles.badgeLabelText}>{badge.label}</Text>
                    <Text style={styles.badgeDescriptionText}>{badge.description}</Text>
                  </View>
                </View>
              ))}
            </View>
            <Pressable
              style={styles.modalPrimaryButton}
              onPress={() => setBadgeModalState(INITIAL_BADGE_MODAL_STATE)}
            >
              <Text style={styles.modalPrimaryButtonText}>閉じる</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal
        transparent={true}
        visible={externalLinkModalState.visible}
        animationType="fade"
        onRequestClose={closeExternalLinkModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>外部サイトを開きます</Text>
            <Text style={styles.modalBody}>
              {externalLinkModalState.label || "外部サイト"} を別タブで開きます。移動先の内容にはご注意ください。
            </Text>
            <Text style={styles.externalLinkModalUrl}>{externalLinkModalState.url}</Text>
            <View style={styles.modalActionRow}>
              <Pressable style={styles.modalSecondaryButton} onPress={closeExternalLinkModal}>
                <Text style={styles.modalSecondaryButtonText}>キャンセル</Text>
              </Pressable>
              <Pressable style={styles.modalPrimaryButton} onPress={() => void confirmOpenExternalUrl()}>
                <Text style={styles.modalPrimaryButtonText}>OK</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {currentScreen === "notifications" ? (
        <ScrollView contentContainerStyle={styles.pageContainer}>
          <RegistrationHeader
            title="通知"
            description="いいね、返信、保存、再投稿、見逃し防止に設定したアカウントの新規投稿を確認できます。"
            onBack={() => setCurrentScreen("top")}
          />
          <View style={styles.stack}>
            {notificationItems.length === 0 ? (
              <View style={styles.communityCard}>
                <Text style={styles.cardTitle}>通知はまだありません</Text>
                <Text style={styles.cardBody}>
                  反応や見逃し防止の設定があると、ここに一覧で表示されます。
                </Text>
              </View>
            ) : null}
            {notificationItems.map((item) => (
              <Pressable
                key={item.id}
                style={styles.notificationCard}
                onPress={() => {
                  if (item.postDetail) {
                    openPostDetail({
                      detail: item.postDetail,
                      backScreen: "notifications",
                    });
                  }
                }}
              >
                <Text style={styles.notificationTitle}>{item.title}</Text>
                <Text style={styles.notificationBody}>{item.body}</Text>
                <Text style={styles.notificationMeta}>
                  {formatDateTimeWithSeconds(item.createdAtMs)}
                </Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>
      ) : null}

      {currentScreen === "post-compose" ? (
        <ScrollView contentContainerStyle={styles.pageContainer}>
          <RegistrationHeader
            title="投稿を作成"
            description={
              !authUser
                ? "投稿の閲覧はできますが、投稿や返信を行うには登録またはログインが必要です。"
                : profileState.role.includes("指導員")
                ? "指導員はタイムラインへ知見やメニューを投稿できます。リプライは全員が参加できます。"
                : "顧問は相談広場またはコミュニティへ投稿できます。リプライは全員が参加できます。"
            }
            onBack={() => setCurrentScreen("top")}
          />
          {authMessage ? <FeedbackBanner kind="success" message={authMessage} /> : null}
          {authError ? <FeedbackBanner kind="error" message={authError} /> : null}
          <View style={styles.registrationCard}>
            {!authUser ? (
              <View style={styles.formGroup}>
                <View style={styles.formLabelRow}>
                  <Text style={styles.formLabel}>投稿先</Text>
                  <Text style={styles.formDetail}>登録が必要です</Text>
                </View>
                <Text style={styles.fieldSupport}>
                  投稿するには会員登録またはログインが必要です。登録後に、役割に応じた投稿先を選べるようになります。
                </Text>
                <View style={styles.registrationFlowCard}>
                  <Text style={styles.registrationFlowText}>
                    投稿機能は登録済みユーザーのみ利用できます。まずは登録して、顧問または指導員としてアカウントを作成してください。
                  </Text>
                  <View style={styles.inlineButtonRow}>
                    <Pressable
                      style={styles.primaryButton}
                      onPress={() => setCurrentScreen("registration-role")}
                    >
                      <Text style={styles.primaryButtonText}>登録する</Text>
                    </Pressable>
                    <Pressable
                      style={styles.secondaryButton}
                      onPress={() => setCurrentScreen("login")}
                    >
                      <Text style={styles.secondaryButtonText}>ログインする</Text>
                    </Pressable>
                  </View>
                </View>
              </View>
            ) : null}
            {authUser ? (
              <>
                <View style={styles.formGroup}>
                  <View style={styles.formLabelRow}>
                    <Text style={styles.formLabel}>投稿先</Text>
                    <Text style={styles.formDetail}>役割に応じて選択</Text>
                  </View>
                  <Text style={styles.fieldSupport}>
                    指導員はタイムラインのみ、顧問は相談広場とコミュニティに投稿できます。
                  </Text>
                  <View style={styles.postTargetRow}>
                    {getAvailablePostTargets(profileState.role).map((target) => {
                      const active = composeState.target === target.key;
                      return (
                        <Pressable
                          key={target.key}
                          style={[
                            styles.postTargetChip,
                            active && styles.postTargetChipActive,
                          ]}
                          onPress={() => updateComposeState("target", target.key)}
                        >
                          <Text
                            style={[
                              styles.postTargetChipText,
                              active && styles.postTargetChipTextActive,
                            ]}
                          >
                            {target.label}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
                <FormField
                  label="タイトル"
                  detail="必須"
                  placeholder="例: 今日の練習で相談したいこと / 共有したいメニュー"
                  multiline={false}
                  value={composeState.title}
                  onChangeText={(value) => updateComposeState("title", value)}
                  maxLength={POST_TITLE_MAX_LENGTH}
                />
                {profileState.role.includes("指導員") && composeState.target === "feed" ? (
                  <View style={styles.formGroup}>
                    <View style={styles.formLabelRow}>
                      <Text style={styles.formLabel}>投稿する種目</Text>
                      <Text style={styles.formDetail}>
                        必須 / 複数選択
                      </Text>
                    </View>
                    <Text style={styles.fieldSupport}>
                      プロフィールで登録している種目の中から、この投稿に該当するものを選択してください。
                    </Text>
                    <View style={styles.sportChipRow}>
                      {profileState.selectedSports.map((sport) => {
                        const selected = composeState.selectedSports.includes(sport);
                        return (
                          <Pressable
                            key={sport}
                            style={[
                              styles.postTargetChip,
                              selected && styles.postTargetChipActive,
                            ]}
                            onPress={() => toggleComposeSport(sport)}
                          >
                            <Text
                              style={[
                                styles.postTargetChipText,
                                selected && styles.postTargetChipTextActive,
                              ]}
                            >
                              {sport}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  </View>
                ) : null}
                <View style={styles.formGroup}>
                  <View style={styles.formLabelRow}>
                    <Text style={styles.formLabel}>本文</Text>
                    <Text style={styles.formDetail}>必須 / {composeState.body.length}/{POST_BODY_MAX_LENGTH}</Text>
                  </View>
                  <Text style={styles.fieldSupport}>
                    `太字` `箇条書き` `引用` をボタン1つで挿入できます。選択中の文字があればその部分に適用します。
                  </Text>
                  <RichTextToolbar onFormat={applyComposeFormatting} />
                  <TextInput
                    placeholder="投稿内容を入力してください"
                    placeholderTextColor="#94a3b8"
                    multiline={true}
                    style={[styles.input, styles.textArea, styles.richEditorInput]}
                    value={composeState.body}
                    onChangeText={(value) => updateComposeState("body", value)}
                    onSelectionChange={(event) =>
                      setComposeBodySelection(event.nativeEvent.selection)
                    }
                    selection={composeBodySelection}
                    maxLength={POST_BODY_MAX_LENGTH}
                  />
                </View>
                <View style={styles.formGroup}>
                  <View style={styles.formLabelRow}>
                    <Text style={styles.formLabel}>画像・動画</Text>
                    <Text style={styles.formDetail}>任意 / 最大4件</Text>
                  </View>
                  <Text style={styles.fieldSupport}>
                    画像または動画を添付できます。動画はアップロード後に添付済みカードとして表示されます。
                  </Text>
                  <Text style={styles.mediaWarningText}>
                    画像や動画を添付する際は、肖像権・著作権・学校や個人が特定される情報に十分注意してください。
                  </Text>
                  <View style={styles.mediaActionRow}>
                    <Pressable style={styles.secondaryButton} onPress={() => void pickComposeMedia()}>
                      <Text style={styles.secondaryButtonText}>メディアを選択</Text>
                    </Pressable>
                  </View>
                  <ComposeMediaPreview media={composeMedia} onRemove={removeComposeMedia} />
                </View>
                <View style={styles.registrationFooter}>
                  <Pressable
                    style={[styles.primaryButton, isPublishing && styles.disabledButton]}
                    onPress={() => {
                      void submitPost();
                    }}
                    disabled={isPublishing}
                  >
                    <Text style={styles.primaryButtonText}>
                      {isPublishing ? "投稿中..." : "投稿を公開する"}
                    </Text>
                  </Pressable>
                </View>
              </>
            ) : null}
          </View>
        </ScrollView>
      ) : null}

      {currentScreen === "search" ? (
        <ScrollView contentContainerStyle={styles.searchPageContainer}>
          <View style={styles.searchHeader}>
            <Pressable
              style={styles.searchBackButton}
              onPress={() => setCurrentScreen("top")}
            >
              <Text style={styles.searchBackButtonText}>戻る</Text>
            </Pressable>
            <View style={styles.searchInputShell}>
              <Text style={styles.searchIcon}>○</Text>
              <TextInput
                style={styles.searchInput}
                placeholder="種目・キーワードで検索"
                placeholderTextColor="#8a8f99"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
          </View>

          <View style={styles.searchTabsBar}>
            {searchTabs.map((tab) => {
              const selected = tab.key === activeSearchTab;
              return (
                <Pressable
                  key={tab.key}
                  style={styles.searchTabButton}
                  onPress={() => setActiveSearchTab(tab.key as SearchTabKey)}
                >
                  <Text
                    style={[
                      styles.searchTabText,
                      selected && styles.searchTabTextActive,
                    ]}
                  >
                    {tab.label}
                  </Text>
                  {selected ? <View style={styles.searchTabUnderline} /> : null}
                </Pressable>
              );
            })}
          </View>

          {activeSearchTab !== "accounts" ? (
            <View style={styles.searchFilterBar}>
              {searchContentFilters.map((filter) => {
                const selected = filter.key === activeSearchContentFilter;
                return (
                  <Pressable
                    key={filter.key}
                    style={[
                      styles.searchFilterChip,
                      selected && styles.searchFilterChipActive,
                    ]}
                    onPress={() => setActiveSearchContentFilter(filter.key)}
                  >
                    <Text
                      style={[
                        styles.searchFilterChipText,
                        selected && styles.searchFilterChipTextActive,
                      ]}
                    >
                      {filter.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          ) : null}

          {activeSearchTab === "trending-posts" ? (
            <View style={styles.searchResultStack}>
              {trendingSearchPosts.length === 0 ? (
                <View style={styles.searchTopicCard}>
                  <Text style={styles.searchTopicTitle}>一致する投稿がありません</Text>
                  <Text style={styles.searchTopicMeta}>
                    別のキーワードや種目名で検索してみてください。
                  </Text>
                </View>
              ) : null}
              {trendingSearchPosts.map((post) => (
                <View key={post.id} style={styles.searchPostCard}>
                  <View style={styles.searchPostTop}>
                    <Pressable
                      style={styles.searchAvatar}
                      onPress={() =>
                        openUserProfile({
                          uid: post.createdByUid,
                          name: post.author,
                          role: post.role,
                          handle: post.authorHandle,
                          selectedSports: post.sports,
                        })
                      }
                    >
                      <DefaultAvatarIcon size={28} />
                    </Pressable>
                    <View style={styles.searchPostBody}>
                      <Pressable
                        onPress={() =>
                          openUserProfile({
                            uid: post.createdByUid,
                            name: post.author,
                            role: post.role,
                            handle: post.authorHandle,
                            selectedSports: post.sports,
                          })
                        }
                      >
                        <Text style={styles.searchPostAuthor}>{post.author}</Text>
                      </Pressable>
                      <Text style={styles.searchPostMeta}>{post.role}</Text>
                      <View style={styles.searchSourceBadge}>
                        <Text style={styles.searchSourceBadgeText}>
                          {post.sourceLabel}
                        </Text>
                      </View>
                      <Pressable
                        style={styles.detailTapArea}
                        onPress={() =>
                          openPostDetail({
                            detail: {
                              id: post.id,
                              source: post.source,
                              sourceLabel: post.sourceLabel,
                              author: post.author,
                              authorHandle: post.authorHandle,
                              createdByUid: post.createdByUid,
                              role: post.role,
                              title: post.title,
                              body: post.body,
                              media: post.media,
                              replies: post.replies,
                              sports: post.sports,
                              tags: post.tags,
                            },
                            backScreen: "search",
                          })
                        }
                      >
                        {(() => {
                          const postDisplay = extractDisplayBodyAndTags(post.body);

                          return (
                            <>
                        <Text style={styles.searchPostTitle}>{post.title}</Text>
                        {postDisplay.bodyText ? (
                          <ExpandableBody
                            id={`mypage-post:${post.id}`}
                            content={postDisplay.bodyText}
                            compact={true}
                            expanded={expandedBodyIds.includes(`mypage-post:${post.id}`)}
                            onToggle={toggleExpandedBody}
                            onOpenUrl={requestOpenExternalUrl}
                          />
                        ) : null}
                        <MediaGallery media={post.media} compact={true} />
                        {renderHashtagChips(postDisplay.tags)}
                        <View style={styles.sportChipRow}>
                          {post.sports.map((sport) => (
                            <View key={sport} style={styles.sportChipActive}>
                              <Text style={styles.sportChipActiveText}>{sport}</Text>
                            </View>
                          ))}
                        </View>
                        <ReplyList replies={post.replies} compact={true} />
                            </>
                          );
                        })()}
                      </Pressable>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          ) : null}

          {activeSearchTab === "recent" ? (
            <View style={styles.searchResultStack}>
              {recentSearchPosts.length === 0 ? (
                <View style={styles.searchTopicCard}>
                  <Text style={styles.searchTopicTitle}>一致する投稿がありません</Text>
                  <Text style={styles.searchTopicMeta}>
                    最近の投稿の中では見つかりませんでした。
                  </Text>
                </View>
              ) : null}
              {recentSearchPosts.map((post, index) => (
                <View key={post.id} style={styles.searchPostCard}>
                  <View style={styles.searchPostTop}>
                    <Pressable
                      style={styles.searchAvatar}
                      onPress={() =>
                        openUserProfile({
                          uid: post.createdByUid,
                          name: post.author,
                          role: post.role,
                          handle: post.authorHandle,
                          selectedSports: post.sports,
                        })
                      }
                    >
                      <DefaultAvatarIcon size={28} />
                    </Pressable>
                    <View style={styles.searchPostBody}>
                      <Pressable
                        onPress={() =>
                          openUserProfile({
                            uid: post.createdByUid,
                            name: post.author,
                            role: post.role,
                            handle: post.authorHandle,
                            selectedSports: post.sports,
                          })
                        }
                      >
                        <Text style={styles.searchPostAuthor}>{post.author}</Text>
                      </Pressable>
                      <Text style={styles.searchPostMeta}>最近の一致 ・ {index + 1}件目</Text>
                      <View style={styles.searchSourceBadge}>
                        <Text style={styles.searchSourceBadgeText}>
                          {post.sourceLabel}
                        </Text>
                      </View>
                      <Pressable
                        style={styles.detailTapArea}
                        onPress={() =>
                          openPostDetail({
                            detail: {
                              id: post.id,
                              source: post.source,
                              sourceLabel: post.sourceLabel,
                              author: post.author,
                              authorHandle: post.authorHandle,
                              createdByUid: post.createdByUid,
                              role: post.role,
                              title: post.title,
                              body: post.body,
                              media: post.media,
                              replies: post.replies,
                              sports: post.sports,
                              tags: post.tags,
                            },
                            backScreen: "search",
                          })
                        }
                      >
                        {(() => {
                          const postDisplay = extractDisplayBodyAndTags(post.body);

                          return (
                            <>
                        <Text style={styles.searchPostTitle}>{post.title}</Text>
                        {postDisplay.bodyText ? (
                          <RichTextRenderer content={postDisplay.bodyText} compact={true} onOpenUrl={requestOpenExternalUrl} />
                        ) : null}
                        <MediaGallery media={post.media} compact={true} />
                        {renderHashtagChips(postDisplay.tags)}
                        <ReplyList replies={post.replies} compact={true} />
                            </>
                          );
                        })()}
                      </Pressable>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          ) : null}

          {activeSearchTab === "accounts" ? (
            <View style={styles.searchTopicStack}>
              {searchAccounts.length === 0 ? (
                <View style={styles.searchTopicCard}>
                  <Text style={styles.searchTopicTitle}>一致するアカウントがありません</Text>
                  <Text style={styles.searchTopicMeta}>
                    名前、ID、プロフィール文のキーワードで探してみてください。
                  </Text>
                </View>
              ) : null}
              {searchAccounts.map((account) => (
                <View key={account.id} style={styles.searchAccountCard}>
                  <Pressable
                    style={styles.searchAvatar}
                    onPress={() =>
                      openUserProfile({
                        uid: account.id.startsWith("expert-") ? undefined : account.id,
                        name: account.name,
                        role: account.role,
                        bio: account.bio,
                        handle: account.handle,
                        followers: account.followers,
                        selectedSports: account.selectedSports,
                      })
                    }
                  >
                    <DefaultAvatarIcon size={28} />
                  </Pressable>
                  <View style={styles.searchAccountBody}>
                    <View style={styles.searchAccountHeader}>
                      <Pressable
                        style={styles.searchAccountTextWrap}
                        onPress={() =>
                          openUserProfile({
                            uid: account.id.startsWith("expert-") ? undefined : account.id,
                            name: account.name,
                            role: account.role,
                            bio: account.bio,
                            handle: account.handle,
                            followers: account.followers,
                            selectedSports: account.selectedSports,
                          })
                        }
                      >
                        <Text style={styles.searchPostAuthor}>{account.name}</Text>
                        <Text style={styles.searchPostMeta}>{account.handle}</Text>
                      </Pressable>
                      {account.id !== authUser?.uid ? (
                        <Pressable
                          style={[
                            styles.searchFollowButton,
                            !account.id.startsWith("expert-") &&
                            currentFollowingUserIds.includes(account.id)
                              ? styles.searchFollowButtonFollowing
                              : styles.searchFollowButtonPrimary,
                          ]}
                          onPress={() => {
                            if (account.id.startsWith("expert-")) {
                              return;
                            }
                            void toggleFollowProfile({
                              targetUid: account.id,
                              targetName: account.name,
                            });
                          }}
                        >
                          <Text
                            style={[
                              styles.searchFollowButtonText,
                              !account.id.startsWith("expert-") &&
                              currentFollowingUserIds.includes(account.id)
                                ? styles.searchFollowButtonTextFollowing
                                : styles.searchFollowButtonTextPrimary,
                            ]}
                          >
                            {!account.id.startsWith("expert-") &&
                            currentFollowingUserIds.includes(account.id)
                              ? "フォロー中"
                              : "フォロー"}
                          </Text>
                        </Pressable>
                      ) : null}
                    </View>
                    <Text style={styles.cardBody}>{account.bio}</Text>
                    <Text style={styles.searchTopicMeta}>
                      フォロワー {account.followers}
                      {account.featured ? " ・ 注目アカウント" : ""}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          ) : null}
        </ScrollView>
      ) : null}

      {currentScreen === "mypage" ? (
        <ScrollView contentContainerStyle={styles.pageContainer}>
          <View style={styles.stack}>
            <View style={styles.profileShell}>
              <View style={styles.profileBanner} />
              <View style={styles.profileTopRow}>
                <View style={styles.profileAvatar}>
                  <DefaultAvatarIcon size={52} tone="light" />
                </View>
                <Pressable
                  style={styles.profileEditButton}
                  onPress={() => goToScreen("profile-edit")}
                >
                  <Text style={styles.profileEditButtonText}>
                    プロフィールを編集
                  </Text>
                </Pressable>
              </View>

              <View style={styles.profileBody}>
                <View style={styles.profileNameRow}>
                  <Text style={styles.profileName}>{profileState.name}</Text>
                </View>
                <Text style={styles.profileHandle}>{profileState.handle}</Text>
                <Text style={styles.profileRole}>{profileState.role}</Text>
                <Text style={styles.profileBio}>{profileState.bio}</Text>
                <Text style={styles.profileLink}>{profileState.link}</Text>
                {profileState.externalLinks.length > 0 ? (
                  <View style={styles.externalLinksRow}>
                    {profileState.externalLinks.map((link) => (
                      <Pressable
                        key={link.id}
                        style={styles.externalLinkChip}
                        onPress={() => requestOpenExternalUrl(link.url, link.label)}
                      >
                        <Text style={styles.externalLinkChipText}>{link.label}</Text>
                      </Pressable>
                    ))}
                  </View>
                ) : null}
                <Text style={styles.profileJoined}>{profileState.joined}</Text>
                <View style={styles.sportChipRow}>
                  {profileState.selectedSports.map((sport) => (
                    <View key={sport} style={styles.sportChipActive}>
                      <Text style={styles.sportChipActiveText}>{sport}</Text>
                    </View>
                  ))}
                </View>
                <ActivityBadgeSection
                  badges={currentUserActivitySummary?.badges ?? []}
                  onOpen={() =>
                    setBadgeModalState({
                      title: `${profileState.name} の活動バッジ`,
                      badges: currentUserActivitySummary?.badges ?? [],
                    })
                  }
                />
                <View style={styles.profileFollowRow}>
                  <Pressable
                    onPress={() =>
                      openRelationshipList({
                        mode: "following",
                        targetUid: authUser?.uid,
                        title: "フォロー一覧",
                        backScreen: "mypage",
                      })
                    }
                  >
                    <Text style={styles.profileFollowText}>
                      <Text style={styles.profileFollowValue}>
                        {currentProfileFollowingValue}
                      </Text>{" "}
                      フォロー中
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() =>
                      openRelationshipList({
                        mode: "followers",
                        targetUid: authUser?.uid,
                        title: "フォロワー一覧",
                        backScreen: "mypage",
                      })
                    }
                  >
                    <Text style={styles.profileFollowText}>
                      <Text style={styles.profileFollowValue}>
                        {currentProfileFollowersValue}
                      </Text>{" "}
                      フォロワー
                    </Text>
                  </Pressable>
                  <Text style={styles.profileFollowText}>
                    <Text style={styles.profileFollowValue}>
                      {currentProfilePostsValue}
                    </Text>{" "}
                    投稿
                  </Text>
                </View>
                <Pressable
                  style={styles.profileFeedButton}
                  onPress={() => goToScreen("following-feed")}
                >
                  <Text style={styles.profileFeedButtonText}>
                    フォロー中の投稿を見る
                  </Text>
                </Pressable>
              </View>
            </View>

            <View style={styles.profileTabBar}>
              {myPageTabs.map((tab) => (
                <Pressable
                  key={tab.key}
                  onPress={() => setActiveProfileTab(tab.key as ProfileTabKey)}
                  style={[
                    styles.profileTabItem,
                    activeProfileTab === tab.key && styles.profileTabItemActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.profileTabText,
                      activeProfileTab === tab.key && styles.profileTabTextActive,
                    ]}
                  >
                    {tab.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            <View style={styles.stack}>
              {activeProfileTab === "posts"
                ? currentUserVisiblePosts.map((post) => (
                    <View key={post.id} style={styles.profilePostCard}>
                      {pinnedPostKey === `${post.source}:${post.id}` ? (
                        <View style={styles.pinnedNoticeRow}>
                          <Text style={styles.pinnedNoticeText}>固定中</Text>
                        </View>
                      ) : null}
                      {post.displayRole ? (
                        <View style={styles.repostNoticeRow}>
                          <Text style={styles.repostNoticeIcon}>↻</Text>
                          <Text style={styles.repostNoticeText}>
                            {profileState.name} さんが再投稿
                          </Text>
                        </View>
                      ) : null}
                      <View style={styles.profilePostHeader}>
                        <View style={styles.profilePostMiniAvatar}>
                          <DefaultAvatarIcon size={24} />
                        </View>
                        <View style={styles.profilePostHeaderText}>
                          <Text style={styles.profilePostName}>{profileState.name}</Text>
                          <Text style={styles.profilePostMeta}>
                            {profileState.handle} ・ {post.displayRole ?? post.role}
                          </Text>
                        </View>
                        <View style={styles.profileSourceBadge}>
                          <Text style={styles.profileSourceBadgeText}>
                            {post.sourceLabel}
                          </Text>
                        </View>
                      </View>
                      <Pressable
                        style={styles.detailTapArea}
                        onPress={() =>
                          openPostDetail({
                            detail: {
                              id: post.id,
                              source: post.source,
                              sourceLabel: post.sourceLabel,
                              author: post.author,
                              authorHandle: post.authorHandle,
                              createdByUid: post.createdByUid,
                              role: post.role,
                              title: post.title,
                              body: post.body,
                              media: post.media,
                              replies: post.replies,
                              sports: post.sports,
                              tags: post.tags,
                              createdAtMs: post.createdAtMs,
                            },
                            backScreen: "mypage",
                          })
                        }
                      >
                        {(() => {
                          const postDisplay = extractDisplayBodyAndTags(post.body);

                          return (
                            <>
                        <Text style={styles.profilePostTitle}>{post.title}</Text>
                        {postDisplay.bodyText ? (
                          <ExpandableBody
                            id={`user-post:${post.id}`}
                            content={postDisplay.bodyText}
                            compact={true}
                            expanded={expandedBodyIds.includes(`user-post:${post.id}`)}
                            onToggle={toggleExpandedBody}
                            onOpenUrl={requestOpenExternalUrl}
                          />
                        ) : null}
                        <MediaGallery media={post.media} compact={true} />
                        {renderHashtagChips(postDisplay.tags)}
                            </>
                          );
                        })()}
                      </Pressable>
                      <Pressable
                        style={styles.inlineActionButton}
                        onPress={() => void togglePinnedPost(post)}
                      >
                        <Text style={styles.inlineActionButtonText}>
                          {pinnedPostKey === `${post.source}:${post.id}` ? "固定を解除" : "この投稿を固定"}
                        </Text>
                      </Pressable>
                      <View style={styles.profilePostMetrics}>
                        <Text style={styles.profileMetricText}>
                          返信 {post.replies.length}
                        </Text>
                      </View>
                    </View>
                  ))
                : null}
              {activeProfileTab === "answers"
                ? currentUserAnswers.map((answer) => (
                    <View key={answer.id} style={styles.profilePostCard}>
                      <View style={styles.profilePostHeader}>
                        <View style={styles.profilePostMiniAvatar}>
                          <DefaultAvatarIcon size={24} />
                        </View>
                        <View style={styles.profilePostHeaderText}>
                          <Text style={styles.profilePostName}>{profileState.name}</Text>
                          <Text style={styles.profilePostMeta}>
                            {profileState.handle} ・ 回答
                          </Text>
                        </View>
                        <View style={styles.profileSourceBadge}>
                          <Text style={styles.profileSourceBadgeText}>
                            {answer.sourceLabel}
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.profilePostTitle}>{answer.parentTitle}</Text>
                      <ExpandableBody
                        id={`mypage-answer:${answer.id}`}
                        content={answer.body}
                        expanded={expandedBodyIds.includes(`mypage-answer:${answer.id}`)}
                        onToggle={toggleExpandedBody}
                        onOpenUrl={requestOpenExternalUrl}
                      />
                    </View>
                  ))
                : null}
              {activeProfileTab === "best_answers"
                ? currentUserBestAnswers.map(({ question, bestReply }) => (
                    <View key={question.id} style={styles.profilePostCard}>
                      <View style={styles.profilePostHeader}>
                        <View style={styles.profilePostMiniAvatar}>
                          <DefaultAvatarIcon size={24} />
                        </View>
                        <View style={styles.profilePostHeaderText}>
                          <Text style={styles.profilePostName}>{profileState.name}</Text>
                          <Text style={styles.profilePostMeta}>
                            {profileState.handle} ・ ベストアンサー
                          </Text>
                        </View>
                        <View style={styles.profileSourceBadge}>
                          <Text style={styles.profileSourceBadgeText}>相談広場</Text>
                        </View>
                      </View>
                      <Text style={styles.profilePostTitle}>{question.title}</Text>
                      <RichTextRenderer content={bestReply?.body ?? ""} onOpenUrl={requestOpenExternalUrl} />
                    </View>
                  ))
                : null}
              {activeProfileTab === "posts" && currentUserVisiblePosts.length === 0 ? (
                <View style={styles.communityCard}>
                  <Text style={styles.cardTitle}>投稿はありません</Text>
                </View>
              ) : null}
              {activeProfileTab === "answers" && currentUserAnswers.length === 0 ? (
                <View style={styles.communityCard}>
                  <Text style={styles.cardTitle}>回答はありません</Text>
                </View>
              ) : null}
              {activeProfileTab === "best_answers" && currentUserBestAnswers.length === 0 ? (
                <View style={styles.communityCard}>
                  <Text style={styles.cardTitle}>ベストアンサーはありません</Text>
                </View>
              ) : null}
            </View>
          </View>
        </ScrollView>
      ) : null}

      {currentScreen === "following-feed" ? (
        <ScrollView contentContainerStyle={styles.pageContainer}>
          <PageIntro
            title="フォロー中の投稿"
            description="フォローしているユーザーのタイムライン投稿だけをまとめて確認できます。"
          />
          <View style={styles.stack}>
            {followingFeedPosts.length === 0 ? (
              <View style={styles.communityCard}>
                <Text style={styles.cardTitle}>まだ投稿がありません</Text>
                <Text style={styles.cardBody}>
                  アカウントをフォローすると、ここにその人の投稿が表示されます。
                </Text>
              </View>
            ) : null}
            {followingFeedPosts.map((post) => {
              const followingPostDisplay = extractDisplayBodyAndTags(post.body);
              return (
              <View key={post.id} style={styles.postCard}>
                <View style={styles.postHeader}>
                  <Pressable
                    style={styles.authorRow}
                    onPress={() =>
                      openUserProfile({
                        uid: post.createdByUid,
                        name: post.author,
                        role: post.role,
                        handle: post.authorHandle,
                        selectedSports: post.sports,
                      })
                    }
                  >
                    <View style={styles.authorAvatar}>
                      <DefaultAvatarIcon size={28} />
                    </View>
                    <View style={styles.authorTextBlock}>
                      <Text style={styles.cardTitle}>{post.title}</Text>
                      <Text style={styles.cardMeta}>
                        {post.author} ・ {post.role}
                      </Text>
                    </View>
                  </Pressable>
                  <View style={styles.pill}>
                    <Text style={styles.pillText}>フォロー中</Text>
                  </View>
                </View>
                <Pressable
                  style={styles.detailTapArea}
                  onPress={() =>
                    openPostDetail({
                      detail: buildFeedDetail(post),
                      backScreen: "following-feed",
                      })
                  }
                >
                  {followingPostDisplay.bodyText ? (
                    <ExpandableBody
                      id={`following:${post.id}`}
                      content={followingPostDisplay.bodyText}
                      expanded={expandedBodyIds.includes(`following:${post.id}`)}
                      onToggle={toggleExpandedBody}
                      onOpenUrl={requestOpenExternalUrl}
                    />
                  ) : null}
                  <MediaGallery media={post.media} />
                  {renderHashtagChips(followingPostDisplay.tags)}
                </Pressable>
                <ReplyList replies={post.replies} />
              </View>
            )})}
          </View>
        </ScrollView>
      ) : null}

      {currentScreen === "relationship-list" ? (
        <ScrollView contentContainerStyle={styles.pageContainer}>
          <RegistrationHeader
            title={relationshipListState.title}
            description="プロフィールからつながっているアカウント一覧です。"
            onBack={() => setCurrentScreen(relationshipListState.backScreen)}
          />
          <View style={styles.searchTopicStack}>
            {relationshipListState.accounts.length === 0 ? (
              <View style={styles.searchTopicCard}>
                <Text style={styles.searchTopicTitle}>まだアカウントがいません</Text>
                <Text style={styles.searchTopicMeta}>
                  フォローまたはフォロワーがあると、ここに一覧表示されます。
                </Text>
              </View>
            ) : null}
            {relationshipListState.accounts.map((account) => (
              <View key={account.id} style={styles.searchAccountCard}>
                <Pressable
                  style={styles.searchAvatar}
                  onPress={() =>
                    openUserProfile({
                      uid: account.id,
                      name: account.name,
                      role: account.role,
                      bio: account.bio,
                      handle: account.handle,
                      followers: account.followers,
                      selectedSports: account.selectedSports,
                    })
                  }
                >
                  <DefaultAvatarIcon size={28} />
                </Pressable>
                <View style={styles.searchAccountBody}>
                  <View style={styles.searchAccountHeader}>
                    <Pressable
                      style={styles.searchAccountTextWrap}
                      onPress={() =>
                        openUserProfile({
                          uid: account.id,
                          name: account.name,
                          role: account.role,
                          bio: account.bio,
                          handle: account.handle,
                          followers: account.followers,
                          selectedSports: account.selectedSports,
                        })
                      }
                    >
                      <Text style={styles.searchPostAuthor}>{account.name}</Text>
                      <Text style={styles.searchPostMeta}>{account.handle}</Text>
                    </Pressable>
                    {account.id !== authUser?.uid ? (
                      <Pressable
                        style={[
                          styles.searchFollowButton,
                          currentFollowingUserIds.includes(account.id)
                            ? styles.searchFollowButtonFollowing
                            : styles.searchFollowButtonPrimary,
                        ]}
                        onPress={() =>
                          void toggleFollowProfile({
                            targetUid: account.id,
                            targetName: account.name,
                          })
                        }
                      >
                        <Text
                          style={[
                            styles.searchFollowButtonText,
                            currentFollowingUserIds.includes(account.id)
                              ? styles.searchFollowButtonTextFollowing
                              : styles.searchFollowButtonTextPrimary,
                          ]}
                        >
                          {currentFollowingUserIds.includes(account.id)
                            ? "フォロー中"
                            : "フォロー"}
                        </Text>
                      </Pressable>
                    ) : null}
                  </View>
                  <Text style={styles.cardBody}>{account.bio}</Text>
                  <Text style={styles.searchTopicMeta}>フォロワー {account.followers}</Text>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      ) : null}

      {currentScreen === "user-profile" ? (
        <ScrollView contentContainerStyle={styles.pageContainer}>
          <View style={styles.stack}>
            <View style={styles.profileShell}>
              <View
                style={[
                  styles.profileBanner,
                  { backgroundColor: selectedUserProfile.coverTone },
                ]}
              />
              <View style={styles.profileTopRow}>
                <View style={[styles.profileAvatar, styles.userProfileAvatar]}>
                  <DefaultAvatarIcon size={52} tone="light" />
                </View>
                <View style={styles.userProfileActions}>
                  <Pressable
                    style={styles.profileIconButton}
                    onPress={() => setCurrentScreen("feed")}
                  >
                    <Text style={styles.profileIconButtonText}>戻る</Text>
                  </Pressable>
                  {selectedUserProfile.uid && selectedUserProfile.uid !== authUser?.uid ? (
                    <Pressable
                      style={[
                        styles.profileFollowButton,
                        isFollowingSelectedProfile
                          ? styles.profileFollowButtonFollowing
                          : styles.profileFollowButtonPrimary,
                      ]}
                      onPress={() =>
                        void toggleFollowProfile({
                          targetUid: selectedUserProfile.uid!,
                          targetName: selectedUserProfile.name,
                        })
                      }
                    >
                      <Text
                        style={[
                          styles.profileFollowButtonText,
                          isFollowingSelectedProfile
                            ? styles.profileFollowButtonTextFollowing
                            : styles.profileFollowButtonTextPrimary,
                        ]}
                      >
                        {isFollowingSelectedProfile ? "フォロー中" : "フォロー"}
                      </Text>
                    </Pressable>
                  ) : null}
                </View>
              </View>

              <View style={styles.profileBody}>
                <View style={styles.profileNameRow}>
                  <Text style={styles.profileName}>{selectedUserProfile.name}</Text>
                </View>
                <Text style={styles.profileHandle}>{selectedUserProfile.handle}</Text>
                <Text style={styles.profileRole}>{selectedUserProfile.role}</Text>
                <Text style={styles.profileBio}>{selectedUserProfile.bio}</Text>
                <Text style={styles.profileLink}>{selectedUserProfile.link}</Text>
                {selectedUserProfile.externalLinks.length > 0 ? (
                  <View style={styles.externalLinksRow}>
                    {selectedUserProfile.externalLinks.map((link) => (
                      <Pressable
                        key={link.id}
                        style={styles.externalLinkChip}
                        onPress={() => requestOpenExternalUrl(link.url, link.label)}
                      >
                        <Text style={styles.externalLinkChipText}>{link.label}</Text>
                      </Pressable>
                    ))}
                  </View>
                ) : null}
                <Text style={styles.profileJoined}>{selectedUserProfile.joined}</Text>
                <View style={styles.sportChipRow}>
                  {selectedUserProfile.selectedSports.map((sport) => (
                    <View key={sport} style={styles.sportChipActive}>
                      <Text style={styles.sportChipActiveText}>{sport}</Text>
                    </View>
                  ))}
                </View>
                <ActivityBadgeSection
                  badges={selectedUserActivitySummary?.badges ?? []}
                  onOpen={() =>
                    setBadgeModalState({
                      title: `${selectedUserProfile.name} の活動バッジ`,
                      badges: selectedUserActivitySummary?.badges ?? [],
                    })
                  }
                />
                <View style={styles.profileFollowRow}>
                  <Pressable
                    onPress={() =>
                      openRelationshipList({
                        mode: "following",
                        targetUid: selectedUserProfile.uid,
                        title: `${selectedUserProfile.name} のフォロー一覧`,
                        backScreen: "user-profile",
                      })
                    }
                  >
                    <Text style={styles.profileFollowText}>
                      <Text style={styles.profileFollowValue}>
                        {selectedProfileFollowingValue}
                      </Text>{" "}
                      フォロー中
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() =>
                      openRelationshipList({
                        mode: "followers",
                        targetUid: selectedUserProfile.uid,
                        title: `${selectedUserProfile.name} のフォロワー一覧`,
                        backScreen: "user-profile",
                      })
                    }
                  >
                    <Text style={styles.profileFollowText}>
                      <Text style={styles.profileFollowValue}>
                        {selectedProfileFollowersValue}
                      </Text>{" "}
                      フォロワー
                    </Text>
                  </Pressable>
                  <Text style={styles.profileFollowText}>
                    <Text style={styles.profileFollowValue}>
                      {selectedProfilePostsValue}
                    </Text>{" "}
                    投稿
                  </Text>
                  <Text style={styles.profileFollowText}>
                    <Text style={styles.profileFollowValue}>
                      {selectedUserBestAnswerCount}
                    </Text>{" "}
                    ベストアンサー
                  </Text>
                </View>
                {selectedUserProfile.uid && selectedUserProfile.uid !== authUser?.uid ? (
                  <View style={styles.userControlRow}>
                    <Pressable
                      style={styles.inlineActionButton}
                      onPress={() =>
                        void togglePostAlertsForUser({
                          targetUid: selectedUserProfile.uid,
                          targetName: selectedUserProfile.name,
                        })
                      }
                    >
                      <Text style={styles.inlineActionButtonText}>
                        {currentPostAlertUserIds.includes(selectedUserProfile.uid)
                          ? "投稿通知中"
                          : "投稿を見逃さない"}
                      </Text>
                    </Pressable>
                    <Pressable
                      style={styles.inlineActionButton}
                      onPress={() =>
                        void toggleBlockUser({
                          targetUid: selectedUserProfile.uid,
                          targetName: selectedUserProfile.name,
                        })
                      }
                    >
                      <Text style={styles.inlineActionButtonText}>
                        {currentBlockedUserIds.includes(selectedUserProfile.uid)
                          ? "ブロック解除"
                          : "ブロック"}
                      </Text>
                    </Pressable>
                    <Pressable
                      style={styles.inlineActionButton}
                      onPress={() =>
                        void reportUserAsSpam({
                          targetUid: selectedUserProfile.uid,
                          targetName: selectedUserProfile.name,
                        })
                      }
                    >
                      <Text style={styles.inlineActionButtonText}>スパム報告</Text>
                    </Pressable>
                  </View>
                ) : null}
              </View>
            </View>

            <View style={styles.profileTabBar}>
              {myPageTabs.map((tab) => (
                <Pressable
                  key={tab.key}
                  onPress={() => setActiveProfileTab(tab.key as ProfileTabKey)}
                  style={[
                    styles.profileTabItem,
                    activeProfileTab === tab.key && styles.profileTabItemActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.profileTabText,
                      activeProfileTab === tab.key && styles.profileTabTextActive,
                    ]}
                  >
                    {tab.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            <View style={styles.stack}>
              {activeProfileTab === "posts"
                ? selectedUserVisiblePosts.map((post) => (
                    <View key={post.id} style={styles.profilePostCard}>
                      {selectedUserPinnedKey === `${post.source}:${post.id}` ? (
                        <View style={styles.pinnedNoticeRow}>
                          <Text style={styles.pinnedNoticeText}>固定中</Text>
                        </View>
                      ) : null}
                      {post.displayRole ? (
                        <View style={styles.repostNoticeRow}>
                          <Text style={styles.repostNoticeIcon}>↻</Text>
                          <Text style={styles.repostNoticeText}>
                            {selectedUserProfile.name} さんが再投稿
                          </Text>
                        </View>
                      ) : null}
                      <View style={styles.profilePostHeader}>
                        <View style={styles.profilePostMiniAvatar}>
                          <DefaultAvatarIcon size={24} />
                        </View>
                        <View style={styles.profilePostHeaderText}>
                          <Text style={styles.profilePostName}>
                            {selectedUserProfile.name}
                          </Text>
                          <Text style={styles.profilePostMeta}>
                            {selectedUserProfile.handle} ・ {post.displayRole ?? post.role}
                          </Text>
                        </View>
                        <View style={styles.profileSourceBadge}>
                          <Text style={styles.profileSourceBadgeText}>
                            {post.sourceLabel}
                          </Text>
                        </View>
                      </View>
                      <Pressable
                        style={styles.detailTapArea}
                        onPress={() =>
                          openPostDetail({
                            detail: {
                              id: post.id,
                              source: post.source,
                              sourceLabel: post.sourceLabel,
                              author: post.author,
                              authorHandle: post.authorHandle,
                              createdByUid: post.createdByUid,
                              role: post.role,
                              title: post.title,
                              body: post.body,
                              media: post.media,
                              replies: post.replies,
                              sports: post.sports,
                              tags: post.tags,
                              createdAtMs: post.createdAtMs,
                            },
                            backScreen: "user-profile",
                          })
                        }
                      >
                        {(() => {
                          const postDisplay = extractDisplayBodyAndTags(post.body);

                          return (
                            <>
                        <Text style={styles.profilePostTitle}>{post.title}</Text>
                        {postDisplay.bodyText ? (
                          <ExpandableBody
                            id={`user-post:${post.id}`}
                            content={postDisplay.bodyText}
                            compact={true}
                            expanded={expandedBodyIds.includes(`user-post:${post.id}`)}
                            onToggle={toggleExpandedBody}
                            onOpenUrl={requestOpenExternalUrl}
                          />
                        ) : null}
                        <MediaGallery media={post.media} compact={true} />
                        {renderHashtagChips(postDisplay.tags)}
                            </>
                          );
                        })()}
                      </Pressable>
                      <View style={styles.profilePostMetrics}>
                        <Text style={styles.profileMetricText}>
                          返信 {post.replies.length}
                        </Text>
                      </View>
                    </View>
                  ))
                : null}
              {activeProfileTab === "answers"
                ? selectedUserAnswers.map((answer) => (
                    <View key={answer.id} style={styles.profilePostCard}>
                      <View style={styles.profilePostHeader}>
                        <View style={styles.profilePostMiniAvatar}>
                          <DefaultAvatarIcon size={24} />
                        </View>
                        <View style={styles.profilePostHeaderText}>
                          <Text style={styles.profilePostName}>
                            {selectedUserProfile.name}
                          </Text>
                          <Text style={styles.profilePostMeta}>
                            {selectedUserProfile.handle} ・ 回答
                          </Text>
                        </View>
                        <View style={styles.profileSourceBadge}>
                          <Text style={styles.profileSourceBadgeText}>
                            {answer.sourceLabel}
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.profilePostTitle}>{answer.parentTitle}</Text>
                      <ExpandableBody
                        id={`user-answer:${answer.id}`}
                        content={answer.body}
                        expanded={expandedBodyIds.includes(`user-answer:${answer.id}`)}
                        onToggle={toggleExpandedBody}
                        onOpenUrl={requestOpenExternalUrl}
                      />
                    </View>
                  ))
                : null}
              {activeProfileTab === "best_answers"
                ? selectedUserBestAnswers.map(({ question, bestReply }) => (
                    <View key={question.id} style={styles.profilePostCard}>
                      <View style={styles.profilePostHeader}>
                        <View style={styles.profilePostMiniAvatar}>
                          <DefaultAvatarIcon size={24} />
                        </View>
                        <View style={styles.profilePostHeaderText}>
                          <Text style={styles.profilePostName}>
                            {selectedUserProfile.name}
                          </Text>
                          <Text style={styles.profilePostMeta}>
                            {selectedUserProfile.handle} ・ ベストアンサー
                          </Text>
                        </View>
                        <View style={styles.profileSourceBadge}>
                          <Text style={styles.profileSourceBadgeText}>相談広場</Text>
                        </View>
                      </View>
                      <Text style={styles.profilePostTitle}>{question.title}</Text>
                      <RichTextRenderer content={bestReply?.body ?? ""} onOpenUrl={requestOpenExternalUrl} />
                    </View>
                  ))
                : null}
              {activeProfileTab === "posts" && selectedUserVisiblePosts.length === 0 ? (
                <View style={styles.communityCard}>
                  <Text style={styles.cardTitle}>投稿はありません</Text>
                </View>
              ) : null}
              {activeProfileTab === "answers" && selectedUserAnswers.length === 0 ? (
                <View style={styles.communityCard}>
                  <Text style={styles.cardTitle}>回答はありません</Text>
                </View>
              ) : null}
              {activeProfileTab === "best_answers" &&
              selectedUserBestAnswers.length === 0 ? (
                <View style={styles.communityCard}>
                  <Text style={styles.cardTitle}>ベストアンサーはありません</Text>
                </View>
              ) : null}
            </View>
          </View>
        </ScrollView>
      ) : null}

      {currentScreen === "profile-edit" ? (
        <ScrollView contentContainerStyle={styles.pageContainer}>
          <RegistrationHeader
            title="プロフィール編集"
            description="表示名、自己紹介、興味のある種目を編集できます。ここで選んだ種目がタイムライン表示にも反映されます。"
            onBack={() => setCurrentScreen("mypage")}
          />
          {authMessage ? <FeedbackBanner kind="success" message={authMessage} /> : null}
          {authError ? <FeedbackBanner kind="error" message={authError} /> : null}
          <View style={styles.registrationCard}>
            <FormField
              label="表示名"
              detail="必須"
              placeholder="例: Coach Nexus"
              multiline={false}
              value={profileDraft.name}
              onChangeText={(value) => updateProfileDraft("name", value)}
            />
            <FormField
              label="表示ID"
              detail="必須"
              placeholder="例: @coach_nexus"
              multiline={false}
              value={profileDraft.handle}
              onChangeText={(value) => updateProfileDraft("handle", value)}
            />
            <FormField
              label="自己紹介"
              detail="任意"
              placeholder="活動内容や相談対応の方針を入力"
              multiline={true}
              value={profileDraft.bio}
              onChangeText={(value) => updateProfileDraft("bio", value)}
            />
            <FormField
              label="プロフィールリンク"
              detail="任意"
              placeholder="例: komonity.jp/profile/..."
              multiline={false}
              value={profileDraft.link}
              onChangeText={(value) => updateProfileDraft("link", value)}
            />
            {profileDraft.role.includes("指導員") ? (
              <View style={styles.formGroup}>
                <View style={styles.formLabelRow}>
                  <Text style={styles.formLabel}>外部サイト情報</Text>
                  <Text style={styles.formDetail}>任意項目 / 複数可</Text>
                </View>
                <Text style={styles.fieldSupport}>
                  YouTube、Instagram、公式サイトなどを、名前とURLのセットで編集できます。
                </Text>
                <View style={styles.linkStack}>
                  {profileDraft.externalLinks.map((link, index) => (
                    <View key={link.id} style={styles.linkCard}>
                      <Text style={styles.linkIndex}>リンク {index + 1}</Text>
                      <TextInput
                        placeholder="Webサイト名 例: YouTube"
                        placeholderTextColor="#94a3b8"
                        style={styles.input}
                        value={link.label}
                        onChangeText={(value) => updateProfileLink(link.id, "label", value)}
                      />
                      <TextInput
                        placeholder="URL 例: https://youtube.com/..."
                        placeholderTextColor="#94a3b8"
                        autoCapitalize="none"
                        style={styles.input}
                        value={link.url}
                        onChangeText={(value) => updateProfileLink(link.id, "url", value)}
                      />
                    </View>
                  ))}
                  <Pressable style={styles.addButton} onPress={addProfileLink}>
                    <Text style={styles.addButtonText}>+ 入力欄を追加する</Text>
                  </Pressable>
                </View>
              </View>
            ) : null}
            <SportSelector
              title="表示したい種目"
              detail="必須 / 複数選択"
              groups={sportGroups}
              selectedSports={profileDraft.selectedSports}
              onToggle={toggleProfileSport}
            />
            <View style={styles.registrationFooter}>
              <Pressable style={styles.primaryButton} onPress={() => void saveProfileEdits()}>
                <Text style={styles.primaryButtonText}>変更を保存する</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      ) : null}

      {currentScreen === "registration-role" ? (
        <ScrollView contentContainerStyle={styles.pageContainer}>
          <RegistrationHeader
            title="登録タイプを選択"
            description="ここで役割を選ぶと、それぞれ専用の登録ページへ進みます。"
            onBack={() => setCurrentScreen("top")}
          />
          <View style={styles.stack}>
            {registrationOptions.map((option) => (
              <Pressable
                key={option.id}
                style={styles.roleCard}
                onPress={() =>
                  setCurrentScreen(
                    option.id === "advisor"
                      ? "advisor-registration"
                      : "coach-registration"
                  )
                }
              >
                <Text style={styles.flowOptionTitle}>{option.title}</Text>
                <Text style={styles.flowOptionText}>{option.description}</Text>
                <Text style={styles.flowOptionCta}>専用登録ページへ進む</Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>
      ) : null}

      {currentScreen === "advisor-registration" ? (
        <ScrollView contentContainerStyle={styles.pageContainer}>
          <RegistrationHeader
            title="顧問登録ページ"
            description="学校名などの個人情報につながる表現を避けつつ、安心して相談参加できる登録画面を想定しています。ログイン用メールアドレスとパスワードは、ログイン時に使う非公開情報です。"
            onBack={() => setCurrentScreen("registration-role")}
          />
          {authMessage ? <FeedbackBanner kind="success" message={authMessage} /> : null}
          {authError ? <FeedbackBanner kind="error" message={authError} /> : null}
          <View style={styles.registrationCard}>
            <ImageField
              title="アイコン"
              detail="任意項目"
              imageUri={advisorIconUri}
              onPress={() => {
                void pickImage("advisor");
              }}
            />
            {advisorRegistrationFields.map((field) => (
              <FormField
                key={field.label}
                label={field.label}
                detail={field.detail}
                placeholder={field.placeholder}
                multiline={false}
                value={getAdvisorFieldValue(field.label, advisorForm)}
                onChangeText={(value) =>
                  updateAdvisorForm(getAdvisorFieldKey(field.label), value)
                }
              />
            ))}
            <SportSelector
              title="表示したい種目"
              detail="必須 / 複数選択"
              groups={sportGroups}
              selectedSports={advisorForm.selectedSports}
              onToggle={toggleAdvisorSport}
            />
            <View style={styles.registrationFooter}>
              <Pressable
                style={[styles.primaryButton, isSubmitting && styles.disabledButton]}
                onPress={() => {
                  void registerAdvisor();
                }}
                disabled={isSubmitting}
              >
                <Text style={styles.primaryButtonText}>
                  {isSubmitting ? "登録中..." : "登録する"}
                </Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      ) : null}

      {currentScreen === "coach-registration" ? (
        <ScrollView contentContainerStyle={styles.pageContainer}>
          <RegistrationHeader
            title="指導員登録ページ"
            description="外部リンクはサービス名とURLをセットで登録でき、複数ある場合は入力欄を追加する流れにしています。電話番号とメールアドレスは任意ですが、入力すると公開されます。ログイン用メールアドレスとパスワードは、ログイン時に使う非公開情報です。"
            onBack={() => setCurrentScreen("registration-role")}
          />
          {authMessage ? <FeedbackBanner kind="success" message={authMessage} /> : null}
          {authError ? <FeedbackBanner kind="error" message={authError} /> : null}
          <View style={styles.registrationCard}>
            <ImageField
              title="アイコン"
              detail="任意項目"
              imageUri={coachIconUri}
              onPress={() => {
                void pickImage("coach");
              }}
            />
            {coachRegistrationFields.map((field) => (
              <FormField
                key={field.label}
                label={field.label}
                detail={field.detail}
                placeholder={field.placeholder}
                multiline={field.label === "今までの経歴や功績"}
                value={getCoachFieldValue(field.label, coachForm)}
                onChangeText={(value) =>
                  updateCoachForm(getCoachFieldKey(field.label), value)
                }
              />
            ))}
            <SportSelector
              title="表示したい種目"
              detail="必須 / 複数選択"
              groups={sportGroups}
              selectedSports={coachForm.selectedSports}
              onToggle={toggleCoachSport}
            />
            <Text style={styles.fieldSupport}>
              電話番号とメールアドレスは任意項目ですが、入力した場合は閲覧者に公開されます。
            </Text>

            <View style={styles.formGroup}>
              <View style={styles.formLabelRow}>
                <Text style={styles.formLabel}>Webサイト情報</Text>
                <Text style={styles.formDetail}>任意項目 / 複数可</Text>
              </View>
              <Text style={styles.fieldSupport}>
                YouTube、Instagram、公式サイトなど、何のURLか分かる名前とセットで登録します。
              </Text>
              <View style={styles.linkStack}>
                {coachLinks.map((link, index) => (
                  <View key={link.id} style={styles.linkCard}>
                    <Text style={styles.linkIndex}>リンク {index + 1}</Text>
                    <TextInput
                      placeholder="Webサイト名 例: YouTube"
                      placeholderTextColor="#94a3b8"
                      style={styles.input}
                      value={link.label}
                      onChangeText={(value) => updateCoachLink(link.id, "label", value)}
                    />
                    <TextInput
                      placeholder="URL 例: https://youtube.com/..."
                      placeholderTextColor="#94a3b8"
                      autoCapitalize="none"
                      style={styles.input}
                      value={link.url}
                      onChangeText={(value) => updateCoachLink(link.id, "url", value)}
                    />
                  </View>
                ))}
                <Pressable style={styles.addButton} onPress={addCoachLink}>
                  <Text style={styles.addButtonText}>+ 入力欄を追加する</Text>
                </Pressable>
              </View>
            </View>

            <View style={styles.registrationFooter}>
              <Pressable
                style={[styles.primaryButton, isSubmitting && styles.disabledButton]}
                onPress={() => {
                  void registerCoach();
                }}
                disabled={isSubmitting}
              >
                <Text style={styles.primaryButtonText}>
                  {isSubmitting ? "登録中..." : "登録する"}
                </Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      ) : null}

      {currentScreen === "login" ? (
        <ScrollView contentContainerStyle={styles.pageContainer}>
          <RegistrationHeader
            title="ログイン"
            description="登録時に設定したログイン用メールアドレスとパスワードでログインします。"
            onBack={() => setCurrentScreen("top")}
          />
          {authMessage ? <FeedbackBanner kind="success" message={authMessage} /> : null}
          {authError ? <FeedbackBanner kind="error" message={authError} /> : null}
          <View style={styles.registrationCard}>
            <FormField
              label="ログイン用メールアドレス"
              detail="必須 / 非公開"
              placeholder="例: login@example.com"
              multiline={false}
              value={loginForm.email}
              onChangeText={(value) => updateLoginForm("email", value)}
            />
            <FormField
              label="ログイン用パスワード"
              detail="必須 / 非公開"
              placeholder="登録時のパスワード"
              multiline={false}
              value={loginForm.password}
              onChangeText={(value) => updateLoginForm("password", value)}
            />
            <View style={styles.registrationFooter}>
              <Pressable
                style={[styles.primaryButton, isSubmitting && styles.disabledButton]}
                onPress={() => {
                  void handleLogin();
                }}
                disabled={isSubmitting}
              >
                <Text style={styles.primaryButtonText}>
                  {isSubmitting ? "ログイン中..." : "ログインする"}
                </Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      ) : null}

      {isMenuOpen ? (
        <View style={styles.menuOverlay}>
          <Pressable
            style={styles.menuBackdrop}
            onPress={() => setIsMenuOpen(false)}
          />
          <View style={styles.sideMenu}>
            <Text style={styles.sideMenuTitle}>メニュー</Text>
            <Pressable style={styles.sideMenuItem} onPress={() => goToScreen("top")}>
              <Text style={styles.sideMenuItemText}>TOPページ</Text>
            </Pressable>
            <Pressable
              style={styles.sideMenuItem}
              onPress={() => goToScreen("feed")}
            >
              <Text style={styles.sideMenuItemText}>タイムライン</Text>
            </Pressable>
            <Pressable
              style={styles.sideMenuItem}
              onPress={() => goToScreen("questions")}
            >
              <Text style={styles.sideMenuItemText}>相談広場</Text>
            </Pressable>
            <Pressable
              style={styles.sideMenuItem}
              onPress={() => goToScreen("post-compose")}
            >
              <Text style={styles.sideMenuItemText}>投稿する</Text>
            </Pressable>
            <Pressable
              style={styles.sideMenuItem}
              onPress={() => goToScreen("search")}
            >
              <Text style={styles.sideMenuItemText}>検索</Text>
            </Pressable>
            <Pressable
              style={styles.sideMenuItem}
              onPress={() => goToScreen("notifications")}
            >
              <Text style={styles.sideMenuItemText}>通知</Text>
            </Pressable>
            <Pressable
              style={styles.sideMenuItem}
              onPress={() => goToScreen("experts")}
            >
              <Text style={styles.sideMenuItemText}>話題の指導者</Text>
            </Pressable>
            <Pressable
              style={styles.sideMenuItem}
              onPress={() => goToScreen("community")}
            >
              <Text style={styles.sideMenuItemText}>コミュニティ</Text>
            </Pressable>
            <Pressable
              style={styles.sideMenuItem}
              onPress={() => goToScreen("mypage")}
            >
              <Text style={styles.sideMenuItemText}>マイページ</Text>
            </Pressable>
            <Pressable
              style={styles.sideMenuItem}
              onPress={() => goToScreen("following-feed")}
            >
              <Text style={styles.sideMenuItemText}>フォロー中の投稿</Text>
            </Pressable>
            {!authUser ? (
              <Pressable
                style={styles.sideMenuItem}
                onPress={() => goToScreen("registration-role")}
              >
                <Text style={styles.sideMenuItemText}>新規登録</Text>
              </Pressable>
            ) : null}
            {authUser ? (
              <Pressable
                style={styles.sideMenuItem}
                onPress={() => {
                  setIsMenuOpen(false);
                  void handleLogout();
                }}
              >
                <Text style={styles.sideMenuItemText}>ログアウト</Text>
              </Pressable>
            ) : (
              <Pressable
                style={styles.sideMenuItem}
                onPress={() => goToScreen("login")}
              >
                <Text style={styles.sideMenuItemText}>ログイン</Text>
              </Pressable>
            )}
          </View>
        </View>
      ) : null}
    </SafeAreaView>
  );
}

function RegistrationHeader({
  title,
  description,
  onBack,
}: {
  title: string;
  description: string;
  onBack: () => void;
}) {
  return (
    <View style={styles.pageHeaderCard}>
      <Pressable onPress={onBack} style={styles.backButton}>
        <Text style={styles.backButtonText}>戻る</Text>
      </Pressable>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionSubtitle}>{description}</Text>
    </View>
  );
}

function PageIntro({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <View style={styles.pageIntroCard}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionSubtitle}>{description}</Text>
    </View>
  );
}

function RichTextToolbar({
  onFormat,
}: {
  onFormat: (action: RichFormatAction) => void;
}) {
  const actions: Array<{ key: RichFormatAction; label: string }> = [
    { key: "bold", label: "太字" },
    { key: "bullet", label: "箇条書き" },
    { key: "quote", label: "引用" },
  ];

  return (
    <View style={styles.richToolbar}>
      {actions.map((action) => (
        <Pressable
          key={action.key}
          style={styles.richToolbarButton}
          onPress={() => onFormat(action.key)}
        >
          <Text style={styles.richToolbarButtonText}>{action.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

function ActivityBadgeSection({
  badges,
  onOpen,
}: {
  badges: ActivityBadge[];
  onOpen: () => void;
}) {
  if (badges.length === 0) {
    return null;
  }

  return (
    <View style={styles.badgeSection}>
      <Text style={styles.badgeSectionTitle}>活動バッジ</Text>
      <Pressable style={styles.badgeLauncher} onPress={onOpen}>
        <View style={styles.badgePreviewRow}>
          {badges.slice(0, 4).map((badge) => (
            <View key={`${badge.id}-${badge.tier}`} style={styles.badgeStackedWrap}>
              <View
                style={[
                  styles.kBadge,
                  badge.tier === "bronze"
                    ? styles.badgeBronze
                    : badge.tier === "silver"
                      ? styles.badgeSilver
                      : styles.badgeGold,
                ]}
              >
                <View style={styles.kBadgeInner}>
                  <Text style={styles.kBadgeText}>K</Text>
                </View>
              </View>
              <View style={styles.badgeRibbon}>
                <Text style={styles.badgeRibbonText}>
                  {badge.tier === "bronze"
                    ? "B"
                    : badge.tier === "silver"
                      ? "S"
                      : "G"}
                </Text>
              </View>
            </View>
          ))}
        </View>
        <View style={styles.badgeLauncherTextWrap}>
          <Text style={styles.badgeLauncherTitle}>{badges.length}個のバッジを確認</Text>
          <Text style={styles.badgeLauncherMeta}>押すと詳細が開きます</Text>
        </View>
      </Pressable>
    </View>
  );
}

function RichTextRenderer({
  content,
  variant = "body",
  compact = false,
  onOpenUrl,
}: {
  content: string;
  variant?: "body" | "detail" | "reply";
  compact?: boolean;
  onOpenUrl?: (url: string, label?: string) => void;
}) {
  if (!content.trim()) {
    return null;
  }

  const handleOpenUrl = onOpenUrl ?? (() => {});
  const lines = content.split("\n");
  const baseStyle =
    variant === "detail"
      ? styles.postDetailBody
      : variant === "reply"
        ? styles.replyBody
        : styles.cardBody;

  return (
    <View style={[styles.richTextStack, compact && styles.richTextStackCompact]}>
      {lines.map((rawLine, index) => {
        const line = rawLine.trimEnd();

        if (!line.trim()) {
          return <View key={`space-${index}`} style={styles.richTextSpacer} />;
        }

        const quoteMatch = line.match(/^>\s?(.*)$/);
        if (quoteMatch) {
          return (
            <View key={`quote-${index}`} style={styles.richQuoteBlock}>
              <Text style={[baseStyle, compact && styles.richTextCompact]}>
                {renderLinkableTextSegments({
                  text: quoteMatch[1],
                  baseStyle: [baseStyle, compact && styles.richTextCompact],
                  boldStyle: styles.richTextBold,
                  linkStyle: styles.richTextLink,
                  onOpenUrl: handleOpenUrl,
                })}
              </Text>
            </View>
          );
        }

        const bulletMatch = line.match(/^[-*]\s+(.*)$/);
        if (bulletMatch) {
          return (
            <View key={`bullet-${index}`} style={styles.richListRow}>
              <Text style={styles.richBullet}>•</Text>
              <Text style={[baseStyle, styles.richListText, compact && styles.richTextCompact]}>
                {renderLinkableTextSegments({
                  text: bulletMatch[1],
                  baseStyle: [baseStyle, styles.richListText, compact && styles.richTextCompact],
                  boldStyle: styles.richTextBold,
                  linkStyle: styles.richTextLink,
                  onOpenUrl: handleOpenUrl,
                })}
              </Text>
            </View>
          );
        }

        return (
          <Text
            key={`text-${index}`}
            style={[baseStyle, compact && styles.richTextCompact]}
          >
            {renderLinkableTextSegments({
              text: line,
              baseStyle: [baseStyle, compact && styles.richTextCompact],
              boldStyle: styles.richTextBold,
              linkStyle: styles.richTextLink,
              onOpenUrl: handleOpenUrl,
            })}
          </Text>
        );
      })}
    </View>
  );
}

function LinkPreviewCard({
  url,
  onOpenUrl,
}: {
  url: string;
  onOpenUrl: (url: string, label?: string) => void;
}) {
  const domainLabel = buildUrlPreviewLabel(url);

  return (
    <Pressable style={styles.linkPreviewCard} onPress={() => onOpenUrl(url, domainLabel)}>
      <Text style={styles.linkPreviewDomain}>{domainLabel}</Text>
      <Text style={styles.linkPreviewUrl}>{url}</Text>
      <Text style={styles.linkPreviewHint}>外部サイトを開く</Text>
    </Pressable>
  );
}

function ExpandableBody({
  id,
  content,
  compact = false,
  onToggle,
  expanded,
  onOpenUrl,
}: {
  id: string;
  content: string;
  compact?: boolean;
  onToggle: (id: string) => void;
  expanded: boolean;
  onOpenUrl: (url: string, label?: string) => void;
}) {
  const collapsed = shouldCollapseBody(content) && !expanded;
  const visibleContent = collapsed ? getCollapsedBody(content) : content;
  const previewUrl = extractFirstUrl(content);

  return (
    <View>
      <RichTextRenderer
        content={visibleContent}
        compact={compact}
        onOpenUrl={onOpenUrl}
      />
      {previewUrl ? <LinkPreviewCard url={previewUrl} onOpenUrl={onOpenUrl} /> : null}
      {shouldCollapseBody(content) ? (
        <Pressable onPress={() => onToggle(id)}>
          <Text style={styles.expandToggleText}>{expanded ? "閉じる" : "もっと見る"}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function ReplyList({
  replies,
  compact = false,
}: {
  replies: Reply[];
  compact?: boolean;
}) {
  if (replies.length === 0) {
    return null;
  }

  return (
    <View style={styles.replyList}>
      {replies.map((reply) => (
        <View key={reply.id} style={styles.replyItem}>
          <Text style={styles.replyAuthor}>{reply.author}</Text>
          <RichTextRenderer content={reply.body} variant="reply" compact={compact} />
          <MediaGallery media={reply.media} compact={compact} />
        </View>
      ))}
    </View>
  );
}

function FeedbackBanner({
  kind,
  message,
}: {
  kind: "success" | "error";
  message: string;
}) {
  return (
    <View
      style={[
        styles.feedbackBanner,
        kind === "success" ? styles.feedbackSuccess : styles.feedbackError,
      ]}
    >
      <Text
        style={[
          styles.feedbackText,
          kind === "success" ? styles.feedbackSuccessText : styles.feedbackErrorText,
        ]}
      >
        {message}
      </Text>
    </View>
  );
}

function getImageDisplayStyle(
  media: Pick<MediaAttachment, "width" | "height">,
  compact = false
) {
  const fallbackHeight = compact ? 180 : 240;

  if (!media.width || !media.height) {
    return compact ? styles.postMediaImageCompact : styles.postMediaImage;
  }

  return {
    width: "100%" as const,
    aspectRatio: media.width / media.height,
    maxHeight: compact ? 180 : 420,
    minHeight: fallbackHeight,
    borderRadius: 18,
    backgroundColor: colors.brandSoft,
  };
}

function MediaGallery({
  media,
  compact = false,
}: {
  media?: MediaAttachment[];
  compact?: boolean;
}) {
  if (!media || media.length === 0) {
    return null;
  }

  return (
    <View style={styles.mediaGallery}>
      {media.map((item) =>
        item.kind === "image" ? (
          <Image
            key={`${item.url}-${item.fileName}`}
            source={{ uri: item.url }}
            style={getImageDisplayStyle(item, compact)}
            resizeMode="contain"
          />
        ) : (
          <View key={`${item.url}-${item.fileName}`} style={styles.videoCard}>
            <Text style={styles.videoCardLabel}>動画を添付済み</Text>
            <Text style={styles.videoCardName}>{item.fileName}</Text>
          </View>
        )
      )}
    </View>
  );
}

function ComposeMediaPreview({
  media,
  onRemove,
}: {
  media: LocalMediaAsset[];
  onRemove: (id: string) => void;
}) {
  if (media.length === 0) {
    return null;
  }

  return (
    <View style={styles.mediaPreviewStack}>
      {media.map((item) => (
        <View key={item.id} style={styles.mediaPreviewCard}>
          {item.kind === "image" ? (
            <Image
              source={{ uri: item.uri }}
              style={getImageDisplayStyle(item)}
              resizeMode="contain"
            />
          ) : (
            <View style={styles.mediaPreviewVideo}>
              <Text style={styles.videoCardLabel}>動画を選択済み</Text>
              <Text style={styles.videoCardName}>{item.fileName}</Text>
            </View>
          )}
          <Pressable
            style={styles.mediaRemoveButton}
            onPress={() => onRemove(item.id)}
          >
            <Text style={styles.mediaRemoveButtonText}>削除</Text>
          </Pressable>
        </View>
      ))}
    </View>
  );
}

function SportSelector({
  title,
  detail,
  groups,
  selectedSports,
  onToggle,
}: {
  title: string;
  detail: string;
  groups: Array<{ category: string; items: string[] }>;
  selectedSports: string[];
  onToggle: (sport: string) => void;
}) {
  return (
    <View style={styles.formGroup}>
      <View style={styles.formLabelRow}>
        <Text style={styles.formLabel}>{title}</Text>
        <Text style={styles.formDetail}>{detail}</Text>
      </View>
      <Text style={styles.fieldSupport}>
        現在担当していない種目でも、見ておきたいものは複数選択できます。
      </Text>
      <View style={styles.sportGroupStack}>
        {groups.map((group) => (
          <View key={group.category} style={styles.sportGroupCard}>
            <Text style={styles.sportGroupTitle}>{group.category}</Text>
            <View style={styles.sportSelectorGrid}>
              {group.items.map((sport) => {
                const selected = selectedSports.includes(sport);
                return (
                  <Pressable
                    key={sport}
                    style={[
                      styles.sportSelectorChip,
                      selected && styles.sportSelectorChipActive,
                    ]}
                    onPress={() => onToggle(sport)}
                  >
                    <Text
                      style={[
                        styles.sportSelectorChipText,
                        selected && styles.sportSelectorChipTextActive,
                      ]}
                    >
                      {sport}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

function KomonityLogo() {
  return (
    <View style={styles.logoWrap}>
      <Text style={styles.logoText}>Komonity</Text>
      <View style={styles.logoUnderlineWrap}>
        <View style={styles.logoUnderline} />
        <View style={[styles.logoDot, styles.logoDotOne]} />
        <View style={[styles.logoDot, styles.logoDotTwo]} />
        <View style={[styles.logoDot, styles.logoDotThree]} />
      </View>
    </View>
  );
}

function ImageField({
  title,
  detail,
  imageUri,
  onPress,
}: {
  title: string;
  detail: string;
  imageUri: string | null;
  onPress: () => void;
}) {
  return (
    <View style={styles.formGroup}>
      <View style={styles.formLabelRow}>
        <Text style={styles.formLabel}>{title}</Text>
        <Text style={styles.formDetail}>{detail}</Text>
      </View>
      <Pressable style={styles.imagePickerCard} onPress={onPress}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.avatarPreview} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarPlaceholderText}>画像を選択</Text>
            <Text style={styles.fieldSupport}>
              デバイス内の写真からアイコン画像を設定します
            </Text>
          </View>
        )}
      </Pressable>
    </View>
  );
}

function FormField({
  label,
  detail,
  placeholder,
  multiline,
  value,
  onChangeText,
  maxLength,
}: {
  label: string;
  detail: string;
  placeholder: string;
  multiline: boolean;
  value: string;
  onChangeText: (value: string) => void;
  maxLength?: number;
}) {
  return (
    <View style={styles.formGroup}>
      <View style={styles.formLabelRow}>
        <Text style={styles.formLabel}>{label}</Text>
        <Text style={styles.formDetail}>
          {maxLength ? `${detail} / ${value.length}/${maxLength}` : detail}
        </Text>
      </View>
      <TextInput
        placeholder={placeholder}
        placeholderTextColor="#94a3b8"
        multiline={multiline}
        secureTextEntry={label.includes("パスワード")}
        autoCapitalize={label.includes("メールアドレス") ? "none" : "sentences"}
        keyboardType={label.includes("メールアドレス") ? "email-address" : "default"}
        style={[styles.input, multiline && styles.textArea]}
        value={value}
        onChangeText={onChangeText}
        maxLength={maxLength}
      />
    </View>
  );
}

function getAdvisorFieldKey(label: string): keyof AdvisorFormState {
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
}

function getAdvisorFieldValue(
  label: string,
  form: AdvisorFormState
): string {
  return String(form[getAdvisorFieldKey(label)]);
}

function getCoachFieldKey(label: string): keyof CoachFormState {
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
}

function getCoachFieldValue(
  label: string,
  form: CoachFormState
): string {
  return String(form[getCoachFieldKey(label)]);
}

function toAuthErrorMessage(error: unknown) {
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
      default:
        return "認証処理に失敗しました。時間をおいて再度お試しください。";
    }
  }

  return "処理に失敗しました。入力内容を確認して、時間をおいて再度お試しください。";
}

function toSaveErrorMessage(error: unknown) {
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
}

const colors = {
  background: "#f4efe6",
  surface: "#fffdf8",
  surfaceStrong: "#fff5dd",
  text: "#1f2430",
  muted: "#6b7280",
  line: "#dfd3bf",
  brand: "#b45309",
  brandSoft: "#fde7c2",
  accent: "#0f766e",
  accentSoft: "#d7f2ee",
  success: "#166534",
  successSoft: "#dcfce7",
  error: "#b91c1c",
  errorSoft: "#fee2e2",
};

const DefaultAvatarIcon = ({
  size,
  tone = "brand",
}: {
  size: number;
  tone?: "brand" | "light";
}) => {
  const fillColor = tone === "light" ? "#fff7ed" : colors.brand;
  const accentColor =
    tone === "light" ? "rgba(255, 247, 237, 0.72)" : "#e2b276";

  return (
    <View
      style={{
        width: size,
        height: size,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <View
        style={{
          width: size * 0.38,
          height: size * 0.38,
          borderRadius: 999,
          backgroundColor: fillColor,
          marginBottom: size * 0.05,
        }}
      />
      <View
        style={{
          width: size * 0.66,
          height: size * 0.34,
          borderTopLeftRadius: size * 0.24,
          borderTopRightRadius: size * 0.24,
          borderBottomLeftRadius: size * 0.12,
          borderBottomRightRadius: size * 0.12,
          backgroundColor: fillColor,
        }}
      />
      <View
        style={{
          position: "absolute",
          bottom: size * 0.08,
          width: size * 0.78,
          height: size * 0.2,
          borderRadius: 999,
          backgroundColor: accentColor,
          opacity: 0.8,
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  globalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 8,
    backgroundColor: colors.background,
  },
  logoWrap: {
    justifyContent: "center",
    minHeight: 58,
  },
  logoButton: {
    alignSelf: "flex-start",
  },
  logoText: {
    color: colors.brand,
    fontSize: 34,
    fontWeight: "800",
    fontStyle: "italic",
    letterSpacing: 0.5,
    transform: [{ rotate: "-4deg" }],
  },
  logoUnderlineWrap: {
    marginTop: -2,
    height: 14,
    justifyContent: "center",
  },
  logoUnderline: {
    width: 126,
    height: 4,
    borderRadius: 999,
    backgroundColor: colors.accent,
    marginLeft: 26,
  },
  logoDot: {
    position: "absolute",
    borderRadius: 999,
  },
  logoDotOne: {
    width: 8,
    height: 8,
    backgroundColor: colors.accent,
    left: 144,
    top: 1,
  },
  logoDotTwo: {
    width: 6,
    height: 6,
    backgroundColor: colors.brand,
    left: 158,
    top: 0,
  },
  logoDotThree: {
    width: 5,
    height: 5,
    backgroundColor: colors.accent,
    left: 170,
    top: 4,
  },
  menuButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    justifyContent: "center",
    alignItems: "center",
    gap: 4,
  },
  menuLine: {
    width: 18,
    height: 2,
    borderRadius: 999,
    backgroundColor: colors.text,
  },
  container: {
    padding: 20,
    paddingTop: 12,
    paddingBottom: 48,
    gap: 18,
  },
  pageContainer: {
    padding: 20,
    paddingTop: 12,
    paddingBottom: 48,
    gap: 16,
  },
  searchPageContainer: {
    paddingBottom: 48,
  },
  menuOverlay: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  menuBackdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.25)",
  },
  sideMenu: {
    width: 260,
    backgroundColor: colors.surface,
    borderLeftWidth: 1,
    borderLeftColor: colors.line,
    paddingHorizontal: 18,
    paddingTop: 86,
    paddingBottom: 24,
    gap: 10,
  },
  sideMenuTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 6,
  },
  sideMenuItem: {
    backgroundColor: "#fbfaf7",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  sideMenuItemText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "700",
  },
  heroCard: {
    backgroundColor: colors.surface,
    borderRadius: 28,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.line,
    gap: 14,
  },
  pageHeaderCard: {
    backgroundColor: colors.surface,
    borderRadius: 28,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.line,
    gap: 12,
  },
  backButton: {
    alignSelf: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: colors.brandSoft,
  },
  backButtonText: {
    color: colors.brand,
    fontWeight: "700",
  },
  eyebrow: {
    color: colors.brand,
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 1.4,
    textTransform: "uppercase",
  },
  heroTitle: {
    color: colors.text,
    fontSize: 30,
    lineHeight: 38,
    fontWeight: "800",
  },
  heroText: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 24,
  },
  heroActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  primaryButton: {
    backgroundColor: colors.brand,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 999,
  },
  primaryButtonText: {
    color: "#ffffff",
    fontWeight: "700",
  },
  secondaryButton: {
    backgroundColor: colors.brandSoft,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 999,
  },
  secondaryButtonText: {
    color: colors.brand,
    fontWeight: "700",
  },
  ghostButton: {
    backgroundColor: colors.surface,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.line,
  },
  ghostButtonText: {
    color: colors.text,
    fontWeight: "700",
  },
  disabledButton: {
    opacity: 0.7,
  },
  flowCard: {
    backgroundColor: "#fcf7ee",
    borderRadius: 22,
    padding: 16,
    gap: 10,
    borderWidth: 1,
    borderColor: colors.line,
  },
  flowTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "800",
  },
  flowText: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 22,
  },
  flowHint: {
    color: colors.brand,
    fontSize: 13,
    fontWeight: "700",
  },
  authPanel: {
    backgroundColor: "#fbfaf7",
    borderRadius: 22,
    padding: 16,
    gap: 10,
    borderWidth: 1,
    borderColor: colors.line,
  },
  authPanelTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "800",
  },
  authPanelText: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 22,
  },
  warningText: {
    color: colors.error,
    fontSize: 13,
    lineHeight: 20,
    fontWeight: "700",
  },
  feedbackBanner: {
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
  },
  feedbackSuccess: {
    backgroundColor: colors.successSoft,
    borderColor: "#86efac",
  },
  feedbackError: {
    backgroundColor: colors.errorSoft,
    borderColor: "#fca5a5",
  },
  feedbackText: {
    fontSize: 14,
    lineHeight: 22,
    fontWeight: "700",
  },
  feedbackSuccessText: {
    color: colors.success,
  },
  feedbackErrorText: {
    color: colors.error,
  },
  roleCard: {
    backgroundColor: colors.surface,
    borderRadius: 22,
    padding: 18,
    gap: 8,
    borderWidth: 1,
    borderColor: colors.line,
  },
  statsRow: {
    gap: 12,
  },
  statCard: {
    backgroundColor: colors.surfaceStrong,
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.line,
    gap: 4,
  },
  statLabel: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: "600",
  },
  statValue: {
    color: colors.text,
    fontSize: 28,
    fontWeight: "800",
  },
  statNote: {
    color: colors.brand,
    fontSize: 13,
    fontWeight: "600",
  },
  topShortcutGrid: {
    gap: 12,
  },
  shortcutCard: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 18,
    gap: 8,
    borderWidth: 1,
    borderColor: colors.line,
  },
  shortcutTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "800",
  },
  shortcutText: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 22,
  },
  pageIntroCard: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 18,
    gap: 6,
    borderWidth: 1,
    borderColor: colors.line,
  },
  searchHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 14,
  },
  searchBackButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    justifyContent: "center",
    alignItems: "center",
  },
  searchBackButtonText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: "800",
  },
  searchInputShell: {
    flex: 1,
    minHeight: 52,
    backgroundColor: colors.surface,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  searchIcon: {
    color: colors.muted,
    fontSize: 18,
    fontWeight: "700",
  },
  searchInput: {
    flex: 1,
    color: colors.text,
    fontSize: 17,
    fontWeight: "700",
    paddingVertical: 10,
  },
  searchTabsBar: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: 12,
  },
  searchTabButton: {
    flex: 1,
    alignItems: "center",
    paddingTop: 14,
    paddingBottom: 10,
    gap: 10,
  },
  searchTabText: {
    color: colors.muted,
    fontSize: 15,
    fontWeight: "700",
  },
  searchTabTextActive: {
    color: colors.text,
  },
  searchTabUnderline: {
    width: 64,
    height: 4,
    borderRadius: 999,
    backgroundColor: colors.accent,
  },
  searchFilterBar: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 6,
  },
  searchFilterChip: {
    backgroundColor: colors.surface,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  searchFilterChipActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  searchFilterChipText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "700",
  },
  searchFilterChipTextActive: {
    color: "#ffffff",
  },
  searchResultStack: {
    gap: 0,
  },
  searchPostCard: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
    paddingHorizontal: 20,
    paddingVertical: 18,
  },
  searchPostTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  searchAvatar: {
    width: 52,
    height: 52,
    borderRadius: 999,
    backgroundColor: colors.brandSoft,
    justifyContent: "center",
    alignItems: "center",
  },
  searchAvatarText: {
    color: colors.brand,
    fontSize: 18,
    fontWeight: "800",
  },
  searchPostBody: {
    flex: 1,
    gap: 6,
  },
  searchPostAuthor: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "800",
  },
  searchPostMeta: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: "600",
  },
  searchSourceBadge: {
    alignSelf: "flex-start",
    backgroundColor: colors.accentSoft,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  searchSourceBadgeText: {
    color: colors.accent,
    fontSize: 11,
    fontWeight: "800",
  },
  searchPostTitle: {
    color: colors.text,
    fontSize: 17,
    lineHeight: 24,
    fontWeight: "800",
  },
  searchTopicStack: {
    gap: 0,
  },
  searchTopicCard: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
    paddingHorizontal: 20,
    paddingVertical: 18,
    gap: 6,
  },
  searchTopicLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "700",
  },
  searchTopicTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: "800",
  },
  searchTopicMeta: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 22,
  },
  searchAccountCard: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
    paddingHorizontal: 20,
    paddingVertical: 18,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  searchAccountBody: {
    flex: 1,
    gap: 8,
  },
  searchAccountHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },
  searchAccountTextWrap: {
    flex: 1,
    gap: 2,
  },
  searchFollowButton: {
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderWidth: 1,
  },
  searchFollowButtonPrimary: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  searchFollowButtonFollowing: {
    backgroundColor: colors.accentSoft,
    borderColor: colors.accent,
  },
  searchFollowButtonText: {
    fontWeight: "800",
  },
  searchFollowButtonTextPrimary: {
    color: "#ffffff",
  },
  searchFollowButtonTextFollowing: {
    color: colors.accent,
  },
  filterSummaryCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 16,
    gap: 10,
    borderWidth: 1,
    borderColor: colors.line,
  },
  filterSummaryTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "800",
  },
  sectionHeader: {
    gap: 4,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 24,
    fontWeight: "800",
  },
  sectionSubtitle: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 22,
  },
  stack: {
    gap: 14,
  },
  registrationCard: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 20,
    gap: 16,
    borderWidth: 1,
    borderColor: colors.line,
  },
  registrationFlowCard: {
    backgroundColor: colors.brandSoft,
    borderRadius: 20,
    padding: 18,
    gap: 14,
    borderWidth: 1,
    borderColor: colors.line,
  },
  registrationFlowText: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 24,
    fontWeight: "600",
  },
  inlineButtonRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  formGroup: {
    gap: 8,
  },
  formLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  formLabel: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "800",
  },
  formDetail: {
    color: colors.brand,
    fontSize: 12,
    fontWeight: "700",
  },
  fieldSupport: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 20,
  },
  sportSelectorGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  sportGroupStack: {
    gap: 12,
  },
  sportGroupCard: {
    backgroundColor: "#fcf7ee",
    borderRadius: 18,
    padding: 14,
    gap: 10,
    borderWidth: 1,
    borderColor: colors.line,
  },
  sportGroupTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "800",
  },
  sportSelectorChip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: "#fbfaf7",
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  sportSelectorChipActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  sportSelectorChipText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "700",
  },
  sportSelectorChipTextActive: {
    color: "#ffffff",
  },
  sportChipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  sportChip: {
    backgroundColor: colors.brandSoft,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  sportChipText: {
    color: colors.brand,
    fontSize: 12,
    fontWeight: "700",
  },
  sportChipActive: {
    backgroundColor: colors.accentSoft,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  sportChipActiveText: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: "800",
  },
  imagePickerCard: {
    minHeight: 144,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: "#fbfaf7",
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarPlaceholder: {
    padding: 20,
    alignItems: "center",
    gap: 8,
  },
  avatarPlaceholderText: {
    color: colors.accent,
    fontSize: 16,
    fontWeight: "800",
  },
  avatarPreview: {
    width: "100%",
    height: 180,
  },
  input: {
    minHeight: 52,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: "#fbfaf7",
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: colors.text,
    fontSize: 14,
  },
  textArea: {
    minHeight: 120,
    textAlignVertical: "top",
  },
  linkStack: {
    gap: 12,
  },
  linkCard: {
    backgroundColor: "#fcf7ee",
    borderRadius: 18,
    padding: 14,
    gap: 10,
    borderWidth: 1,
    borderColor: colors.line,
  },
  linkIndex: {
    color: colors.accent,
    fontSize: 13,
    fontWeight: "800",
  },
  addButton: {
    alignSelf: "flex-start",
    backgroundColor: colors.accentSoft,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  addButtonText: {
    color: colors.accent,
    fontWeight: "800",
  },
  registrationFooter: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    paddingTop: 4,
  },
  mediaActionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  mediaPreviewStack: {
    gap: 12,
  },
  mediaPreviewCard: {
    backgroundColor: "#fcf7ee",
    borderRadius: 18,
    padding: 12,
    gap: 10,
    borderWidth: 1,
    borderColor: colors.line,
  },
  mediaPreviewImage: {
    width: "100%",
    height: 220,
    borderRadius: 14,
    backgroundColor: colors.brandSoft,
  },
  mediaPreviewVideo: {
    minHeight: 120,
    borderRadius: 14,
    backgroundColor: colors.brandSoft,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    gap: 6,
  },
  mediaRemoveButton: {
    alignSelf: "flex-start",
    backgroundColor: colors.errorSoft,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  mediaRemoveButtonText: {
    color: colors.error,
    fontSize: 12,
    fontWeight: "800",
  },
  postTargetRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  postTargetChip: {
    backgroundColor: "#fbfaf7",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  postTargetChipActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  postTargetChipText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "800",
  },
  postTargetChipTextActive: {
    color: "#ffffff",
  },
  postCard: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 20,
    gap: 14,
    borderWidth: 1,
    borderColor: colors.line,
  },
  detailTapArea: {
    gap: 12,
  },
  postHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },
  authorRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  authorAvatar: {
    width: 48,
    height: 48,
    borderRadius: 999,
    backgroundColor: colors.brandSoft,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  authorAvatarText: {
    color: colors.brand,
    fontSize: 18,
    fontWeight: "800",
  },
  authorTextBlock: {
    flex: 1,
    gap: 2,
  },
  cardTitle: {
    color: colors.text,
    fontSize: 19,
    lineHeight: 26,
    fontWeight: "800",
  },
  cardMeta: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 20,
    marginTop: 4,
  },
  cardBody: {
    color: colors.text,
    fontSize: 15,
    lineHeight: 24,
  },
  richTextStack: {
    gap: 6,
  },
  richTextStackCompact: {
    gap: 4,
  },
  richTextSpacer: {
    height: 8,
  },
  richTextBold: {
    fontWeight: "800",
  },
  richQuoteBlock: {
    borderLeftWidth: 3,
    borderLeftColor: colors.accent,
    paddingLeft: 12,
    backgroundColor: "#f7fafc",
    borderRadius: 12,
    paddingVertical: 8,
    paddingRight: 10,
  },
  richListRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  richBullet: {
    color: colors.brand,
    fontSize: 16,
    fontWeight: "800",
    lineHeight: 24,
  },
  richListText: {
    flex: 1,
  },
  richTextCompact: {
    fontSize: 14,
    lineHeight: 21,
  },
  richToolbar: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  richToolbarButton: {
    backgroundColor: colors.surfaceStrong,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  richToolbarButtonText: {
    color: colors.brand,
    fontSize: 12,
    fontWeight: "800",
  },
  richEditorInput: {
    minHeight: 180,
    textAlignVertical: "top",
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    lineHeight: 24,
    color: colors.text,
  },
  mediaGallery: {
    gap: 10,
  },
  postMediaImage: {
    width: "100%",
    height: 240,
    borderRadius: 18,
    backgroundColor: colors.brandSoft,
  },
  postMediaImageCompact: {
    height: 180,
  },
  videoCard: {
    backgroundColor: "#f7fafc",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 16,
    gap: 6,
  },
  videoCardLabel: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: "800",
  },
  videoCardName: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "700",
  },
  pill: {
    backgroundColor: colors.accentSoft,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  pillText: {
    color: colors.accent,
    fontWeight: "700",
    fontSize: 12,
  },
  tagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tag: {
    backgroundColor: colors.brandSoft,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  tagText: {
    color: colors.brand,
    fontSize: 12,
    fontWeight: "700",
  },
  metricRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  metricButton: {
    backgroundColor: "#f4f4f5",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  metricButtonActive: {
    backgroundColor: colors.brandSoft,
  },
  metricChip: {
    backgroundColor: "#f4f4f5",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  metricText: {
    color: colors.text,
    fontWeight: "700",
    fontSize: 13,
  },
  metricTextActive: {
    color: colors.brand,
  },
  replyList: {
    gap: 8,
    paddingTop: 2,
  },
  replyItem: {
    backgroundColor: "#f7fafc",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 4,
  },
  replyAuthor: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: "800",
  },
  replyBody: {
    color: colors.text,
    fontSize: 13,
    lineHeight: 20,
  },
  replyBodyCompact: {
    fontSize: 12,
    lineHeight: 18,
  },
  questionCard: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 20,
    gap: 10,
    borderWidth: 1,
    borderColor: colors.line,
  },
  categoryText: {
    color: colors.brand,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  bestAnswerBox: {
    backgroundColor: "#f7fafc",
    borderRadius: 18,
    padding: 16,
    gap: 8,
  },
  bestAnswerLabel: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: "800",
  },
  expertCard: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 20,
    gap: 14,
    borderWidth: 1,
    borderColor: colors.line,
  },
  scoreCard: {
    backgroundColor: colors.brandSoft,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: "center",
    minWidth: 90,
  },
  scoreValue: {
    color: colors.brand,
    fontSize: 20,
    fontWeight: "800",
  },
  scoreLabel: {
    color: colors.brand,
    fontSize: 11,
    fontWeight: "700",
  },
  expertMetrics: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  expertMetricBox: {
    flex: 1,
    minWidth: 130,
    backgroundColor: "#f7fafc",
    borderRadius: 18,
    padding: 14,
  },
  expertMetricValue: {
    color: colors.text,
    fontSize: 21,
    fontWeight: "800",
  },
  expertMetricLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "600",
  },
  promoText: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 22,
  },
  communityCard: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 20,
    gap: 14,
    borderWidth: 1,
    borderColor: colors.line,
  },
  profileShell: {
    backgroundColor: colors.surface,
    borderRadius: 28,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.line,
  },
  profileBanner: {
    height: 180,
    backgroundColor: "#d8c7ad",
  },
  profileTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingHorizontal: 20,
    marginTop: -44,
  },
  userProfileActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  userProfileAvatar: {
    backgroundColor: colors.surface,
  },
  profileIconButton: {
    backgroundColor: colors.surface,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  profileIconButtonText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "800",
  },
  profileFollowButton: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 22,
    paddingVertical: 12,
  },
  profileFollowButtonPrimary: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  profileFollowButtonFollowing: {
    backgroundColor: colors.surfaceStrong,
    borderColor: colors.brand,
  },
  profileFollowButtonText: {
    fontSize: 14,
    fontWeight: "800",
  },
  profileFollowButtonTextPrimary: {
    color: "#ffffff",
  },
  profileFollowButtonTextFollowing: {
    color: colors.brand,
  },
  profileAvatar: {
    width: 92,
    height: 92,
    borderRadius: 999,
    backgroundColor: colors.brand,
    borderWidth: 5,
    borderColor: colors.surface,
    justifyContent: "center",
    alignItems: "center",
  },
  profileAvatarText: {
    color: "#fff7ed",
    fontSize: 28,
    fontWeight: "800",
  },
  profileEditButton: {
    backgroundColor: colors.surface,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  profileEditButtonText: {
    color: colors.text,
    fontWeight: "700",
  },
  profileBody: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 18,
    gap: 8,
  },
  profileNameRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
  },
  profileName: {
    color: colors.text,
    fontSize: 28,
    fontWeight: "800",
  },
  profileHandle: {
    color: colors.muted,
    fontSize: 16,
    fontWeight: "600",
  },
  profileRole: {
    color: colors.brand,
    fontSize: 13,
    fontWeight: "700",
  },
  profileBio: {
    color: colors.text,
    fontSize: 15,
    lineHeight: 24,
  },
  profileLink: {
    color: colors.accent,
    fontSize: 14,
    fontWeight: "700",
  },
  profileJoined: {
    color: colors.muted,
    fontSize: 14,
  },
  profileFollowRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    paddingTop: 4,
  },
  badgeSection: {
    gap: 10,
    paddingTop: 6,
  },
  badgeSectionTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "800",
  },
  badgeLauncher: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  badgePreviewRow: {
    flexDirection: "row",
    gap: 10,
  },
  badgeLauncherTextWrap: {
    flex: 1,
    gap: 2,
  },
  badgeLauncherTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "800",
  },
  badgeLauncherMeta: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "600",
  },
  badgeStackedWrap: {
    alignItems: "center",
    gap: 4,
  },
  kBadge: {
    width: 44,
    height: 44,
    borderRadius: 999,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  kBadgeLarge: {
    width: 56,
    height: 56,
  },
  kBadgeInner: {
    width: "78%",
    height: "78%",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.65)",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.18)",
  },
  badgeBronze: {
    backgroundColor: "#c87a41",
    borderColor: "#8c4b1f",
  },
  badgeSilver: {
    backgroundColor: "#c2ccd8",
    borderColor: "#7c8797",
  },
  badgeGold: {
    backgroundColor: "#efc24b",
    borderColor: "#a46c00",
  },
  kBadgeText: {
    color: "#fffdf8",
    fontSize: 20,
    fontWeight: "900",
    textShadowColor: "rgba(0,0,0,0.18)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  badgeRibbon: {
    minWidth: 24,
    borderRadius: 999,
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: colors.text,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeRibbonLarge: {
    paddingHorizontal: 8,
    minWidth: 58,
  },
  badgeRibbonText: {
    color: "#ffffff",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.4,
  },
  badgeTierText: {
    color: colors.text,
    fontSize: 11,
    fontWeight: "800",
  },
  badgeLabelText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "700",
  },
  badgeDescriptionText: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 18,
  },
  badgeModalStack: {
    gap: 12,
  },
  badgeModalCard: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    borderRadius: 18,
    borderWidth: 1.5,
    padding: 12,
  },
  badgeModalCardBronze: {
    borderColor: "#d4a07c",
    backgroundColor: "#fff4ea",
  },
  badgeModalCardSilver: {
    borderColor: "#b8c2cf",
    backgroundColor: "#f7fafc",
  },
  badgeModalCardGold: {
    borderColor: "#e5c364",
    backgroundColor: "#fff8de",
  },
  badgeModalTextWrap: {
    flex: 1,
    gap: 2,
  },
  profileFeedButton: {
    alignSelf: "flex-start",
    backgroundColor: colors.accentSoft,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 8,
  },
  profileFeedButtonText: {
    color: colors.accent,
    fontSize: 13,
    fontWeight: "800",
  },
  profileFollowText: {
    color: colors.muted,
    fontSize: 15,
  },
  profileFollowValue: {
    color: colors.text,
    fontWeight: "800",
  },
  profileTabBar: {
    flexDirection: "row",
    flexWrap: "wrap",
    backgroundColor: colors.surface,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.line,
    overflow: "hidden",
  },
  profileTabItem: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  profileTabItemActive: {
    borderBottomWidth: 3,
    borderBottomColor: colors.accent,
  },
  profileTabText: {
    color: colors.muted,
    fontSize: 14,
    fontWeight: "700",
  },
  profileTabTextActive: {
    color: colors.text,
  },
  profilePostCard: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 18,
    gap: 12,
    borderWidth: 1,
    borderColor: colors.line,
  },
  repostNoticeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  repostNoticeIcon: {
    color: colors.muted,
    fontSize: 14,
    fontWeight: "800",
  },
  repostNoticeText: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: "700",
  },
  profilePostHeader: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  profileSourceBadge: {
    marginLeft: "auto",
    backgroundColor: colors.accentSoft,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  profileSourceBadgeText: {
    color: colors.accent,
    fontSize: 11,
    fontWeight: "800",
  },
  profilePostMiniAvatar: {
    width: 44,
    height: 44,
    borderRadius: 999,
    backgroundColor: colors.brandSoft,
    justifyContent: "center",
    alignItems: "center",
  },
  profilePostMiniAvatarText: {
    color: colors.brand,
    fontWeight: "800",
  },
  postDetailShell: {
    gap: 16,
  },
  postDetailHeaderBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  postDetailHeaderTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "800",
  },
  postDetailHeaderSpacer: {
    width: 56,
  },
  postDetailCard: {
    backgroundColor: colors.surface,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 24,
    gap: 16,
  },
  postDetailAuthorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  postDetailAvatar: {
    width: 56,
    height: 56,
    borderRadius: 999,
    backgroundColor: colors.brandSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  postDetailAvatarText: {
    color: colors.accent,
    fontSize: 22,
    fontWeight: "800",
  },
  postDetailAuthorText: {
    flex: 1,
    gap: 4,
  },
  postDetailAuthorName: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "800",
  },
  postDetailAuthorMeta: {
    color: colors.muted,
    fontSize: 14,
    fontWeight: "600",
  },
  postDetailTitle: {
    color: colors.text,
    fontSize: 28,
    lineHeight: 38,
    fontWeight: "800",
  },
  postDetailBody: {
    color: colors.text,
    fontSize: 20,
    lineHeight: 32,
  },
  postDetailMetaLine: {
    color: colors.muted,
    fontSize: 14,
    fontWeight: "600",
  },
  postDetailMetricRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    paddingTop: 4,
  },
  postDetailReplyComposer: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    backgroundColor: colors.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 16,
  },
  postDetailReplyComposerBody: {
    flex: 1,
    gap: 12,
  },
  postDetailReplyAvatar: {
    width: 44,
    height: 44,
    borderRadius: 999,
    backgroundColor: colors.brandSoft,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  postDetailReplyAvatarText: {
    color: colors.accent,
    fontSize: 18,
    fontWeight: "800",
  },
  postDetailReplyInput: {
    minHeight: 48,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.brandSoft,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: colors.text,
    fontSize: 16,
  },
  inlineCountText: {
    alignSelf: "flex-end",
    color: colors.muted,
    fontSize: 12,
    fontWeight: "600",
  },
  postDetailReplyActionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  postDetailReplyPlaceholder: {
    color: colors.muted,
    fontSize: 16,
    fontWeight: "600",
  },
  postDetailReplyButton: {
    backgroundColor: colors.accent,
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  postDetailReplyButtonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "800",
  },
  postDetailReplies: {
    gap: 0,
  },
  postDetailReplyCard: {
    position: "relative",
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
    paddingVertical: 18,
    paddingHorizontal: 10,
  },
  postDetailThreadLine: {
    position: "absolute",
    left: 31,
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: colors.line,
  },
  postDetailReplyRow: {
    flexDirection: "row",
    gap: 12,
  },
  postDetailReplyContent: {
    flex: 1,
    gap: 6,
  },
  replyMetricRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  postDetailReplyAuthor: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "800",
  },
  postDetailReplyText: {
    color: colors.text,
    fontSize: 17,
    lineHeight: 28,
  },
  bestAnswerInlineBadge: {
    alignSelf: "flex-start",
    backgroundColor: colors.accentSoft,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  bestAnswerInlineBadgeText: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: "800",
  },
  bestAnswerSelectButton: {
    alignSelf: "flex-start",
    backgroundColor: colors.brandSoft,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  bestAnswerSelectButtonText: {
    color: colors.brand,
    fontSize: 13,
    fontWeight: "800",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(22, 28, 45, 0.26)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  modalCard: {
    width: "100%",
    maxWidth: 460,
    backgroundColor: colors.surface,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 24,
    gap: 16,
  },
  modalTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: "800",
  },
  modalBody: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 24,
  },
  modalButtonRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
  },
  modalSecondaryButton: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: 18,
    paddingVertical: 12,
    backgroundColor: colors.surface,
  },
  modalSecondaryButtonText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "700",
  },
  modalPrimaryButton: {
    borderRadius: 999,
    backgroundColor: colors.accent,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  modalPrimaryButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "800",
  },
  profilePostHeaderText: {
    gap: 2,
  },
  profilePostName: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "800",
  },
  profilePostMeta: {
    color: colors.muted,
    fontSize: 13,
  },
  profilePostTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "800",
  },
  profilePostMetrics: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
  },
  profileMetricText: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: "700",
  },
  communityButton: {
    alignSelf: "flex-start",
    backgroundColor: colors.accent,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  communityButtonText: {
    color: "#ffffff",
    fontWeight: "700",
  },
  flowOptionTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "800",
  },
  flowOptionText: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 20,
  },
  flowOptionCta: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: "800",
    marginTop: 4,
  },
  mediaWarningText: {
    color: "#b42318",
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "700",
  },
  externalLinkModalUrl: {
    color: colors.accent,
    fontSize: 13,
    lineHeight: 20,
    marginTop: 8,
    marginBottom: 16,
  },
  modalActionRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
  },
  notificationCard: {
    backgroundColor: colors.surface,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 22,
    gap: 8,
  },
  notificationTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "800",
  },
  notificationBody: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 22,
  },
  notificationMeta: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "700",
  },
  externalLinksRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  externalLinkChip: {
    borderRadius: 999,
    backgroundColor: "#e8f5f2",
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  externalLinkChipText: {
    color: colors.accent,
    fontSize: 13,
    fontWeight: "800",
  },
  pinnedNoticeRow: {
    alignSelf: "flex-start",
    borderRadius: 999,
    backgroundColor: "#fff1c7",
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  pinnedNoticeText: {
    color: "#9a6700",
    fontSize: 12,
    fontWeight: "800",
  },
  inlineActionButton: {
    alignSelf: "flex-start",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: colors.surfaceStrong,
  },
  inlineActionButtonText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "800",
  },
  userControlRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  richTextLink: {
    color: colors.accent,
    textDecorationLine: "underline",
  },
  linkPreviewCard: {
    marginTop: 10,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: "#f7faf9",
    padding: 14,
    gap: 4,
  },
  linkPreviewDomain: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "800",
  },
  linkPreviewUrl: {
    color: colors.accent,
    fontSize: 12,
    lineHeight: 18,
  },
  linkPreviewHint: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "700",
  },
  expandToggleText: {
    color: colors.accent,
    fontSize: 13,
    fontWeight: "800",
    marginTop: 8,
  },
});
