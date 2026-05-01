import type { ReactNode } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import type { User } from "firebase/auth";

import { myPageTabs } from "../constants/app";
import {
  ActivityBadgeSection,
  AvatarVisual,
  DefaultAvatarIcon,
  ExpandableBody,
  MediaGallery,
  ProfileBannerVisual,
  RegistrationHeader,
  RichTextRenderer,
} from "../components/shared";
import type {
  BadgeModalState,
  PostDetailState,
  PracticeMenuTemplate,
  ProfileAnswerItem,
  ProfilePostItem,
  ProfileState,
  ProfileTabKey,
  QuestionPost,
  Reply,
  ScreenKey,
  UserActivitySummary,
} from "../types/app";
import { createHandleFromName, extractDisplayBodyAndTags } from "../utils/appUtils";

type SharedStyles = Record<string, any>;

type RelationshipPayload = {
  mode: "following" | "followers";
  targetUid?: string;
  title: string;
  backScreen: "mypage" | "user-profile";
};

/**
 * マイページ画面です。
 * 自分のプロフィール、活動バッジ、投稿・回答・いいね・保存タブを表示します。
 */
export function MyPageScreen({
  styles,
  authUser,
  profileState,
  activeProfileTab,
  currentUserActivitySummary,
  currentProfileFollowingValue,
  currentProfileFollowersValue,
  currentProfilePostsValue,
  currentUserProfileTabPosts,
  currentUserVisiblePosts,
  currentUserAnswers,
  currentUserBestAnswers,
  currentUserLikedPosts,
  currentUserBookmarkedPosts,
  pinnedPostKey,
  expandedBodyIds,
  renderCoachProfileDetails,
  renderPracticeMenu,
  renderHashtagChips,
  onBack,
  onGoToRegister,
  onGoToLogin,
  onGoToProfileEdit,
  onGoToFollowingFeed,
  onChangeProfileTab,
  onOpenRelationshipList,
  onSetBadgeModalState,
  onOpenExternalUrl,
  onOpenPostDetail,
  onToggleExpandedBody,
  onTogglePinnedPost,
}: {
  styles: SharedStyles;
  authUser: User | null;
  profileState: ProfileState;
  activeProfileTab: ProfileTabKey;
  currentUserActivitySummary?: UserActivitySummary | null;
  currentProfileFollowingValue: number | string;
  currentProfileFollowersValue: number | string;
  currentProfilePostsValue: number | string;
  currentUserProfileTabPosts: ProfilePostItem[];
  currentUserVisiblePosts: ProfilePostItem[];
  currentUserAnswers: ProfileAnswerItem[];
  currentUserBestAnswers: Array<{ question: QuestionPost; bestReply?: Reply }>;
  currentUserLikedPosts: ProfilePostItem[];
  currentUserBookmarkedPosts: ProfilePostItem[];
  pinnedPostKey: string | null;
  expandedBodyIds: string[];
  renderCoachProfileDetails: (profile: ProfileState) => ReactNode;
  renderPracticeMenu: (menu?: PracticeMenuTemplate) => ReactNode;
  renderHashtagChips: (tags: string[]) => ReactNode;
  onBack: () => void;
  onGoToRegister: () => void;
  onGoToLogin: () => void;
  onGoToProfileEdit: () => void;
  onGoToFollowingFeed: () => void;
  onChangeProfileTab: (tab: ProfileTabKey) => void;
  onOpenRelationshipList: (payload: RelationshipPayload) => void;
  onSetBadgeModalState: (state: BadgeModalState) => void;
  onOpenExternalUrl: (url: string, label?: string) => void;
  onOpenPostDetail: (payload: { detail: PostDetailState; backScreen: ScreenKey }) => void;
  onToggleExpandedBody: (id: string) => void;
  onTogglePinnedPost: (post: ProfilePostItem) => void;
}) {
  return (
    <ScrollView contentContainerStyle={styles.pageContainer}>
      {!authUser ? (
        <>
          <RegistrationHeader
            title="マイページ"
            description="マイページの確認には登録またはログインが必要です。登録するとプロフィール編集や活動履歴の確認ができます。"
            onBack={onBack}
          />
          <View style={styles.registrationCard}>
            <View style={styles.registrationFlowCard}>
              <Text style={styles.registrationFlowText}>
                マイページを利用するには、会員登録またはログインが必要です。登録後にプロフィール、投稿、回答、フォロー情報を確認できます。
              </Text>
              <View style={styles.inlineButtonRow}>
                <Pressable style={styles.primaryButton} onPress={onGoToRegister}>
                  <Text style={styles.primaryButtonText}>登録する</Text>
                </Pressable>
                <Pressable style={styles.secondaryButton} onPress={onGoToLogin}>
                  <Text style={styles.secondaryButtonText}>ログインする</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </>
      ) : (
        <View style={styles.stack}>
          <View style={styles.profileShell}>
            <ProfileBannerVisual imageUri={profileState.coverUrl} tone={profileState.name} />
            <View style={styles.profileTopRow}>
              <View style={styles.profileAvatar}>
                <AvatarVisual size={82} imageUri={profileState.avatarUrl} tone="light" />
              </View>
              <Pressable style={styles.profileEditButton} onPress={onGoToProfileEdit}>
                <Text style={styles.profileEditButtonText}>プロフィールを編集</Text>
              </Pressable>
            </View>

            <View style={styles.profileBody}>
              <View style={styles.profileNameRow}>
                <Text style={styles.profileName}>{profileState.name}</Text>
              </View>
              <Text style={styles.profileHandle}>{profileState.handle}</Text>
              <Text style={styles.profileRole}>{profileState.role}</Text>
              {profileState.bio ? (
                <Text style={styles.profileBio}>{profileState.bio}</Text>
              ) : null}
              {profileState.externalLinks.length > 0 ? (
                <View style={styles.externalLinksRow}>
                  {profileState.externalLinks.map((link) => (
                    <Pressable
                      key={link.id}
                      style={styles.externalLinkChip}
                      onPress={() => onOpenExternalUrl(link.url, link.label)}
                    >
                      <Text style={styles.externalLinkChipText}>{link.label}</Text>
                    </Pressable>
                  ))}
                </View>
              ) : null}
              {renderCoachProfileDetails(profileState)}
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
                  onSetBadgeModalState({
                    title: `${profileState.name} の活動バッジ`,
                    badges: currentUserActivitySummary?.badges ?? [],
                  })
                }
              />
              <View style={styles.profileFollowRow}>
                <Pressable
                  onPress={() =>
                    onOpenRelationshipList({
                      mode: "following",
                      targetUid: authUser?.uid,
                      title: "フォロー一覧",
                      backScreen: "mypage",
                    })
                  }
                >
                  <Text style={styles.profileFollowText}>
                    <Text style={styles.profileFollowValue}>{currentProfileFollowingValue}</Text>{" "}
                    フォロー中
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() =>
                    onOpenRelationshipList({
                      mode: "followers",
                      targetUid: authUser?.uid,
                      title: "フォロワー一覧",
                      backScreen: "mypage",
                    })
                  }
                >
                  <Text style={styles.profileFollowText}>
                    <Text style={styles.profileFollowValue}>{currentProfileFollowersValue}</Text>{" "}
                    フォロワー
                  </Text>
                </Pressable>
                <Text style={styles.profileFollowText}>
                  <Text style={styles.profileFollowValue}>{currentProfilePostsValue}</Text> 投稿
                </Text>
              </View>
              <Pressable style={styles.profileFeedButton} onPress={onGoToFollowingFeed}>
                <Text style={styles.profileFeedButtonText}>フォロー中の投稿を見る</Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.profileTabBar}>
            {myPageTabs.map((tab) => (
              <Pressable
                key={tab.key}
                onPress={() => onChangeProfileTab(tab.key as ProfileTabKey)}
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
            {["posts", "likes", "bookmarks"].includes(activeProfileTab)
              ? currentUserProfileTabPosts.map((post) => {
                  const display = extractDisplayBodyAndTags(post.body);
                  return (
                    <View key={post.id} style={styles.profilePostCard}>
                      {activeProfileTab === "posts" &&
                      pinnedPostKey === `${post.source}:${post.id}` ? (
                        <View style={styles.pinnedNoticeRow}>
                          <Text style={styles.pinnedNoticeText}>固定中</Text>
                        </View>
                      ) : null}
                      {activeProfileTab === "posts" && post.displayRole ? (
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
                          <Text style={styles.profilePostName}>{post.author}</Text>
                          <Text style={styles.profilePostMeta}>
                            {post.authorHandle ?? createHandleFromName(post.author)} ・{" "}
                            {post.displayRole ?? post.role}
                          </Text>
                        </View>
                        <View style={styles.profileSourceBadge}>
                          <Text style={styles.profileSourceBadgeText}>{post.sourceLabel}</Text>
                        </View>
                      </View>
                      <Pressable
                        style={styles.detailTapArea}
                        onPress={() =>
                          onOpenPostDetail({
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
                              practiceMenu: post.practiceMenu,
                              replies: post.replies,
                              sports: post.sports,
                              tags: post.tags,
                              createdAtMs: post.createdAtMs,
                            },
                            backScreen: "mypage",
                          })
                        }
                      >
                        <Text style={styles.profilePostTitle}>{post.title}</Text>
                        {display.bodyText ? (
                          <ExpandableBody
                            id={`mypage-post:${post.id}`}
                            content={display.bodyText}
                            compact={true}
                            expanded={expandedBodyIds.includes(`mypage-post:${post.id}`)}
                            onToggle={onToggleExpandedBody}
                            onOpenUrl={onOpenExternalUrl}
                          />
                        ) : null}
                        {renderPracticeMenu(post.practiceMenu)}
                        <MediaGallery media={post.media} compact={true} />
                        {renderHashtagChips(display.tags)}
                      </Pressable>
                      {activeProfileTab === "posts" ? (
                        <Pressable
                          style={styles.inlineActionButton}
                          onPress={() => onTogglePinnedPost(post)}
                        >
                          <Text style={styles.inlineActionButtonText}>
                            {pinnedPostKey === `${post.source}:${post.id}`
                              ? "固定を解除"
                              : "この投稿を固定"}
                          </Text>
                        </Pressable>
                      ) : null}
                      <View style={styles.profilePostMetrics}>
                        <Text style={styles.profileMetricText}>返信 {post.replies.length}</Text>
                      </View>
                    </View>
                  );
                })
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
                        <Text style={styles.profilePostMeta}>{profileState.handle} ・ 回答</Text>
                      </View>
                      <View style={styles.profileSourceBadge}>
                        <Text style={styles.profileSourceBadgeText}>{answer.sourceLabel}</Text>
                      </View>
                    </View>
                    <Text style={styles.profilePostTitle}>{answer.parentTitle}</Text>
                    <ExpandableBody
                      id={`mypage-answer:${answer.id}`}
                      content={answer.body}
                      expanded={expandedBodyIds.includes(`mypage-answer:${answer.id}`)}
                      onToggle={onToggleExpandedBody}
                      onOpenUrl={onOpenExternalUrl}
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
                    <RichTextRenderer
                      content={bestReply?.body ?? ""}
                      onOpenUrl={onOpenExternalUrl}
                    />
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
            {activeProfileTab === "likes" && currentUserLikedPosts.length === 0 ? (
              <View style={styles.communityCard}>
                <Text style={styles.cardTitle}>いいねした投稿はありません</Text>
              </View>
            ) : null}
            {activeProfileTab === "bookmarks" && currentUserBookmarkedPosts.length === 0 ? (
              <View style={styles.communityCard}>
                <Text style={styles.cardTitle}>保存した投稿はありません</Text>
              </View>
            ) : null}
          </View>
        </View>
      )}
    </ScrollView>
  );
}
