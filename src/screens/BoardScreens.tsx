import type { ReactNode } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import type { User } from "firebase/auth";

import {
  AvatarVisual,
  DefaultAvatarIcon,
  ExpandableBody,
  MediaGallery,
  PageIntro,
  RegistrationHeader,
  ReplyList,
  RichTextRenderer,
} from "../components/shared";
import {
  buildCommunityDetail,
  buildFeedDetail,
  buildQuestionDetail,
} from "../services/postService";
import type {
  CommunityPost,
  FeedPost,
  NotificationItem,
  PostDetailState,
  QuestionPost,
  ScreenKey,
  SearchAccountItem,
  TrendingCoachItem,
} from "../types/app";
import {
  extractDisplayBodyAndTags,
  formatDateTimeWithSeconds,
} from "../utils/appUtils";

type SharedStyles = Record<string, any>;

type OpenProfilePayload = {
  uid?: string;
  name: string;
  role: string;
  bio?: string;
  handle?: string;
  avatarUrl?: string;
  followers?: string;
  selectedSports?: string[];
};

type OpenPostDetailPayload = {
  detail: PostDetailState;
  backScreen: ScreenKey;
};

/**
 * 相談広場の一覧画面です。
 * 相談投稿、本文、メディア、ベストアンサーの概要を表示します。
 */
