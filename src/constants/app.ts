import type {
  AdvisorFormState,
  BadgeModalState,
  CoachFormState,
  CommunityPost,
  ComposeState,
  ContactFormState,
  ExternalLinkModalState,
  FeedPost,
  LoginFormState,
  PostDetailState,
  ProfileState,
  QuestionPost,
  ReplyDetailState,
  RelationshipListState,
  ScreenKey,
  SearchContentFilterKey,
  TextSelectionRange,
  TimelineSectionKey,
  UserActionMenuState,
  UserProfileState,
} from "../types/app";

export const sportGroups = [
  {
    category: "球技",
    items: [
      "サッカー",
      "野球",
      "ソフトボール",
      "バスケットボール",
      "バレーボール",
      "テニス",
      "ソフトテニス",
      "バドミントン",
      "卓球",
      "ラグビー",
      "ハンドボール",
    ],
  },
  {
    category: "武道・競技",
    items: ["陸上", "駅伝", "水泳", "体操", "剣道", "柔道", "空手道", "弓道", "登山"],
  },
  {
    category: "パフォーマンス",
    items: ["ダンス", "チア", "吹奏楽", "合唱", "軽音楽", "演劇", "放送"],
  },
  {
    category: "創作・芸術",
    items: ["美術", "書道", "写真", "茶道", "華道", "文芸"],
  },
  {
    category: "学術・文化",
    items: [
      "科学",
      "家庭科",
      "料理",
      "英語",
      "囲碁",
      "将棋",
      "新聞",
      "パソコン",
      "eスポーツ",
      "ボランティア",
      "その他",
    ],
  },
] as const;

export const registrationOptions = [
  {
    id: "advisor",
    title: "顧問として登録",
    description:
      "相談投稿、ベストアンサーの保存、参考になった指導者のフォロー、マイページでの活動管理ができます。",
  },
  {
    id: "coach",
    title: "指導員として登録",
    description:
      "経歴や実績を公開し、毎日のメニュー投稿や回答を通じて信頼を積み上げられます。",
  },
] as const;

export const advisorRegistrationFields = [
  { label: "ニックネーム", detail: "必須", placeholder: "例: バスケ顧問A / みどり先生" },
  { label: "表示ID", detail: "必須", placeholder: "例: @midori_teacher" },
  { label: "担当部活", detail: "必須", placeholder: "例: 女子バスケットボール部" },
  { label: "担当歴", detail: "必須", placeholder: "例: 6年" },
  {
    label: "ログイン用メールアドレス",
    detail: "必須 / 非公開",
    placeholder: "例: advisor@example.com",
  },
  {
    label: "ログイン用パスワード",
    detail: "必須 / 非公開",
    placeholder: "8文字以上のパスワード",
  },
] as const;

export const coachRegistrationFields = [
  { label: "ニックネーム", detail: "必須", placeholder: "例: 山本 真理 / Coach Mari" },
  { label: "表示ID", detail: "必須", placeholder: "例: @coach_mari" },
  { label: "専門種目", detail: "必須", placeholder: "例: バスケットボール" },
  { label: "指導歴", detail: "必須", placeholder: "例: 12年" },
  {
    label: "今までの経歴や功績",
    detail: "必須",
    placeholder: "例: 全国大会出場3回、指導者研修講師など",
  },
  {
    label: "電話番号",
    detail: "任意項目 / 入力すると公開",
    placeholder: "例: 090-1234-5678",
  },
  {
    label: "メールアドレス",
    detail: "任意項目 / 入力すると公開",
    placeholder: "例: coach@example.com",
  },
  {
    label: "ログイン用メールアドレス",
    detail: "必須 / 非公開",
    placeholder: "例: login@example.com",
  },
  {
    label: "ログイン用パスワード",
    detail: "必須 / 非公開",
    placeholder: "8文字以上のパスワード",
  },
] as const;

export const DEFAULT_PUBLIC_SITE_URL = "https://komonity-510b7.web.app";
export const SUPPORT_EMAIL_ADDRESS = "komonity.official@gmail.com";

export const defaultProfileState: ProfileState = {
  name: "Komonityユーザー",
  handle: "@komonity_user",
  role: "未登録",
  bio: "プロフィールを登録すると、投稿や回答、コミュニティ機能を利用できます。",
  link: `${DEFAULT_PUBLIC_SITE_URL}/profile/komonity_user`,
  avatarUrl: "",
  coverUrl: "",
  externalLinks: [],
  joined: "Komonityへようこそ",
  following: "0",
  followers: "0",
  posts: "0",
  selectedSports: [],
};

export const myPageTabs = [
  { key: "posts", label: "投稿" },
  { key: "answers", label: "回答" },
  { key: "best_answers", label: "ベストアンサー" },
] as const;

export const searchTabs = [
  { key: "trending-posts", label: "話題の投稿" },
  { key: "recent", label: "最近" },
  { key: "accounts", label: "アカウント" },
] as const;

