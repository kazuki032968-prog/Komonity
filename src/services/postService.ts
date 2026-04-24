import { COLLECTIONS } from "../constants/app";
import type {
  FeedPost,
  InteractionRecord,
  PostDetailState,
  ProfilePostItem,
  QuestionPost,
  Reply,
  SearchContentFilterKey,
  SearchContentItem,
  SearchContentItem as SearchItem,
  CommunityPost,
} from "../types/app";

export const buildFeedDetail = (post: FeedPost): PostDetailState => ({
  id: post.id,
  source: "feed",
  sourceLabel: "メニュー・戦術",
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

export const buildQuestionDetail = (question: QuestionPost): PostDetailState => ({
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

export const buildCommunityDetail = (item: CommunityPost): PostDetailState => ({
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

export const getSourceLabel = (source: SearchContentFilterKey) => {
  if (source === "feed") {
    return "メニュー・戦術";
  }

  if (source === "questions") {
    return "相談広場";
  }

  return "コミュニティ";
};

export const buildDetailStateFromSearchItem = (item: SearchItem): PostDetailState => ({
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
  likes: item.source === "feed" ? item.score : undefined,
  reposts: undefined,
  comments: item.replies.length,
  answers: item.source === "questions" ? item.replies.length : undefined,
  bestAnswer: undefined,
  bestAnswerReplyId: undefined,
  sports: item.sports,
  tags: item.tags,
  createdAtMs: item.createdAtMs,
});

export const buildInteractionRecord = ({
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

export const getPostCollectionFromSource = (source: SearchContentFilterKey) => {
  if (source === "feed") {
    return COLLECTIONS.feed;
  }

  if (source === "questions") {
    return COLLECTIONS.questions;
  }

  return COLLECTIONS.community;
};

export const getBestAnswerReplyForQuestion = (question: QuestionPost) => {
  if (question.bestAnswerReplyId) {
    return question.replies.find((reply) => reply.id === question.bestAnswerReplyId);
  }

  if (!question.bestAnswer || question.bestAnswer === "まだベストアンサーはありません。") {
    return undefined;
  }

  return question.replies.find((reply) => reply.body === question.bestAnswer);
};

export const buildReplyInteractionPostId = (rootPostId: string, path: string[]) =>
  `reply:${rootPostId}:${path.join(":")}`;

/**
 * reply id のパス配列をたどって、ネストした返信ツリーから対象返信を探します。
 */
export const findReplyByPath = (replies: Reply[], path: string[]): Reply | undefined => {
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

/**
 * 指定された返信パスの位置に新しい返信を挿入し、更新後の返信ツリーを返します。
 */
export const appendReplyToPath = (
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

export const mergeProfilePostItems = (baseItems: ProfilePostItem[], extraItems: ProfilePostItem[]) => {
  const merged = new Map<string, ProfilePostItem>();

  baseItems.forEach((item) => {
    merged.set(item.id, item);
  });
  extraItems.forEach((item) => {
    merged.set(item.id, item);
  });

  return Array.from(merged.values());
};

/**
 * 返信ツリーをフラットな一覧へ展開し、プロフィールや通知などで扱いやすくします。
 */
export const flattenReplyItems = ({
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
