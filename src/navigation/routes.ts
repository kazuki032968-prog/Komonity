import { staticScreenPathMap, timelineSectionPathMap } from "../constants/app";
import type { PostDetailState, ReplyDetailState, ScreenKey, TimelineSectionKey } from "../types/app";
import { buildPostPath, buildProfilePath, buildReplyPath, buildSearchPath } from "../utils/appUtils";

type ResolveScreenPathParams = {
  currentScreen: ScreenKey;
  activeTimelineSection: TimelineSectionKey;
  searchQuery: string;
  selectedProfileHandle: string;
  postDetail: Pick<PostDetailState, "id" | "source">;
  replyDetail: Pick<ReplyDetailState, "rootPostId" | "source" | "path">;
};

/**
 * Web URL を画面状態から組み立てます。
 * SPA の内部状態とブラウザ URL を同期するため、ここに経路解決を集約します。
 */
export function resolveScreenPath({
  currentScreen,
  activeTimelineSection,
  searchQuery,
  selectedProfileHandle,
  postDetail,
  replyDetail,
}: ResolveScreenPathParams) {
  if (currentScreen === "top") {
    return timelineSectionPathMap[activeTimelineSection];
  }

  if (currentScreen === "search") {
    return buildSearchPath(searchQuery);
  }

  if (currentScreen === "user-profile") {
    return buildProfilePath(selectedProfileHandle);
  }

  if (currentScreen === "post-detail" && postDetail.id) {
    return buildPostPath(postDetail.source, postDetail.id);
  }

  if (currentScreen === "reply-detail" && replyDetail.rootPostId && replyDetail.path.length > 0) {
    return buildReplyPath(replyDetail.source, replyDetail.rootPostId, replyDetail.path);
  }

  return staticScreenPathMap[currentScreen] ?? "/";
}
