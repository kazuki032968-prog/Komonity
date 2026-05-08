import type { ReactNode } from "react";
import { Pressable, Text, View } from "react-native";

import { COLLECTIONS } from "../../constants/app";
import { buildFeedDetail } from "../../services/postService";
import { extractDisplayBodyAndTags } from "../../utils/appUtils";
import type { FeedPost, PostDetailState, ScreenKey } from "../../types/app";
import {
  DefaultAvatarIcon,
  ExpandableBody,
  MediaGallery,
  ReplyList,
} from "../shared";

type SharedStyles = Record<string, any>;

/**
 * メニュー・戦術投稿を表示する共通カードです。
 * 一覧ごとの違いは props で受け取り、カードの構造を一箇所に集約します。
 */
export function FeedPostCard({
  post,
  styles,
  expanded,
  sectionKey,
  sourceLabel = post.feedKind === "strategy" ? "戦術" : "メニュー",
  showMetrics = false,
  liked = false,
  likeCount,
  repostCount,
  backScreen,
  renderHashtagChips,
  renderPracticeMenu,
  onToggleExpanded,
  onOpenUrl,
  onOpenUserProfile,
  onOpenDetail,
  onToggleLike,
}: {
  post: FeedPost;
  styles: SharedStyles;
  expanded: boolean;
  sectionKey: string;
  sourceLabel?: string;
  showMetrics?: boolean;
  liked?: boolean;
  likeCount?: number;
  repostCount?: number;
  backScreen: ScreenKey;
  renderHashtagChips: (tags: string[]) => ReactNode;
  renderPracticeMenu: (
    menu: FeedPost["practiceMenu"],
    strategy?: FeedPost["strategyTemplate"]
  ) => ReactNode;
  onToggleExpanded: (id: string) => void;
  onOpenUrl: (url: string, label?: string) => void;
  onOpenUserProfile: (profile: {
    uid?: string;
    name: string;
    role: string;
    handle?: string;
    selectedSports?: string[];
  }) => void;
  onOpenDetail: (payload: {
    detail: PostDetailState;
    backScreen: ScreenKey;
  }) => void;
  onToggleLike?: (payload: {
    collectionName: typeof COLLECTIONS.likes;
    detail: PostDetailState;
  }) => void;
}) {
  const feedDisplay = extractDisplayBodyAndTags(post.body);
  const detail = buildFeedDetail(post);

  return (
    <View style={styles.postCard}>
      <View style={styles.postHeader}>
        <Pressable
          style={styles.authorRow}
          onPress={() =>
            onOpenUserProfile({
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
            <Text style={styles.authorName}>{post.author}</Text>
            <Text style={styles.cardMeta}>
              {post.role}
            </Text>
          </View>
        </Pressable>
        <View style={styles.pill}>
          <Text style={styles.pillText}>{sourceLabel}</Text>
        </View>
      </View>
      <Pressable
        style={styles.detailTapArea}
        onPress={() =>
          onOpenDetail({
            detail,
            backScreen,
          })
        }
      >
        <Text style={styles.cardTitle}>{post.title}</Text>
        <View style={styles.sportChipRow}>
          {post.sports.map((sport) => (
            <View key={sport} style={styles.sportChip}>
              <Text style={styles.sportChipText}>{sport}</Text>
            </View>
          ))}
        </View>
        {feedDisplay.bodyText ? (
          <ExpandableBody
            id={`${sectionKey}:${post.id}`}
            content={feedDisplay.bodyText}
            expanded={expanded}
            onToggle={onToggleExpanded}
            onOpenUrl={onOpenUrl}
          />
        ) : null}
        {renderPracticeMenu(post.practiceMenu, post.strategyTemplate)}
        <MediaGallery media={post.media} />
        {renderHashtagChips(feedDisplay.tags)}
      </Pressable>
      {showMetrics ? (
        <View style={styles.metricRow}>
          <Pressable
            onPress={() =>
              onToggleLike?.({
                collectionName: COLLECTIONS.likes,
                detail,
              })
            }
            style={[styles.metricButton, liked && styles.metricButtonActive]}
          >
            <Text style={[styles.metricText, liked && styles.metricTextActive]}>
              いいね {likeCount ?? post.likes}
            </Text>
          </Pressable>
          <View style={styles.metricChip}>
            <Text style={styles.metricText}>
              再投稿 {repostCount ?? post.reposts}
            </Text>
          </View>
          <View style={styles.metricChip}>
            <Text style={styles.metricText}>コメント {post.comments}</Text>
          </View>
        </View>
      ) : null}
      <ReplyList replies={post.replies} />
    </View>
  );
}
