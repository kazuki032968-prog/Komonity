import { StatusBar } from "expo-status-bar";
import type { ReactNode } from "react";
import { Pressable, SafeAreaView, Text, View } from "react-native";

import { AppModals } from "../components/modals/AppModals";
import { SideMenu } from "../components/navigation/SideMenu";
import { UserActionMenuModal } from "../components/profile/UserActionMenuModal";
import { KomonityLogo } from "../components/shared";
import { SUPPORT_EMAIL_ADDRESS } from "../constants/app";
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
import { FeedScreen } from "../screens/FeedScreen";
import { LegalDocumentScreen } from "../screens/LegalDocumentScreen";
import { MyPageScreen } from "../screens/MyPageScreen";
import { PostComposeScreen } from "../screens/PostComposeScreen";
import { PostDetailScreen } from "../screens/PostDetailScreen";
import { ProfileEditScreen } from "../screens/ProfileEditScreen";
import { ReplyDetailScreen } from "../screens/ReplyDetailScreen";
import { SearchScreen } from "../screens/SearchScreen";
import { ServiceDetailScreen } from "../screens/ServiceDetailScreen";
import { TimelineScreen } from "../screens/TimelineScreen";
import { UserProfileScreen } from "../screens/UserProfileScreen";
import type { ScreenKey } from "../types/app";

type AppRouterProps = {
  styles: Record<string, any>;
  currentScreen: ScreenKey;
  isMenuOpen: boolean;
  setIsMenuOpen: (value: boolean | ((current: boolean) => boolean)) => void;
  goToScreen: (screen: ScreenKey, mode?: "push" | "replace") => void;
  setCurrentScreen: (screen: ScreenKey) => void;
  [key: string]: any;
};

type LineIconProps = {
  active?: boolean;
  styles: Record<string, any>;
};

const getLineIconColor = (active?: boolean) =>
  active ? "#0f766e" : "#4b5563";

function HomeLineIcon({ active, styles }: LineIconProps) {
  const color = getLineIconColor(active);

  return (
    <View style={styles.lineIconBox}>
      <View style={[styles.homeIconRoof, { borderColor: color }]} />
      <View style={[styles.homeIconBase, { borderColor: color }]} />
    </View>
  );
}

function SearchLineIcon({ active, styles }: LineIconProps) {
  const color = getLineIconColor(active);

  return (
    <View style={styles.lineIconBox}>
      <View style={[styles.searchIconCircle, { borderColor: color }]} />
      <View style={[styles.searchIconHandle, { backgroundColor: color }]} />
    </View>
  );
}

function BellLineIcon({ active, styles }: LineIconProps) {
  const color = getLineIconColor(active);

  return (
    <View style={styles.lineIconBox}>
      <View style={[styles.bellIconBody, { borderColor: color }]} />
      <View style={[styles.bellIconClapper, { backgroundColor: color }]} />
    </View>
  );
}

function UserLineIcon({ active, styles }: LineIconProps) {
  const color = getLineIconColor(active);

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

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
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
          sections={[
            {
              title: "1. 取得する情報",
              body: "アカウント登録時のメールアドレス、表示名、プロフィール情報、投稿内容、返信内容、通報やお問い合わせ内容など、サービス提供に必要な情報を取得します。",
            },
            {
              title: "2. 利用目的",
              body: "アカウント管理、投稿機能の提供、本人確認や不正利用対策、お問い合わせ対応、重要なお知らせの通知のために利用します。",
            },
            {
              title: "3. 第三者提供",
              body: "法令に基づく場合を除き、本人の同意なく第三者へ個人情報を提供しません。公開プロフィールとして登録された情報は、サービス利用者から閲覧できる場合があります。",
            },
            {
              title: "4. 安全管理",
              body: "アクセス制御やルール設定など、個人情報の漏えい・改ざん・不正アクセスを防ぐために必要な措置を講じます。",
            },
            {
              title: "5. お問い合わせ",
              body: `個人情報に関するお問い合わせは、${SUPPORT_EMAIL_ADDRESS} またはアプリ内のお問い合わせ画面からご連絡ください。`,
            },
          ]}
        />
        ) : null}

        {currentScreen === "terms" ? (
        <LegalDocumentScreen
          styles={styles}
          title="利用規約"
          description="Komonity を利用する際の基本的なルールです。"
          onBack={() => setCurrentScreen("top")}
          sections={[
            { title: "1. 適用", body: "本規約は、Komonity の利用に関する一切の関係に適用されます。" },
            {
              title: "2. 禁止事項",
              body: "法令違反、公序良俗に反する行為、なりすまし、著作権や肖像権を侵害する投稿、個人情報の不適切な公開、スパム行為を禁止します。",
            },
            {
              title: "3. 投稿内容",
              body: "投稿内容の責任は投稿者にあります。運営は必要に応じて投稿の削除、アカウント制限、通報対応を行うことがあります。",
            },
            {
              title: "4. 外部リンク",
              body: "外部サイトへのリンクは利用者自身の判断でご利用ください。リンク先の内容や安全性について運営は責任を負いません。",
            },
            {
              title: "5. 免責",
              body: "サービスの完全性、継続性、特定目的への適合性を保証するものではありません。",
            },
          ]}
        />
        ) : null}
      </View>

      {showBottomNav ? (
        <View style={styles.bottomNav}>
          <BottomNavButton
            label="タイムライン"
            icon={<HomeLineIcon active={currentScreen === "top"} styles={styles} />}
            active={currentScreen === "top"}
            styles={styles}
            onPress={() => goToScreen("top")}
          />
          <BottomNavButton
            label="検索"
            icon={<SearchLineIcon active={currentScreen === "search"} styles={styles} />}
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