export function QuestionsScreen({
  styles,
  questions,
  expandedBodyIds,
  renderHashtagChips,
  onOpenPostDetail,
  onOpenUserProfile,
  onToggleExpandedBody,
  onOpenExternalUrl,
}: {
  styles: SharedStyles;
  questions: QuestionPost[];
  expandedBodyIds: string[];
  renderHashtagChips: (tags: string[]) => ReactNode;
  onOpenPostDetail: (payload: OpenPostDetailPayload) => void;
  onOpenUserProfile: (profile: OpenProfilePayload) => void;
  onToggleExpandedBody: (id: string) => void;
  onOpenExternalUrl: (url: string, label?: string) => void;
}) {
  return (
    <ScrollView contentContainerStyle={styles.pageContainer}>
      <PageIntro
        title="相談広場"
        description="顧問の先生の悩みと、評価の高い回答をまとめて確認できます。"
      />
      <View style={styles.stack}>
        {questions.length === 0 ? (
          <View style={styles.communityCard}>
            <Text style={styles.cardTitle}>相談はまだありません</Text>
          </View>
        ) : null}
        {questions.map((question) => {
          const display = extractDisplayBodyAndTags(question.body);
          return (
            <View key={question.id} style={styles.questionCard}>
              <Pressable
                style={styles.detailTapArea}
                onPress={() =>
                  onOpenPostDetail({
                    detail: buildQuestionDetail(question),
                    backScreen: "questions",
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
                {display.bodyText ? (
                  <ExpandableBody
                    id={`questions:${question.id}`}
                    content={display.bodyText}
                    expanded={expandedBodyIds.includes(`questions:${question.id}`)}
                    onToggle={onToggleExpandedBody}
                    onOpenUrl={onOpenExternalUrl}
                  />
                ) : null}
                <MediaGallery media={question.media} />
                {renderHashtagChips(display.tags)}
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
        })}
      </View>
    </ScrollView>
  );
}

/**
 * 話題の指導者一覧です。
 * フォロワーや反応量をもとに並んだ指導者カードを表示します。
 */
export function ExpertsScreen({
  styles,
  trendingCoaches,
  onOpenUserProfile,
}: {
  styles: SharedStyles;
  trendingCoaches: TrendingCoachItem[];
  onOpenUserProfile: (profile: OpenProfilePayload) => void;
}) {
  return (
    <ScrollView contentContainerStyle={styles.pageContainer}>
      <PageIntro
        title="話題の指導者"
        description="全種目の指導者を、反応量と更新頻度をもとに並べています。"
        collapsible={true}
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
                  onOpenUserProfile({
                    uid: coach.id,
                    name: coach.name,
                    role: "指導員アカウント",
                    bio: coach.bio,
                    handle: coach.handle,
                    avatarUrl: coach.avatarUrl,
                    followers: coach.followers,
                    selectedSports: coach.selectedSports,
                  })
                }
              >
                <View style={styles.authorAvatar}>
                  <AvatarVisual
                    size={56}
                    imageUri={coach.avatarUrl}
                  />
                </View>
                <View style={styles.authorTextBlock}>
                  <Text style={styles.cardTitle}>{coach.name}</Text>
                  <Text style={styles.cardMeta}>
                    {coach.role} ・ {coach.bio}
                  </Text>
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
              <MetricBox styles={styles} value={coach.likes} label="累計いいね" />
              <MetricBox styles={styles} value={coach.reposts} label="累計再投稿" />
              <MetricBox styles={styles} value={coach.bookmarks} label="累計保存" />
              <MetricBox
                styles={styles}
                value={coach.bestAnswers}
                label="ベストアンサー"
              />
            </View>
            <Text style={styles.promoText}>最終投稿から {coach.lastActivityDays} 日</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

/**
 * コミュニティ投稿一覧です。
 * 顧問同士の公開相談や資料共有を表示します。
 */
export function CommunityScreen({
  styles,
  items,
  expandedBodyIds,
  renderHashtagChips,
  onOpenPostDetail,
  onOpenUserProfile,
  onToggleExpandedBody,
  onOpenExternalUrl,
}: {
  styles: SharedStyles;
  items: CommunityPost[];
  expandedBodyIds: string[];
  renderHashtagChips: (tags: string[]) => ReactNode;
  onOpenPostDetail: (payload: OpenPostDetailPayload) => void;
  onOpenUserProfile: (profile: OpenProfilePayload) => void;
  onToggleExpandedBody: (id: string) => void;
  onOpenExternalUrl: (url: string, label?: string) => void;
}) {
  return (
    <ScrollView contentContainerStyle={styles.pageContainer}>
      <PageIntro
        title="コミュニティ"
        description="顧問同士の公開相談、資料共有、運営ノウハウ交換のためのページです。"
      />
      <View style={styles.stack}>
        {items.length === 0 ? (
          <View style={styles.communityCard}>
            <Text style={styles.cardTitle}>コミュニティ投稿はまだありません</Text>
          </View>
        ) : null}
        {items.map((item) => {
          const display = extractDisplayBodyAndTags(item.body);
          return (
            <View key={item.id} style={styles.communityCard}>
              <Pressable
                style={styles.detailTapArea}
                onPress={() =>
                  onOpenPostDetail({
                    detail: buildCommunityDetail(item),
                    backScreen: "community",
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
                {display.bodyText ? (
                  <ExpandableBody
                    id={`community:${item.id}`}
                    content={display.bodyText}
                    expanded={expandedBodyIds.includes(`community:${item.id}`)}
                    onToggle={onToggleExpandedBody}
                    onOpenUrl={onOpenExternalUrl}
                  />
                ) : null}
                <MediaGallery media={item.media} />
                {renderHashtagChips(display.tags)}
              </Pressable>
              <Pressable style={styles.communityButton}>
                <Text style={styles.communityButtonText}>{item.cta}</Text>
              </Pressable>
              <ReplyList replies={item.replies} />
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

/**
 * 通知一覧です。
 * 未ログイン時は登録・ログインへの導線を表示します。
 */
export function NotificationsScreen({
  styles,
  authUser,
  notificationItems,
  onBack,
  onGoToRegister,
  onGoToLogin,
  onOpenPostDetail,
}: {
  styles: SharedStyles;
  authUser: User | null;
  notificationItems: NotificationItem[];
  onBack: () => void;
  onGoToRegister: () => void;
  onGoToLogin: () => void;
  onOpenPostDetail: (payload: OpenPostDetailPayload) => void;
}) {
  return (
    <ScrollView contentContainerStyle={styles.pageContainer}>
      {!authUser ? (
        <LoginRequiredPanel
          styles={styles}
          title="通知"
          description="通知一覧の確認には登録またはログインが必要です。登録すると、いいねや返信などの反応を確認できます。"
          body="通知機能は登録済みユーザーのみ利用できます。ログインすると、いいね、返信、保存、再投稿、新規投稿通知を確認できます。"
          onBack={onBack}
          onGoToRegister={onGoToRegister}
          onGoToLogin={onGoToLogin}
        />
      ) : (
        <>
          <RegistrationHeader
            title="通知"
            description="いいね、返信、保存、再投稿、投稿通知に設定したアカウントの新規投稿を確認できます。"
            collapsible={true}
            showBackButton={false}
          />
          <View style={styles.stack}>
            {notificationItems.length === 0 ? (
              <View style={styles.communityCard}>
                <Text style={styles.cardTitle}>通知はまだありません</Text>
                <Text style={styles.cardBody}>
                  反応や投稿通知の設定があると、ここに一覧で表示されます。
                </Text>
              </View>
            ) : null}
            {notificationItems.map((item) => (
              <Pressable
                key={item.id}
                style={styles.notificationCard}
                onPress={() => {
                  if (item.postDetail) {
                    onOpenPostDetail({
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
        </>
      )}
    </ScrollView>
  );
}

/**
 * フォロー中の投稿一覧です。
 * フォロー済みアカウントの投稿だけを表示します。
 */
export function FollowingFeedScreen({
  styles,
  authUser,
  posts,
  expandedBodyIds,
  renderHashtagChips,
  onBack,
  onGoToRegister,
  onGoToLogin,
  onOpenUserProfile,
  onOpenPostDetail,
  onToggleExpandedBody,
  onOpenExternalUrl,
}: {
  styles: SharedStyles;
  authUser: User | null;
  posts: FeedPost[];
  expandedBodyIds: string[];
  renderHashtagChips: (tags: string[]) => ReactNode;
  onBack: () => void;
  onGoToRegister: () => void;
  onGoToLogin: () => void;
  onOpenUserProfile: (profile: OpenProfilePayload) => void;
  onOpenPostDetail: (payload: OpenPostDetailPayload) => void;
  onToggleExpandedBody: (id: string) => void;
  onOpenExternalUrl: (url: string, label?: string) => void;
}) {
  return (
    <ScrollView contentContainerStyle={styles.pageContainer}>
      {!authUser ? (
        <LoginRequiredPanel
          styles={styles}
          title="フォロー中の投稿"
          description="フォロー中の投稿一覧は登録またはログイン後に利用できます。ログインすると、気になるアカウントの投稿をまとめて確認できます。"
          body="フォロー中の投稿一覧は、登録済みユーザー向けの機能です。ログインすると、フォローしたアカウントの投稿だけをまとめて確認できます。"
          onBack={onBack}
          onGoToRegister={onGoToRegister}
          onGoToLogin={onGoToLogin}
        />
      ) : (
        <>
          <PageIntro
            title="フォロー中の投稿"
            description="フォローしているユーザーのメニュー・戦術投稿だけをまとめて確認できます。"
          />
          <View style={styles.stack}>
            {posts.length === 0 ? (
              <View style={styles.communityCard}>
                <Text style={styles.cardTitle}>まだ投稿がありません</Text>
                <Text style={styles.cardBody}>
                  アカウントをフォローすると、ここにその人の投稿が表示されます。
                </Text>
              </View>
            ) : null}
            {posts.map((post) => {
              const display = extractDisplayBodyAndTags(post.body);
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
                      onOpenPostDetail({
                        detail: buildFeedDetail(post),
                        backScreen: "following-feed",
                      })
                    }
                  >
                    {display.bodyText ? (
                      <ExpandableBody
                        id={`following:${post.id}`}
                        content={display.bodyText}
                        expanded={expandedBodyIds.includes(`following:${post.id}`)}
                        onToggle={onToggleExpandedBody}
                        onOpenUrl={onOpenExternalUrl}
                      />
                    ) : null}
                    <MediaGallery media={post.media} />
                    {renderHashtagChips(display.tags)}
                  </Pressable>
                  <ReplyList replies={post.replies} />
                </View>
              );
            })}
          </View>
        </>
      )}
    </ScrollView>
  );
}

/**
 * フォロー・フォロワー一覧画面です。
 */
export function RelationshipListScreen({
  styles,
  title,
  backScreen,
  accounts,
  authUserUid,
  currentFollowingUserIds,
  onBack,
  onOpenUserProfile,
  onToggleFollowProfile,
}: {
  styles: SharedStyles;
  title: string;
  backScreen: "mypage" | "user-profile";
  accounts: SearchAccountItem[];
  authUserUid?: string;
  currentFollowingUserIds: string[];
  onBack: (screen: "mypage" | "user-profile") => void;
  onOpenUserProfile: (profile: OpenProfilePayload) => void;
  onToggleFollowProfile: (payload: { targetUid: string; targetName: string }) => void;
}) {
  return (
    <ScrollView contentContainerStyle={styles.pageContainer}>
      <RegistrationHeader
        title={title}
        description="プロフィールからつながっているアカウント一覧です。"
        onBack={() => onBack(backScreen)}
      />
      <View style={styles.searchTopicStack}>
        {accounts.length === 0 ? (
          <View style={styles.searchTopicCard}>
            <Text style={styles.searchTopicTitle}>まだアカウントがいません</Text>
            <Text style={styles.searchTopicMeta}>
              フォローまたはフォロワーがあると、ここに一覧表示されます。
            </Text>
          </View>
        ) : null}
        {accounts.map((account) => {
          const isFollowing = currentFollowingUserIds.includes(account.id);
          const openAccount = () =>
            onOpenUserProfile({
              uid: account.id,
              name: account.name,
              role: account.role,
              bio: account.bio,
              handle: account.handle,
              avatarUrl: account.avatarUrl,
              followers: account.followers,
              selectedSports: account.selectedSports,
            });

          return (
            <View key={account.id} style={styles.searchAccountCard}>
              <Pressable style={styles.searchAvatar} onPress={openAccount}>
                <AvatarVisual
                  size={52}
                  imageUri={account.avatarUrl}
                />
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
                <Text style={styles.searchTopicMeta}>フォロワー {account.followers}</Text>
              </View>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

function LoginRequiredPanel({
  styles,
  title,
  description,
  body,
  onBack,
  onGoToRegister,
  onGoToLogin,
}: {
  styles: SharedStyles;
  title: string;
  description: string;
  body: string;
  onBack: () => void;
  onGoToRegister: () => void;
  onGoToLogin: () => void;
}) {
  return (
    <>
      <RegistrationHeader
        title={title}
        description={description}
        onBack={onBack}
        collapsible={true}
        showBackButton={false}
      />
      <View style={styles.registrationCard}>
        <View style={styles.registrationFlowCard}>
          <Text style={styles.registrationFlowText}>{body}</Text>
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
  );
}

function MetricBox({
  styles,
  value,
  label,
}: {
  styles: SharedStyles;
  value: number | string;
  label: string;
}) {
  return (
    <View style={styles.expertMetricBox}>
      <Text style={styles.expertMetricValue}>{value}</Text>
      <Text style={styles.expertMetricLabel}>{label}</Text>
    </View>
  );
}
