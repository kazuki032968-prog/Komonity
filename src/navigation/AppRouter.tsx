import { StatusBar } from "expo-status-bar";
import type { ReactNode } from "react";
import { Pressable, SafeAreaView, Text, View } from "react-native";

import { AppModals } from "../components/modals/AppModals";
import { SideMenu } from "../components/navigation/SideMenu";
import { UserActionMenuModal } from "../components/profile/UserActionMenuModal";
import { KomonityLogo } from "../components/shared";
import {
  SUPPORT_EMAIL_ADDRESS,
  featureArticleMap,
  featureArticles,
  seoLandingPageMap,
} from "../constants/app";
import {
  AdvisorRegistrationScreen,
  CoachRegistrationScreen,
  ContactScreen,
  ForgotPasswordScreen,
  LoginScreen,
  RegistrationRoleScreen,
} from "../screens/AuthScreens";
import {
  CommunityScreen,
  ExpertsScreen,
  FollowingFeedScreen,
  NotificationsScreen,
  QuestionsScreen,
  RelationshipListScreen,
} from "../screens/BoardScreens";
import { FeatureDetailScreen } from "../screens/FeatureDetailScreen";
import { FeatureListScreen } from "../screens/FeatureListScreen";
import { FeedScreen } from "../screens/FeedScreen";
import { LegalDocumentScreen } from "../screens/LegalDocumentScreen";
import { MyPageScreen } from "../screens/MyPageScreen";
import { PostComposeScreen } from "../screens/PostComposeScreen";
import { PostDetailScreen } from "../screens/PostDetailScreen";
import { ProfileEditScreen } from "../screens/ProfileEditScreen";
import { ReplyDetailScreen } from "../screens/ReplyDetailScreen";
import { SearchScreen } from "../screens/SearchScreen";
import { SeoLandingScreen } from "../screens/SeoLandingScreen";
import { ServiceDetailScreen } from "../screens/ServiceDetailScreen";
import { TimelineScreen } from "../screens/TimelineScreen";
import { UserProfileScreen } from "../screens/UserProfileScreen";
import type { ScreenKey } from "../types/app";

type AppRouterProps = {
  styles: Record<string, any>;
  isDarkMode?: boolean;
  currentScreen: ScreenKey;
  isMenuOpen: boolean;
  setIsMenuOpen: (value: boolean | ((current: boolean) => boolean)) => void;
  goToScreen: (screen: ScreenKey, mode?: "push" | "replace") => void;
  setCurrentScreen: (screen: ScreenKey) => void;
  [key: string]: any;
};

type LineIconProps = {
  active?: boolean;
  isDarkMode?: boolean;
  styles: Record<string, any>;
};

const getLineIconColor = (active?: boolean, isDarkMode?: boolean) =>
  active ? (isDarkMode ? "#5eead4" : "#0f766e") : isDarkMode ? "#cbd5e1" : "#4b5563";

const legalEffectiveDate = "2026年5月15日";

const privacyPolicySections = [
  {
    title: "1. 運営者・お問い合わせ先",
    body: `Komonity運営は、本プライバシーポリシーに基づき個人情報を取り扱います。個人情報に関するお問い合わせ、開示・訂正・削除・利用停止等のご相談は、${SUPPORT_EMAIL_ADDRESS} またはアプリ内のお問い合わせ画面からご連絡ください。`,
  },
  {
    title: "2. 取得する情報",
    body: "ログイン用メールアドレス、表示名、表示ID、プロフィール情報、外部リンク、投稿・返信・画像・動画、いいね・保存・フォロー・ブロック・通報・投稿通知の操作情報、お問い合わせ内容、端末やブラウザから送信されるアクセス情報、Cookie等の識別子を取得する場合があります。パスワードはFirebase Authentication等の認証基盤で管理され、当サービスが閲覧できる形では保存しません。",
  },
  {
    title: "3. 公開される情報",
    body: "表示名、表示ID、役割、プロフィール、外部リンク、投稿、返信、添付した画像・動画、選択した種目など、利用者が公開または投稿した情報は他の利用者やインターネット上の閲覧者から確認できる場合があります。学校名、生徒の氏名、顔写真、連絡先など、第三者を特定できる情報の投稿には十分注意してください。",
  },
  {
    title: "4. 利用目的",
    body: "アカウント管理、本人確認、投稿・返信・検索・通知・フォロー等の機能提供、不具合対応、お問い合わせ対応、通報・スパム・不正利用への対応、サービス改善、利用状況の分析、広告配信、法令や規約に基づく権利保護のために利用します。",
  },
  {
    title: "5. 外部サービス・委託先",
    body: "認証、データ保存、画像・動画保存、メール送信、広告配信等のため、Firebase Authentication、Cloud Firestore、Cloud Storage、Firebase Extensions、Google AdSense等の外部サービスを利用する場合があります。これらのサービス提供者には、機能提供に必要な範囲で情報が送信・保存されることがあります。",
  },
  {
    title: "6. Cookie・広告について",
    body: "当サービスでは、ログイン状態の維持、利便性向上、利用状況の把握、広告配信のためにCookieや類似技術を利用する場合があります。Googleを含む第三者配信事業者は、利用者の過去のアクセス情報に基づいて広告を配信するためCookieを使用することがあります。利用者はGoogleの広告設定（https://adssettings.google.com/）などからパーソナライズ広告を無効にできます。",
  },
  {
    title: "7. 第三者提供",
    body: "法令に基づく場合、本人の同意がある場合、人の生命・身体・財産の保護に必要な場合、不正利用対応や権利保護のために必要な場合を除き、個人データを第三者へ提供しません。公開プロフィールや投稿として利用者自身が公開した情報は、サービス上で他者が閲覧できる場合があります。",
  },
  {
    title: "8. 安全管理",
    body: "アクセス制御、認証、データベースおよびストレージのルール設定、不要データの削除、管理権限の制限など、漏えい・滅失・改ざん・不正アクセスを防ぐために必要かつ適切な安全管理措置を講じます。",
  },
  {
    title: "9. 開示・訂正・削除・利用停止",
    body: "本人から、保有する個人データの開示、訂正、追加、削除、利用停止、第三者提供停止等の請求があった場合、本人確認のうえ、法令に従い合理的な範囲で対応します。アカウント削除機能を利用した場合、投稿・返信・メディア等の削除処理を行いますが、バックアップ、ログ、他者の投稿内に残る引用等は直ちに削除できない場合があります。",
  },
  {
    title: "10. 未成年者・生徒情報の取扱い",
    body: "未成年者が当サービスを利用する場合は、保護者等の同意を得てください。部活動の生徒、保護者、学校関係者など第三者の個人情報、顔写真、動画、健康状態、成績、家庭事情等を投稿する場合は、必要な同意や権限を得たうえで、個人が特定されない表現にしてください。",
  },
  {
    title: "11. 改定",
    body: "本ポリシーを変更する場合、当サービス上での掲示その他適切な方法により周知します。重要な変更については、必要に応じて追加の通知を行います。",
  },
  {
    title: "12. 制定日・最終改定日",
    body: `制定日・最終改定日: ${legalEffectiveDate}`,
  },
];

