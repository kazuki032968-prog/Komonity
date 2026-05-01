import type { ReactNode } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";

import {
  searchContentFilters,
  searchTabs,
  todayMenuConditionOptions,
} from "../constants/app";
import {
  DefaultAvatarIcon,
  ExpandableBody,
  MediaGallery,
  ReplyList,
  RichTextRenderer,
} from "../components/shared";
import type {
  PostDetailState,
  PracticeMenuTemplate,
  ScreenKey,
  SearchAccountItem,
  SearchContentFilterKey,
  SearchContentItem,
  SearchTabKey,
  TodayMenuConditionKey,
} from "../types/app";
import { extractDisplayBodyAndTags } from "../utils/appUtils";

type SharedStyles = Record<string, any>;

type SearchProfilePayload = {
  uid?: string;
  name: string;
  role: string;
  bio?: string;
  handle?: string;
  followers?: string;
  selectedSports?: string[];
  strengths?: string;
  supportTopics?: string;
  certifications?: string;
  organization?: string;
  youtubeUrl?: string;
  xUrl?: string;
  instagramUrl?: string;
  consultationAvailable?: boolean;
  paidConsultationAvailable?: boolean;
};

const buildSearchPostDetail = (post: SearchContentItem): PostDetailState => ({
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
});

/**
 * 検索画面です。
 * 投稿検索、今日の練習メニュー条件検索、アカウント検索をまとめて表示します。
 */
