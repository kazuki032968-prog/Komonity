export type ScreenKey =
  | "top"
  | "service-detail"
  | "feed"
  | "post-detail"
  | "reply-detail"
  | "following-feed"
  | "relationship-list"
  | "questions"
  | "experts"
  | "community"
  | "mypage"
  | "user-profile"
  | "notifications"
  | "search"
  | "post-compose"
  | "profile-edit"
  | "registration-role"
  | "advisor-registration"
  | "coach-registration"
  | "login"
  | "forgot-password"
  | "contact"
  | "privacy-policy"
  | "terms";

export type ExternalLink = {
  id: string;
  label: string;
  url: string;
};

export type AdvisorFormState = {
  nickname: string;
  handle: string;
  club: string;
  experience: string;
  loginEmail: string;
  loginPassword: string;
  selectedSports: string[];
};

export type CoachFormState = {
  nickname: string;
  handle: string;
  specialty: string;
  experience: string;
  achievements: string;
  strengths: string;
  supportTopics: string;
  certifications: string;
  organization: string;
  youtubeUrl: string;
  xUrl: string;
  instagramUrl: string;
  consultationAvailable: string;
  paidConsultationAvailable: string;
  phone: string;
  publicEmail: string;
  loginEmail: string;
  loginPassword: string;
  selectedSports: string[];
};

export type LoginFormState = {
  email: string;
  password: string;
};

export type ContactFormState = {
  email: string;
  subject: string;
  body: string;
};

export type UserActionMenuState = {
  open: boolean;
  targetUid?: string;
  targetName: string;
};

export type AccountDeleteConfirmStep = "idle" | "confirm-first" | "confirm-final";

export type ProfileState = {
  name: string;
  handle: string;
  role: string;
  bio: string;
  link: string;
  avatarUrl: string;
  coverUrl: string;
  externalLinks: ExternalLink[];
  joined: string;
  following: string;
  followers: string;
  posts: string;
  selectedSports: string[];
  strengths: string;
  supportTopics: string;
  certifications: string;
  organization: string;
  youtubeUrl: string;
  xUrl: string;
  instagramUrl: string;
  consultationAvailable: boolean;
  paidConsultationAvailable: boolean;
};

export type UserProfileState = ProfileState & {
  uid?: string;
  avatarLabel: string;
  verified?: boolean;
  coverTone: string;
};

export type SearchTabKey = "trending-posts" | "recent" | "accounts";
export type SearchContentFilterKey = "all" | "feed" | "questions" | "community";
export type TimelineSectionKey = "all" | "feed" | "questions" | "community" | "following";

export type Reply = {
  id: string;
  author: string;
  authorHandle?: string;
  createdByUid?: string;
  body: string;
  likes?: number;
  reposts?: number;
  bookmarks?: number;
  media?: MediaAttachment[];
  replies?: Reply[];
};

export type MediaKind = "image" | "video";

export type MediaAttachment = {
  kind: MediaKind;
  url: string;
  fileName: string;
  mimeType?: string;
  storagePath?: string;
  width?: number;
  height?: number;
};

export type LocalMediaAsset = {
  id: string;
  uri: string;
  kind: MediaKind;
  fileName: string;
  mimeType?: string;
  width?: number;
  height?: number;
  sizeBytes?: number;
};

export type FeedPost = {
  id: string;
  author: string;
  role: string;
  title: string;
  body: string;
  tags: string[];
  sports: string[];
  likes: number;
  reposts: number;
  comments: number;
  replies: Reply[];
  media?: MediaAttachment[];
  practiceMenu?: PracticeMenuTemplate;
  createdByUid?: string;
  authorHandle?: string;
  createdAtMs?: number;
  isDeleted?: boolean;
};

export type QuestionPost = {
  id: string;
  category: string;
  title: string;
  body: string;
  author: string;
  answers: number;
  bestAnswer: string;
  replies: Reply[];
  media?: MediaAttachment[];
  createdByUid?: string;
  authorHandle?: string;
  bestAnswerReplyId?: string;
  createdAtMs?: number;
  isDeleted?: boolean;
};

export type CommunityPost = {
  id: string;
  title: string;
  author: string;
  body: string;
  cta: string;
  replies: Reply[];
  media?: MediaAttachment[];
  practiceMenu?: PracticeMenuTemplate;
  createdByUid?: string;
  authorHandle?: string;
  createdAtMs?: number;
  isDeleted?: boolean;
};

export type FollowRecord = {
  id: string;
  followerUid: string;
  followingUid: string;
};

export type BlockRecord = {
  id: string;
  blockerUid: string;
  blockedUid: string;
};

export type PostAlertRecord = {
  id: string;
  watcherUid: string;
  targetUid: string;
};

export type InteractionRecord = {
  id: string;
  userUid: string;
  postId: string;
  source: SearchContentFilterKey;
  createdAtMs?: number;
};