const termsSections = [
  {
    title: "1. 適用",
    body: "本規約は、Komonityの閲覧、登録、投稿、返信、検索、フォロー、通知、お問い合わせ等、当サービスの利用に関する一切の関係に適用されます。利用者は、本規約およびプライバシーポリシーに同意したうえで当サービスを利用するものとします。",
  },
  {
    title: "2. 利用登録・アカウント管理",
    body: "利用者は、登録情報を正確かつ最新に保つものとします。ログイン情報の管理責任は利用者にあり、第三者への譲渡、貸与、共有、なりすまし利用を禁止します。登録情報に虚偽、不備、不正利用のおそれがある場合、運営は登録拒否、機能制限、アカウント停止、削除等を行うことがあります。",
  },
  {
    title: "3. サービス内容",
    body: "Komonityは、部活動の顧問、指導員、関係者が練習メニュー、相談、知見、コミュニティ投稿を共有するためのサービスです。投稿や回答は一般的な情報共有であり、医療、法律、心理、栄養、トレーニング等の専門的判断を代替するものではありません。怪我、疾病、重大なトラブル、緊急性のある問題は、専門家や所属機関へ相談してください。",
  },
  {
    title: "4. 投稿・公開情報",
    body: "投稿、返信、プロフィール、画像、動画、外部リンク等の内容については、投稿者が責任を負います。利用者は、投稿に必要な権利、許諾、同意を有することを保証します。運営は、当サービスの表示、配信、保存、紹介、検索、広報、改善に必要な範囲で、投稿内容を無償で利用できるものとします。",
  },
  {
    title: "5. 禁止事項",
    body: "法令違反、公序良俗に反する行為、差別・誹謗中傷・脅迫・ハラスメント、著作権・商標権・肖像権・プライバシー等の侵害、第三者の個人情報や機微情報の無断投稿、危険な練習や体罰を助長する投稿、虚偽または誤解を招く実績表示、スパム、広告・勧誘目的の乱用、不正アクセス、スクレイピング、リバースエンジニアリング、サービス運営や広告審査を妨げる行為を禁止します。",
  },
  {
    title: "6. 生徒・未成年者に関する配慮",
    body: "利用者は、部活動の生徒や未成年者が特定される氏名、顔写真、動画、学校名、連絡先、健康状態、家庭事情、成績、懲戒・トラブル情報等を、必要な同意や権限なく投稿してはなりません。指導事例を共有する場合は、個人が特定されないよう匿名化・抽象化してください。",
  },
  {
    title: "7. モデレーション・通報対応",
    body: "運営は、規約違反、権利侵害、不適切投稿、不正利用、広告ポリシー違反のおそれがあると判断した場合、事前通知なく投稿の非表示・削除、広告表示の停止、アカウント制限、通報対応、関係機関への相談等を行うことがあります。利用者からの通報内容に対し、対応結果の個別開示を保証するものではありません。",
  },
  {
    title: "8. 知的財産権",
    body: "当サービスのロゴ、デザイン、プログラム、文章、画像、その他運営が作成したコンテンツに関する権利は、運営または正当な権利者に帰属します。利用者は、自身の投稿に関する権利を保持しますが、第三者の権利を侵害しない範囲で投稿するものとします。",
  },
  {
    title: "9. 外部リンク・外部取引",
    body: "プロフィールや投稿に含まれる外部リンク、外部サービス、指導依頼、有料相談、物品販売、イベント参加等は、利用者自身の判断と責任で利用してください。当サービス内で別途明示しない限り、外部で成立する契約、支払い、トラブルについて運営は関与せず、責任を負いません。",
  },
  {
    title: "10. サービスの変更・停止",
    body: "運営は、機能追加、仕様変更、保守、障害、セキュリティ対応、法令・ポリシー対応、事業上の都合により、当サービスの全部または一部を変更、停止、終了することがあります。これにより利用者に生じた損害について、運営の故意または重過失がある場合を除き責任を負いません。",
  },
  {
    title: "11. 免責",
    body: "運営は、当サービスの正確性、有用性、安全性、継続性、特定目的への適合性、投稿内容の信頼性、外部リンク先の内容を保証しません。利用者間または第三者との間で生じた紛争は、当事者間で解決するものとします。ただし、法令上免責が認められない場合はこの限りではありません。",
  },
  {
    title: "12. 規約変更・準拠法",
    body: "運営は、必要に応じて本規約を変更できます。変更後の規約は、当サービス上に掲載した時点または別途定める時点から効力を生じます。本規約は日本法に準拠します。",
  },
  {
    title: "13. お問い合わせ・制定日",
    body: `本規約に関するお問い合わせは、${SUPPORT_EMAIL_ADDRESS} またはアプリ内のお問い合わせ画面からご連絡ください。制定日・最終改定日: ${legalEffectiveDate}`,
  },
];