export function SearchScreen({
  styles,
  searchQuery,
  activeSearchTab,
  activeSearchContentFilter,
  todayMenuConditions,
  trendingSearchPosts,
  recentSearchPosts,
  searchAccounts,
  authUserUid,
  currentFollowingUserIds,
  expandedBodyIds,
  renderPracticeMenu,
  renderHashtagChips,
  onBack,
  onChangeSearchQuery,
  onChangeSearchTab,
  onChangeSearchContentFilter,
  onToggleTodayMenuCondition,
  onOpenUserProfile,
  onOpenPostDetail,
  onToggleFollowProfile,
  onToggleExpandedBody,
  onOpenExternalUrl,
}: {
  styles: SharedStyles;
  searchQuery: string;
  activeSearchTab: SearchTabKey;
  activeSearchContentFilter: SearchContentFilterKey;
  todayMenuConditions: TodayMenuConditionKey[];
  trendingSearchPosts: SearchContentItem[];
  recentSearchPosts: SearchContentItem[];
  searchAccounts: SearchAccountItem[];
  authUserUid?: string;
  currentFollowingUserIds: string[];
  expandedBodyIds: string[];
  renderPracticeMenu: (menu?: PracticeMenuTemplate) => ReactNode;
  renderHashtagChips: (tags: string[]) => ReactNode;
  onBack: () => void;
  onChangeSearchQuery: (value: string) => void;
  onChangeSearchTab: (tab: SearchTabKey) => void;
  onChangeSearchContentFilter: (filter: SearchContentFilterKey) => void;
  onToggleTodayMenuCondition: (key: TodayMenuConditionKey) => void;
  onOpenUserProfile: (profile: SearchProfilePayload) => void;
  onOpenPostDetail: (payload: { detail: PostDetailState; backScreen: ScreenKey }) => void;
  onToggleFollowProfile: (payload: { targetUid: string; targetName: string }) => void;
  onToggleExpandedBody: (id: string) => void;
  onOpenExternalUrl: (url: string, label?: string) => void;
}) {
  const renderPostResult = (post: SearchContentItem, meta: string) => {
    const display = extractDisplayBodyAndTags(post.body);

    return (
      <View key={post.id} style={styles.searchPostCard}>
        <View style={styles.searchPostTop}>
          <Pressable
            style={styles.searchAvatar}
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
            <DefaultAvatarIcon size={28} />
          </Pressable>
          <View style={styles.searchPostBody}>
            <Pressable
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
              <Text style={styles.searchPostAuthor}>{post.author}</Text>
            </Pressable>
            <Text style={styles.searchPostMeta}>{meta}</Text>
            <View style={styles.searchSourceBadge}>
              <Text style={styles.searchSourceBadgeText}>{post.sourceLabel}</Text>
            </View>
            <Pressable
              style={styles.detailTapArea}
              onPress={() =>
                onOpenPostDetail({
                  detail: buildSearchPostDetail(post),
                  backScreen: "search",
                })
              }
            >
              <Text style={styles.searchPostTitle}>{post.title}</Text>
              {display.bodyText ? (
                meta.startsWith("最近") ? (
                  <RichTextRenderer
                    content={display.bodyText}
                    compact={true}
                    onOpenUrl={onOpenExternalUrl}
                  />
                ) : (
                  <ExpandableBody
                    id={`search-post:${post.id}`}
                    content={display.bodyText}
                    compact={true}
                    expanded={expandedBodyIds.includes(`search-post:${post.id}`)}
                    onToggle={onToggleExpandedBody}
                    onOpenUrl={onOpenExternalUrl}
                  />
                )
              ) : null}
              {renderPracticeMenu(post.practiceMenu)}
              <MediaGallery media={post.media} compact={true} />
              {renderHashtagChips(display.tags)}
              {meta.startsWith("最近") ? null : (
                <View style={styles.sportChipRow}>
                  {post.sports.map((sport) => (
                    <View key={sport} style={styles.sportChipActive}>
                      <Text style={styles.sportChipActiveText}>{sport}</Text>
                    </View>
                  ))}
                </View>
              )}
              <ReplyList replies={post.replies} compact={true} />
            </Pressable>
          </View>
        </View>
      </View>
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.searchPageContainer}>
      <View style={styles.searchHeader}>
        <Pressable style={styles.searchBackButton} onPress={onBack}>
          <Text style={styles.searchBackButtonText}>戻る</Text>
        </Pressable>
        <View style={styles.searchInputShell}>
          <Text style={styles.searchIcon}>○</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="種目・キーワードで検索"
            placeholderTextColor="#8a8f99"
            value={searchQuery}
            onChangeText={onChangeSearchQuery}
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
              onPress={() => onChangeSearchTab(tab.key as SearchTabKey)}
            >
              <Text style={[styles.searchTabText, selected && styles.searchTabTextActive]}>
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
                style={[styles.searchFilterChip, selected && styles.searchFilterChipActive]}
                onPress={() => onChangeSearchContentFilter(filter.key)}
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

      {activeSearchTab !== "accounts" ? (
        <View style={styles.todayMenuSearchCard}>
          <Text style={styles.todayMenuSearchTitle}>今日の練習メニュー検索</Text>
          <Text style={styles.todayMenuSearchText}>
            60分以内、雨の日、初心者多めなど、部活の状況に合わせて型付きメニュー投稿を絞り込めます。
          </Text>
          <View style={styles.sportChipRow}>
            {todayMenuConditionOptions.map((condition) => {
              const selected = todayMenuConditions.includes(condition.key);
              return (
                <Pressable
                  key={condition.key}
                  style={[styles.searchFilterChip, selected && styles.searchFilterChipActive]}
                  onPress={() => onToggleTodayMenuCondition(condition.key)}
                >
                  <Text
                    style={[
                      styles.searchFilterChipText,
                      selected && styles.searchFilterChipTextActive,
                    ]}
                  >
                    {condition.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
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
          {trendingSearchPosts.map((post) => renderPostResult(post, post.role))}
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
          {recentSearchPosts.map((post, index) =>
            renderPostResult(post, `最近の一致 ・ ${index + 1}件目`)
          )}
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
          {searchAccounts.map((account) => {
            const isFollowing = currentFollowingUserIds.includes(account.id);
            const openAccount = () =>
              onOpenUserProfile({
                uid: account.id,
                name: account.name,
                role: account.role,
                bio: account.bio,
                handle: account.handle,
                followers: account.followers,
                selectedSports: account.selectedSports,
                strengths: account.strengths,
                supportTopics: account.supportTopics,
                certifications: account.certifications,
                organization: account.organization,
                youtubeUrl: account.youtubeUrl,
                xUrl: account.xUrl,
                instagramUrl: account.instagramUrl,
                consultationAvailable: account.consultationAvailable,
                paidConsultationAvailable: account.paidConsultationAvailable,
              });

            return (
              <View key={account.id} style={styles.searchAccountCard}>
                <Pressable style={styles.searchAvatar} onPress={openAccount}>
                  <DefaultAvatarIcon size={28} />
                </Pressable>
                <View style={styles.searchAccountBody}>
                  <View style={styles.searchAccountHeader}>
                    <Pressable style={styles.searchAccountTextWrap} onPress={openAccount}>
                      <Text style={styles.searchPostAuthor}>{account.name}</Text>
                      <Text style={styles.searchPostMeta}>{account.handle}</Text>
                    </Pressable>
                    {account.id !== authUserUid ? (
                      <Pressable
                        style={[
                          styles.searchFollowButton,
                          isFollowing
                            ? styles.searchFollowButtonFollowing
                            : styles.searchFollowButtonPrimary,
                        ]}
                        onPress={() =>
                          onToggleFollowProfile({
                            targetUid: account.id,
                            targetName: account.name,
                          })
                        }
                      >
                        <Text
                          style={[
                            styles.searchFollowButtonText,
                            isFollowing
                              ? styles.searchFollowButtonTextFollowing
                              : styles.searchFollowButtonTextPrimary,
                          ]}
                        >
                          {isFollowing ? "フォロー中" : "フォロー"}
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
            );
          })}
        </View>
      ) : null}
    </ScrollView>
  );
}
