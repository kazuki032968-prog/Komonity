import type { ReactNode } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import type { User } from "firebase/auth";

import { COLLECTIONS } from "../constants/app";
import {
  DefaultAvatarIcon,
  ExpandableBody,
  MediaGallery,
  PageIntro,
  ReplyList,
  RichTextRenderer,
} from "../components/shared";
import {
  buildCommunityDetail,
  buildDetailStateFromSearchItem,
  buildFeedDetail,
  buildQuestionDetail,
} from "../services/postService";
import type {
  CommunityPost,
  FeedPost,
  InteractionRecord,
  PostDetailState,
  QuestionPost,
  ScreenKey,
  SearchContentItem,
  TimelineSectionKey,
} from "../types/app";
import { extractDisplayBodyAndTags } from "../utils/appUtils";

type SharedStyles = Record<string, any>;
type TimelineSection = { key: TimelineSectionKey; label: string };

/**
 * TOP のタイムライン画面です。
 * 複数種別の投稿一覧を横スワイプ/タブ押下で切り替える責務だけを持ちます。
 */
export function TimelineScreen({
  styles,
  authUser,
  activeTimelineSection,
  timelineSections,
  timelineSwipePanResponder,
  homeContentItems,
  filteredFeedPosts,
  visibleQuestionBoard,
  visibleCommunityBoard,
  followingFeedPosts,
  likeRecords,
  likeCountMap,
  repostCountMap,
  expandedBodyIds,
  onChangeTimelineSection,
  onGoToScreen,
  onOpenUserProfile,
  onOpenPostDetail,
  onToggleExpandedBody,
  onOpenExternalUrl,
  onTogglePostInteraction,
  renderHashtagChips,
}: {
  styles: SharedStyles;
  authUser: User | null;
  activeTimelineSection: TimelineSectionKey;
  timelineSections: TimelineSection[];
  timelineSwipePanResponder: any;
  homeContentItems: SearchContentItem[];
  filteredFeedPosts: FeedPost[];
  visibleQuestionBoard: QuestionPost[];
  visibleCommunityBoard: CommunityPost[];
  followingFeedPosts: FeedPost[];
  likeRecords: InteractionRecord[];
  likeCountMap: Record<string, number>;
  repostCountMap: Record<string, number>;
  expandedBodyIds: string[];
  onChangeTimelineSection: (section: TimelineSectionKey) => void;
  onGoToScreen: (screen: ScreenKey) => void;
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
  onToggleExpandedBody: (id: string) => void;
  onOpenExternalUrl: (url: string, label?: string) => void;
  onTogglePostInteraction: (payload: {
    collectionName: typeof COLLECTIONS.likes;
    detail: PostDetailState;
  }) => void;
  renderHashtagChips: (tags: string[]) => ReactNode;
}) {
  return (
    <View style={[styles.pageContainer, styles.timelineScreen]}>
      <PageIntro
        title="タイムライン"
        description="コーチ・指導者同士でつながり、学び、成長する。現場の悩みをシェアして、より良い指導を。"
        collapsible={true}
        styles={styles}
      />
      <View style={styles.timelineSectionScrollShell}>
        <ScrollView
          horizontal={true}
          showsHorizontalScrollIndicator={false}
          style={styles.timelineSectionScroll}
          contentContainerStyle={styles.timelineSectionHeaderRow}
        >
          {timelineSections.map((section) => (
            <Pressable
              key={section.key}
              style={[
                styles.timelineSectionChip,
                activeTimelineSection === section.key &&
                  styles.timelineSectionChipActive,
              ]}
              onPress={() => onChangeTimelineSection(section.key)}
            >
              <Text
                style={[
                  styles.timelineSectionChipText,
                  activeTimelineSection === section.key &&
                    styles.timelineSectionChipTextActive,
                ]}
              >
                {section.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>
      <View style={styles.timelineContentShell} {...timelineSwipePanResponder.panHandlers}>
        <ScrollView
          style={styles.timelineContentScroller}
          contentContainerStyle={styles.timelinePageContent}
          nestedScrollEnabled={true}
          showsVerticalScrollIndicator={false}
        >
          {activeTimelineSection === "all" && homeContentItems.length === 0 ? (
            <View style={styles.communityCard}>
              <Text style={styles.cardTitle}>まだ投稿がありません</Text>
              <Text style={styles.cardBody}>
                投稿が増えると、ここに新しい順で一覧表示されます。
              </Text>
            </View>
          ) : null}
          {activeTimelineSection === "all"
            ? homeContentItems.map((item) => {
                const homeDisplay = extractDisplayBodyAndTags(item.body);
                return (
                  <View key={`${item.source}:${item.id}`} style={styles.postCard}>
                    <View style={styles.postHeader}>
                      <Pressable
                        style={styles.authorRow}
                        onPress={() =>
                          onOpenUserProfile({
                            uid: item.createdByUid,
                            name: item.author,
                            role: item.role,
                            handle: item.authorHandle,
                            selectedSports: item.sports,
                          })
                        }
                      >
                        <View style={styles.authorAvatar}>
                          <DefaultAvatarIcon size={28} />
                        </View>
                        <View style={styles.authorTextBlock}>
                          <Text style={styles.authorName}>{item.author}</Text>
                          <Text style={styles.cardMeta}>
                            {item.role}
                          </Text>
                        </View>
                      </Pressable>
                      <View style={styles.pill}>
                        <Text style={styles.pillText}>{item.sourceLabel}</Text>
                      </View>
                    </View>
                    <Pressable
                      style={styles.detailTapArea}
                      onPress={() =>
                        onOpenPostDetail({
                          detail: buildDetailStateFromSearchItem(item),
                          backScreen: "top",
                        })
                      }
                    >
                      <Text style={styles.cardTitle}>{item.title}</Text>
                      {item.sports.length > 0 ? (
                        <View style={styles.sportChipRow}>
                          {item.sports.map((sport) => (
                            <View key={sport} style={styles.sportChip}>
                              <Text style={styles.sportChipText}>{sport}</Text>
                            </View>
                          ))}
                        </View>
                      ) : null}
                      {homeDisplay.bodyText ? (
                        <ExpandableBody
                          id={`top:${item.source}:${item.id}`}
                          content={homeDisplay.bodyText}
                          expanded={expandedBodyIds.includes(
                            `top:${item.source}:${item.id}`
                          )}
                          onToggle={onToggleExpandedBody}
                          onOpenUrl={onOpenExternalUrl}
                        />
                      ) : null}
                      <MediaGallery media={item.media} />
                      {renderHashtagChips(homeDisplay.tags)}
                    </Pressable>
                    <ReplyList replies={item.replies} />
                  </View>
                );
              })
            : null}
          {activeTimelineSection === "feed" && filteredFeedPosts.length === 0 ? (
            <View style={styles.communityCard}>
              <Text style={styles.cardTitle}>該当する投稿がまだありません</Text>
              <Text style={styles.cardBody}>
                指導者の投稿が増えると、ここに最新の内容が表示されます。
              </Text>
            </View>
          ) : null}
          {activeTimelineSection === "feed"
            ? filteredFeedPosts.map((post) => {
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
                        <Text style={styles.pillText}>
                          {post.feedKind === "strategy" ? "戦術" : "メニュー"}
                        </Text>
                      </View>
                    </View>
                    <Pressable
                      style={styles.detailTapArea}
                      onPress={() =>
                        onOpenPostDetail({
                          detail: buildFeedDetail(post),
                          backScreen: "top",
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
                          id={`feed:${post.id}`}
                          content={feedDisplay.bodyText}
                          expanded={expandedBodyIds.includes(`feed:${post.id}`)}
                          onToggle={onToggleExpandedBody}
                          onOpenUrl={onOpenExternalUrl}
                        />
                      ) : null}
                      <MediaGallery media={post.media} />
                      {renderHashtagChips(feedDisplay.tags)}
                    </Pressable>
                    <View style={styles.metricRow}>
                      <Pressable
                        onPress={() =>
                          onTogglePostInteraction({
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
              })
            : null}
          {activeTimelineSection === "questions" && visibleQuestionBoard.length === 0 ? (
            <View style={styles.communityCard}>
              <Text style={styles.cardTitle}>相談はまだありません</Text>
              <Text style={styles.cardBody}>
                顧問からの相談が投稿されると、ここに表示されます。
              </Text>
            </View>
          ) : null}
          {activeTimelineSection === "questions"
            ? visibleQuestionBoard.map((question) => {
                const questionDisplay = extractDisplayBodyAndTags(question.body);
                return (
                  <View key={question.id} style={styles.questionCard}>
                    <Pressable
                      style={styles.detailTapArea}
                      onPress={() =>
                        onOpenPostDetail({
                          detail: buildQuestionDetail(question),
                          backScreen: "top",
                        })
                      }
                    >
                      <Text style={styles.categoryText}>{question.category}</Text>
                      <Text style={styles.cardTitle}>{question.title}</Text>
                      <Pressable
                        onPress={() =>
                          onOpenUserProfile({
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
                          expanded={expandedBodyIds.includes(
                            `questions:${question.id}`
                          )}
                          onToggle={onToggleExpandedBody}
                          onOpenUrl={onOpenExternalUrl}
                        />
                      ) : null}
                      <MediaGallery media={question.media} />
                      {renderHashtagChips(questionDisplay.tags)}
                      <View style={styles.bestAnswerBox}>
                        <Text style={styles.bestAnswerLabel}>ベストアンサー</Text>
                        <RichTextRenderer
                          content={question.bestAnswer}
                          onOpenUrl={onOpenExternalUrl}
                        />
                      </View>
                    </Pressable>
                    <ReplyList replies={question.replies} />
                  </View>
                );
              })
            : null}
          {activeTimelineSection === "community" &&
          visibleCommunityBoard.length === 0 ? (
            <View style={styles.communityCard}>
              <Text style={styles.cardTitle}>コミュニティ投稿はまだありません</Text>
              <Text style={styles.cardBody}>
                コミュニティの投稿が増えると、ここに表示されます。
              </Text>
            </View>
          ) : null}
          {activeTimelineSection === "community"
            ? visibleCommunityBoard.map((item) => {
                const communityDisplay = extractDisplayBodyAndTags(item.body);
                return (
                  <View key={item.id} style={styles.communityCard}>
                    <Pressable
                      style={styles.detailTapArea}
                      onPress={() =>
                        onOpenPostDetail({
                          detail: buildCommunityDetail(item),
                          backScreen: "top",
                        })
                      }
                    >
                      <Text style={styles.cardTitle}>{item.title}</Text>
                      <Pressable
                        onPress={() =>
                          onOpenUserProfile({
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
                          onToggle={onToggleExpandedBody}
                          onOpenUrl={onOpenExternalUrl}
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
                );
              })
            : null}
          {activeTimelineSection === "following" && !authUser ? (
            <View style={styles.registrationCard}>
              <View style={styles.registrationFlowCard}>
                <Text style={styles.registrationFlowText}>
                  フォロー中の投稿一覧は、登録済みユーザー向けの機能です。ログインすると、フォローしたアカウントの投稿だけをまとめて確認できます。
                </Text>
                <View style={styles.inlineButtonRow}>
                  <Pressable
                    style={styles.primaryButton}
                    onPress={() => onGoToScreen("registration-role")}
                  >
                    <Text style={styles.primaryButtonText}>登録する</Text>
                  </Pressable>
                  <Pressable
                    style={styles.secondaryButton}
                    onPress={() => onGoToScreen("login")}
                  >
                    <Text style={styles.secondaryButtonText}>ログインする</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          ) : null}
          {activeTimelineSection === "following" &&
          authUser &&
          followingFeedPosts.length === 0 ? (
            <View style={styles.communityCard}>
              <Text style={styles.cardTitle}>まだ投稿がありません</Text>
              <Text style={styles.cardBody}>
                アカウントをフォローすると、ここにその人の投稿が表示されます。
              </Text>
            </View>
          ) : null}
          {activeTimelineSection === "following" && authUser
            ? followingFeedPosts.map((post) => {
                const followingPostDisplay = extractDisplayBodyAndTags(post.body);
                return (
                  <View key={post.id} style={styles.postCard}>
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
                        <Text style={styles.pillText}>フォロー中</Text>
                      </View>
                    </View>
                    <Pressable
                      style={styles.detailTapArea}
                      onPress={() =>
                        onOpenPostDetail({
                          detail: buildFeedDetail(post),
                          backScreen: "top",
                        })
                      }
                    >
                      <Text style={styles.cardTitle}>{post.title}</Text>
                      {followingPostDisplay.bodyText ? (
                        <ExpandableBody
                          id={`following:${post.id}`}
                          content={followingPostDisplay.bodyText}
                          expanded={expandedBodyIds.includes(`following:${post.id}`)}
                          onToggle={onToggleExpandedBody}
                          onOpenUrl={onOpenExternalUrl}
                        />
                      ) : null}
                      <MediaGallery media={post.media} />
                      {renderHashtagChips(followingPostDisplay.tags)}
                    </Pressable>
                    <ReplyList replies={post.replies} />
                  </View>
                );
              })
            : null}
        </ScrollView>
      </View>
    </View>
  );
}