export type ComposeTarget = "feed" | "questions" | "community";

export type TodayMenuConditionKey =
  | "under60"
  | "beginner"
  | "rainy"
  | "preTournament"
  | "fewTools"
  | "mixedAbility";

export type PracticeMenuTemplate = {
  sport: string;
  targetLevel: string;
  grade: string;
  participants: string;
  durationMinutes: string;
  tools: string;
  purpose: string;
  steps: string;
  cautions: string;
  commonMistakes: string;
  arrangements: string;
  conditionTags: TodayMenuConditionKey[];
};

export type ComposeState = {
  target: ComposeTarget;
  title: string;
  body: string;
  selectedSports: string[];
  practiceMenu: PracticeMenuTemplate;
};

export type SearchContentItem = {
  id: string;
  source: SearchContentFilterKey;
  sourceLabel: string;
  author: string;
  authorHandle?: string;
  createdByUid?: string;
  role: string;
  title: string;
  body: string;
  sports: string[];
  tags: string[];
  replies: Reply[];
  media?: MediaAttachment[];
  practiceMenu?: PracticeMenuTemplate;
  score: number;
  createdAtMs?: number;
};

export type SearchAccountItem = {
  id: string;
  name: string;
  handle: string;
  bio: string;
  avatarUrl?: string;
  followers: string;
  featured: boolean;
  role: string;
  selectedSports: string[];
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

export type UserDirectoryMeta = {
  externalLinks: ExternalLink[];
  iconUrl?: string;
  coverUrl?: string;
  pinnedPostId?: string;
  pinnedPostSource?: SearchContentFilterKey;
};

export type ProfileTabKey =
  | "posts"
  | "answers"
  | "best_answers"
  | "likes"
  | "bookmarks";

export type PostDetailState = {
  id: string;
  source: SearchContentFilterKey;
  sourceLabel: string;
  author: string;
  authorHandle?: string;
  createdByUid?: string;
  role: string;
  title: string;
  body: string;
  media?: MediaAttachment[];
  practiceMenu?: PracticeMenuTemplate;
  replies: Reply[];
  likes?: number;
  reposts?: number;
  comments?: number;
  answers?: number;
  bestAnswer?: string;
  bestAnswerReplyId?: string;
  sports: string[];
  tags: string[];
  createdAtMs?: number;
};

export type RelationshipListState = {
  mode: "following" | "followers";
  title: string;
  accounts: SearchAccountItem[];
  backScreen: "mypage" | "user-profile";
};

export type ReplyDetailState = {
  rootPostId: string;
  source: SearchContentFilterKey;
  sourceLabel: string;
  path: string[];
  reply: Reply;
  backScreen: ScreenKey;
};

export type ResolvedWebRoute =
  | {
      kind: "screen";
      screen: ScreenKey;
      timelineSection?: TimelineSectionKey;
      searchQuery?: string;
    }
  | {
      kind: "profile";
      handleSlug: string;
    }
  | {
      kind: "post";
      source: SearchContentFilterKey;
      id: string;
    }
  | {
      kind: "reply";
      source: SearchContentFilterKey;
      rootPostId: string;
      path: string[];
    };

export type TextSelectionRange = {
  start: number;
  end: number;
};

export type RichFormatAction = "bold" | "bullet" | "quote";

export type ProfilePostItem = SearchContentItem & {
  displayRole?: string;
  sortTimestampMs?: number;
};

export type ProfileAnswerItem = {
  id: string;
  sourceLabel: string;
  parentTitle: string;
  body: string;
};

export type TrendingCoachItem = SearchAccountItem & {
  likes: number;
  reposts: number;
  bookmarks: number;
  bestAnswers: number;
  repliesReceived: number;
  repliesSent: number;
  profileCompletionScore: number;
  responseRate: number;
  lastActivityDays: number;
  score: number;
};

export type BadgeTier = "bronze" | "silver" | "gold";

export type ActivityBadge = {
  id: string;
  label: string;
  tier: BadgeTier;
  description: string;
};

export type BadgeModalState = {
  title: string;
  badges: ActivityBadge[];
};

export type ExternalLinkModalState = {
  visible: boolean;
  url: string;
  label: string;
};

export type NotificationItem = {
  id: string;
  kind: "like" | "reply" | "bookmark" | "repost" | "new-post";
  title: string;
  body: string;
  createdAtMs: number;
  postDetail?: PostDetailState;
};

export type UserActivitySummary = {
  postCount: number;
  postingStreakDays: number;
  followerCount: number;
  likesReceived: number;
  repostsReceived: number;
  bookmarksReceived: number;
  repliesReceived: number;
  repliesSent: number;
  bestAnswers: number;
  profileCompletionScore: number;
  badges: ActivityBadge[];
};