function HomeLineIcon({ active, isDarkMode, styles }: LineIconProps) {
  const color = getLineIconColor(active, isDarkMode);

  return (
    <View style={styles.lineIconBox}>
      <View style={[styles.homeIconRoof, { borderColor: color }]} />
      <View style={[styles.homeIconBase, { borderColor: color }]} />
    </View>
  );
}

function SearchLineIcon({ active, isDarkMode, styles }: LineIconProps) {
  const color = getLineIconColor(active, isDarkMode);

  return (
    <View style={styles.lineIconBox}>
      <View style={[styles.searchIconCircle, { borderColor: color }]} />
      <View style={[styles.searchIconHandle, { backgroundColor: color }]} />
    </View>
  );
}

function BellLineIcon({ active, isDarkMode, styles }: LineIconProps) {
  const color = getLineIconColor(active, isDarkMode);

  return (
    <View style={styles.lineIconBox}>
      <View style={[styles.bellIconBody, { borderColor: color }]} />
      <View style={[styles.bellIconClapper, { backgroundColor: color }]} />
    </View>
  );
}

function UserLineIcon({ active, isDarkMode, styles }: LineIconProps) {
  const color = getLineIconColor(active, isDarkMode);

  return (
    <View style={styles.lineIconBox}>
      <View style={[styles.userIconHead, { borderColor: color }]} />
      <View style={[styles.userIconShoulder, { borderColor: color }]} />
    </View>
  );
}