export const FIRESTORE_SAVE_TIMEOUT_MS = 8000;
export const IMAGE_FILE_SIZE_LIMIT_BYTES = 10 * 1024 * 1024;
export const VIDEO_FILE_SIZE_LIMIT_BYTES = 100 * 1024 * 1024;
export const RECENT_LOGIN_MAX_AGE_MS = 5 * 60 * 1000;
export const POST_TITLE_MAX_LENGTH = 100;
export const POST_BODY_MAX_LENGTH = 2000;
export const REPLY_BODY_MAX_LENGTH = 2000;
export const LIST_BODY_COLLAPSE_LENGTH = 220;

export const initialAdvisorForm: AdvisorFormState = {
  nickname: "",
  handle: "",
  club: "",
  experience: "",
  loginEmail: "",
  loginPassword: "",
  selectedSports: [],
};

export const initialCoachForm: CoachFormState = {
  nickname: "",
  handle: "",
  specialty: "",
  experience: "",
  achievements: "",
  phone: "",
  publicEmail: "",
  loginEmail: "",
  loginPassword: "",
  selectedSports: [],
};

export const initialLoginForm: LoginFormState = {
  email: "",
  password: "",
};

export const initialContactForm: ContactFormState = {
  email: "",
  subject: "",
  body: "",
};

export const initialComposeState: ComposeState = {
  target: "feed",
  title: "",
  body: "",
  selectedSports: [],
};

export const INITIAL_SELECTION: TextSelectionRange = {
  start: 0,
  end: 0,
};

export const initialPostDetailState: PostDetailState = {
  id: "",
  source: "feed",
  sourceLabel: "",
  author: "",
  authorHandle: "",
  createdByUid: "",
  role: "",
  title: "",
  body: "",
  media: [],
  replies: [],
  likes: 0,
  reposts: 0,
  comments: 0,
  answers: 0,
  bestAnswer: "",
  bestAnswerReplyId: "",
  sports: [],
  tags: [],
  createdAtMs: undefined,
};

export const initialReplyDetailState: ReplyDetailState = {
  rootPostId: "",
  source: "feed",
  sourceLabel: "",
  path: [],
  reply: {
    id: "",
    author: "",
    authorHandle: "",
    createdByUid: "",
    body: "",
    likes: 0,
    reposts: 0,
    bookmarks: 0,
    replies: [],
    media: [],
  },
  backScreen: "top",
};

export const initialFeedPosts: FeedPost[] = [];
export const initialQuestions: QuestionPost[] = [];
export const initialCommunityItems: CommunityPost[] = [];

export const INITIAL_USER_ACTION_MENU_STATE: UserActionMenuState = {
  open: false,
  targetName: "",
};

export const INITIAL_BADGE_MODAL_STATE: BadgeModalState = {
  title: "",
  badges: [],
};

export const INITIAL_EXTERNAL_LINK_MODAL_STATE: ExternalLinkModalState = {
  visible: false,
  url: "",
  label: "",
};

export const searchContentFilters: Array<{
  key: SearchContentFilterKey;
  label: string;
}> = [
  { key: "all", label: "全て" },
  { key: "feed", label: "メニュー・戦術" },
  { key: "questions", label: "相談広場" },
  { key: "community", label: "コミュニティ" },
];

export const timelineSections: Array<{ key: TimelineSectionKey; label: string }> = [
  { key: "all", label: "全て" },
  { key: "feed", label: "メニュー・戦術" },
  { key: "questions", label: "相談広場" },
  { key: "community", label: "コミュニティ" },
  { key: "following", label: "フォロー中の投稿" },
];

export const timelineSectionPathMap: Record<TimelineSectionKey, string> = {
  all: "/",
  feed: "/timeline/menu-strategy",
  questions: "/timeline/questions",
  community: "/timeline/community",
  following: "/timeline/following",
};

export const staticScreenPathMap: Partial<Record<ScreenKey, string>> = {
  top: "/",
  "service-detail": "/service-detail",
  feed: timelineSectionPathMap.feed,
  questions: timelineSectionPathMap.questions,
  community: timelineSectionPathMap.community,
  "following-feed": timelineSectionPathMap.following,
  experts: "/featured-coaches",
  mypage: "/mypage",
  notifications: "/notifications",
  search: "/search",
  "post-compose": "/compose",
  "profile-edit": "/mypage/edit",
  "registration-role": "/register",
  "advisor-registration": "/register/advisor",
  "coach-registration": "/register/coach",
  login: "/login",
  "forgot-password": "/forgot-password",
  contact: "/contact",
  "privacy-policy": "/privacy-policy",
  terms: "/terms",
  "relationship-list": "/connections",
};

export const initialSelectedUserProfile: UserProfileState = {
  ...defaultProfileState,
  avatarLabel: defaultProfileState.name.slice(0, 1),
  coverTone: "#d8c7ad",
};

export const initialRelationshipListState: RelationshipListState = {
  mode: "following",
  title: "フォロー一覧",
  accounts: [],
  backScreen: "user-profile",
};

export const COLLECTIONS = {
  feed: "timeline_posts",
  questions: "question_posts",
  community: "community_posts",
  follows: "follows",
  blocks: "blocks",
  likes: "post_likes",
  reposts: "post_reposts",
  bookmarks: "post_bookmarks",
  alerts: "post_alerts",
  reports: "spam_reports",
  inquiries: "contact_inquiries",
  mail: "mail",
} as const;
