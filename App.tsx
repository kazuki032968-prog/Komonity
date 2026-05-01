import * as ImagePicker from "expo-image-picker";
import { useEffect, useRef, useState } from "react";
import {
  Linking,
  Platform,
  Pressable,
  Text,
  View,
} from "react-native";
import {
  createUserWithEmailAndPassword,
  deleteUser,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from "firebase/auth";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";

import { auth, db, hasFirebaseConfig as hasAuthConfig, storage } from "./src/lib/firebase";
import {
  COLLECTIONS,
  defaultProfileState,
  IMAGE_FILE_SIZE_LIMIT_BYTES,
  initialAdvisorForm,
  initialCommunityItems,
  initialCoachForm,
  initialComposeState,
  initialContactForm,
  initialFeedPosts,
  initialLoginForm,
  initialPostDetailState,
  initialQuestions,
  initialReplyDetailState,
  initialRelationshipListState,
  initialSelectedUserProfile,
  INITIAL_BADGE_MODAL_STATE,
  INITIAL_EXTERNAL_LINK_MODAL_STATE,
  INITIAL_SELECTION,
  INITIAL_USER_ACTION_MENU_STATE,
  POST_BODY_MAX_LENGTH,
  POST_TITLE_MAX_LENGTH,
  RECENT_LOGIN_MAX_AGE_MS,
  REPLY_BODY_MAX_LENGTH,
  staticScreenPathMap,
  timelineSectionPathMap,
  timelineSections,
} from "./src/constants/app";
import {
  mockCommunityPosts,
  mockDirectoryAccounts,
  mockDirectoryMetaMap,
  mockFeedPosts,
  mockQuestionPosts,
} from "./src/constants/mockData";
import { useTimelineSwipe } from "./src/hooks/useTimelineSwipe";
import { useWebSeo } from "./src/hooks/useWebSeo";
import {
  appendReplyToPath,
  buildCommunityDetail,
  buildDetailStateFromSearchItem,
  buildFeedDetail,
  buildInteractionRecord,
  buildQuestionDetail,
  buildReplyInteractionPostId,
  findReplyByPath,
  flattenReplyItems,
  getBestAnswerReplyForQuestion,
  getPostCollectionFromSource,
  getSourceLabel,
  mergeProfilePostItems,
} from "./src/services/postService";
import {
  getRoleLabel,
  mapUserDocumentToProfileState,
} from "./src/services/profileService";
import {
  normalizeMedia,
  normalizePracticeMenu,
  normalizeReplies,
  toArrayOfStrings,
  serializePracticeMenuForFirestore,
  serializeRepliesForFirestore,
} from "./src/services/serializers";
import { resolveScreenPath } from "./src/navigation/routes";
import { buildSeoMeta } from "./src/navigation/seo";
import { AppRouter } from "./src/navigation/AppRouter";
import { PracticeMenuCard } from "./src/components/practice/PracticeMenuCard";
import { CoachProfileDetails } from "./src/components/profile/CoachProfileDetails";
import { styles } from "./src/styles/appStyles";
import {
  collectReplyMediaUrls,
  deleteOwnedPostsAndMedia as deleteOwnedPostsAndMediaFromFirestore,
} from "./src/services/firebase/accountCleanupService";
import {
  deleteStorageFileByUrl as deleteStorageFileByUrlFromStorage,
  deleteStorageFilesQuietly as deleteStorageFilesQuietlyFromStorage,
  uploadMediaAssets as uploadMediaAssetsToStorage,
  uploadProfileMedia as uploadProfileMediaToStorage,
} from "./src/services/firebase/storageService";
import {
  queueSupportEmail as queueSupportEmailInFirestore,
  saveProfileDocument as saveProfileDocumentInFirestore,
} from "./src/services/firebase/userService";
import type {
  AccountDeleteConfirmStep,
  ActivityBadge,
  AdvisorFormState,
  BadgeModalState,
  BlockRecord,
  CoachFormState,
  CommunityPost,
  ComposeState,
  ContactFormState,
  ExternalLink,
  ExternalLinkModalState,
  FeedPost,
  FollowRecord,
  InteractionRecord,
  LocalMediaAsset,
  LoginFormState,
  MediaKind,
  NotificationItem,
  PostAlertRecord,
  PostDetailState,
  PracticeMenuTemplate,
  ProfileTabKey,
  ProfileAnswerItem,
  ProfilePostItem,
  ProfileState,
  QuestionPost,
  RelationshipListState,
  Reply,
  ReplyDetailState,
  RichFormatAction,
  ScreenKey,
  SearchAccountItem,
  SearchContentFilterKey,
  SearchContentItem,
  SearchTabKey,
  TextSelectionRange,
  TodayMenuConditionKey,
  TimelineSectionKey,
  TrendingCoachItem,
  UserActionMenuState,
  UserActivitySummary,
  UserDirectoryMeta,
  UserProfileState,
} from "./src/types/app";
import {
  applyRichFormatting,
  buildProfilePath,
  buildProfileUrl,
  buildReplyPath,
  buildSearchPath,
  buildUrlPreviewLabel,
  countRepliesRecursively,
  createCoverToneFromName,
  createHandleFromName,
  createLinkRow,
  formatCount,
  formatFileSizeLabel,
  getAccountSearchScore,
  getAdvisorFieldKey,
  getAdvisorFieldValue,
  getCoachFieldKey,
  getCoachFieldValue,
  getDaysSinceTimestamp,
  getHandleSlug,
  getMediaSizeLimit,
  getPostingStreakDays,
  getProfileCompletionScore,
  getPublicSiteUrl,
  getTrendingCoachScore,
  getTrendingScore,
  isPublishedAtOrBeforeNow,
  mergeItemsById,
  normalizeHandle,
  parseFollowerCount,
  parseWebRoute,
  replyMatchesProfile,
  toTimestampMs,
  toAuthErrorMessage,
  toSaveErrorMessage,
  userMatchesProfile,
  createTieredBadge,
  buildPostPath,
} from "./src/utils/appUtils";

export default function App() {
  const isHandlingBrowserNavigation = useRef(false);
  const [currentScreen, setCurrentScreen] = useState<ScreenKey>("top");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [advisorIconUri, setAdvisorIconUri] = useState<string | null>(null);
  const [advisorCoverUri, setAdvisorCoverUri] = useState<string | null>(null);
  const [coachIconUri, setCoachIconUri] = useState<string | null>(null);
  const [coachCoverUri, setCoachCoverUri] = useState<string | null>(null);
  const [coachLinks, setCoachLinks] = useState<ExternalLink[]>([
    createLinkRow(1),
  ]);
  const [advisorForm, setAdvisorForm] =
    useState<AdvisorFormState>(initialAdvisorForm);
  const [coachForm, setCoachForm] = useState<CoachFormState>(initialCoachForm);
  const [loginForm, setLoginForm] = useState<LoginFormState>(initialLoginForm);
  const [contactForm, setContactForm] = useState<ContactFormState>(initialContactForm);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [spamReasonDraft, setSpamReasonDraft] = useState("");
  const [profileState, setProfileState] = useState<ProfileState>(defaultProfileState);
  const [profileDraft, setProfileDraft] = useState<ProfileState>(defaultProfileState);
  const [selectedUserProfile, setSelectedUserProfile] =
    useState<UserProfileState>(initialSelectedUserProfile);
  const [relationshipListState, setRelationshipListState] =
    useState<RelationshipListState>(initialRelationshipListState);
  const [postDetail, setPostDetail] = useState<PostDetailState>(initialPostDetailState);
  const [postDetailBackScreen, setPostDetailBackScreen] =
    useState<ScreenKey>("feed");
  const [replyDetail, setReplyDetail] = useState<ReplyDetailState>(initialReplyDetailState);
  const [replyDraft, setReplyDraft] = useState("");
  const [replyMedia, setReplyMedia] = useState<LocalMediaAsset[]>([]);
  const [replySelection, setReplySelection] = useState<TextSelectionRange>(INITIAL_SELECTION);
  const [bestAnswerCandidate, setBestAnswerCandidate] = useState<Reply | null>(null);
  const [badgeModalState, setBadgeModalState] =
    useState<BadgeModalState>(INITIAL_BADGE_MODAL_STATE);
  const [externalLinkModalState, setExternalLinkModalState] =
    useState<ExternalLinkModalState>(INITIAL_EXTERNAL_LINK_MODAL_STATE);
  const [userActionMenuState, setUserActionMenuState] =
    useState<UserActionMenuState>(INITIAL_USER_ACTION_MENU_STATE);
  const [accountDeleteConfirmStep, setAccountDeleteConfirmStep] =
    useState<AccountDeleteConfirmStep>("idle");
  const [directoryAccounts, setDirectoryAccounts] =
    useState<SearchAccountItem[]>(mockDirectoryAccounts);
  const [directoryMetaMap, setDirectoryMetaMap] =
    useState<Record<string, UserDirectoryMeta>>(mockDirectoryMetaMap);
  const [followRecords, setFollowRecords] = useState<FollowRecord[]>([]);
  const [blockRecords, setBlockRecords] = useState<BlockRecord[]>([]);
  const [postAlertRecords, setPostAlertRecords] = useState<PostAlertRecord[]>([]);
  const [likeRecords, setLikeRecords] = useState<InteractionRecord[]>([]);
  const [repostRecords, setRepostRecords] = useState<InteractionRecord[]>([]);
  const [bookmarkRecords, setBookmarkRecords] = useState<InteractionRecord[]>([]);
  const [feedTimeline, setFeedTimeline] = useState<FeedPost[]>(
    mergeItemsById(mockFeedPosts, initialFeedPosts)
  );
  const [questionBoard, setQuestionBoard] = useState<QuestionPost[]>(
    mergeItemsById(mockQuestionPosts, initialQuestions)
  );
  const [communityBoard, setCommunityBoard] =
    useState<CommunityPost[]>(mergeItemsById(mockCommunityPosts, initialCommunityItems));
  const [composeState, setComposeState] = useState<ComposeState>(initialComposeState);
  const [composeMedia, setComposeMedia] = useState<LocalMediaAsset[]>([]);
  const [composeBodySelection, setComposeBodySelection] =
    useState<TextSelectionRange>(INITIAL_SELECTION);
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSearchTab, setActiveSearchTab] =
    useState<SearchTabKey>("trending-posts");
  const [activeSearchContentFilter, setActiveSearchContentFilter] =
    useState<SearchContentFilterKey>("all");
  const [todayMenuConditions, setTodayMenuConditions] = useState<
    TodayMenuConditionKey[]
  >([]);
  const [activeTimelineSection, setActiveTimelineSection] =
    useState<TimelineSectionKey>("all");
  const [activeProfileTab, setActiveProfileTab] = useState<ProfileTabKey>("posts");
  const [authMessage, setAuthMessage] = useState("");
  const [authError, setAuthError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isReplySubmitting, setIsReplySubmitting] = useState(false);
  const [expandedBodyIds, setExpandedBodyIds] = useState<string[]>([]);
  const [pinnedPostKey, setPinnedPostKey] = useState<string | null>(null);
  const [pendingWebRoute, setPendingWebRoute] = useState<string | null>(
    Platform.OS === "web" && typeof window !== "undefined"
      ? `${window.location.pathname}${window.location.search}`
      : null
  );

  useEffect(() => {
    if (!auth) {
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAuthUser(user);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!authUser || !db) {
      if (!authUser) {
        setProfileState(defaultProfileState);
        setProfileDraft(defaultProfileState);
      }
      return;
    }

    const unsubscribeUser = onSnapshot(
      doc(db, "users", authUser.uid),
      (snapshot) => {
        if (!snapshot.exists()) {
          return;
        }

        const data = snapshot.data();
        const nextProfile = mapUserDocumentToProfileState(data);
        setProfileState(nextProfile);
        setProfileDraft(nextProfile);
        const profile =
          typeof data.profile === "object" && data.profile ? data.profile : {};
        const profileData = profile as Record<string, unknown>;
        if (
          typeof profileData.pinnedPostId === "string" &&
          (profileData.pinnedPostSource === "feed" ||
            profileData.pinnedPostSource === "questions" ||
            profileData.pinnedPostSource === "community")
        ) {
          setPinnedPostKey(`${profileData.pinnedPostSource}:${profileData.pinnedPostId}`);
        } else {
          setPinnedPostKey(null);
        }
      },
      (error) => {
        setAuthError(
          `プロフィール読込に失敗しました。${toSaveErrorMessage(error)}`
        );
      }
    );

    return unsubscribeUser;
  }, [authUser, db]);

  useEffect(() => {
    if (!db) {
      setDirectoryAccounts(mockDirectoryAccounts);
      setDirectoryMetaMap(mockDirectoryMetaMap);
      return;
    }

    const unsubscribeUsers = onSnapshot(
      collection(db, "users"),
      (snapshot) => {
        const nextMetaMap: Record<string, UserDirectoryMeta> = {};
        const firestoreAccounts: SearchAccountItem[] = snapshot.docs.map((entry) => {
          const data = entry.data();
          const profile =
            typeof data.profile === "object" && data.profile ? data.profile : {};
          const profileData = profile as Record<string, unknown>;
          const name =
            typeof profileData.nickname === "string" && profileData.nickname
              ? profileData.nickname
              : "Komonityユーザー";
          const externalLinks = Array.isArray(profileData.externalLinks)
            ? profileData.externalLinks
                .map((item, index) => {
                  if (typeof item !== "object" || item === null) {
                    return null;
                  }
                  const link = item as { label?: unknown; url?: unknown };
                  return {
                    id: `link-${index + 1}`,
                    label: typeof link.label === "string" ? link.label : "",
                    url: typeof link.url === "string" ? link.url : "",
                  };
                })
                .filter((item): item is ExternalLink => Boolean(item))
            : [];

          nextMetaMap[entry.id] = {
            externalLinks,
            iconUrl:
              typeof profileData.iconUrl === "string" ? profileData.iconUrl : undefined,
            coverUrl:
              typeof profileData.coverUrl === "string"
                ? profileData.coverUrl
                : undefined,
            pinnedPostId:
              typeof profileData.pinnedPostId === "string"
                ? profileData.pinnedPostId
                : undefined,
            pinnedPostSource:
              profileData.pinnedPostSource === "feed" ||
              profileData.pinnedPostSource === "questions" ||
              profileData.pinnedPostSource === "community"
                ? profileData.pinnedPostSource
                : undefined,
          };

          return {
            id: entry.id,
            name,
            handle:
              typeof profileData.handle === "string" && profileData.handle
                ? profileData.handle
                : createHandleFromName(name),
            bio:
              typeof profileData.bio === "string" && profileData.bio
                ? profileData.bio
                : typeof profileData.achievements === "string" &&
                    profileData.achievements
                  ? profileData.achievements
                  : typeof profileData.club === "string" && profileData.club
                    ? `${profileData.club} を中心に活動しています。`
                    : "Komonity で活動中です。",
            avatarUrl:
              typeof profileData.iconUrl === "string" ? profileData.iconUrl : undefined,
            coverUrl:
              typeof profileData.coverUrl === "string"
                ? profileData.coverUrl
                : undefined,
            followers:
              typeof profileData.followers === "string" && profileData.followers
                ? profileData.followers
                : "0",
            featured: false,
            role: getRoleLabel(
              typeof data.roleLabel === "string"
                ? data.roleLabel
                : String(data.role ?? "")
            ),
            selectedSports: toArrayOfStrings(profileData.selectedSports),
            strengths:
              typeof profileData.strengths === "string" ? profileData.strengths : "",
            supportTopics:
              typeof profileData.supportTopics === "string"
                ? profileData.supportTopics
                : "",
            certifications:
              typeof profileData.certifications === "string"
                ? profileData.certifications
                : "",
            organization:
              typeof profileData.organization === "string"
                ? profileData.organization
                : "",
            youtubeUrl:
              typeof profileData.youtubeUrl === "string" ? profileData.youtubeUrl : "",
            xUrl: typeof profileData.xUrl === "string" ? profileData.xUrl : "",
            instagramUrl:
              typeof profileData.instagramUrl === "string"
                ? profileData.instagramUrl
                : "",
            consultationAvailable: profileData.consultationAvailable === true,
            paidConsultationAvailable: profileData.paidConsultationAvailable === true,
          };
        });

        const mergedAccounts = new Map<string, SearchAccountItem>();
        mockDirectoryAccounts.forEach((account) => {
          mergedAccounts.set(account.id, account);
        });
        firestoreAccounts.forEach((account) => {
          mergedAccounts.set(account.id, account);
        });

        setDirectoryAccounts(Array.from(mergedAccounts.values()));
        setDirectoryMetaMap({
          ...mockDirectoryMetaMap,
          ...nextMetaMap,
        });
      },
      (error) => {
        setDirectoryAccounts(mockDirectoryAccounts);
        setDirectoryMetaMap(mockDirectoryMetaMap);
        setAuthError(
          `公開プロフィールの読込に失敗しました。${toSaveErrorMessage(error)}`
        );
      }
    );

    return unsubscribeUsers;
  }, [db]);

  useEffect(() => {
    if (!db || !authUser) {
      setFollowRecords([]);
      return;
    }

    const unsubscribeFollows = onSnapshot(
      collection(db, COLLECTIONS.follows),
      (snapshot) => {
        const nextFollows: FollowRecord[] = snapshot.docs
          .map((entry) => {
            const data = entry.data();
            if (
              typeof data.followerUid !== "string" ||
              typeof data.followingUid !== "string"
            ) {
              return null;
            }

            return {
              id: entry.id,
              followerUid: data.followerUid,
              followingUid: data.followingUid,
            };
          })
          .filter((item): item is FollowRecord => Boolean(item));

        setFollowRecords(nextFollows);
      },
      () => {
        setFollowRecords([]);
      }
    );

    return unsubscribeFollows;
  }, [authUser, db]);

  useEffect(() => {
    if (!db || !authUser) {
      setBlockRecords([]);
      setPostAlertRecords([]);
      return;
    }

    const unsubscribeBlocks = onSnapshot(
      collection(db, COLLECTIONS.blocks),
      (snapshot) => {
        const nextBlocks = snapshot.docs.reduce<BlockRecord[]>((accumulator, entry) => {
          const data = entry.data();
          if (
            typeof data.blockerUid !== "string" ||
            typeof data.blockedUid !== "string"
          ) {
            return accumulator;
          }

          accumulator.push({
            id: entry.id,
            blockerUid: data.blockerUid,
            blockedUid: data.blockedUid,
          });
          return accumulator;
        }, []);

        setBlockRecords(nextBlocks);
      },
      () => {
        setBlockRecords([]);
      }
    );

    const unsubscribeAlerts = onSnapshot(
      collection(db, COLLECTIONS.alerts),
      (snapshot) => {
        const nextAlerts = snapshot.docs.reduce<PostAlertRecord[]>((accumulator, entry) => {
          const data = entry.data();
          if (
            typeof data.watcherUid !== "string" ||
            typeof data.targetUid !== "string"
          ) {
            return accumulator;
          }

          accumulator.push({
            id: entry.id,
            watcherUid: data.watcherUid,
            targetUid: data.targetUid,
          });
          return accumulator;
        }, []);

        setPostAlertRecords(nextAlerts);
      },
      () => {
        setPostAlertRecords([]);
      }
    );

    return () => {
      unsubscribeBlocks();
      unsubscribeAlerts();
    };
  }, [authUser, db]);

  useEffect(() => {
    if (!db) {
      setLikeRecords([]);
      setRepostRecords([]);
      if (!authUser) {
        setBookmarkRecords([]);
      }
      return;
    }

    const unsubscribeLikes = onSnapshot(
      collection(db, COLLECTIONS.likes),
      (snapshot) => {
        const nextRecords = snapshot.docs.reduce<InteractionRecord[]>((accumulator, entry) => {
            const data = entry.data();
            if (
              typeof data.userUid !== "string" ||
              typeof data.postId !== "string" ||
              (data.source !== "feed" &&
                data.source !== "questions" &&
                data.source !== "community")
            ) {
              return accumulator;
            }

            accumulator.push({
              id: entry.id,
              userUid: data.userUid,
              postId: data.postId,
              source: data.source,
              createdAtMs: toTimestampMs(data.createdAt),
            });

            return accumulator;
          }, []);

        setLikeRecords(nextRecords);
      },
      () => {
        setLikeRecords([]);
      }
    );

    const unsubscribeReposts = onSnapshot(
      collection(db, COLLECTIONS.reposts),
      (snapshot) => {
        const nextRecords = snapshot.docs.reduce<InteractionRecord[]>((accumulator, entry) => {
            const data = entry.data();
            if (
              typeof data.userUid !== "string" ||
              typeof data.postId !== "string" ||
              (data.source !== "feed" &&
                data.source !== "questions" &&
                data.source !== "community")
            ) {
              return accumulator;
            }

            accumulator.push({
              id: entry.id,
              userUid: data.userUid,
              postId: data.postId,
              source: data.source,
              createdAtMs: toTimestampMs(data.createdAt),
            });

            return accumulator;
          }, []);

        setRepostRecords(nextRecords);
      },
      () => {
        setRepostRecords([]);
      }
    );

    const unsubscribeBookmarks = authUser
      ? onSnapshot(
          collection(db, COLLECTIONS.bookmarks),
          (snapshot) => {
            const nextRecords = snapshot.docs.reduce<InteractionRecord[]>(
              (accumulator, entry) => {
                const data = entry.data();
                if (
                  typeof data.userUid !== "string" ||
                  data.userUid !== authUser.uid ||
                  typeof data.postId !== "string" ||
                  (data.source !== "feed" &&
                    data.source !== "questions" &&
                    data.source !== "community")
                ) {
                  return accumulator;
                }

                accumulator.push({
                  id: entry.id,
                  userUid: data.userUid,
                  postId: data.postId,
                  source: data.source,
                  createdAtMs: toTimestampMs(data.createdAt),
                });

                return accumulator;
              },
              []
            );

            setBookmarkRecords(nextRecords);
          },
          () => {
            setBookmarkRecords([]);
          }
        )
      : () => {
          setBookmarkRecords([]);
        };

    return () => {
      unsubscribeLikes();
      unsubscribeReposts();
      unsubscribeBookmarks();
    };
  }, [authUser, db]);

  useEffect(() => {
    if (!db) {
      setFeedTimeline(mergeItemsById(mockFeedPosts, initialFeedPosts));
      setQuestionBoard(mergeItemsById(mockQuestionPosts, initialQuestions));
      setCommunityBoard(mergeItemsById(mockCommunityPosts, initialCommunityItems));
      return;
    }

    const feedQuery = query(
      collection(db, COLLECTIONS.feed),
      orderBy("createdAt", "desc")
    );
    const questionQuery = query(
      collection(db, COLLECTIONS.questions),
      orderBy("createdAt", "desc")
    );
    const communityQuery = query(
      collection(db, COLLECTIONS.community),
      orderBy("createdAt", "desc")
    );

    const unsubscribeFeed = onSnapshot(feedQuery, (snapshot) => {
      const firestorePosts: FeedPost[] = snapshot.docs.flatMap((entry) => {
        const data = entry.data();
        if (data.isDeleted === true) {
          return [];
        }

        return [{
          id: entry.id,
          author:
            typeof data.author === "string" ? data.author : "Komonityユーザー",
          authorHandle:
            typeof data.authorHandle === "string" ? data.authorHandle : undefined,
          createdByUid:
            typeof data.createdByUid === "string" ? data.createdByUid : undefined,
          role:
            typeof data.role === "string" ? data.role : "一般アカウント",
          title: typeof data.title === "string" ? data.title : "",
          body: typeof data.body === "string" ? data.body : "",
          tags: toArrayOfStrings(data.tags),
          sports: toArrayOfStrings(data.sports),
          likes: typeof data.likes === "number" ? data.likes : 0,
          reposts: typeof data.reposts === "number" ? data.reposts : 0,
          comments: typeof data.comments === "number" ? data.comments : 0,
          replies: normalizeReplies(data.replies),
          media: normalizeMedia(data.media),
          practiceMenu: normalizePracticeMenu(data.practiceMenu),
          createdAtMs: toTimestampMs(data.createdAt),
          isDeleted: data.isDeleted === true,
        }];
      });

      setFeedTimeline(mergeItemsById(mockFeedPosts, firestorePosts));
    });

    const unsubscribeQuestions = onSnapshot(questionQuery, (snapshot) => {
      const firestoreQuestions: QuestionPost[] = snapshot.docs.flatMap((entry) => {
        const data = entry.data();
        if (data.isDeleted === true) {
          return [];
        }

        return [{
          id: entry.id,
          category:
            typeof data.category === "string" ? data.category : "その他",
          authorHandle:
            typeof data.authorHandle === "string" ? data.authorHandle : undefined,
          createdByUid:
            typeof data.createdByUid === "string" ? data.createdByUid : undefined,
          title: typeof data.title === "string" ? data.title : "",
          body: typeof data.body === "string" ? data.body : "",
          author:
            typeof data.author === "string" ? data.author : "Komonityユーザー",
          answers: typeof data.answers === "number" ? data.answers : 0,
          bestAnswer:
            typeof data.bestAnswer === "string"
              ? data.bestAnswer
              : "まだベストアンサーはありません。",
          bestAnswerReplyId:
            typeof data.bestAnswerReplyId === "string"
              ? data.bestAnswerReplyId
              : undefined,
          replies: normalizeReplies(data.replies),
          media: normalizeMedia(data.media),
          createdAtMs: toTimestampMs(data.createdAt),
          isDeleted: data.isDeleted === true,
        }];
      });

      setQuestionBoard(mergeItemsById(mockQuestionPosts, firestoreQuestions));
    });

    const unsubscribeCommunity = onSnapshot(communityQuery, (snapshot) => {
      const firestoreCommunities: CommunityPost[] = snapshot.docs.flatMap((entry) => {
        const data = entry.data();
        if (data.isDeleted === true) {
          return [];
        }

        return [{
          id: entry.id,
          title: typeof data.title === "string" ? data.title : "",
          author:
            typeof data.author === "string" ? data.author : "Komonityユーザー",
          authorHandle:
            typeof data.authorHandle === "string" ? data.authorHandle : undefined,
          createdByUid:
            typeof data.createdByUid === "string" ? data.createdByUid : undefined,
          body: typeof data.body === "string" ? data.body : "",
          cta: typeof data.cta === "string" ? data.cta : "スレッドを見る",
          replies: normalizeReplies(data.replies),
          media: normalizeMedia(data.media),
          createdAtMs: toTimestampMs(data.createdAt),
          isDeleted: data.isDeleted === true,
        }];
      });

      setCommunityBoard(mergeItemsById(mockCommunityPosts, firestoreCommunities));
    });

    return () => {
      unsubscribeFeed();
      unsubscribeQuestions();
      unsubscribeCommunity();
    };
  }, []);

  const clearAuthFeedback = () => {
    setAuthError("");
    setAuthMessage("");
  };

  const currentSeoMeta = buildSeoMeta({
    currentScreen,
    activeTimelineSection,
    searchQuery,
    profileState,
    selectedUserProfile,
    postDetail,
    replyDetail,
    pathname:
      Platform.OS === "web" && typeof window !== "undefined"
        ? `${window.location.pathname}${window.location.search}`
        : "/",
  });

  useWebSeo(currentSeoMeta);

  const updateBrowserPath = ({
    path,
    mode = "push",
  }: {
    path: string;
    mode?: "push" | "replace";
  }) => {
    if (
      Platform.OS !== "web" ||
      typeof window === "undefined" ||
      isHandlingBrowserNavigation.current
    ) {
      return;
    }

    const currentPath = `${window.location.pathname}${window.location.search}`;
    if (currentPath === path) {
      return;
    }

    if (mode === "replace") {
      window.history.replaceState({}, "", path);
      return;
    }

    window.history.pushState({}, "", path);
  };

  const openTimelineSection = (
    section: TimelineSectionKey,
    mode: "push" | "replace" = "push"
  ) => {
    setActiveTimelineSection(section);
    setCurrentScreen("top");
    setIsMenuOpen(false);
    updateBrowserPath({ path: timelineSectionPathMap[section], mode });
  };

  const goToScreen = (screen: ScreenKey, mode: "push" | "replace" = "push") => {
    if (screen === "top") {
      openTimelineSection("all", mode);
      return;
    }
    if (screen === "feed") {
      openTimelineSection("feed", mode);
      return;
    }
    if (screen === "questions") {
      openTimelineSection("questions", mode);
      return;
    }
    if (screen === "community") {
      openTimelineSection("community", mode);
      return;
    }
    if (screen === "following-feed") {
      openTimelineSection("following", mode);
      return;
    }
    if (screen === "profile-edit") {
      setProfileDraft(profileState);
    }
    if (screen === "post-compose") {
      setComposeState({
        ...initialComposeState,
        target: profileState.role.includes("指導員") ? "feed" : "questions",
      });
      setComposeMedia([]);
      setComposeBodySelection(INITIAL_SELECTION);
    }
    if (screen === "contact") {
      setContactForm((current) => ({
        ...current,
        email: authUser?.email ?? current.email,
      }));
    }
    setCurrentScreen(screen);
    setIsMenuOpen(false);
    updateBrowserPath({ path: staticScreenPathMap[screen] ?? "/", mode });
  };

  const openSearchWithQuery = (
    query: string,
    mode: "push" | "replace" = "push"
  ) => {
    setSearchQuery(query);
    setActiveSearchTab("trending-posts");
    setActiveSearchContentFilter("all");
    setCurrentScreen("search");
    setIsMenuOpen(false);
    updateBrowserPath({ path: buildSearchPath(query), mode });
  };

  const renderHashtagChips = (tags: string[]) => {
    if (tags.length === 0) {
      return null;
    }

    return (
      <View style={styles.tagRow}>
        {tags.map((tag) => (
          <Pressable
            key={tag}
            style={styles.tag}
            onPress={() => openSearchWithQuery(tag)}
          >
            <Text style={styles.tagText}>#{tag}</Text>
          </Pressable>
        ))}
      </View>
    );
  };

  const renderPracticeMenu = (
    menu?: PracticeMenuTemplate,
    variant: "summary" | "detail" = "summary"
  ) => <PracticeMenuCard menu={menu} variant={variant} styles={styles} />;

  const renderCoachProfileDetails = (profile: ProfileState) => (
    <CoachProfileDetails
      profile={profile}
      styles={styles}
      onOpenUrl={requestOpenExternalUrl}
    />
  );

  const completeAuthSuccess = (message: string) => {
    setAuthMessage(message);
    setCurrentScreen("mypage");
    setIsSubmitting(false);
  };

  const saveProfileDocument = async (uid: string, data: object) => {
    await saveProfileDocumentInFirestore({ db, uid, data });
  };

  const queueSupportEmail = async ({
    subject,
    text,
    replyTo,
  }: {
    subject: string;
    text: string;
    replyTo?: string;
  }) => {
    await queueSupportEmailInFirestore({ db, subject, text, replyTo });
  };

  const updateAdvisorForm = (key: keyof AdvisorFormState, value: string) => {
    clearAuthFeedback();
    setAdvisorForm((current) => ({ ...current, [key]: value }));
  };

  const updateCoachForm = (key: keyof CoachFormState, value: string) => {
    clearAuthFeedback();
    setCoachForm((current) => ({ ...current, [key]: value }));
  };

  const toAvailabilityBoolean = (value: string) =>
    /可|受付|対応|ok|yes|true/iu.test(value) && !/不可|停止|なし|no|false/iu.test(value);

  const updateLoginForm = (key: keyof LoginFormState, value: string) => {
    clearAuthFeedback();
    setLoginForm((current) => ({ ...current, [key]: value }));
  };

  const updateContactForm = (key: keyof ContactFormState, value: string) => {
    clearAuthFeedback();
    setContactForm((current) => ({ ...current, [key]: value }));
  };

  const toggleExpandedBody = (id: string) => {
    setExpandedBodyIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    );
  };

  const requestOpenExternalUrl = (url: string, label?: string) => {
    clearAuthFeedback();
    const nextUrl = /^https?:\/\//u.test(url) ? url : `https://${url}`;
    setExternalLinkModalState({
      visible: true,
      url: nextUrl,
      label: label ?? buildUrlPreviewLabel(nextUrl),
    });
  };

  const closeExternalLinkModal = () => {
    setExternalLinkModalState(INITIAL_EXTERNAL_LINK_MODAL_STATE);
  };

  const confirmOpenExternalUrl = async () => {
    const { url } = externalLinkModalState;
    if (!url) {
      closeExternalLinkModal();
      return;
    }

    try {
      if (Platform.OS === "web" && typeof window !== "undefined") {
        window.open(url, "_blank", "noopener,noreferrer");
      } else {
        await Linking.openURL(url);
      }
    } catch {
      setAuthError("外部サイトを開けませんでした。URLを確認してください。");
    } finally {
      closeExternalLinkModal();
    }
  };

  const pickImage = async (
    target:
      | "advisor"
      | "advisor-cover"
      | "coach"
      | "coach-cover"
      | "profile"
      | "profile-cover"
  ) => {
    clearAuthFeedback();

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setAuthError("画像ライブラリへのアクセス権限が必要です。");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect:
        target === "advisor-cover" ||
        target === "coach-cover" ||
        target === "profile-cover"
          ? [3, 1]
          : [1, 1],
      quality: 0.8,
    });

    if (result.canceled) {
      return;
    }

    const selectedAsset = result.assets[0];
    if (
      selectedAsset?.fileSize &&
      selectedAsset.fileSize > IMAGE_FILE_SIZE_LIMIT_BYTES
    ) {
      setAuthError(
        `画像は10MB以下のファイルを選択してください。現在のサイズ: ${formatFileSizeLabel(
          selectedAsset.fileSize
        )}`
      );
      return;
    }

    const assetUri = selectedAsset?.uri ?? null;
    if (target === "advisor") {
      setAdvisorIconUri(assetUri);
      return;
    }

    if (target === "advisor-cover") {
      setAdvisorCoverUri(assetUri);
      return;
    }

    if (target === "profile") {
      setProfileDraft((current) => ({
        ...current,
        avatarUrl: assetUri ?? "",
      }));
      return;
    }

    if (target === "profile-cover") {
      setProfileDraft((current) => ({
        ...current,
        coverUrl: assetUri ?? "",
      }));
      return;
    }

    if (target === "coach-cover") {
      setCoachCoverUri(assetUri);
      return;
    }

    setCoachIconUri(assetUri);
  };

  const uploadProfileMedia = async ({
    uid,
    uri,
    kind,
  }: {
    uid: string;
    uri: string;
    kind: "icon" | "cover";
  }) => {
    return uploadProfileMediaToStorage({ storage, uid, uri, kind });
  };

  const deleteStorageFileByUrl = (url: string) =>
    deleteStorageFileByUrlFromStorage(storage, url);

  const deleteStorageFilesQuietly = (urls: string[]) =>
    deleteStorageFilesQuietlyFromStorage(storage, urls);

  const deleteOwnedPostsAndMedia = (uid: string) =>
    deleteOwnedPostsAndMediaFromFirestore({ db, storage, uid });

  const deletePostFromDetail = async () => {
    clearAuthFeedback();

    if (!authUser || !db || !postDetail.id) {
      setAuthError("投稿削除にはログインが必要です。");
      return;
    }

    const isOwner =
      (postDetail.createdByUid && postDetail.createdByUid === authUser.uid) ||
      postDetail.author === profileState.name;

    if (!isOwner) {
      setAuthError("自分の投稿のみ削除できます。");
      return;
    }

    try {
      const collectionName =
        postDetail.source === "feed"
          ? COLLECTIONS.feed
          : postDetail.source === "questions"
            ? COLLECTIONS.questions
            : COLLECTIONS.community;

      const mediaUrls = [
        ...(postDetail.media?.map((item) => item.url) ?? []),
        ...collectReplyMediaUrls(postDetail.replies),
      ];

      await updateDoc(doc(db, collectionName, postDetail.id), {
        isDeleted: true,
        deletedAt: serverTimestamp(),
        deletedByUid: authUser.uid,
      });
      await deleteStorageFilesQuietly(mediaUrls);
      setAuthMessage("投稿を削除しました。");
      setCurrentScreen(postDetailBackScreen);
    } catch (error) {
      setAuthError(`投稿削除に失敗しました。${toSaveErrorMessage(error)}`);
    }
  };

  const pickMediaAssets = async ({
    onPicked,
    limit,
  }: {
    onPicked: (assets: LocalMediaAsset[]) => void;
    limit: number;
  }) => {
    clearAuthFeedback();

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setAuthError("画像・動画ライブラリへのアクセス権限が必要です。");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: false,
      quality: 0.8,
    });

    if (result.canceled) {
      return;
    }

    const pickedAssets: LocalMediaAsset[] = [];
    const skippedAssets: string[] = [];

    (result.assets ?? []).forEach((asset, index) => {
      if (!asset.uri) {
        return;
      }

      const kind: MediaKind = asset.type === "video" ? "video" : "image";
      const sizeLimit = getMediaSizeLimit(kind);
      if (asset.fileSize && asset.fileSize > sizeLimit) {
        skippedAssets.push(
          `${asset.fileName ?? `${kind}-${index + 1}`} (${kind === "video" ? "100MB" : "10MB"}超過)`
        );
        return;
      }

      pickedAssets.push({
        id: `${Date.now()}-${index}`,
        uri: asset.uri,
        kind,
        fileName:
          asset.fileName ??
          `${asset.type === "video" ? "video" : "image"}-${Date.now()}-${index}`,
        mimeType: asset.mimeType,
        width: asset.width,
        height: asset.height,
        sizeBytes: asset.fileSize,
      });
    });

    if (pickedAssets.length === 0 && skippedAssets.length > 0) {
      setAuthError(
        "選択したファイルはサイズ上限を超えています。画像は10MB以下、動画は100MB以下にしてください。"
      );
      return;
    }

    if (skippedAssets.length > 0) {
      setAuthError(
        `一部のファイルは追加されませんでした。画像は10MB以下、動画は100MB以下にしてください。対象: ${skippedAssets.join(
          "、"
        )}`
      );
    }

    onPicked(pickedAssets.slice(0, limit));
  };

  const pickComposeMedia = async () => {
    await pickMediaAssets({
      limit: 4,
      onPicked: (assets) => {
        setComposeMedia((current) => [...current, ...assets].slice(0, 4));
      },
    });
  };

  const pickReplyMedia = async () => {
    await pickMediaAssets({
      limit: 4,
      onPicked: (assets) => {
        setReplyMedia((current) => [...current, ...assets].slice(0, 4));
      },
    });
  };

  const removeComposeMedia = (id: string) => {
    setComposeMedia((current) => current.filter((item) => item.id !== id));
  };

  const removeReplyMedia = (id: string) => {
    setReplyMedia((current) => current.filter((item) => item.id !== id));
  };

  const uploadMediaAssets = async ({
    uid,
    media,
    folder,
  }: {
    uid: string;
    media: LocalMediaAsset[];
    folder: "post-media" | "reply-media";
  }) => {
    return uploadMediaAssetsToStorage({ storage, uid, media, folder });
  };

  const uploadComposeMedia = async (uid: string) =>
    uploadMediaAssets({ uid, media: composeMedia, folder: "post-media" });

  const uploadReplyMedia = async (uid: string) =>
    uploadMediaAssets({ uid, media: replyMedia, folder: "reply-media" });

  const addCoachLink = () => {
    setCoachLinks((current) => [...current, createLinkRow(current.length + 1)]);
  };

  const updateCoachLink = (
    id: string,
    key: keyof Omit<ExternalLink, "id">,
    value: string
  ) => {
    clearAuthFeedback();
    setCoachLinks((current) =>
      current.map((link) => (link.id === id ? { ...link, [key]: value } : link))
    );
  };

  const toggleAdvisorSport = (sport: string) => {
    clearAuthFeedback();
    setAdvisorForm((current) => ({
      ...current,
      selectedSports: current.selectedSports.includes(sport)
        ? current.selectedSports.filter((item) => item !== sport)
        : [...current.selectedSports, sport],
    }));
  };

  const toggleCoachSport = (sport: string) => {
    clearAuthFeedback();
    setCoachForm((current) => ({
      ...current,
      selectedSports: current.selectedSports.includes(sport)
        ? current.selectedSports.filter((item) => item !== sport)
        : [...current.selectedSports, sport],
    }));
  };

  const toggleProfileSport = (sport: string) => {
    setProfileDraft((current) => ({
      ...current,
      selectedSports: current.selectedSports.includes(sport)
        ? current.selectedSports.filter((item) => item !== sport)
        : [...current.selectedSports, sport],
    }));
  };

  const updateProfileDraft = (
    key: Exclude<
      keyof ProfileState,
      "selectedSports" | "externalLinks" | "consultationAvailable" | "paidConsultationAvailable"
    >,
    value: string
  ) => {
    setProfileDraft((current) => ({ ...current, [key]: value }));
  };

  const updateProfileAvailability = (
    key: "consultationAvailable" | "paidConsultationAvailable",
    value: boolean
  ) => {
    setProfileDraft((current) => ({ ...current, [key]: value }));
  };

  const registerAdvisor = async () => {
    clearAuthFeedback();

    if (!hasAuthConfig || !auth || !db) {
      setAuthError("認証設定が未完了です。管理者に設定状況を確認してください。");
      return;
    }

    if (
      !advisorForm.nickname ||
      !advisorForm.handle ||
      !advisorForm.club ||
      !advisorForm.experience ||
      !advisorForm.loginEmail ||
      !advisorForm.loginPassword ||
      advisorForm.selectedSports.length === 0
    ) {
      setAuthError("顧問登録に必要な必須項目と表示したい種目を入力してください。");
      return;
    }

    const normalizedAdvisorHandle = normalizeHandle(advisorForm.handle);
    if (!normalizedAdvisorHandle) {
      setAuthError("表示IDは @ を含む英数字ベースで入力してください。");
      return;
    }

    setIsSubmitting(true);
    try {
      const credential = await createUserWithEmailAndPassword(
        auth,
        advisorForm.loginEmail,
        advisorForm.loginPassword
      );
      const uploadedAdvisorIconUrl = advisorIconUri
        ? await uploadProfileMedia({
            uid: credential.user.uid,
            uri: advisorIconUri,
            kind: "icon",
          })
        : "";
      const uploadedAdvisorCoverUrl = advisorCoverUri
        ? await uploadProfileMedia({
            uid: credential.user.uid,
            uri: advisorCoverUri,
            kind: "cover",
          })
        : "";

      completeAuthSuccess(
        "顧問アカウントを登録し、ログイン済みの状態でマイページへ移動しました。"
      );
      const nextProfile = {
        ...profileState,
        name: advisorForm.nickname,
        handle: normalizedAdvisorHandle,
        role: "顧問アカウント",
        bio: `${advisorForm.club} を担当中。必要な種目を横断して情報収集しながら運営しています。`,
        link: buildProfileUrl(normalizedAdvisorHandle),
        avatarUrl: uploadedAdvisorIconUrl,
        coverUrl: uploadedAdvisorCoverUrl,
        externalLinks: [],
        selectedSports: advisorForm.selectedSports,
      };
      setProfileState(nextProfile);
      setProfileDraft(nextProfile);

      try {
        await saveProfileDocument(credential.user.uid, {
          role: "advisor",
          roleLabel: "顧問アカウント",
          profile: {
            nickname: advisorForm.nickname,
            handle: nextProfile.handle,
            club: advisorForm.club,
            experience: advisorForm.experience,
            bio: nextProfile.bio,
            link: nextProfile.link,
            following: nextProfile.following,
            followers: nextProfile.followers,
            posts: nextProfile.posts,
            selectedSports: advisorForm.selectedSports,
            iconUrl: uploadedAdvisorIconUrl,
            coverUrl: uploadedAdvisorCoverUrl,
          },
          auth: {
            loginEmail: advisorForm.loginEmail,
          },
          createdAt: serverTimestamp(),
        });
      } catch (error) {
        setAuthError(
          `ログインは完了しましたが、プロフィール保存に失敗しました。${toSaveErrorMessage(
            error
          )}`
        );
      }

      setAdvisorForm(initialAdvisorForm);
      setAdvisorIconUri(null);
      setAdvisorCoverUri(null);
    } catch (error) {
      setAuthError(toAuthErrorMessage(error));
      setIsSubmitting(false);
    }
  };

  const registerCoach = async () => {
    clearAuthFeedback();

    if (!hasAuthConfig || !auth || !db) {
      setAuthError("認証設定が未完了です。管理者に設定状況を確認してください。");
      return;
    }

    if (
      !coachForm.nickname ||
      !coachForm.handle ||
      !coachForm.specialty ||
      !coachForm.experience ||
      !coachForm.achievements ||
      !coachForm.loginEmail ||
      !coachForm.loginPassword ||
      coachForm.selectedSports.length === 0
    ) {
      setAuthError("指導員登録に必要な必須項目と表示したい種目を入力してください。");
      return;
    }

    const filteredLinks = coachLinks.filter((link) => link.label && link.url);
    const normalizedCoachHandle = normalizeHandle(coachForm.handle);
    if (!normalizedCoachHandle) {
      setAuthError("表示IDは @ を含む英数字ベースで入力してください。");
      return;
    }

    setIsSubmitting(true);
    try {
      const credential = await createUserWithEmailAndPassword(
        auth,
        coachForm.loginEmail,
        coachForm.loginPassword
      );
      const uploadedCoachIconUrl = coachIconUri
        ? await uploadProfileMedia({
            uid: credential.user.uid,
            uri: coachIconUri,
            kind: "icon",
          })
        : "";
      const uploadedCoachCoverUrl = coachCoverUri
        ? await uploadProfileMedia({
            uid: credential.user.uid,
            uri: coachCoverUri,
            kind: "cover",
          })
        : "";

      completeAuthSuccess(
        "指導員アカウントを登録し、ログイン済みの状態でマイページへ移動しました。"
      );
      const nextProfile = {
        ...profileState,
        name: coachForm.nickname,
        handle: normalizedCoachHandle,
        role: "指導員アカウント",
        bio: coachForm.achievements,
        link: buildProfileUrl(normalizedCoachHandle),
        avatarUrl: uploadedCoachIconUrl,
        coverUrl: uploadedCoachCoverUrl,
        externalLinks: filteredLinks,
        selectedSports: coachForm.selectedSports,
        strengths: coachForm.strengths,
        supportTopics: coachForm.supportTopics,
        certifications: coachForm.certifications,
        organization: coachForm.organization,
        youtubeUrl: coachForm.youtubeUrl,
        xUrl: coachForm.xUrl,
        instagramUrl: coachForm.instagramUrl,
        consultationAvailable: toAvailabilityBoolean(coachForm.consultationAvailable),
        paidConsultationAvailable: toAvailabilityBoolean(
          coachForm.paidConsultationAvailable
        ),
      };
      setProfileState(nextProfile);
      setProfileDraft(nextProfile);

      try {
        await saveProfileDocument(credential.user.uid, {
          role: "coach",
          roleLabel: "指導員アカウント",
          profile: {
            nickname: coachForm.nickname,
            handle: nextProfile.handle,
            specialty: coachForm.specialty,
            experience: coachForm.experience,
            achievements: coachForm.achievements,
            phone: coachForm.phone,
            publicEmail: coachForm.publicEmail,
            strengths: coachForm.strengths,
            supportTopics: coachForm.supportTopics,
            certifications: coachForm.certifications,
            organization: coachForm.organization,
            youtubeUrl: coachForm.youtubeUrl,
            xUrl: coachForm.xUrl,
            instagramUrl: coachForm.instagramUrl,
            consultationAvailable: nextProfile.consultationAvailable,
            paidConsultationAvailable: nextProfile.paidConsultationAvailable,
            bio: nextProfile.bio,
            link: nextProfile.link,
            following: nextProfile.following,
            followers: nextProfile.followers,
            posts: nextProfile.posts,
            selectedSports: coachForm.selectedSports,
            iconUrl: uploadedCoachIconUrl,
            coverUrl: uploadedCoachCoverUrl,
            externalLinks: filteredLinks,
          },
          visibility: {
            phonePublic: Boolean(coachForm.phone),
            emailPublic: Boolean(coachForm.publicEmail),
          },
          auth: {
            loginEmail: coachForm.loginEmail,
          },
          createdAt: serverTimestamp(),
        });
      } catch (error) {
        setAuthError(
          `ログインは完了しましたが、プロフィール保存に失敗しました。${toSaveErrorMessage(
            error
          )}`
        );
      }

      setCoachForm(initialCoachForm);
      setCoachIconUri(null);
      setCoachCoverUri(null);
      setCoachLinks([createLinkRow(1)]);
    } catch (error) {
      setAuthError(toAuthErrorMessage(error));
      setIsSubmitting(false);
    }
  };

  const handleLogin = async () => {
    clearAuthFeedback();

    if (!hasAuthConfig || !auth) {
      setAuthError("認証設定が未完了です。管理者に設定状況を確認してください。");
      return;
    }

    if (!loginForm.email || !loginForm.password) {
      setAuthError("ログイン用メールアドレスとパスワードを入力してください。");
      return;
    }

    setIsSubmitting(true);
    try {
      await signInWithEmailAndPassword(auth, loginForm.email, loginForm.password);
      setAuthMessage("ログインしました。");
      setLoginForm(initialLoginForm);
      setCurrentScreen("mypage");
    } catch (error) {
      setAuthError(toAuthErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = async () => {
    clearAuthFeedback();

    if (!hasAuthConfig || !auth) {
      setAuthError("認証設定が未完了です。管理者に設定状況を確認してください。");
      return;
    }

    if (!forgotPasswordEmail) {
      setAuthError("再設定用メールアドレスを入力してください。");
      return;
    }

    setIsSubmitting(true);
    try {
      await sendPasswordResetEmail(auth, forgotPasswordEmail, {
        url: getPublicSiteUrl(),
        handleCodeInApp: false,
      });
      setAuthMessage(
        "再設定メールを送信しました。登録済みメールアドレスであれば、メール内リンクからパスワードを変更できます。"
      );
      setForgotPasswordEmail("");
    } catch (error) {
      setAuthError(`再設定メールの送信に失敗しました。${toAuthErrorMessage(error)}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitContactInquiry = async () => {
    clearAuthFeedback();

    if (!db) {
      setAuthError("お問い合わせ設定が未完了です。");
      return;
    }

    if (!contactForm.email || !contactForm.subject || !contactForm.body) {
      setAuthError("お問い合わせにはメールアドレス、件名、本文の入力が必要です。");
      return;
    }

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, COLLECTIONS.inquiries), {
        userUid: authUser?.uid ?? null,
        email: contactForm.email,
        subject: contactForm.subject,
        body: contactForm.body,
        createdAt: serverTimestamp(),
      });
      await queueSupportEmail({
        subject: `[Komonity お問い合わせ] ${contactForm.subject}`,
        replyTo: contactForm.email,
        text: [
          `送信者メールアドレス: ${contactForm.email}`,
          authUser?.uid ? `送信者UID: ${authUser.uid}` : "送信者UID: 未ログイン",
          "",
          "お問い合わせ本文:",
          contactForm.body,
        ].join("\n"),
      });
      setContactForm({
        email: authUser?.email ?? "",
        subject: "",
        body: "",
      });
      setAuthMessage("お問い合わせを送信しました。返信が必要な場合は入力されたメールアドレス宛にご連絡します。");
    } catch (error) {
      setAuthError(`お問い合わせの送信に失敗しました。${toSaveErrorMessage(error)}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    clearAuthFeedback();

    if (!auth) {
      return;
    }

    try {
      await signOut(auth);
      setAuthMessage("ログアウトしました。");
      setCurrentScreen("top");
    } catch (error) {
      setAuthError(toAuthErrorMessage(error));
    }
  };

  const currentFollowingUserIds = authUser
    ? followRecords
        .filter((record) => record.followerUid === authUser.uid)
        .map((record) => record.followingUid)
    : [];
  const currentBlockedUserIds = authUser
    ? blockRecords
        .filter((record) => record.blockerUid === authUser.uid)
        .map((record) => record.blockedUid)
    : [];
  const currentPostAlertUserIds = authUser
    ? postAlertRecords
        .filter((record) => record.watcherUid === authUser.uid)
        .map((record) => record.targetUid)
    : [];
  const currentTimeMs = Date.now();
  const filteredFeedPosts = feedTimeline.filter(
    (post) =>
      isPublishedAtOrBeforeNow(post.createdAtMs, currentTimeMs) &&
      (!post.createdByUid || !currentBlockedUserIds.includes(post.createdByUid))
  );
  const visibleQuestionBoard = questionBoard.filter(
    (question) =>
      isPublishedAtOrBeforeNow(question.createdAtMs, currentTimeMs) &&
      (!question.createdByUid || !currentBlockedUserIds.includes(question.createdByUid))
  );
  const visibleCommunityBoard = communityBoard.filter(
    (item) =>
      isPublishedAtOrBeforeNow(item.createdAtMs, currentTimeMs) &&
      (!item.createdByUid || !currentBlockedUserIds.includes(item.createdByUid))
  );
  const likeCountMap = likeRecords.reduce<Record<string, number>>((accumulator, record) => {
    const key = `${record.source}:${record.postId}`;
    accumulator[key] = (accumulator[key] ?? 0) + 1;
    return accumulator;
  }, {});
  const repostCountMap = repostRecords.reduce<Record<string, number>>(
    (accumulator, record) => {
      const key = `${record.source}:${record.postId}`;
      accumulator[key] = (accumulator[key] ?? 0) + 1;
      return accumulator;
    },
    {}
  );
  const bookmarkMap = bookmarkRecords.reduce<Record<string, boolean>>(
    (accumulator, record) => {
      accumulator[`${record.source}:${record.postId}`] = true;
      return accumulator;
    },
    {}
  );
  const bookmarkCountMap = bookmarkRecords.reduce<Record<string, number>>(
    (accumulator, record) => {
      const key = `${record.source}:${record.postId}`;
      accumulator[key] = (accumulator[key] ?? 0) + 1;
      return accumulator;
    },
    {}
  );

  const followerCountMap = followRecords.reduce<Record<string, number>>(
    (accumulator, record) => {
      accumulator[record.followingUid] =
        (accumulator[record.followingUid] ?? 0) + 1;
      return accumulator;
    },
    {}
  );

  const followingCountMap = followRecords.reduce<Record<string, number>>(
    (accumulator, record) => {
      accumulator[record.followerUid] = (accumulator[record.followerUid] ?? 0) + 1;
      return accumulator;
    },
    {}
  );

  const followingFeedPosts = filteredFeedPosts.filter(
    (post) =>
      post.createdByUid &&
      currentFollowingUserIds.includes(post.createdByUid) &&
      !currentBlockedUserIds.includes(post.createdByUid)
  );
  const now = new Date();
  const startOfCurrentMonth = new Date(
    now.getFullYear(),
    now.getMonth(),
    1
  ).getTime();
  const monthlyQuestions = visibleQuestionBoard.filter(
    (question) => (question.createdAtMs ?? 0) >= startOfCurrentMonth
  );
  const monthlyBestAnsweredQuestions = monthlyQuestions.filter((question) =>
    Boolean(question.bestAnswerReplyId)
  );
  const monthlyBestAnswerRate = monthlyQuestions.length
    ? Math.round(
        (monthlyBestAnsweredQuestions.length / monthlyQuestions.length) * 100
      )
    : 0;
  const registeredExpertsCount = directoryAccounts.filter((account) =>
    account.role.includes("指導員")
  ).length;
  const overviewStats = [
    {
      label: "月間相談数",
      value: formatCount(monthlyQuestions.length),
      note: `ベストアンサー率 ${monthlyBestAnswerRate}%`,
    },
    {
      label: "登録指導者",
      value: formatCount(registeredExpertsCount),
      note: "登録済みの指導員アカウント数",
    },
    {
      label: "公開ナレッジ投稿",
      value: formatCount(filteredFeedPosts.length),
      note: "メニュー・戦術に公開されている投稿数",
    },
  ];
  const currentProfileFollowingValue = authUser
    ? String(followingCountMap[authUser.uid] ?? 0)
    : profileState.following;
  const currentProfileFollowersValue = authUser
    ? String(followerCountMap[authUser.uid] ?? 0)
    : profileState.followers;
  const selectedProfileFollowingValue = selectedUserProfile.uid
    ? String(followingCountMap[selectedUserProfile.uid] ?? 0)
    : selectedUserProfile.following;
  const selectedProfileFollowersValue = selectedUserProfile.uid
    ? String(followerCountMap[selectedUserProfile.uid] ?? 0)
    : selectedUserProfile.followers;
  const normalizedSearchQuery = searchQuery.trim().toLowerCase();
  const allSearchContentItems: SearchContentItem[] = [
    ...filteredFeedPosts.map((post) => ({
      createdAtMs: post.createdAtMs,
      id: post.id,
      source: "feed" as const,
      sourceLabel: "メニュー・戦術",
      author: post.author,
      authorHandle: post.authorHandle,
      createdByUid: post.createdByUid,
      role: post.role,
      title: post.title,
      body: post.body,
      sports: post.sports,
      tags: post.tags,
      replies: post.replies,
      media: post.media,
      practiceMenu: post.practiceMenu,
      score: getTrendingScore({
        source: "feed",
        baseScore: post.likes + post.reposts * 2 + post.comments,
        createdAtMs: post.createdAtMs,
      }),
    })),
    ...visibleQuestionBoard.map((question) => ({
      createdAtMs: question.createdAtMs,
      id: question.id,
      source: "questions" as const,
      sourceLabel: "相談広場",
      author: question.author,
      authorHandle: question.authorHandle,
      createdByUid: question.createdByUid,
      role: "顧問アカウント",
      title: question.title,
      body: question.body,
      sports: [question.category],
      tags: ["相談", question.category],
      replies: question.replies,
      media: question.media,
      score: getTrendingScore({
        source: "questions",
        baseScore: question.answers * 3 + question.replies.length,
        createdAtMs: question.createdAtMs,
        hasBestAnswer: Boolean(question.bestAnswerReplyId),
      }),
    })),
    ...visibleCommunityBoard.map((item) => ({
      createdAtMs: item.createdAtMs,
      id: item.id,
      source: "community" as const,
      sourceLabel: "コミュニティ",
      author: item.author,
      authorHandle: item.authorHandle,
      createdByUid: item.createdByUid,
      role: "コミュニティ投稿",
      title: item.title,
      body: item.body,
      sports: [],
      tags: ["コミュニティ"],
      replies: item.replies,
      media: item.media,
      score: getTrendingScore({
        source: "community",
        baseScore: item.replies.length * 2 + 4,
        createdAtMs: item.createdAtMs,
      }),
    })),
  ].filter(
    (item) => !item.createdByUid || !currentBlockedUserIds.includes(item.createdByUid)
  );
  const allReplyItems = allSearchContentItems.flatMap((item) =>
    flattenReplyItems({
      replies: item.replies,
      source: item.source,
      sourceLabel: item.sourceLabel,
      parentTitle: item.title,
      rootPostId: item.id,
    })
  );
  const homeContentItems = [...allSearchContentItems].sort(
    (left, right) => (right.createdAtMs ?? 0) - (left.createdAtMs ?? 0)
  );
  const trendingCoaches: TrendingCoachItem[] = directoryAccounts
    .filter(
      (account) =>
        !currentBlockedUserIds.includes(account.id) &&
        account.role.includes("指導員")
    )
    .map((account) => {
      const authoredItems = allSearchContentItems.filter((item) =>
        userMatchesProfile({
          uid: item.createdByUid,
          name: item.author,
          targetUid: account.id,
          targetName: account.name,
        })
      );
      const authoredReplyItems = allReplyItems.filter((item) =>
        userMatchesProfile({
          uid: item.reply.createdByUid,
          name: item.reply.author,
          targetUid: account.id,
          targetName: account.name,
        })
      );
      const authoredInteractionKeys = new Set([
        ...authoredItems.map((item) => `${item.source}:${item.id}`),
        ...authoredReplyItems.map(
          (item) => `${item.source}:${item.interactionPostId}`
        ),
      ]);
      const likes = likeRecords.filter((record) =>
        authoredInteractionKeys.has(`${record.source}:${record.postId}`)
      ).length;
      const reposts = repostRecords.filter((record) =>
        authoredInteractionKeys.has(`${record.source}:${record.postId}`)
      ).length;
      const bookmarks = bookmarkRecords.filter((record) =>
        authoredInteractionKeys.has(`${record.source}:${record.postId}`)
      ).length;
      const bestAnswers = visibleQuestionBoard.filter((question) => {
        const bestReply = getBestAnswerReplyForQuestion(question) as Reply | undefined;

        return bestReply
          ? userMatchesProfile({
              uid: bestReply.createdByUid,
              name: bestReply.author,
              targetUid: account.id,
              targetName: account.name,
            })
          : false;
      }).length;
      const latestPostMs = authoredItems.reduce(
        (latest, item) => Math.max(latest, item.createdAtMs ?? 0),
        0
      );
      const lastActivityDays = latestPostMs
        ? Math.floor(getDaysSinceTimestamp(latestPostMs))
        : 365;
      const followers = followerCountMap[account.id] ?? parseFollowerCount(account.followers);
      const repliesReceived = authoredItems.reduce(
        (total, item) => total + countRepliesRecursively(item.replies),
        0
      );
      const repliesSent = authoredReplyItems.length;
      const responseRate =
        repliesReceived > 0 ? Math.min(1, repliesSent / repliesReceived) : 0;
      const profileCompletionScore = getProfileCompletionScore({
        bio: account.bio,
        link: buildProfileUrl(account.handle),
        selectedSports: account.selectedSports,
        handle: account.handle,
        strengths: account.strengths ?? "",
        supportTopics: account.supportTopics ?? "",
        certifications: account.certifications ?? "",
        organization: account.organization ?? "",
        youtubeUrl: account.youtubeUrl ?? "",
        xUrl: account.xUrl ?? "",
        instagramUrl: account.instagramUrl ?? "",
        consultationAvailable: account.consultationAvailable ?? false,
        paidConsultationAvailable: account.paidConsultationAvailable ?? false,
      });

      return {
        ...account,
        followers: String(followers),
        likes,
        reposts,
        bookmarks,
        bestAnswers,
        repliesReceived,
        repliesSent,
        profileCompletionScore,
        responseRate,
        lastActivityDays,
        score: getTrendingCoachScore({
          followers,
          likes,
          reposts,
          bookmarks,
          bestAnswers,
          repliesReceived,
          repliesSent,
          profileCompletionScore,
          responseRate,
          lastActivityDays,
        }),
      };
    })
    .sort((left, right) => right.score - left.score);

  const buildRepostedItemsForUser = (uid?: string, name?: string): ProfilePostItem[] => {
    if (!uid) {
      return [];
    }

    return repostRecords.reduce<ProfilePostItem[]>((accumulator, record) => {
      if (record.userUid !== uid) {
        return accumulator;
      }

        const original = allSearchContentItems.find(
          (item) => item.id === record.postId && item.source === record.source
        );
        if (original) {
          accumulator.push({
            ...original,
            id: `repost:${uid}:${record.source}:${record.postId}`,
            author: name ?? original.author,
            authorHandle: name ? createHandleFromName(name) : original.authorHandle,
            createdByUid: uid,
            role: original.role,
            displayRole: `${original.sourceLabel}を再投稿`,
            sortTimestampMs: record.createdAtMs ?? original.createdAtMs ?? 0,
          } satisfies ProfilePostItem);

          return accumulator;
        }

        const originalReply = allReplyItems.find(
          (item) =>
            item.interactionPostId === record.postId && item.source === record.source
        );
        if (!originalReply) {
          return accumulator;
        }

        accumulator.push({
          id: `repost:${uid}:${record.source}:${record.postId}`,
          source: record.source,
          sourceLabel: originalReply.sourceLabel,
          author: name ?? originalReply.reply.author,
          authorHandle: name
            ? createHandleFromName(name)
            : originalReply.reply.authorHandle,
          createdByUid: uid,
          role: "返信を再投稿",
          title: originalReply.parentTitle,
          body: originalReply.reply.body,
          sports: [],
          tags: ["返信", "再投稿"],
          replies: originalReply.reply.replies ?? [],
          media: originalReply.reply.media,
          score: 0,
          displayRole: `${originalReply.sourceLabel}の返信を再投稿`,
          sortTimestampMs: record.createdAtMs ?? 0,
        });

        return accumulator;
      }, []);
  };

  /**
   * いいね・保存した投稿をマイページ表示用の投稿カード形式に変換します。
   * 返信へのリアクションは投稿詳細側の文脈が必要なため、ここでは通常投稿のみを一覧化します。
   */
  const buildInteractedPostItemsForUser = ({
    uid,
    records,
    displayRole,
  }: {
    uid?: string;
    records: InteractionRecord[];
    displayRole: string;
  }): ProfilePostItem[] => {
    if (!uid) {
      return [];
    }

    return records.reduce<ProfilePostItem[]>((accumulator, record) => {
      if (record.userUid !== uid) {
        return accumulator;
      }

      const original = allSearchContentItems.find(
        (item) => item.id === record.postId && item.source === record.source
      );
      if (!original) {
        return accumulator;
      }

      accumulator.push({
        ...original,
        displayRole,
        sortTimestampMs: record.createdAtMs ?? original.createdAtMs ?? 0,
      });

      return accumulator;
    }, []);
  };

  const authoredPostCountForUser = (uid?: string, name?: string) =>
    allSearchContentItems.filter((item) =>
      uid ? item.createdByUid === uid : item.author === name
    ).length;

  const accountDirectory = new Map<string, SearchAccountItem>();
  directoryAccounts.forEach((account) => {
    if (currentBlockedUserIds.includes(account.id)) {
      return;
    }
    accountDirectory.set(account.id, {
      ...account,
      followers: String(
        followerCountMap[account.id] ?? parseFollowerCount(account.followers)
      ),
    });
  });
  if (authUser) {
    accountDirectory.set(authUser.uid, {
      id: authUser.uid,
      name: profileState.name,
      handle: profileState.handle,
      bio: profileState.bio,
      followers: String(followerCountMap[authUser.uid] ?? 0),
      featured: false,
      role: profileState.role,
      selectedSports: profileState.selectedSports,
      strengths: profileState.strengths,
      supportTopics: profileState.supportTopics,
      certifications: profileState.certifications,
      organization: profileState.organization,
      youtubeUrl: profileState.youtubeUrl,
      xUrl: profileState.xUrl,
      instagramUrl: profileState.instagramUrl,
      consultationAvailable: profileState.consultationAvailable,
      paidConsultationAvailable: profileState.paidConsultationAvailable,
    });
  }

  const currentProfilePostsValue = authUser
    ? String(authoredPostCountForUser(authUser.uid, profileState.name))
    : profileState.posts;
  const selectedProfilePostsValue = selectedUserProfile.uid
    ? String(authoredPostCountForUser(selectedUserProfile.uid, selectedUserProfile.name))
    : selectedUserProfile.posts;
  const selectedUserBestAnswers = visibleQuestionBoard
    .map((question) => ({
      question,
      bestReply: getBestAnswerReplyForQuestion(question),
    }))
    .filter(({ bestReply }) =>
      bestReply
        ? userMatchesProfile({
            name: bestReply.author,
            targetUid: selectedUserProfile.uid,
            targetName: selectedUserProfile.name,
          })
        : false
    );
  const selectedUserBestAnswerCount = selectedUserBestAnswers.length;
  const selectedUserAuthoredPosts = allSearchContentItems.filter((item) =>
    userMatchesProfile({
      uid: item.createdByUid,
      name: item.author,
      targetUid: selectedUserProfile.uid,
      targetName: selectedUserProfile.name,
    })
  );
  const selectedUserAllPosts = mergeProfilePostItems(
    selectedUserAuthoredPosts,
    buildRepostedItemsForUser(selectedUserProfile.uid, selectedUserProfile.name)
  ).sort(
    (left, right) =>
      (right.sortTimestampMs ?? right.createdAtMs ?? 0) -
      (left.sortTimestampMs ?? left.createdAtMs ?? 0)
  );
  const selectedUserPinnedKey =
    selectedUserProfile.uid && directoryMetaMap[selectedUserProfile.uid]?.pinnedPostId
      ? `${directoryMetaMap[selectedUserProfile.uid]?.pinnedPostSource}:${directoryMetaMap[selectedUserProfile.uid]?.pinnedPostId}`
      : null;
  const selectedUserPinnedPost = selectedUserPinnedKey
    ? selectedUserAllPosts.find(
        (post) => `${post.source}:${post.id}` === selectedUserPinnedKey
      ) ?? null
    : null;
  const selectedUserVisiblePosts = selectedUserPinnedPost
    ? [
        selectedUserPinnedPost,
        ...selectedUserAllPosts.filter(
          (post) =>
            `${post.source}:${post.id}` !== `${selectedUserPinnedPost.source}:${selectedUserPinnedPost.id}`
        ),
      ]
    : selectedUserAllPosts;
  const selectedUserAnswers = allReplyItems.reduce<ProfileAnswerItem[]>(
    (accumulator, item) => {
      if (
        replyMatchesProfile({
          author: item.reply.author,
          targetName: selectedUserProfile.name,
        })
      ) {
        accumulator.push({
          id: `${item.interactionPostId}`,
          sourceLabel: item.sourceLabel,
          parentTitle: item.parentTitle,
          body: item.reply.body,
        });
      }

      return accumulator;
    },
    []
  );
  const currentUserAuthoredPosts = allSearchContentItems.filter((item) =>
    authUser
      ? item.createdByUid === authUser.uid || (!item.createdByUid && item.author === profileState.name)
      : item.author === profileState.name
  );
  const currentUserAllPosts = mergeProfilePostItems(
    currentUserAuthoredPosts,
    buildRepostedItemsForUser(authUser?.uid, profileState.name)
  ).sort(
    (left, right) =>
      (right.sortTimestampMs ?? right.createdAtMs ?? 0) -
      (left.sortTimestampMs ?? left.createdAtMs ?? 0)
  );
  const currentUserPinnedPost = pinnedPostKey
    ? currentUserAllPosts.find((post) => `${post.source}:${post.id}` === pinnedPostKey) ?? null
    : null;
  const currentUserVisiblePosts = currentUserPinnedPost
    ? [
        currentUserPinnedPost,
        ...currentUserAllPosts.filter(
          (post) => `${post.source}:${post.id}` !== `${currentUserPinnedPost.source}:${currentUserPinnedPost.id}`
        ),
      ]
    : currentUserAllPosts;
  const currentUserLikedPosts = buildInteractedPostItemsForUser({
    uid: authUser?.uid,
    records: likeRecords,
    displayRole: "いいねした投稿",
  }).sort(
    (left, right) =>
      (right.sortTimestampMs ?? right.createdAtMs ?? 0) -
      (left.sortTimestampMs ?? left.createdAtMs ?? 0)
  );
  const currentUserBookmarkedPosts = buildInteractedPostItemsForUser({
    uid: authUser?.uid,
    records: bookmarkRecords,
    displayRole: "保存した投稿",
  }).sort(
    (left, right) =>
      (right.sortTimestampMs ?? right.createdAtMs ?? 0) -
      (left.sortTimestampMs ?? left.createdAtMs ?? 0)
  );
  const currentUserProfileTabPosts =
    activeProfileTab === "likes"
      ? currentUserLikedPosts
      : activeProfileTab === "bookmarks"
        ? currentUserBookmarkedPosts
        : currentUserVisiblePosts;
  const currentUserAnswers = allReplyItems.reduce<ProfileAnswerItem[]>(
    (accumulator, item) => {
      if (
        replyMatchesProfile({
          author: item.reply.author,
          targetName: profileState.name,
        })
      ) {
        accumulator.push({
          id: `${item.interactionPostId}`,
          sourceLabel: item.sourceLabel,
          parentTitle: item.parentTitle,
          body: item.reply.body,
        });
      }

      return accumulator;
    },
    []
  );
  const currentUserBestAnswers = visibleQuestionBoard
    .map((question) => ({
      question,
      bestReply: getBestAnswerReplyForQuestion(question),
    }))
    .filter(({ bestReply }) =>
      bestReply
        ? userMatchesProfile({
            name: bestReply.author,
            targetUid: authUser?.uid,
            targetName: profileState.name,
          })
        : false
    );

  

  const notificationItems: NotificationItem[] = authUser
    ? [
        ...likeRecords.flatMap((record) => {
          const post = allSearchContentItems.find(
            (item) =>
              item.id === record.postId &&
              item.source === record.source &&
              currentUserAuthoredPosts.some(
                (authored) =>
                  authored.id === record.postId && authored.source === record.source
              )
          );
          return post
            ? [{
                id: `like-${record.id}`,
                kind: "like" as const,
                title: "いいねされました",
                body: `${post.title} にいいねが付きました。`,
                createdAtMs: record.createdAtMs ?? 0,
                postDetail: buildDetailStateFromSearchItem(post),
              }]
            : [];
        }),
        ...repostRecords.flatMap((record) => {
          const post = allSearchContentItems.find(
            (item) =>
              item.id === record.postId &&
              item.source === record.source &&
              currentUserAuthoredPosts.some(
                (authored) =>
                  authored.id === record.postId && authored.source === record.source
              )
          );
          return post
            ? [{
                id: `repost-${record.id}`,
                kind: "repost" as const,
                title: "再投稿されました",
                body: `${post.title} が再投稿されました。`,
                createdAtMs: record.createdAtMs ?? 0,
                postDetail: buildDetailStateFromSearchItem(post),
              }]
            : [];
        }),
        ...bookmarkRecords.flatMap((record) => {
          const post = allSearchContentItems.find(
            (item) =>
              item.id === record.postId &&
              item.source === record.source &&
              currentUserAuthoredPosts.some(
                (authored) =>
                  authored.id === record.postId && authored.source === record.source
              )
          );
          return post
            ? [{
                id: `bookmark-${record.id}`,
                kind: "bookmark" as const,
                title: "保存されました",
                body: `${post.title} が保存されました。`,
                createdAtMs: record.createdAtMs ?? 0,
                postDetail: buildDetailStateFromSearchItem(post),
              }]
            : [];
        }),
        ...allReplyItems.flatMap((item) => {
          const post = allSearchContentItems.find(
            (candidate) => candidate.id === item.rootPostId && candidate.source === item.source
          );
          return post &&
            currentUserAuthoredPosts.some(
              (authored) => authored.id === item.rootPostId && authored.source === item.source
            )
            ? [{
                id: `reply-${item.interactionPostId}`,
                kind: "reply" as const,
                title: "返信が届きました",
                body: `${item.parentTitle} に新しい返信があります。`,
                createdAtMs: 0,
                postDetail: buildDetailStateFromSearchItem(post),
              }]
            : [];
        }),
        ...filteredFeedPosts
          .filter(
            (post) =>
              post.createdByUid &&
              currentPostAlertUserIds.includes(post.createdByUid) &&
              post.createdByUid !== authUser.uid
          )
          .map((post) => ({
            id: `alert-${post.id}`,
            kind: "new-post" as const,
            title: "投稿通知",
            body: `${post.author} さんが新しい投稿を公開しました。`,
            createdAtMs: post.createdAtMs ?? 0,
            postDetail: buildFeedDetail(post),
          })),
      ].sort((left, right) => right.createdAtMs - left.createdAtMs)
    : [];

  const buildUserActivitySummary = ({
    uid,
    name,
    role,
    profile,
  }: {
    uid?: string;
    name: string;
    role: string;
    profile: Pick<
      ProfileState,
      | "bio"
      | "link"
      | "selectedSports"
      | "handle"
      | "strengths"
      | "supportTopics"
      | "certifications"
      | "organization"
      | "youtubeUrl"
      | "xUrl"
      | "instagramUrl"
      | "consultationAvailable"
      | "paidConsultationAvailable"
    >;
  }): UserActivitySummary | null => {
    if (!role.includes("指導員")) {
      return null;
    }

    const authoredPosts = allSearchContentItems.filter((item) =>
      userMatchesProfile({
        uid: item.createdByUid,
        name: item.author,
        targetUid: uid,
        targetName: name,
      })
    );
    const authoredReplies = allReplyItems.filter((item) =>
      userMatchesProfile({
        uid: item.reply.createdByUid,
        name: item.reply.author,
        targetUid: uid,
        targetName: name,
      })
    );
    const authoredInteractionKeys = new Set([
      ...authoredPosts.map((item) => `${item.source}:${item.id}`),
      ...authoredReplies.map((item) => `${item.source}:${item.interactionPostId}`),
    ]);
    const likesReceived = likeRecords.filter((record) =>
      authoredInteractionKeys.has(`${record.source}:${record.postId}`)
    ).length;
    const repostsReceived = repostRecords.filter((record) =>
      authoredInteractionKeys.has(`${record.source}:${record.postId}`)
    ).length;
    const bookmarksReceived = bookmarkRecords.filter((record) =>
      authoredInteractionKeys.has(`${record.source}:${record.postId}`)
    ).length;
    const repliesReceived = authoredPosts.reduce(
      (total, item) => total + countRepliesRecursively(item.replies),
      0
    );
    const repliesSent = authoredReplies.length;
    const bestAnswers = visibleQuestionBoard.filter((question) => {
      const bestReply = getBestAnswerReplyForQuestion(question) as Reply | undefined;

      return bestReply
        ? userMatchesProfile({
            uid: bestReply.createdByUid,
            name: bestReply.author,
            targetUid: uid,
            targetName: name,
          })
        : false;
    }).length;
    const followerCount = uid ? followerCountMap[uid] ?? 0 : 0;
    const postingStreakDays = getPostingStreakDays(
      authoredPosts.map((item) => item.createdAtMs ?? 0)
    );
    const profileCompletionScore = getProfileCompletionScore(profile);

    const badges = [
      createTieredBadge({
        id: "posts",
        label: "投稿実績",
        description: `${authoredPosts.length}件の投稿を達成`,
        value: authoredPosts.length,
        bronze: 5,
        silver: 50,
        gold: 300,
      }),
      createTieredBadge({
        id: "streak",
        label: "継続投稿",
        description: `${postingStreakDays}日連続で投稿`,
        value: postingStreakDays,
        bronze: 7,
        silver: 30,
        gold: 365,
      }),
      createTieredBadge({
        id: "followers",
        label: "フォロワー",
        description: `${followerCount}人のフォロワーを獲得`,
        value: followerCount,
        bronze: 10,
        silver: 100,
        gold: 1000,
      }),
      createTieredBadge({
        id: "likes",
        label: "いいね獲得",
        description: `${likesReceived}件のいいねを獲得`,
        value: likesReceived,
        bronze: 10,
        silver: 500,
        gold: 10000,
      }),
      createTieredBadge({
        id: "reposts",
        label: "再投稿獲得",
        description: `${repostsReceived}件の再投稿を獲得`,
        value: repostsReceived,
        bronze: 5,
        silver: 100,
        gold: 1000,
      }),
      createTieredBadge({
        id: "bookmarks",
        label: "保存獲得",
        description: `${bookmarksReceived}件の保存を獲得`,
        value: bookmarksReceived,
        bronze: 5,
        silver: 40,
        gold: 200,
      }),
      createTieredBadge({
        id: "replies_received",
        label: "会話を生んだ",
        description: `${repliesReceived}件の返信を受信`,
        value: repliesReceived,
        bronze: 10,
        silver: 100,
        gold: 1000,
      }),
      createTieredBadge({
        id: "replies_sent",
        label: "回答参加",
        description: `${repliesSent}件の返信を投稿`,
        value: repliesSent,
        bronze: 10,
        silver: 100,
        gold: 1000,
      }),
      createTieredBadge({
        id: "best_answers",
        label: "ベストアンサー",
        description: `${bestAnswers}件のベストアンサーを獲得`,
        value: bestAnswers,
        bronze: 1,
        silver: 5,
        gold: 15,
      }),
      profileCompletionScore >= 10
        ? {
            id: "profile",
            label: "プロフィール完成",
            description: "プロフィールの主要項目をすべて整備",
            tier: "gold" as const,
          }
        : null,
    ].filter((badge): badge is ActivityBadge => Boolean(badge));

    return {
      postCount: authoredPosts.length,
      postingStreakDays,
      followerCount,
      likesReceived,
      repostsReceived,
      bookmarksReceived,
      repliesReceived,
      repliesSent,
      bestAnswers,
      profileCompletionScore,
      badges,
    };
  };

  const currentUserActivitySummary = buildUserActivitySummary({
    uid: authUser?.uid,
    name: profileState.name,
    role: profileState.role,
    profile: profileState,
  });
  const selectedUserActivitySummary = buildUserActivitySummary({
    uid: selectedUserProfile.uid,
    name: selectedUserProfile.name,
    role: selectedUserProfile.role,
    profile: selectedUserProfile,
  });

  /**
   * 「今日の練習メニュー」検索用の条件判定です。
   * Firestore に保存した条件タグを優先し、過去投稿でも本文から補助的に判定します。
   */
  const matchesTodayMenuConditions = (item: SearchContentItem) => {
    if (todayMenuConditions.length === 0) {
      return true;
    }

    if (item.source !== "feed" || !item.practiceMenu) {
      return false;
    }

    const menu = item.practiceMenu;
    const menuText = [
      item.title,
      item.body,
      menu.sport,
      menu.targetLevel,
      menu.grade,
      menu.participants,
      menu.durationMinutes,
      menu.tools,
      menu.purpose,
      menu.steps,
      menu.cautions,
      menu.commonMistakes,
      menu.arrangements,
    ]
      .join(" ")
      .toLowerCase();

    return todayMenuConditions.every((condition) => {
      if (menu.conditionTags.includes(condition)) {
        return true;
      }

      if (condition === "under60") {
        const durations = menu.durationMinutes.match(/\d+/g) ?? [];
        return (
          durations.some((duration) => Number(duration) <= 60) ||
          /60分|短時間|時短|短め/.test(menuText)
        );
      }

      if (condition === "beginner") {
        return /初心者|初級|入門|基礎|未経験/.test(menuText);
      }

      if (condition === "rainy") {
        return /雨|室内|屋内|体育館|外が使えない|グラウンド不可/.test(menuText);
      }

      if (condition === "preTournament") {
        return /大会前|試合前|調整|確認|コンディション/.test(menuText);
      }

      if (condition === "fewTools") {
        return /道具少な|少なめ|不要|ボールのみ|コーンのみ|準備物少/.test(menuText);
      }

      return /体力差|レベル差|差が大きい|個人差|混在/.test(menuText);
    });
  };

  const searchMatchedPosts = allSearchContentItems.filter((item) => {
    if (
      activeSearchContentFilter !== "all" &&
      item.source !== activeSearchContentFilter
    ) {
      return false;
    }

    if (item.source === "feed" && !matchesTodayMenuConditions(item)) {
      return false;
    }

    if (!normalizedSearchQuery) {
      return true;
    }

    const haystack = [
      item.author,
      item.role,
      item.title,
      item.body,
      item.sourceLabel,
      item.practiceMenu?.sport,
      item.practiceMenu?.targetLevel,
      item.practiceMenu?.grade,
      item.practiceMenu?.participants,
      item.practiceMenu?.durationMinutes,
      item.practiceMenu?.tools,
      item.practiceMenu?.purpose,
      item.practiceMenu?.steps,
      item.practiceMenu?.cautions,
      item.practiceMenu?.commonMistakes,
      item.practiceMenu?.arrangements,
      ...item.tags,
      ...item.sports,
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(normalizedSearchQuery);
  });

  const trendingSearchPosts = [...searchMatchedPosts].sort(
    (left, right) => right.score - left.score
  );

  const recentSearchPosts = [...searchMatchedPosts].sort(
    (left, right) => (right.createdAtMs ?? 0) - (left.createdAtMs ?? 0)
  );

  const searchAccounts = [
    ...directoryAccounts.map((account) => ({
      ...account,
      followers: String(
        followerCountMap[account.id] ?? parseFollowerCount(account.followers)
      ),
    })),
  ]
    .filter((account) => !currentBlockedUserIds.includes(account.id))
    .filter(
      (account, index, array) =>
        index ===
        array.findIndex(
          (candidate) =>
            candidate.id === account.id ||
            candidate.handle === account.handle ||
            candidate.name === account.name
        )
    )
    .filter((account) => {
      if (!normalizedSearchQuery) {
        return true;
      }

      return [
        account.name,
        account.handle,
        account.bio,
        account.strengths,
        account.supportTopics,
        account.certifications,
        account.organization,
        account.youtubeUrl,
        account.xUrl,
        account.instagramUrl,
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalizedSearchQuery);
    })
    .sort((left, right) => {
      const scoreDiff =
        getAccountSearchScore(right, normalizedSearchQuery) -
        getAccountSearchScore(left, normalizedSearchQuery);

      if (scoreDiff !== 0) {
        return scoreDiff;
      }

      const followerDiff =
        parseFollowerCount(right.followers) - parseFollowerCount(left.followers);
      if (followerDiff !== 0) {
        return followerDiff;
      }

      return left.name.localeCompare(right.name, "ja");
    });
  const postDetailInteractionKey = `${postDetail.source}:${postDetail.id}`;
  const isPostDetailLiked = authUser
    ? likeRecords.some(
        (record) =>
          record.userUid === authUser.uid &&
          record.postId === postDetail.id &&
          record.source === postDetail.source
      )
    : false;
  const isPostDetailReposted = authUser
    ? repostRecords.some(
        (record) =>
          record.userUid === authUser.uid &&
          record.postId === postDetail.id &&
          record.source === postDetail.source
      )
    : false;
  const isPostDetailBookmarked = Boolean(bookmarkMap[postDetailInteractionKey]);
  const postDetailLikeCount = likeCountMap[postDetailInteractionKey] ?? postDetail.likes ?? 0;
  const postDetailRepostCount =
    repostCountMap[postDetailInteractionKey] ?? postDetail.reposts ?? 0;
  const postDetailBookmarkCount = bookmarkCountMap[postDetailInteractionKey] ?? 0;
  const isPostDetailQuestionOwner =
    postDetail.source === "questions" &&
    ((postDetail.createdByUid && postDetail.createdByUid === authUser?.uid) ||
      postDetail.author === profileState.name);

  const getReplyInteractionSummary = ({
    rootPostId,
    source,
    path,
    reply,
  }: {
    rootPostId: string;
    source: SearchContentFilterKey;
    path: string[];
    reply: Reply;
  }) => {
    const interactionPostId = buildReplyInteractionPostId(rootPostId, path);
    const interactionKey = `${source}:${interactionPostId}`;
    const liked = authUser
      ? likeRecords.some(
          (record) =>
            record.userUid === authUser.uid &&
            record.postId === interactionPostId &&
            record.source === source
        )
      : false;
    const reposted = authUser
      ? repostRecords.some(
          (record) =>
            record.userUid === authUser.uid &&
            record.postId === interactionPostId &&
            record.source === source
        )
      : false;
    const bookmarked = Boolean(bookmarkMap[interactionKey]);

    return {
      interactionPostId,
      liked,
      reposted,
      bookmarked,
      likeCount: likeCountMap[interactionKey] ?? 0,
      repostCount: repostCountMap[interactionKey] ?? 0,
      bookmarkCount: bookmarkCountMap[interactionKey] ?? 0,
      replyCount: reply.replies?.length ?? 0,
    };
  };

  useEffect(() => {
    if (currentScreen !== "post-detail" || !postDetail.id) {
      return;
    }

    if (postDetail.source === "feed") {
      const match = feedTimeline.find((item) => item.id === postDetail.id);
      if (match) {
        setPostDetail(buildFeedDetail(match));
      }
      return;
    }

    if (postDetail.source === "questions") {
      const match = questionBoard.find((item) => item.id === postDetail.id);
      if (match) {
        setPostDetail(buildQuestionDetail(match));
      }
      return;
    }

    const match = communityBoard.find((item) => item.id === postDetail.id);
    if (match) {
      setPostDetail(buildCommunityDetail(match));
    }
  }, [communityBoard, currentScreen, feedTimeline, postDetail.id, postDetail.source, questionBoard]);

  useEffect(() => {
    if (currentScreen !== "reply-detail" || !replyDetail.rootPostId || replyDetail.path.length === 0) {
      return;
    }

    const rootReplies =
      replyDetail.source === "feed"
        ? feedTimeline.find((item) => item.id === replyDetail.rootPostId)?.replies
        : replyDetail.source === "questions"
          ? questionBoard.find((item) => item.id === replyDetail.rootPostId)?.replies
          : communityBoard.find((item) => item.id === replyDetail.rootPostId)?.replies;

    if (!rootReplies) {
      return;
    }

    const nextReply = findReplyByPath(rootReplies, replyDetail.path);
    if (nextReply) {
      setReplyDetail((current) => ({
        ...current,
        reply: nextReply,
      }));
    }
  }, [
    communityBoard,
    currentScreen,
    feedTimeline,
    questionBoard,
    replyDetail.path,
    replyDetail.rootPostId,
    replyDetail.source,
  ]);

  useEffect(() => {
    if (Platform.OS !== "web" || typeof window === "undefined") {
      return;
    }

    const handlePopState = () => {
      setPendingWebRoute(`${window.location.pathname}${window.location.search}`);
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  useEffect(() => {
    if (!pendingWebRoute) {
      return;
    }

    const [pathname, search = ""] = pendingWebRoute.split("?");
    const resolvedRoute = parseWebRoute(pathname, search ? `?${search}` : "");

    if (resolvedRoute.kind === "screen") {
      isHandlingBrowserNavigation.current = true;
      if (resolvedRoute.screen === "top") {
        setActiveTimelineSection(resolvedRoute.timelineSection ?? "all");
      }
      if (resolvedRoute.screen === "search") {
        setSearchQuery(resolvedRoute.searchQuery ?? "");
        setActiveSearchTab("trending-posts");
        setActiveSearchContentFilter("all");
      }
      if (resolvedRoute.screen === "profile-edit") {
        setProfileDraft(profileState);
      }
      setCurrentScreen(resolvedRoute.screen);
      setIsMenuOpen(false);
      setPendingWebRoute(null);
      isHandlingBrowserNavigation.current = false;
      return;
    }

    if (resolvedRoute.kind === "profile") {
      const account =
        directoryAccounts.find(
          (item) => getHandleSlug(normalizeHandle(item.handle)) === resolvedRoute.handleSlug
        ) ??
        (authUser && getHandleSlug(profileState.handle) === resolvedRoute.handleSlug
          ? {
              id: authUser.uid,
              name: profileState.name,
              handle: profileState.handle,
              bio: profileState.bio,
              role: profileState.role,
              followers: profileState.followers,
              selectedSports: profileState.selectedSports,
            }
          : null);

      if (!account) {
        return;
      }

      isHandlingBrowserNavigation.current = true;
      openUserProfile({
        uid: account.id,
        name: account.name,
        role: account.role,
        bio: account.bio,
        handle: account.handle,
        followers: account.followers,
        selectedSports: account.selectedSports,
        historyMode: "replace",
      });
      setPendingWebRoute(null);
      isHandlingBrowserNavigation.current = false;
      return;
    }

    if (resolvedRoute.kind === "post") {
      const matchedPost = allSearchContentItems.find(
        (item) => item.source === resolvedRoute.source && item.id === resolvedRoute.id
      );
      if (!matchedPost) {
        return;
      }

      isHandlingBrowserNavigation.current = true;
      openPostDetail({
        detail: buildDetailStateFromSearchItem(matchedPost),
        backScreen: "top",
        historyMode: "replace",
      });
      setPendingWebRoute(null);
      isHandlingBrowserNavigation.current = false;
      return;
    }

    const rootReplies =
      resolvedRoute.source === "feed"
        ? feedTimeline.find((item) => item.id === resolvedRoute.rootPostId)?.replies
        : resolvedRoute.source === "questions"
          ? questionBoard.find((item) => item.id === resolvedRoute.rootPostId)?.replies
          : communityBoard.find((item) => item.id === resolvedRoute.rootPostId)?.replies;

    const targetReply = rootReplies
      ? findReplyByPath(rootReplies, resolvedRoute.path)
      : undefined;

    if (!targetReply) {
      return;
    }

    isHandlingBrowserNavigation.current = true;
    openReplyDetail({
      rootPostId: resolvedRoute.rootPostId,
      source: resolvedRoute.source,
      sourceLabel: getSourceLabel(resolvedRoute.source),
      path: resolvedRoute.path,
      reply: targetReply,
      backScreen: resolvedRoute.path.length > 1 ? "reply-detail" : "post-detail",
      historyMode: "replace",
    });
    setPendingWebRoute(null);
    isHandlingBrowserNavigation.current = false;
  }, [
    allSearchContentItems,
    authUser,
    communityBoard,
    directoryAccounts,
    feedTimeline,
    pendingWebRoute,
    profileState.bio,
    profileState.followers,
    profileState.handle,
    profileState.name,
    profileState.role,
    profileState.selectedSports,
    questionBoard,
  ]);

  useEffect(() => {
    if (Platform.OS !== "web" || typeof window === "undefined" || pendingWebRoute) {
      return;
    }

    updateBrowserPath({
      path: resolveScreenPath({
        currentScreen,
        activeTimelineSection,
        searchQuery,
        selectedProfileHandle: selectedUserProfile.handle,
        postDetail,
        replyDetail,
      }),
      mode: "replace",
    });
  }, [
    activeTimelineSection,
    currentScreen,
    pendingWebRoute,
    postDetail.id,
    postDetail.source,
    replyDetail.path,
    replyDetail.rootPostId,
    replyDetail.source,
    searchQuery,
    selectedUserProfile.handle,
  ]);

  const saveProfileEdits = async () => {
    clearAuthFeedback();

    if (!profileDraft.name || !profileDraft.handle || profileDraft.selectedSports.length === 0) {
      setAuthError("プロフィール名、表示ID、表示したい種目は入力してください。");
      return;
    }

    if (!authUser || !db) {
      setProfileState(profileDraft);
      setCurrentScreen("mypage");
      setAuthMessage("プロフィールを更新しました。");
      return;
    }

    try {
      const previousAvatarUrl = profileState.avatarUrl;
      const previousCoverUrl = profileState.coverUrl;
      const uploadedProfileIconUrl = profileDraft.avatarUrl
        ? await uploadProfileMedia({
            uid: authUser.uid,
            uri: profileDraft.avatarUrl,
            kind: "icon",
          })
        : "";
      const uploadedProfileCoverUrl = profileDraft.coverUrl
        ? await uploadProfileMedia({
            uid: authUser.uid,
            uri: profileDraft.coverUrl,
            kind: "cover",
          })
        : "";
      const filteredLinks = profileDraft.externalLinks.filter(
        (link) => link.label.trim() && link.url.trim()
      );
      const nextProfile = {
        ...profileDraft,
        link: buildProfileUrl(profileDraft.handle),
        avatarUrl: uploadedProfileIconUrl,
        coverUrl: uploadedProfileCoverUrl,
      };
      await saveProfileDocument(authUser.uid, {
        role: nextProfile.role.includes("顧問") ? "advisor" : "coach",
        roleLabel: nextProfile.role,
        profile: {
          nickname: nextProfile.name,
          handle: nextProfile.handle,
          bio: nextProfile.bio,
          link: nextProfile.link,
          iconUrl: uploadedProfileIconUrl,
          coverUrl: uploadedProfileCoverUrl,
          following: nextProfile.following,
          followers: nextProfile.followers,
          posts: nextProfile.posts,
          selectedSports: nextProfile.selectedSports,
          strengths: nextProfile.strengths,
          supportTopics: nextProfile.supportTopics,
          certifications: nextProfile.certifications,
          organization: nextProfile.organization,
          youtubeUrl: nextProfile.youtubeUrl,
          xUrl: nextProfile.xUrl,
          instagramUrl: nextProfile.instagramUrl,
          consultationAvailable: nextProfile.consultationAvailable,
          paidConsultationAvailable: nextProfile.paidConsultationAvailable,
          externalLinks: filteredLinks,
        },
        updatedAt: serverTimestamp(),
      });
      if (previousAvatarUrl && previousAvatarUrl !== uploadedProfileIconUrl) {
        await deleteStorageFileByUrl(previousAvatarUrl);
      }
      if (previousCoverUrl && previousCoverUrl !== uploadedProfileCoverUrl) {
        await deleteStorageFileByUrl(previousCoverUrl);
      }
      setProfileState(nextProfile);
      setProfileDraft(nextProfile);
      setCurrentScreen("mypage");
      setAuthMessage("プロフィールを更新しました。");
    } catch (error) {
      setAuthError(
        `画面上のプロフィールは更新しましたが、保存に失敗しました。${toSaveErrorMessage(
          error
        )}`
      );
    }
  };

  const deleteCurrentAccount = async () => {
    clearAuthFeedback();

    if (!authUser || !db) {
      setAuthError("アカウント削除にはログインが必要です。");
      return;
    }

    const lastSignInMs = authUser.metadata.lastSignInTime
      ? Date.parse(authUser.metadata.lastSignInTime)
      : undefined;
    if (
      typeof lastSignInMs === "number" &&
      !Number.isNaN(lastSignInMs) &&
      Date.now() - lastSignInMs > RECENT_LOGIN_MAX_AGE_MS
    ) {
      setAuthError(
        "安全のため、アカウント削除の前に一度ログインし直してください。"
      );
      setAccountDeleteConfirmStep("idle");
      return;
    }

    try {
      if (profileState.avatarUrl) {
        await deleteStorageFileByUrl(profileState.avatarUrl);
      }
      if (profileState.coverUrl) {
        await deleteStorageFileByUrl(profileState.coverUrl);
      }
      await deleteOwnedPostsAndMedia(authUser.uid);
      await deleteDoc(doc(db, "users", authUser.uid));
      await deleteUser(authUser);
      setProfileState(defaultProfileState);
      setProfileDraft(defaultProfileState);
      setPinnedPostKey(null);
      setCurrentScreen("top");
      setAuthMessage("アカウントを削除しました。");
    } catch (error) {
      const message =
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        error.code === "auth/requires-recent-login"
          ? "安全のため、アカウント削除の前に一度ログインし直してください。"
          : `アカウント削除に失敗しました。${toSaveErrorMessage(error)}`;
      setAuthError(message);
    } finally {
      setAccountDeleteConfirmStep("idle");
    }
  };

  const updateComposeState = (
    key: Exclude<keyof ComposeState, "selectedSports">,
    value: string
  ) => {
    setComposeState((current) => ({ ...current, [key]: value }));
  };

  const toggleComposeSport = (sport: string) => {
    setComposeState((current) => ({
      ...current,
      selectedSports: current.selectedSports.includes(sport)
        ? current.selectedSports.filter((item) => item !== sport)
        : [...current.selectedSports, sport],
      practiceMenu: {
        ...current.practiceMenu,
        sport:
          current.practiceMenu.sport ||
          (!current.selectedSports.includes(sport) ? sport : current.practiceMenu.sport),
      },
    }));
  };

  const updatePracticeMenuField = (
    key: Exclude<keyof PracticeMenuTemplate, "conditionTags">,
    value: string
  ) => {
    setComposeState((current) => ({
      ...current,
      practiceMenu: {
        ...current.practiceMenu,
        [key]: value,
      },
    }));
  };

  const togglePracticeMenuCondition = (key: TodayMenuConditionKey) => {
    setComposeState((current) => ({
      ...current,
      practiceMenu: {
        ...current.practiceMenu,
        conditionTags: current.practiceMenu.conditionTags.includes(key)
          ? current.practiceMenu.conditionTags.filter((item) => item !== key)
          : [...current.practiceMenu.conditionTags, key],
      },
    }));
  };

  const toggleTodayMenuCondition = (key: TodayMenuConditionKey) => {
    setTodayMenuConditions((current) =>
      current.includes(key)
        ? current.filter((item) => item !== key)
        : [...current, key]
    );
  };

  const addProfileLink = () => {
    setProfileDraft((current) => ({
      ...current,
      externalLinks: [...current.externalLinks, createLinkRow(current.externalLinks.length + 1)],
    }));
  };

  const updateProfileLink = (
    id: string,
    key: keyof Omit<ExternalLink, "id">,
    value: string
  ) => {
    setProfileDraft((current) => ({
      ...current,
      externalLinks: current.externalLinks.map((link) =>
        link.id === id ? { ...link, [key]: value } : link
      ),
    }));
  };

  const applyComposeFormatting = (action: RichFormatAction) => {
    setComposeState((current) => {
      const next = applyRichFormatting(current.body, composeBodySelection, action);
      setComposeBodySelection(next.selection);
      return {
        ...current,
        body: next.value,
      };
    });
  };

  const applyReplyFormatting = (action: RichFormatAction) => {
    const next = applyRichFormatting(replyDraft, replySelection, action);
    setReplyDraft(next.value);
    setReplySelection(next.selection);
  };

  const openUserProfile = ({
    uid,
    name,
    role,
    bio,
    handle,
    selectedSports,
    followers,
    strengths,
    supportTopics,
    certifications,
    organization,
    youtubeUrl,
    xUrl,
    instagramUrl,
    consultationAvailable,
    paidConsultationAvailable,
    historyMode = "push",
  }: {
    uid?: string;
    name: string;
    role: string;
    bio?: string;
    handle?: string;
    selectedSports?: string[];
    followers?: string;
    strengths?: string;
    supportTopics?: string;
    certifications?: string;
    organization?: string;
    youtubeUrl?: string;
    xUrl?: string;
    instagramUrl?: string;
    consultationAvailable?: boolean;
    paidConsultationAvailable?: boolean;
    historyMode?: "push" | "replace";
  }) => {
    const directoryAccount = uid
      ? directoryAccounts.find((account) => account.id === uid)
      : undefined;
    const authoredPosts = allSearchContentItems.filter((item) =>
      uid
        ? item.createdByUid === uid || (!item.createdByUid && item.author === name)
        : item.author === name
    );
    const primarySports =
      selectedSports && selectedSports.length > 0
        ? selectedSports
        : Array.from(new Set(authoredPosts.flatMap((post) => post.sports))).slice(0, 3);
    setSelectedUserProfile({
      uid,
      name,
      handle: handle ?? createHandleFromName(name),
      role,
      bio: bio ?? "",
      link: buildProfileUrl(handle ?? createHandleFromName(name)),
      externalLinks: uid ? directoryMetaMap[uid]?.externalLinks ?? [] : [],
      avatarUrl: uid ? directoryMetaMap[uid]?.iconUrl ?? "" : "",
      coverUrl: uid ? directoryMetaMap[uid]?.coverUrl ?? "" : "",
      joined: "2026年4月からKomonityを利用",
      following:
        uid && followingCountMap[uid] !== undefined
          ? String(followingCountMap[uid])
          : "0",
      followers:
        uid && followerCountMap[uid] !== undefined
          ? String(followerCountMap[uid])
          : followers ?? "0",
      posts: String(authoredPosts.length),
      selectedSports: primarySports.length > 0 ? primarySports : ["その他"],
      strengths: strengths ?? directoryAccount?.strengths ?? "",
      supportTopics: supportTopics ?? directoryAccount?.supportTopics ?? "",
      certifications: certifications ?? directoryAccount?.certifications ?? "",
      organization: organization ?? directoryAccount?.organization ?? "",
      youtubeUrl: youtubeUrl ?? directoryAccount?.youtubeUrl ?? "",
      xUrl: xUrl ?? directoryAccount?.xUrl ?? "",
      instagramUrl: instagramUrl ?? directoryAccount?.instagramUrl ?? "",
      consultationAvailable:
        consultationAvailable ?? directoryAccount?.consultationAvailable ?? false,
      paidConsultationAvailable:
        paidConsultationAvailable ?? directoryAccount?.paidConsultationAvailable ?? false,
      avatarLabel: name.slice(0, 1),
      coverTone: createCoverToneFromName(name),
    });
    setActiveProfileTab("posts");
    setCurrentScreen("user-profile");
    setIsMenuOpen(false);
    updateBrowserPath({
      path: buildProfilePath(handle ?? createHandleFromName(name)),
      mode: historyMode,
    });
  };

  const isFollowingSelectedProfile = selectedUserProfile.uid
    ? currentFollowingUserIds.includes(selectedUserProfile.uid)
    : false;

  const toggleFollowProfile = async ({
    targetUid,
    targetName,
  }: {
    targetUid: string;
    targetName: string;
  }) => {
    clearAuthFeedback();

    if (!authUser || !db) {
      setAuthError("フォローするにはログインが必要です。");
      return;
    }

    if (authUser.uid === targetUid) {
      setAuthError("自分自身をフォローすることはできません。");
      return;
    }

    const followDocId = `${authUser.uid}__${targetUid}`;
    const followDocRef = doc(db, COLLECTIONS.follows, followDocId);
    const alreadyFollowing = currentFollowingUserIds.includes(targetUid);

    try {
      if (alreadyFollowing) {
        await deleteDoc(followDocRef);
        setAuthMessage(`${targetName} のフォローを解除しました。`);
      } else {
        await setDoc(followDocRef, {
          followerUid: authUser.uid,
          followerName: profileState.name,
          followingUid: targetUid,
          followingName: targetName,
          createdAt: serverTimestamp(),
        });
        setAuthMessage(`${targetName} をフォローしました。`);
      }
    } catch (error) {
      setAuthError(`フォロー操作に失敗しました。${toSaveErrorMessage(error)}`);
    }
  };

  const toggleBlockUser = async ({
    targetUid,
    targetName,
  }: {
    targetUid?: string;
    targetName: string;
  }) => {
    clearAuthFeedback();

    if (!authUser || !db || !targetUid) {
      setAuthError("この操作にはログインが必要です。");
      return;
    }

    if (authUser.uid === targetUid) {
      setAuthError("自分自身をブロックすることはできません。");
      return;
    }

    const blockId = `${authUser.uid}__${targetUid}`;
    const blockRef = doc(db, COLLECTIONS.blocks, blockId);
    const blocked = currentBlockedUserIds.includes(targetUid);

    try {
      if (blocked) {
        await deleteDoc(blockRef);
        setAuthMessage(`${targetName} のブロックを解除しました。`);
      } else {
        await setDoc(blockRef, {
          blockerUid: authUser.uid,
          blockedUid: targetUid,
          createdAt: serverTimestamp(),
        });
        setAuthMessage(`${targetName} をブロックしました。`);
      }
    } catch (error) {
      setAuthError(`ブロック操作に失敗しました。${toSaveErrorMessage(error)}`);
    }
  };

  const reportUserAsSpam = async ({
    targetUid,
    targetName,
    reason,
  }: {
    targetUid?: string;
    targetName: string;
    reason: string;
  }) => {
    clearAuthFeedback();

    if (!authUser || !db || !targetUid) {
      setAuthError("この操作にはログインが必要です。");
      return;
    }

    if (!reason.trim()) {
      setAuthError("報告理由を入力してください。");
      return;
    }

    try {
      await addDoc(collection(db, COLLECTIONS.reports), {
        reporterUid: authUser.uid,
        targetUid,
        targetName,
        createdAt: serverTimestamp(),
        reason: reason.trim(),
      });
      await queueSupportEmail({
        subject: `[Komonity スパム報告] ${targetName}`,
        replyTo: authUser.email ?? undefined,
        text: [
          `報告者UID: ${authUser.uid}`,
          `報告者メールアドレス: ${authUser.email ?? "未設定"}`,
          `報告対象UID: ${targetUid}`,
          `報告対象名: ${targetName}`,
          "",
          "報告理由:",
          reason.trim(),
        ].join("\n"),
      });
      setAuthMessage(`${targetName} をスパムとして報告しました。`);
    } catch (error) {
      setAuthError(`報告に失敗しました。${toSaveErrorMessage(error)}`);
    }
  };

  const togglePostAlertsForUser = async ({
    targetUid,
    targetName,
  }: {
    targetUid?: string;
    targetName: string;
  }) => {
    clearAuthFeedback();

    if (!authUser || !db || !targetUid) {
      setAuthError("この操作にはログインが必要です。");
      return;
    }

    const alertId = `${authUser.uid}__${targetUid}`;
    const alertRef = doc(db, COLLECTIONS.alerts, alertId);
    const enabled = currentPostAlertUserIds.includes(targetUid);

    try {
      if (enabled) {
        await deleteDoc(alertRef);
        setAuthMessage(`${targetName} の投稿通知を解除しました。`);
      } else {
        await setDoc(alertRef, {
          watcherUid: authUser.uid,
          targetUid,
          createdAt: serverTimestamp(),
        });
        setAuthMessage(`${targetName} の新しい投稿を通知一覧で確認できるようにしました。`);
      }
    } catch (error) {
      setAuthError(`通知設定に失敗しました。${toSaveErrorMessage(error)}`);
    }
  };

  const openUserActionMenu = (targetUid?: string, targetName?: string) => {
    setSpamReasonDraft("");
    setUserActionMenuState({
      open: true,
      targetUid,
      targetName: targetName ?? "",
    });
  };

  const closeUserActionMenu = () => {
    setUserActionMenuState(INITIAL_USER_ACTION_MENU_STATE);
    setSpamReasonDraft("");
  };

  const togglePinnedPost = async (post: ProfilePostItem) => {
    clearAuthFeedback();

    if (!authUser || !db) {
      setAuthError("固定投稿の設定にはログインが必要です。");
      return;
    }

    const nextPinnedKey =
      pinnedPostKey === `${post.source}:${post.id}` ? null : `${post.source}:${post.id}`;

    setPinnedPostKey(nextPinnedKey);

    try {
      await setDoc(
        doc(db, "users", authUser.uid),
        {
          profile: {
            pinnedPostId: nextPinnedKey ? post.id : "",
            pinnedPostSource: nextPinnedKey ? post.source : "",
          },
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
      setAuthMessage(nextPinnedKey ? "投稿をプロフィール上部に固定しました。" : "固定投稿を解除しました。");
    } catch (error) {
      setPinnedPostKey(pinnedPostKey);
      setAuthError(`固定投稿の設定に失敗しました。${toSaveErrorMessage(error)}`);
    }
  };

  const openRelationshipList = ({
    mode,
    targetUid,
    title,
    backScreen,
    historyMode = "push",
  }: {
    mode: "following" | "followers";
    targetUid?: string;
    title: string;
    backScreen: "mypage" | "user-profile";
    historyMode?: "push" | "replace";
  }) => {
    if (!targetUid) {
      return;
    }

    const targetIds =
      mode === "following"
        ? followRecords
            .filter((record) => record.followerUid === targetUid)
            .map((record) => record.followingUid)
        : followRecords
            .filter((record) => record.followingUid === targetUid)
            .map((record) => record.followerUid);

    const accounts = targetIds
      .map((uid) => accountDirectory.get(uid))
      .filter((account): account is SearchAccountItem => Boolean(account));

    setRelationshipListState({
      mode,
      title,
      accounts,
      backScreen,
    });
    setCurrentScreen("relationship-list");
    updateBrowserPath({
      path: staticScreenPathMap["relationship-list"] ?? "/",
      mode: historyMode,
    });
  };

  const openPostDetail = ({
    detail,
    backScreen,
    historyMode = "push",
  }: {
    detail: PostDetailState;
    backScreen: ScreenKey;
    historyMode?: "push" | "replace";
  }) => {
    setPostDetail(detail);
    setPostDetailBackScreen(backScreen);
    setReplyDraft("");
    setReplyMedia([]);
    setCurrentScreen("post-detail");
    setIsMenuOpen(false);
    updateBrowserPath({
      path: buildPostPath(detail.source, detail.id),
      mode: historyMode,
    });
  };

  const openReplyDetail = ({
    rootPostId,
    source,
    sourceLabel,
    path,
    reply,
    backScreen,
    historyMode = "push",
  }: ReplyDetailState & { historyMode?: "push" | "replace" }) => {
    setReplyDetail({
      rootPostId,
      source,
      sourceLabel,
      path,
      reply,
      backScreen,
    });
    setReplyDraft("");
    setReplyMedia([]);
    setCurrentScreen("reply-detail");
    setIsMenuOpen(false);
    updateBrowserPath({
      path: buildReplyPath(source, rootPostId, path),
      mode: historyMode,
    });
  };

  const goBackFromReplyDetail = () => {
    if (replyDetail.path.length <= 1) {
      setCurrentScreen(replyDetail.backScreen);
      return;
    }

    const parentPath = replyDetail.path.slice(0, -1);
    const rootReplies =
      replyDetail.source === "feed"
        ? feedTimeline.find((item) => item.id === replyDetail.rootPostId)?.replies
        : replyDetail.source === "questions"
          ? questionBoard.find((item) => item.id === replyDetail.rootPostId)?.replies
          : communityBoard.find((item) => item.id === replyDetail.rootPostId)?.replies;

    const parentReply = rootReplies ? findReplyByPath(rootReplies, parentPath) : undefined;
    if (!parentReply) {
      setCurrentScreen("post-detail");
      return;
    }

    setReplyDetail((current) => ({
      ...current,
      path: parentPath,
      reply: parentReply,
      backScreen: parentPath.length > 1 ? "reply-detail" : "post-detail",
    }));
  };

  const updatePostRepliesLocally = ({
    source,
    rootPostId,
    replies,
  }: {
    source: SearchContentFilterKey;
    rootPostId: string;
    replies: Reply[];
  }) => {
    if (source === "feed") {
      setFeedTimeline((current) =>
        current.map((item) =>
          item.id === rootPostId
            ? {
                ...item,
                replies,
                comments: replies.length,
              }
            : item
        )
      );
      return;
    }

    if (source === "questions") {
      setQuestionBoard((current) =>
        current.map((item) =>
          item.id === rootPostId
            ? {
                ...item,
                replies,
                answers: replies.length,
              }
            : item
        )
      );
      return;
    }

    setCommunityBoard((current) =>
      current.map((item) => (item.id === rootPostId ? { ...item, replies } : item))
    );
  };

  const togglePostInteraction = async ({
    collectionName,
    detail,
  }: {
    collectionName:
      | typeof COLLECTIONS.likes
      | typeof COLLECTIONS.reposts
      | typeof COLLECTIONS.bookmarks;
    detail: PostDetailState;
  }) => {
    clearAuthFeedback();

    if (!authUser || !db) {
      setAuthError("この操作にはログインが必要です。");
      return;
    }

    const recordId = `${authUser.uid}__${detail.source}__${detail.id}`;
    const recordRef = doc(db, collectionName, recordId);
    const nextRecord = buildInteractionRecord({
      id: recordId,
      userUid: authUser.uid,
      postId: detail.id,
      source: detail.source,
      createdAtMs: Date.now(),
    });
    const existingRecords =
      collectionName === COLLECTIONS.likes
        ? likeRecords
        : collectionName === COLLECTIONS.reposts
          ? repostRecords
          : bookmarkRecords;
    const alreadyExists = existingRecords.some((record) => record.id === recordId);

    const applyLocalChange = (shouldAdd: boolean) => {
      if (collectionName === COLLECTIONS.likes) {
        setLikeRecords((current) =>
          shouldAdd
            ? [...current, nextRecord]
            : current.filter((record) => record.id !== recordId)
        );
        return;
      }

      if (collectionName === COLLECTIONS.reposts) {
        setRepostRecords((current) =>
          shouldAdd
            ? [...current, nextRecord]
            : current.filter((record) => record.id !== recordId)
        );
        return;
      }

      setBookmarkRecords((current) =>
        shouldAdd
          ? [...current, nextRecord]
          : current.filter((record) => record.id !== recordId)
      );
    };

    applyLocalChange(!alreadyExists);

    try {
      if (alreadyExists) {
        await deleteDoc(recordRef);
      } else {
        await setDoc(recordRef, {
          userUid: authUser.uid,
          postId: detail.id,
          source: detail.source,
          createdAt: serverTimestamp(),
        });
      }
    } catch (error) {
      applyLocalChange(alreadyExists);
      setAuthError(`操作に失敗しました。${toSaveErrorMessage(error)}`);
    }
  };

  const submitReply = async () => {
    clearAuthFeedback();

    if (!authUser || !db) {
      setAuthError("返信するにはログインが必要です。");
      return;
    }

    if (!replyDraft.trim()) {
      setAuthError("返信内容を入力してください。");
      return;
    }

    if (replyDraft.length > REPLY_BODY_MAX_LENGTH) {
      setAuthError(`返信本文は${REPLY_BODY_MAX_LENGTH}文字以内で入力してください。`);
      return;
    }

    const isReplyTarget = currentScreen === "reply-detail";
    const rootPostId = isReplyTarget ? replyDetail.rootPostId : postDetail.id;
    const replyPath = isReplyTarget ? replyDetail.path : [];
    const replySource = isReplyTarget ? replyDetail.source : postDetail.source;
    const previousReplies =
      replySource === "feed"
        ? feedTimeline.find((item) => item.id === rootPostId)?.replies ?? []
        : replySource === "questions"
          ? questionBoard.find((item) => item.id === rootPostId)?.replies ?? []
          : communityBoard.find((item) => item.id === rootPostId)?.replies ?? [];
    const collectionName = getPostCollectionFromSource(replySource);
    const docRef = doc(db, collectionName, rootPostId);

    setIsReplySubmitting(true);

    try {
      const uploadedReplyMedia = await uploadReplyMedia(authUser.uid);
      const nextReply: Reply = {
        id: `reply-${Date.now()}`,
        author: profileState.name,
        authorHandle: profileState.handle,
        createdByUid: authUser.uid,
        body: replyDraft.trim(),
        media: uploadedReplyMedia,
        replies: [],
      };
      const nextReplies = appendReplyToPath(previousReplies, replyPath, nextReply);
      const payload: Record<string, unknown> = {
        replies: serializeRepliesForFirestore(nextReplies),
        updatedAt: serverTimestamp(),
      };

      if (replySource === "feed") {
        payload.comments = nextReplies.length;
      }

      if (replySource === "questions") {
        payload.answers = nextReplies.length;
      }

      updatePostRepliesLocally({
        source: replySource,
        rootPostId,
        replies: nextReplies,
      });
      if (!isReplyTarget) {
        setPostDetail((current) => ({
          ...current,
          replies: nextReplies,
          comments: current.source === "feed" ? nextReplies.length : current.comments,
          answers: current.source === "questions" ? nextReplies.length : current.answers,
        }));
      }

      await setDoc(docRef, payload, { merge: true });
      setReplyDraft("");
      setReplyMedia([]);
      setReplySelection(INITIAL_SELECTION);
      setAuthMessage("返信を投稿しました。");
    } catch (error) {
      updatePostRepliesLocally({
        source: replySource,
        rootPostId,
        replies: previousReplies,
      });
      if (!isReplyTarget) {
        setPostDetail((current) => ({
          ...current,
          replies: previousReplies,
          comments: current.source === "feed" ? previousReplies.length : current.comments,
          answers: current.source === "questions" ? previousReplies.length : current.answers,
        }));
      }
      setAuthError(`返信に失敗しました。${toSaveErrorMessage(error)}`);
    } finally {
      setIsReplySubmitting(false);
    }
  };

  const confirmBestAnswer = async () => {
    if (!bestAnswerCandidate || !authUser || !db || postDetail.source !== "questions") {
      return;
    }

    clearAuthFeedback();

    if (postDetail.bestAnswerReplyId) {
      setBestAnswerCandidate(null);
      setAuthError("ベストアンサーはすでに登録されています。");
      return;
    }

    const isQuestionOwner =
      (postDetail.createdByUid && postDetail.createdByUid === authUser.uid) ||
      postDetail.author === profileState.name;

    if (!isQuestionOwner) {
      setBestAnswerCandidate(null);
      setAuthError("ベストアンサーを登録できるのは相談投稿者のみです。");
      return;
    }

    const previousBestAnswer =
      postDetail.bestAnswer ?? "まだベストアンサーはありません。";
    const previousBestAnswerReplyId = postDetail.bestAnswerReplyId;
    const payload = {
      bestAnswer: bestAnswerCandidate.body,
      bestAnswerReplyId: bestAnswerCandidate.id,
      updatedAt: serverTimestamp(),
    };

    setBestAnswerCandidate(null);
    setPostDetail((current) => ({
      ...current,
      bestAnswer: bestAnswerCandidate.body,
      bestAnswerReplyId: bestAnswerCandidate.id,
    }));
    setQuestionBoard((current) =>
      current.map((question) =>
        question.id === postDetail.id
          ? {
              ...question,
              bestAnswer: bestAnswerCandidate.body,
              bestAnswerReplyId: bestAnswerCandidate.id,
            }
          : question
      )
    );

    try {
      await setDoc(doc(db, COLLECTIONS.questions, postDetail.id), payload, {
        merge: true,
      });
      setAuthMessage("ベストアンサーを登録しました。");
    } catch (error) {
      setPostDetail((current) => ({
        ...current,
        bestAnswer: previousBestAnswer,
        bestAnswerReplyId: previousBestAnswerReplyId,
      }));
      setQuestionBoard((current) =>
        current.map((question) =>
          question.id === postDetail.id
            ? {
                ...question,
                bestAnswer: previousBestAnswer,
                bestAnswerReplyId: previousBestAnswerReplyId,
              }
            : question
        )
      );
      setAuthError(`ベストアンサー登録に失敗しました。${toSaveErrorMessage(error)}`);
    }
  };

  const submitPost = async () => {
    clearAuthFeedback();

    if (!authUser) {
      setAuthError("投稿するにはログインが必要です。");
      return;
    }

    if (!composeState.title || !composeState.body) {
      setAuthError("タイトルと本文を入力してください。");
      return;
    }

    if (composeState.title.length > POST_TITLE_MAX_LENGTH) {
      setAuthError(`タイトルは${POST_TITLE_MAX_LENGTH}文字以内で入力してください。`);
      return;
    }

    if (composeState.body.length > POST_BODY_MAX_LENGTH) {
      setAuthError(`本文は${POST_BODY_MAX_LENGTH}文字以内で入力してください。`);
      return;
    }

    const selectedComposeSports =
      composeState.target === "feed"
        ? composeState.selectedSports
        : profileState.selectedSports;

    if (profileState.role.includes("指導員") && selectedComposeSports.length === 0) {
      setAuthError("投稿する種目を1つ以上選択してください。");
      return;
    }

    if (profileState.role.includes("指導員") && composeState.target === "feed") {
      const menu = composeState.practiceMenu;
      const requiredPracticeFields = [
        menu.sport,
        menu.targetLevel,
        menu.grade,
        menu.participants,
        menu.durationMinutes,
        menu.tools,
        menu.purpose,
        menu.steps,
        menu.cautions,
        menu.commonMistakes,
        menu.arrangements,
      ];
      if (requiredPracticeFields.some((value) => !value.trim())) {
        setAuthError("練習メニュー投稿テンプレの項目をすべて入力してください。");
        return;
      }
    }

    if (!db || !storage) {
      setAuthError(
        "投稿設定が未完了です。管理者に設定状況を確認してください。"
      );
      return;
    }

    setIsPublishing(true);

    try {
      const uploadedMedia = await uploadComposeMedia(authUser.uid);

      if (composeState.target === "feed") {
        await addDoc(collection(db, COLLECTIONS.feed), {
          type: "feed",
          author: profileState.name,
          authorHandle: profileState.handle,
          role: profileState.role,
          title: composeState.title,
          body: composeState.body,
          tags: ["新規投稿"],
          sports: selectedComposeSports.length > 0 ? selectedComposeSports : ["その他"],
          likes: 0,
          reposts: 0,
          comments: 0,
          replies: [],
          media: uploadedMedia,
          practiceMenu: serializePracticeMenuForFirestore(composeState.practiceMenu),
          createdByUid: authUser.uid,
          visibility: "public",
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      setCurrentScreen("top");
      }

      if (composeState.target === "questions") {
        await addDoc(collection(db, COLLECTIONS.questions), {
          type: "question",
          category: profileState.selectedSports[0] ?? "その他",
          title: composeState.title,
          body: composeState.body,
          author: profileState.name,
          authorHandle: profileState.handle,
          role: profileState.role,
          answers: 0,
          bestAnswer: "まだベストアンサーはありません。",
          replies: [],
          media: uploadedMedia,
          sports: selectedComposeSports.length > 0 ? selectedComposeSports : ["その他"],
          createdByUid: authUser.uid,
          visibility: "public",
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        setCurrentScreen("questions");
      }

      if (composeState.target === "community") {
        await addDoc(collection(db, COLLECTIONS.community), {
          type: "community",
          title: composeState.title,
          author: profileState.name,
          authorHandle: profileState.handle,
          role: profileState.role,
          body: composeState.body,
          cta: "スレッドを見る",
          replies: [],
          media: uploadedMedia,
          sports: selectedComposeSports.length > 0 ? selectedComposeSports : ["その他"],
          createdByUid: authUser.uid,
          visibility: "public",
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        setCurrentScreen("community");
      }

      setComposeState(initialComposeState);
      setComposeMedia([]);
      setComposeBodySelection(INITIAL_SELECTION);
      setAuthMessage("投稿を作成しました。公開一覧にも反映されます。");
    } catch (error) {
      setAuthError(`投稿保存に失敗しました。${toSaveErrorMessage(error)}`);
    } finally {
      setIsPublishing(false);
    }
  };

  const timelineSwipePanResponder = useTimelineSwipe({
    activeTimelineSection,
    timelineSections,
    setActiveTimelineSection,
  });

  return (
    <AppRouter
      styles={styles}
      currentScreen={currentScreen}
      isMenuOpen={isMenuOpen}
      setIsMenuOpen={setIsMenuOpen}
      goToScreen={goToScreen}
      setCurrentScreen={setCurrentScreen}
      authUser={authUser}
      authUserUid={authUser?.uid}
      authMessage={authMessage}
      authError={authError}
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
      setActiveTimelineSection={setActiveTimelineSection}
      openUserProfile={openUserProfile}
      openPostDetail={openPostDetail}
      toggleExpandedBody={toggleExpandedBody}
      requestOpenExternalUrl={requestOpenExternalUrl}
      togglePostInteraction={togglePostInteraction}
      renderHashtagChips={renderHashtagChips}
      overviewStats={overviewStats}
      handleLogout={handleLogout}
      renderPracticeMenu={renderPracticeMenu}
      trendingCoaches={trendingCoaches}
      profileState={profileState}
      postDetail={postDetail}
      postDetailBackScreen={postDetailBackScreen}
      isPostDetailLiked={isPostDetailLiked}
      isPostDetailReposted={isPostDetailReposted}
      isPostDetailBookmarked={isPostDetailBookmarked}
      postDetailLikeCount={postDetailLikeCount}
      postDetailRepostCount={postDetailRepostCount}
      postDetailBookmarkCount={postDetailBookmarkCount}
      isPostDetailQuestionOwner={isPostDetailQuestionOwner}
      replyDraft={replyDraft}
      replySelection={replySelection}
      replyMedia={replyMedia}
      isReplySubmitting={isReplySubmitting}
      getReplyInteractionSummary={getReplyInteractionSummary}
      openReplyDetail={openReplyDetail}
      deletePostFromDetail={deletePostFromDetail}
      setReplyDraft={setReplyDraft}
      setReplySelection={setReplySelection}
      applyReplyFormatting={applyReplyFormatting}
      pickReplyMedia={pickReplyMedia}
      removeReplyMedia={removeReplyMedia}
      submitReply={submitReply}
      setBestAnswerCandidate={setBestAnswerCandidate}
      replyDetail={replyDetail}
      goBackFromReplyDetail={goBackFromReplyDetail}
      accountDeleteConfirmStep={accountDeleteConfirmStep}
      bestAnswerCandidate={bestAnswerCandidate}
      badgeModalState={badgeModalState}
      externalLinkModalState={externalLinkModalState}
      setAccountDeleteConfirmStep={setAccountDeleteConfirmStep}
      deleteCurrentAccount={deleteCurrentAccount}
      confirmBestAnswer={confirmBestAnswer}
      setBadgeModalState={setBadgeModalState}
      closeExternalLinkModal={closeExternalLinkModal}
      confirmOpenExternalUrl={confirmOpenExternalUrl}
      notificationItems={notificationItems}
      composeState={composeState}
      composeMedia={composeMedia}
      composeBodySelection={composeBodySelection}
      isPublishing={isPublishing}
      updateComposeState={updateComposeState}
      updatePracticeMenuField={updatePracticeMenuField}
      toggleComposeSport={toggleComposeSport}
      togglePracticeMenuCondition={togglePracticeMenuCondition}
      applyComposeFormatting={applyComposeFormatting}
      setComposeBodySelection={setComposeBodySelection}
      pickComposeMedia={pickComposeMedia}
      removeComposeMedia={removeComposeMedia}
      submitPost={submitPost}
      searchQuery={searchQuery}
      activeSearchTab={activeSearchTab}
      activeSearchContentFilter={activeSearchContentFilter}
      todayMenuConditions={todayMenuConditions}
      trendingSearchPosts={trendingSearchPosts}
      recentSearchPosts={recentSearchPosts}
      searchAccounts={searchAccounts}
      currentFollowingUserIds={currentFollowingUserIds}
      setSearchQuery={setSearchQuery}
      setActiveSearchTab={setActiveSearchTab}
      setActiveSearchContentFilter={setActiveSearchContentFilter}
      toggleTodayMenuCondition={toggleTodayMenuCondition}
      toggleFollowProfile={toggleFollowProfile}
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
      renderCoachProfileDetails={renderCoachProfileDetails}
      openRelationshipList={openRelationshipList}
      relationshipListState={relationshipListState}
      selectedUserProfile={selectedUserProfile}
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
      openUserActionMenu={openUserActionMenu}
      setActiveProfileTab={setActiveProfileTab}
      togglePinnedPost={togglePinnedPost}
      profileDraft={profileDraft}
      pickImage={pickImage}
      setProfileDraft={setProfileDraft}
      updateProfileDraft={updateProfileDraft}
      updateProfileAvailability={updateProfileAvailability}
      updateProfileLink={updateProfileLink}
      addProfileLink={addProfileLink}
      toggleProfileSport={toggleProfileSport}
      saveProfileEdits={saveProfileEdits}
      advisorForm={advisorForm}
      advisorIconUri={advisorIconUri}
      advisorCoverUri={advisorCoverUri}
      isSubmitting={isSubmitting}
      getAdvisorFieldKey={getAdvisorFieldKey}
      getAdvisorFieldValue={getAdvisorFieldValue}
      updateAdvisorForm={updateAdvisorForm}
      toggleAdvisorSport={toggleAdvisorSport}
      registerAdvisor={registerAdvisor}
      setAdvisorIconUri={setAdvisorIconUri}
      setAdvisorCoverUri={setAdvisorCoverUri}
      coachForm={coachForm}
      coachIconUri={coachIconUri}
      coachCoverUri={coachCoverUri}
      coachLinks={coachLinks}
      getCoachFieldKey={getCoachFieldKey}
      getCoachFieldValue={getCoachFieldValue}
      updateCoachForm={updateCoachForm}
      toggleCoachSport={toggleCoachSport}
      updateCoachLink={updateCoachLink}
      addCoachLink={addCoachLink}
      registerCoach={registerCoach}
      setCoachIconUri={setCoachIconUri}
      setCoachCoverUri={setCoachCoverUri}
      loginForm={loginForm}
      updateLoginForm={updateLoginForm}
      handleLogin={handleLogin}
      forgotPasswordEmail={forgotPasswordEmail}
      setForgotPasswordEmail={setForgotPasswordEmail}
      handleForgotPassword={handleForgotPassword}
      contactForm={contactForm}
      updateContactForm={updateContactForm}
      submitContactInquiry={submitContactInquiry}
      userActionMenuState={userActionMenuState}
      spamReasonDraft={spamReasonDraft}
      currentPostAlertUserIds={currentPostAlertUserIds}
      currentBlockedUserIds={currentBlockedUserIds}
      setSpamReasonDraft={setSpamReasonDraft}
      closeUserActionMenu={closeUserActionMenu}
      togglePostAlertsForUser={togglePostAlertsForUser}
      toggleBlockUser={toggleBlockUser}
      reportUserAsSpam={reportUserAsSpam}
    />
  );
}