function BottomNavButton({
  label,
  icon,
  active,
  showDot,
  onPress,
  styles,
}: {
  label: string;
  icon: ReactNode;
  active?: boolean;
  showDot?: boolean;
  onPress: () => void;
  styles: Record<string, any>;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      style={styles.bottomNavItem}
      onPress={onPress}
    >
      <View style={styles.bottomNavIconSlot}>
        {icon}
        {showDot ? <View style={styles.bottomNavNotificationDot} /> : null}
      </View>
      <Text
        numberOfLines={1}
        style={[styles.bottomNavLabel, active && styles.bottomNavLabelActive]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

/**
 * App.tsx が状態管理で肥大化しすぎないよう、画面ごとの表示切り替えだけを担当します。
 * 各screenのpropsは既存実装を崩さないため、段階的リファクタリング前提でAppから受け取ります。
 */
export function AppRouter(props: AppRouterProps) {
  const {
    styles,
    isDarkMode,
    currentScreen,
    isMenuOpen,
    setIsMenuOpen,
    goToScreen,
    setCurrentScreen,
    authUser,
    authUserUid,
    authMessage,
    authError,
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
    setActiveTimelineSection,
    openUserProfile,
    openPostDetail,
    toggleExpandedBody,
    requestOpenExternalUrl,
    togglePostInteraction,
    renderHashtagChips,
    getAuthorAvatarUrl,
    overviewStats,
    handleLogout,
    renderPracticeMenu,
    trendingCoaches,
    profileState,
    postDetail,
    postDetailBackScreen,
    isPostDetailLiked,
    isPostDetailReposted,
    isPostDetailBookmarked,
    postDetailLikeCount,
    postDetailRepostCount,
    postDetailBookmarkCount,
    isPostDetailQuestionOwner,
    replyDraft,
    replySelection,
    replyMedia,
    isReplySubmitting,
    getReplyInteractionSummary,
    openReplyDetail,
    deletePostFromDetail,
    setReplyDraft,
    setReplySelection,
    applyReplyFormatting,
    pickReplyMedia,
    removeReplyMedia,
    submitReply,
    setBestAnswerCandidate,
    replyDetail,
    goBackFromReplyDetail,
    accountDeleteConfirmStep,
    bestAnswerCandidate,
    badgeModalState,
    externalLinkModalState,
    setAccountDeleteConfirmStep,
    deleteCurrentAccount,
    confirmBestAnswer,
    setBadgeModalState,
    closeExternalLinkModal,
    confirmOpenExternalUrl,
    notificationItems,
    composeState,
    composeMedia,
    composeBodySelection,
    isPublishing,
    updateComposeState,
    updatePracticeMenuField,
    updatePracticeStrategyField,
    toggleComposeSport,
    togglePracticeMenuCondition,
    applyComposeFormatting,
    setComposeBodySelection,
    pickComposeMedia,
    removeComposeMedia,
    submitPost,
    searchQuery,
    activeSearchTab,
    activeSearchContentFilter,
    todayMenuConditions,
    trendingSearchPosts,
    recentSearchPosts,
    searchAccounts,
    currentFollowingUserIds,
    setSearchQuery,
    setActiveSearchTab,
    setActiveSearchContentFilter,
    toggleTodayMenuCondition,
    toggleFollowProfile,
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
    renderCoachProfileDetails,
    openRelationshipList,
    relationshipListState,
    selectedUserProfile,
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
    openUserActionMenu,
    setActiveProfileTab,
    togglePinnedPost,
    profileDraft,
    pickImage,
    setProfileDraft,
    updateProfileDraft,
    updateProfileAvailability,
    updateProfileLink,
    addProfileLink,
    toggleProfileSport,
    saveProfileEdits,
    advisorForm,
    advisorIconUri,
    advisorCoverUri,
    isSubmitting,
    getAdvisorFieldKey,
    getAdvisorFieldValue,
    updateAdvisorForm,
    toggleAdvisorSport,
    registerAdvisor,
    setAdvisorIconUri,
    setAdvisorCoverUri,
    coachForm,
    coachIconUri,
    coachCoverUri,
    coachLinks,
    getCoachFieldKey,
    getCoachFieldValue,
    updateCoachForm,
    toggleCoachSport,
    updateCoachLink,
    addCoachLink,
    registerCoach,
    setCoachIconUri,
    setCoachCoverUri,
    loginForm,
    updateLoginForm,
    handleLogin,
    forgotPasswordEmail,
    setForgotPasswordEmail,
    handleForgotPassword,
    contactForm,
    updateContactForm,
    submitContactInquiry,
    userActionMenuState,
    spamReasonDraft,
    currentPostAlertUserIds,
    currentBlockedUserIds,
    setSpamReasonDraft,
    closeUserActionMenu,
    togglePostAlertsForUser,
    toggleBlockUser,
    reportUserAsSpam,
  } = props;

  const showBottomNav = ![
    "registration-role",
    "advisor-registration",
    "coach-registration",
    "login",
    "forgot-password",
    "contact",
    "privacy-policy",
    "terms",
  ].includes(currentScreen);
  const seoLandingPage = seoLandingPageMap[currentScreen];
  const featureArticle = featureArticleMap[currentScreen];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style={isDarkMode ? "light" : "dark"} />
      <View style={styles.globalHeader}>
        <Pressable onPress={() => goToScreen("top")} style={styles.logoButton}>
          <KomonityLogo />
        </Pressable>
        <View style={styles.headerActionRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="メニュー"
            style={styles.menuButton}
            onPress={() => setIsMenuOpen((current) => !current)}
          >
            <View style={styles.menuLine} />
            <View style={styles.menuLine} />
            <View style={styles.menuLine} />
          </Pressable>
        </View>
      </View>

      <View style={styles.appContent}>
        {currentScreen === "top" ? (
        <TimelineScreen
          styles={styles}
          authUser={authUser}
          activeTimelineSection={activeTimelineSection}
          timelineSections={timelineSections}
          timelineSwipePanResponder={timelineSwipePanResponder}
          homeContentItems={homeContentItems}
          filteredFeedPosts={filteredFeedPosts}
          visibleQuestionBoard={visibleQuestionBoard}
          visibleCommunityBoard={visibleCommunityBoard}
          followingFeedPosts={followingFeedPosts}
          likeRecords={likeRecords}
          likeCountMap={likeCountMap}
          repostCountMap={repostCountMap}
          expandedBodyIds={expandedBodyIds}
          onChangeTimelineSection={setActiveTimelineSection}
          onGoToScreen={goToScreen}
          onOpenUserProfile={openUserProfile}
          onOpenPostDetail={openPostDetail}
          onToggleExpandedBody={toggleExpandedBody}
          onOpenExternalUrl={requestOpenExternalUrl}
          onTogglePostInteraction={(payload) => void togglePostInteraction(payload)}
          renderHashtagChips={renderHashtagChips}
          getAuthorAvatarUrl={getAuthorAvatarUrl}
        />
        ) : null}

        {currentScreen === "service-detail" ? (
        <ServiceDetailScreen
          styles={styles}
          authUser={authUser}
          authMessage={authMessage}
          authError={authError}
          overviewStats={overviewStats}
          onGoToScreen={goToScreen}
          onLogout={handleLogout}
        />
        ) : null}

        {seoLandingPage ? (
        <SeoLandingScreen
          styles={styles}
          page={seoLandingPage}
          onGoToScreen={goToScreen}
        />
        ) : null}

        {currentScreen === "features" ? (
        <FeatureListScreen
          styles={styles}
          articles={featureArticles}
          onGoToScreen={goToScreen}
        />
        ) : null}

        {featureArticle ? (
        <FeatureDetailScreen
          styles={styles}
          article={featureArticle}
          onGoToScreen={goToScreen}
        />
        ) : null}

        {currentScreen === "feed" ? (
        <FeedScreen
          styles={styles}
          posts={filteredFeedPosts}
          authUser={authUser}
          likeRecords={likeRecords}
          likeCountMap={likeCountMap}
          repostCountMap={repostCountMap}
          expandedBodyIds={expandedBodyIds}
          renderHashtagChips={renderHashtagChips}
          renderPracticeMenu={renderPracticeMenu}
          onToggleExpandedBody={toggleExpandedBody}
          onOpenExternalUrl={requestOpenExternalUrl}
          onOpenUserProfile={openUserProfile}
          onOpenPostDetail={openPostDetail}
          onTogglePostInteraction={(payload) => void togglePostInteraction(payload)}
          getAuthorAvatarUrl={getAuthorAvatarUrl}
        />
        ) : null}

        {currentScreen === "questions" ? (
        <QuestionsScreen
          styles={styles}
          questions={visibleQuestionBoard}
          expandedBodyIds={expandedBodyIds}
          renderHashtagChips={renderHashtagChips}
          onOpenPostDetail={openPostDetail}
          onOpenUserProfile={openUserProfile}
          onToggleExpandedBody={toggleExpandedBody}
          onOpenExternalUrl={requestOpenExternalUrl}
        />
        ) : null}

        {currentScreen === "experts" ? (
        <ExpertsScreen styles={styles} trendingCoaches={trendingCoaches} onOpenUserProfile={openUserProfile} />
        ) : null}

        {currentScreen === "community" ? (
        <CommunityScreen
          styles={styles}
          items={visibleCommunityBoard}
          expandedBodyIds={expandedBodyIds}
          renderHashtagChips={renderHashtagChips}
          onOpenPostDetail={openPostDetail}
          onOpenUserProfile={openUserProfile}
          onToggleExpandedBody={toggleExpandedBody}
          onOpenExternalUrl={requestOpenExternalUrl}
        />
        ) : null}

        {currentScreen === "post-detail" ? (
        <PostDetailScreen
          styles={styles}
          authUser={authUser}
          profileState={profileState}
          authMessage={authMessage}
          authError={authError}
          postDetail={postDetail}
          backScreen={postDetailBackScreen}
          isLiked={isPostDetailLiked}
          isReposted={isPostDetailReposted}
          isBookmarked={isPostDetailBookmarked}
          likeCount={postDetailLikeCount}
          repostCount={postDetailRepostCount}
          bookmarkCount={postDetailBookmarkCount}
          isQuestionOwner={isPostDetailQuestionOwner}
          replyDraft={replyDraft}
          replySelection={replySelection}
          replyMedia={replyMedia}
          isReplySubmitting={isReplySubmitting}
          renderPracticeMenu={renderPracticeMenu}
          renderHashtagChips={renderHashtagChips}
          getReplyInteractionSummary={getReplyInteractionSummary}
          onBack={setCurrentScreen}
          onOpenUserProfile={openUserProfile}
          onOpenReplyDetail={openReplyDetail}
          onOpenExternalUrl={requestOpenExternalUrl}
          onDeletePost={() => void deletePostFromDetail()}
          onTogglePostInteraction={(payload) => void togglePostInteraction(payload)}
          onChangeReplyDraft={setReplyDraft}
          onChangeReplySelection={setReplySelection}
          onApplyReplyFormatting={applyReplyFormatting}
          onPickReplyMedia={() => void pickReplyMedia()}
          onRemoveReplyMedia={removeReplyMedia}
          onSubmitReply={() => void submitReply()}
          onSelectBestAnswer={setBestAnswerCandidate}
        />
        ) : null}

        {currentScreen === "reply-detail" ? (
        <ReplyDetailScreen
          styles={styles}
          authMessage={authMessage}
          authError={authError}
          postDetail={postDetail}
          replyDetail={replyDetail}
          replyDraft={replyDraft}
          replySelection={replySelection}
          replyMedia={replyMedia}
          isReplySubmitting={isReplySubmitting}
          getReplyInteractionSummary={getReplyInteractionSummary}
          onBack={goBackFromReplyDetail}
          onOpenUserProfile={openUserProfile}
          onOpenReplyDetail={openReplyDetail}
          onOpenExternalUrl={requestOpenExternalUrl}
          onTogglePostInteraction={(payload) => void togglePostInteraction(payload)}
          onChangeReplyDraft={setReplyDraft}
          onChangeReplySelection={setReplySelection}
          onApplyReplyFormatting={applyReplyFormatting}
          onPickReplyMedia={() => void pickReplyMedia()}
          onRemoveReplyMedia={removeReplyMedia}
          onSubmitReply={() => void submitReply()}
        />
        ) : null}

      <AppModals
        styles={styles}
        accountDeleteConfirmStep={accountDeleteConfirmStep}
        bestAnswerCandidate={bestAnswerCandidate}
        badgeModalState={badgeModalState}
        externalLinkModalState={externalLinkModalState}
        onCloseAccountDelete={() => setAccountDeleteConfirmStep("idle")}
        onProceedAccountDelete={() => setAccountDeleteConfirmStep("confirm-final")}
        onConfirmAccountDelete={() => void deleteCurrentAccount()}
        onCloseBestAnswer={() => setBestAnswerCandidate(null)}
        onConfirmBestAnswer={() => void confirmBestAnswer()}
        onCloseBadgeModal={() => setBadgeModalState({ open: false, userName: "", badges: [] })}
        onCloseExternalLink={closeExternalLinkModal}
        onConfirmExternalLink={() => void confirmOpenExternalUrl()}
      />

        {currentScreen === "notifications" ? (
        <NotificationsScreen
          styles={styles}
          authUser={authUser}
          notificationItems={notificationItems}
          onBack={() => setCurrentScreen("top")}
          onGoToRegister={() => setCurrentScreen("registration-role")}
          onGoToLogin={() => setCurrentScreen("login")}
          onOpenPostDetail={openPostDetail}
        />
        ) : null}

        {currentScreen === "post-compose" ? (
        <PostComposeScreen
          styles={styles}
          authUser={authUser}
          profileState={profileState}
          composeState={composeState}
          composeMedia={composeMedia}
          composeBodySelection={composeBodySelection}
          authMessage={authMessage}
          authError={authError}
          isPublishing={isPublishing}
          onGoToRegister={() => setCurrentScreen("registration-role")}
          onGoToLogin={() => setCurrentScreen("login")}
          onUpdateComposeState={updateComposeState}
          onUpdatePracticeMenuField={updatePracticeMenuField}
          onUpdatePracticeStrategyField={updatePracticeStrategyField}
          onToggleComposeSport={toggleComposeSport}
          onTogglePracticeMenuCondition={togglePracticeMenuCondition}
          onApplyComposeFormatting={applyComposeFormatting}
          onSetComposeBodySelection={setComposeBodySelection}
          onPickComposeMedia={() => void pickComposeMedia()}
          onRemoveComposeMedia={removeComposeMedia}
          onSubmitPost={() => void submitPost()}
        />
        ) : null}

        {currentScreen === "search" ? (
        <SearchScreen
          styles={styles}
          searchQuery={searchQuery}
          activeSearchTab={activeSearchTab}
          activeSearchContentFilter={activeSearchContentFilter}
          todayMenuConditions={todayMenuConditions}
          trendingSearchPosts={trendingSearchPosts}
          recentSearchPosts={recentSearchPosts}
          searchAccounts={searchAccounts}
          authUserUid={authUserUid}
          currentFollowingUserIds={currentFollowingUserIds}
          expandedBodyIds={expandedBodyIds}
          renderPracticeMenu={renderPracticeMenu}
          renderHashtagChips={renderHashtagChips}
          getAuthorAvatarUrl={getAuthorAvatarUrl}
          onBack={() => setCurrentScreen("top")}
          onChangeSearchQuery={setSearchQuery}
          onChangeSearchTab={setActiveSearchTab}
          onChangeSearchContentFilter={setActiveSearchContentFilter}
          onToggleTodayMenuCondition={toggleTodayMenuCondition}
          onOpenUserProfile={openUserProfile}
          onOpenPostDetail={openPostDetail}
          onToggleFollowProfile={(payload) => void toggleFollowProfile(payload)}
          onToggleExpandedBody={toggleExpandedBody}
          onOpenExternalUrl={requestOpenExternalUrl}
        />
        ) : null}

        {currentScreen === "mypage" ? (
        <MyPageScreen
          styles={styles}
          authUser={authUser}
          profileState={profileState}
          activeProfileTab={activeProfileTab}
          currentUserActivitySummary={currentUserActivitySummary}
          currentProfileFollowingValue={currentProfileFollowingValue}
          currentProfileFollowersValue={currentProfileFollowersValue}
          currentProfilePostsValue={currentProfilePostsValue}
          currentUserProfileTabPosts={currentUserProfileTabPosts}
          currentUserVisiblePosts={currentUserVisiblePosts}
          currentUserAnswers={currentUserAnswers}
          currentUserBestAnswers={currentUserBestAnswers}
          currentUserLikedPosts={currentUserLikedPosts}
          currentUserBookmarkedPosts={currentUserBookmarkedPosts}
          pinnedPostKey={pinnedPostKey}
          expandedBodyIds={expandedBodyIds}
          renderCoachProfileDetails={renderCoachProfileDetails}
          renderPracticeMenu={renderPracticeMenu}
          renderHashtagChips={renderHashtagChips}
          onBack={() => setCurrentScreen("top")}
          onGoToRegister={() => setCurrentScreen("registration-role")}
          onGoToLogin={() => setCurrentScreen("login")}
          onGoToProfileEdit={() => goToScreen("profile-edit")}
          onGoToFollowingFeed={() => goToScreen("following-feed")}
          onChangeProfileTab={setActiveProfileTab}
          onOpenRelationshipList={openRelationshipList}
          onSetBadgeModalState={setBadgeModalState}
          onOpenExternalUrl={requestOpenExternalUrl}
          onOpenPostDetail={openPostDetail}
          onToggleExpandedBody={toggleExpandedBody}
          onTogglePinnedPost={(post) => void togglePinnedPost(post)}
        />
        ) : null}

        {currentScreen === "following-feed" ? (
        <FollowingFeedScreen
          styles={styles}
          authUser={authUser}
          posts={followingFeedPosts}
          expandedBodyIds={expandedBodyIds}
          renderHashtagChips={renderHashtagChips}
          onBack={() => setCurrentScreen("top")}
          onGoToRegister={() => setCurrentScreen("registration-role")}
          onGoToLogin={() => setCurrentScreen("login")}
          onOpenUserProfile={openUserProfile}
          onOpenPostDetail={openPostDetail}
          onToggleExpandedBody={toggleExpandedBody}
          onOpenExternalUrl={requestOpenExternalUrl}
        />
        ) : null}

        {currentScreen === "relationship-list" ? (
        <RelationshipListScreen
          styles={styles}
          title={relationshipListState.title}
          backScreen={relationshipListState.backScreen}
          accounts={relationshipListState.accounts}
          authUserUid={authUserUid}
          currentFollowingUserIds={currentFollowingUserIds}
          onBack={(screen) => setCurrentScreen(screen)}
          onOpenUserProfile={openUserProfile}
          onToggleFollowProfile={(payload) => void toggleFollowProfile(payload)}
        />
        ) : null}

        {currentScreen === "user-profile" ? (
        <UserProfileScreen
          styles={styles}
          authUserUid={authUserUid}
          selectedUserProfile={selectedUserProfile}
          activeProfileTab={activeProfileTab}
          isFollowingSelectedProfile={isFollowingSelectedProfile}
          selectedUserActivitySummary={selectedUserActivitySummary}
          selectedProfileFollowingValue={selectedProfileFollowingValue}
          selectedProfileFollowersValue={selectedProfileFollowersValue}
          selectedProfilePostsValue={selectedProfilePostsValue}
          selectedUserBestAnswerCount={selectedUserBestAnswerCount}
          selectedUserPinnedKey={selectedUserPinnedKey}
          selectedUserVisiblePosts={selectedUserVisiblePosts}
          selectedUserAnswers={selectedUserAnswers}
          selectedUserBestAnswers={selectedUserBestAnswers}
          expandedBodyIds={expandedBodyIds}
          renderCoachProfileDetails={renderCoachProfileDetails}
          renderPracticeMenu={renderPracticeMenu}
          renderHashtagChips={renderHashtagChips}
          onBack={() => setCurrentScreen("top")}
          onToggleFollowProfile={(payload) => void toggleFollowProfile(payload)}
          onOpenRelationshipList={openRelationshipList}
          onSetBadgeModalState={setBadgeModalState}
          onOpenUserActionMenu={openUserActionMenu}
          onChangeProfileTab={setActiveProfileTab}
          onOpenPostDetail={openPostDetail}
          onToggleExpandedBody={toggleExpandedBody}
          onOpenExternalUrl={requestOpenExternalUrl}
        />
        ) : null}

        {currentScreen === "profile-edit" ? (
        <ProfileEditScreen
          styles={styles}
          profileDraft={profileDraft}
          authMessage={authMessage}
          authError={authError}
          onBack={() => setCurrentScreen("mypage")}
          onPickImage={(kind) => void pickImage(kind)}
          onRemoveAvatar={() => setProfileDraft((current: any) => ({ ...current, avatarUrl: "" }))}
          onRemoveCover={() => setProfileDraft((current: any) => ({ ...current, coverUrl: "" }))}
          onUpdateProfileDraft={updateProfileDraft}
          onUpdateProfileAvailability={updateProfileAvailability}
          onUpdateProfileLink={updateProfileLink}
          onAddProfileLink={addProfileLink}
          onToggleProfileSport={toggleProfileSport}
          onSaveProfileEdits={() => void saveProfileEdits()}
          onSetAccountDeleteConfirmStep={setAccountDeleteConfirmStep}
        />
        ) : null}

        {currentScreen === "registration-role" ? (
        <RegistrationRoleScreen styles={styles} onBack={() => setCurrentScreen("top")} onGoToScreen={setCurrentScreen} />
        ) : null}

        {currentScreen === "advisor-registration" ? (
        <AdvisorRegistrationScreen
          styles={styles}
          advisorForm={advisorForm}
          advisorIconUri={advisorIconUri}
          advisorCoverUri={advisorCoverUri}
          authMessage={authMessage}
          authError={authError}
          isSubmitting={isSubmitting}
          getAdvisorFieldKey={getAdvisorFieldKey}
          getAdvisorFieldValue={getAdvisorFieldValue}
          onBack={() => setCurrentScreen("registration-role")}
          onPickImage={(kind) => void pickImage(kind)}
          onRemoveIcon={() => setAdvisorIconUri(null)}
          onRemoveCover={() => setAdvisorCoverUri(null)}
          onUpdateAdvisorForm={updateAdvisorForm}
          onToggleAdvisorSport={toggleAdvisorSport}
          onRegisterAdvisor={() => void registerAdvisor()}
        />
        ) : null}

        {currentScreen === "coach-registration" ? (
        <CoachRegistrationScreen
          styles={styles}
          coachForm={coachForm}
          coachIconUri={coachIconUri}
          coachCoverUri={coachCoverUri}
          coachLinks={coachLinks}
          authMessage={authMessage}
          authError={authError}
          isSubmitting={isSubmitting}
          getCoachFieldKey={getCoachFieldKey}
          getCoachFieldValue={getCoachFieldValue}
          onBack={() => setCurrentScreen("registration-role")}
          onPickImage={(kind) => void pickImage(kind)}
          onRemoveIcon={() => setCoachIconUri(null)}
          onRemoveCover={() => setCoachCoverUri(null)}
          onUpdateCoachForm={updateCoachForm}
          onToggleCoachSport={toggleCoachSport}
          onUpdateCoachLink={updateCoachLink}
          onAddCoachLink={addCoachLink}
          onRegisterCoach={() => void registerCoach()}
        />
        ) : null}

        {currentScreen === "login" ? (
        <LoginScreen
          styles={styles}
          loginForm={loginForm}
          authMessage={authMessage}
          authError={authError}
          isSubmitting={isSubmitting}
          onBack={() => setCurrentScreen("top")}
          onUpdateLoginForm={updateLoginForm}
          onLogin={() => void handleLogin()}
          onGoToForgotPassword={() => goToScreen("forgot-password")}
        />
        ) : null}

        {currentScreen === "forgot-password" ? (
        <ForgotPasswordScreen
          styles={styles}
          email={forgotPasswordEmail}
          authMessage={authMessage}
          authError={authError}
          isSubmitting={isSubmitting}
          onBack={() => setCurrentScreen("login")}
          onChangeEmail={setForgotPasswordEmail}
          onSubmit={() => void handleForgotPassword()}
        />
        ) : null}

        {currentScreen === "contact" ? (
        <ContactScreen
          styles={styles}
          contactForm={contactForm}
          authMessage={authMessage}
          authError={authError}
          isSubmitting={isSubmitting}
          onBack={() => setCurrentScreen("top")}
          onUpdateContactForm={updateContactForm}
          onSubmit={() => void submitContactInquiry()}
        />
        ) : null}

        {currentScreen === "privacy-policy" ? (
        <LegalDocumentScreen
          styles={styles}
          title="プライバシーポリシー"
          description="Komonity における個人情報の取扱い方針です。"
          onBack={() => setCurrentScreen("top")}
          sections={privacyPolicySections}
        />
        ) : null}

        {currentScreen === "terms" ? (
        <LegalDocumentScreen
          styles={styles}
          title="利用規約"
          description="Komonity を利用する際の基本的なルールです。"
          onBack={() => setCurrentScreen("top")}
          sections={termsSections}
        />
        ) : null}
      </View>

      {showBottomNav ? (
        <View style={styles.bottomNav}>
          <BottomNavButton
            label="タイムライン"
            icon={
              <HomeLineIcon
                active={currentScreen === "top"}
                isDarkMode={isDarkMode}
                styles={styles}
              />
            }
            active={currentScreen === "top"}
            styles={styles}
            onPress={() => goToScreen("top")}
          />
          <BottomNavButton
            label="検索"
            icon={
              <SearchLineIcon
                active={currentScreen === "search"}
                isDarkMode={isDarkMode}
                styles={styles}
              />
            }
            active={currentScreen === "search"}
            styles={styles}
            onPress={() => goToScreen("search")}
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="投稿する"
            style={styles.bottomComposeButton}
            onPress={() => goToScreen("post-compose")}
          >
            <Text style={styles.bottomComposeIcon}>✎</Text>
            <Text style={styles.bottomComposeLabel}>投稿する</Text>
          </Pressable>
          <BottomNavButton
            label="通知"
            icon={
              <BellLineIcon
                active={currentScreen === "notifications"}
                isDarkMode={isDarkMode}
                styles={styles}
              />
            }
            active={currentScreen === "notifications"}
            showDot={notificationItems.length > 0}
            styles={styles}
            onPress={() => goToScreen("notifications")}
          />
          <BottomNavButton
            label="マイページ"
            icon={
              <UserLineIcon
                active={currentScreen === "mypage"}
                isDarkMode={isDarkMode}
                styles={styles}
              />
            }
            active={currentScreen === "mypage" && activeProfileTab !== "bookmarks"}
            styles={styles}
            onPress={() => goToScreen("mypage")}
          />
        </View>
      ) : null}

      {isMenuOpen ? (
        <SideMenu
          styles={styles}
          authUser={authUser}
          onClose={() => setIsMenuOpen(false)}
          onGoToScreen={goToScreen}
          onLogout={() => {
            setIsMenuOpen(false);
            void handleLogout();
          }}
        />
      ) : null}

      <UserActionMenuModal
        styles={styles}
        state={userActionMenuState}
        spamReason={spamReasonDraft}
        currentPostAlertUserIds={currentPostAlertUserIds}
        currentBlockedUserIds={currentBlockedUserIds}
        onChangeSpamReason={setSpamReasonDraft}
        onClose={closeUserActionMenu}
        onTogglePostAlert={(targetUid, targetName) => {
          if (!targetUid) return;
          void togglePostAlertsForUser({ targetUid, targetName: targetName ?? "" });
        }}
        onToggleBlock={(targetUid, targetName) => {
          if (!targetUid) return;
          void toggleBlockUser({ targetUid, targetName: targetName ?? "" });
        }}
        onReportSpam={(targetUid, targetName, reason) => {
          if (!targetUid) return;
          void reportUserAsSpam({
            targetUid,
            targetName: targetName ?? "",
            reason: reason ?? "",
          });
        }}
      />
    </SafeAreaView>
  );
}
