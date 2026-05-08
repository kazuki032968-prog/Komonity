import type { ReactNode } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

import { myPageTabs } from "../constants/app";
import {
  ActivityBadgeSection,
  AvatarVisual,
  DefaultAvatarIcon,
  ExpandableBody,
  MediaGallery,
  ProfileBannerVisual,
  RichTextRenderer,
} from "../components/shared";
import type {
  BadgeModalState,
  PostDetailState,
  PracticeMenuTemplate,
  PracticeStrategyTemplate,
  ProfileAnswerItem,
  ProfilePostItem,
  ProfileState,
  ProfileTabKey,
  QuestionPost,
  Reply,
  ScreenKey,
  UserActivitySummary,
  UserProfileState,
} from "../types/app";
import { extractDisplayBodyAndTags } from "../utils/appUtils";

type SharedStyles = Record<string, any>;

type RelationshipPayload = {
  mode: "following" | "followers";
  targetUid?: string;
  title: string;
  backScreen: "mypage" | "user-profile";
};

/**
 * 他ユーザーのプロフィール画面です。
 * 公開プロフィール、フォロー操作、投稿・回答・ベストアンサーを表示します。
 */
export function UserProfileScreen({
  styles,
  authUserUid,
  selectedUserProfile,
  activeProfileTab,
  isFollowingSelectedProfile,
  selectedUserActivitySummary,
  selectedProfileFollowingValue,
  selectedProfileFollowersValue,
  selectedProfilePostsValue,
  selectedUserBestAnswerCount,
  selectedUserPinnedKey,
  selectedUserVisiblePosts,
  selectedUserAnswers,
  selectedUserBestAnswers,
  expandedBodyIds,
  renderCoachProfileDetails,
  renderPracticeMenu,
  renderHashtagChips,
  onBack,
  onToggleFollowProfile,
  onOpenRelationshipList,
  onSetBadgeModalState,
  onOpenUserActionMenu,
  onChangeProfileTab,
  onOpenPostDetail,
  onToggleExpandedBody,
  onOpenExternalUrl,
}: {
  styles: SharedStyles;
  authUserUid?: string;
  selectedUserProfile: UserProfileState;
  activeProfileTab: ProfileTabKey;
  isFollowingSelectedProfile: boolean;
  selectedUserActivitySummary?: UserActivitySummary | null;
  selectedProfileFollowingValue: number | string;
  selectedProfileFollowersValue: number | string;
  selectedProfilePostsValue: number | string;
  selectedUserBestAnswerCount: number;
  selectedUserPinnedKey: string | null;
  selectedUserVisiblePosts: ProfilePostItem[];
  selectedUserAnswers: ProfileAnswerItem[];
  selectedUserBestAnswers: Array<{ question: QuestionPost; bestReply?: Reply }>;
  expandedBodyIds: string[];
  renderCoachProfileDetails: (profile: ProfileState) => ReactNode;
  renderPracticeMenu: (
    menu?: PracticeMenuTemplate,
    strategy?: PracticeStrategyTemplate
  ) => ReactNode;
  renderHashtagChips: (tags: string[]) => ReactNode;
  onBack: () => void;
  onToggleFollowProfile: (payload: { targetUid: string; targetName: string }) => void;
  onOpenRelationshipList: (payload: RelationshipPayload) => void;
  onSetBadgeModalState: (state: BadgeModalState) => void;
  onOpenUserActionMenu: (uid: string, name: string) => void;
  onChangeProfileTab: (tab: ProfileTabKey) => void;
  onOpenPostDetail: (payload: { detail: PostDetailState; backScreen: ScreenKey }) => void;
  onToggleExpandedBody: (id: string) => void;
  onOpenExternalUrl: (url: string, label?: string) => void;
}) {
  const canActOnProfile =
    Boolean(selectedUserProfile.uid) && selectedUserProfile.uid !== authUserUid;

  return (
    <ScrollView contentContainerStyle={styles.pageContainer}>
      <View style={styles.stack}>
        <View style={styles.profileShell}>
          <ProfileBannerVisual
            imageUri={selectedUserProfile.coverUrl}
            tone={selectedUserProfile.name}
          />
          <View style={styles.profileTopRow}>
            <View style={[styles.profileAvatar, styles.userProfileAvatar]}>
              <AvatarVisual
                size={82}
                imageUri={selectedUserProfile.avatarUrl}
                tone="light"
              />
            </View>
            <View style={styles.userProfileActions}>
              <Pressable style={styles.profileIconButton} onPress={onBack}>
                <Text style={styles.profileIconButtonText}>戻る</Text>
              </Pressable>
              {canActOnProfile ? (
                <Pressable
                  style={[
                    styles.profileFollowButton,
                    isFollowingSelectedProfile
                      ? styles.profileFollowButtonFollowing
                      : styles.profileFollowButtonPrimary,
                  ]}
                  onPress={() =>
                    onToggleFollowProfile({
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
            {selectedUserProfile.bio ? (
              <Text style={styles.profileBio}>{selectedUserProfile.bio}</Text>
            ) : null}
            {selectedUserProfile.externalLinks.length > 0 ? (
              <View style={styles.externalLinksRow}>
                {selectedUserProfile.externalLinks.map((link) => (
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
            {renderCoachProfileDetails(selectedUserProfile)}
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
                onSetBadgeModalState({
                  title: `${selectedUserProfile.name} の活動バッジ`,
                  badges: selectedUserActivitySummary?.badges ?? [],
                })
              }
            />
            <View style={styles.profileFollowRow}>
              <Pressable
                onPress={() =>
                  onOpenRelationshipList({
                    mode: "following",
                    targetUid: selectedUserProfile.uid,
                    title: `${selectedUserProfile.name} のフォロー一覧`,
                    backScreen: "user-profile",
                  })
                }
              >
                <Text style={styles.profileFollowText}>
                  <Text style={styles.profileFollowValue}>{selectedProfileFollowingValue}</Text>{" "}
                  フォロー中
                </Text>
              </Pressable>
              <Pressable
                onPress={() =>
                  onOpenRelationshipList({
                    mode: "followers",
                    targetUid: selectedUserProfile.uid,
                    title: `${selectedUserProfile.name} のフォロワー一覧`,
                    backScreen: "user-profile",
                  })
                }
              >
                <Text style={styles.profileFollowText}>
                  <Text style={styles.profileFollowValue}>{selectedProfileFollowersValue}</Text>{" "}
                  フォロワー
                </Text>
              </Pressable>
              <Text style={styles.profileFollowText}>
                <Text style={styles.profileFollowValue}>{selectedProfilePostsValue}</Text> 投稿
              </Text>
              <Text style={styles.profileFollowText}>
                <Text style={styles.profileFollowValue}>{selectedUserBestAnswerCount}</Text>{" "}
                ベストアンサー
              </Text>
            </View>
            {canActOnProfile ? (
              <View style={styles.userControlRow}>
                <Pressable
                  style={styles.profileIconButton}
                  onPress={() =>
                    onOpenUserActionMenu(
                      selectedUserProfile.uid!,
                      selectedUserProfile.name
                    )
                  }
                >
                  <Text style={styles.profileIconButtonText}>•••</Text>
                </Pressable>
              </View>
            ) : null}
          </View>
        </View>

        <View style={styles.profileTabBar}>
          {myPageTabs
            .filter((tab) => tab.key !== "likes" && tab.key !== "bookmarks")
            .map((tab) => (
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
          {activeProfileTab === "posts"
            ? selectedUserVisiblePosts.map((post) => {
                const display = extractDisplayBodyAndTags(post.body);
                return (
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
                            feedKind: post.feedKind,
                            practiceMenu: post.practiceMenu,
                            strategyTemplate: post.strategyTemplate,
                            replies: post.replies,
                            sports: post.sports,
                            tags: post.tags,
                            createdAtMs: post.createdAtMs,
                          },
                          backScreen: "user-profile",
                        })
                      }
                    >
                      <Text style={styles.profilePostTitle}>{post.title}</Text>
                      {display.bodyText ? (
                        <ExpandableBody
                          id={`user-post:${post.id}`}
                          content={display.bodyText}
                          compact={true}
                          expanded={expandedBodyIds.includes(`user-post:${post.id}`)}
                          onToggle={onToggleExpandedBody}
                          onOpenUrl={onOpenExternalUrl}
                        />
                      ) : null}
                      {renderPracticeMenu(post.practiceMenu, post.strategyTemplate)}
                      <MediaGallery media={post.media} compact={true} />
                      {renderHashtagChips(display.tags)}
                    </Pressable>
                    <View style={styles.profilePostMetrics}>
                      <Text style={styles.profileMetricText}>返信 {post.replies.length}</Text>
                    </View>
                  </View>
                );
              })
            : null}

          {activeProfileTab === "answers"
            ? selectedUserAnswers.map((answer) => (
                <View key={answer.id} style={styles.profilePostCard}>
                  <View style={styles.profilePostHeader}>
                    <View style={styles.profilePostMiniAvatar}>
                      <DefaultAvatarIcon size={24} />
                    </View>
                    <View style={styles.profilePostHeaderText}>
                      <Text style={styles.profilePostName}>{selectedUserProfile.name}</Text>
                      <Text style={styles.profilePostMeta}>
                        {selectedUserProfile.handle} ・ 回答
                      </Text>
                    </View>
                    <View style={styles.profileSourceBadge}>
                      <Text style={styles.profileSourceBadgeText}>{answer.sourceLabel}</Text>
                    </View>
                  </View>
                  <Text style={styles.profilePostTitle}>{answer.parentTitle}</Text>
                  <ExpandableBody
                    id={`user-answer:${answer.id}`}
                    content={answer.body}
                    expanded={expandedBodyIds.includes(`user-answer:${answer.id}`)}
                    onToggle={onToggleExpandedBody}
                    onOpenUrl={onOpenExternalUrl}
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
                      <Text style={styles.profilePostName}>{selectedUserProfile.name}</Text>
                      <Text style={styles.profilePostMeta}>
                        {selectedUserProfile.handle} ・ ベストアンサー
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
          {activeProfileTab === "best_answers" && selectedUserBestAnswers.length === 0 ? (
            <View style={styles.communityCard}>
              <Text style={styles.cardTitle}>ベストアンサーはありません</Text>
            </View>
          ) : null}
        </View>
      </View>
    </ScrollView>
  );
}
