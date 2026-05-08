import type { ReactNode } from "react";
import { ScrollView, Text, View } from "react-native";
import type { User } from "firebase/auth";

import { COLLECTIONS } from "../constants/app";
import type { FeedPost, InteractionRecord, PostDetailState, ScreenKey } from "../types/app";
import { FeedPostCard } from "../components/post/FeedPostCard";
import { PageIntro } from "../components/shared";

type SharedStyles = Record<string, any>;

/**
 * 指導者が投稿した練習メニュー・戦術の一覧画面です。
 * 画面側では並び順や状態だけを受け取り、投稿カードの描画は FeedPostCard に委譲します。
 */
export function FeedScreen({
  styles,
  posts,
  authUser,
  likeRecords,
  likeCountMap,
  repostCountMap,
  expandedBodyIds,
  renderHashtagChips,
  renderPracticeMenu,
  onToggleExpandedBody,
  onOpenExternalUrl,
  onOpenUserProfile,
  onOpenPostDetail,
  onTogglePostInteraction,
}: {
  styles: SharedStyles;
  posts: FeedPost[];
  authUser: User | null;
  likeRecords: InteractionRecord[];
  likeCountMap: Record<string, number>;
  repostCountMap: Record<string, number>;
  expandedBodyIds: string[];
  renderHashtagChips: (tags: string[]) => ReactNode;
  renderPracticeMenu: (
    menu: FeedPost["practiceMenu"],
    strategy?: FeedPost["strategyTemplate"]
  ) => ReactNode;
  onToggleExpandedBody: (id: string) => void;
  onOpenExternalUrl: (url: string, label?: string) => void;
  onOpenUserProfile: (profile: {
    uid?: string;
    name: string;
    role: string;
    handle?: string;
    selectedSports?: string[];
  }) => void;
  onOpenPostDetail: (payload: {
    detail: PostDetailState;
    backScreen: ScreenKey;
  }) => void;
  onTogglePostInteraction: (payload: {
    collectionName: typeof COLLECTIONS.likes;
    detail: PostDetailState;
  }) => void;
}) {
  return (
    <ScrollView contentContainerStyle={styles.pageContainer}>
      <PageIntro
        title="メニュー・戦術"
        description="指導者によるおすすめの練習メニューや戦術投稿を一覧で確認できます。"
      />
      <View style={styles.stack}>
        {posts.length === 0 ? (
          <View style={styles.communityCard}>
            <Text style={styles.cardTitle}>該当する投稿がまだありません</Text>
            <Text style={styles.cardBody}>
              指導者の投稿が増えると、ここに最新の内容が表示されます。
            </Text>
          </View>
        ) : null}
        {posts.map((post) => {
          const interactionKey = `feed:${post.id}`;
          const liked = authUser
            ? likeRecords.some(
                (record) =>
                  record.userUid === authUser.uid &&
                  record.postId === post.id &&
                  record.source === "feed"
              )
            : false;

          return (
            <FeedPostCard
              key={post.id}
              post={post}
              styles={styles}
              sectionKey="feed"
              expanded={expandedBodyIds.includes(`feed:${post.id}`)}
              backScreen="feed"
              showMetrics={true}
              liked={liked}
              likeCount={likeCountMap[interactionKey] ?? post.likes}
              repostCount={repostCountMap[interactionKey] ?? post.reposts}
              renderHashtagChips={renderHashtagChips}
              renderPracticeMenu={renderPracticeMenu}
              onToggleExpanded={onToggleExpandedBody}
              onOpenUrl={onOpenExternalUrl}
              onOpenUserProfile={onOpenUserProfile}
              onOpenDetail={onOpenPostDetail}
              onToggleLike={(payload) => onTogglePostInteraction(payload)}
            />
          );
        })}
      </View>
    </ScrollView>
  );
}
