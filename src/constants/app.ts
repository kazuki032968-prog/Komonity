import type {
  AdvisorFormState,
  BadgeModalState,
  CoachFormState,
  CommunityPost,
  ComposeState,
  ContactFormState,
  ExternalLinkModalState,
  FeatureArticleConfig,
  FeedPost,
  LoginFormState,
  PostDetailState,
  PracticeMenuTemplate,
  PracticeStrategyTemplate,
  ProfileState,
  QuestionPost,
  ReplyDetailState,
  RelationshipListState,
  ScreenKey,
  SearchContentFilterKey,
  SeoLandingPageConfig,
  TodayMenuConditionKey,
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
    label: "得意分野",
    detail: "任意項目",
    placeholder: "例: 守備戦術、初心者指導、メンタルサポート",
  },
  {
    label: "対応できる悩み",
    detail: "任意項目",
    placeholder: "例: 部員の技術差、短時間練習、怪我予防",
  },
  {
    label: "資格",
    detail: "任意項目",
    placeholder: "例: 公認指導者資格、トレーナー資格など",
  },
  {
    label: "所属スクール",
    detail: "任意項目",
    placeholder: "例: Komonityスポーツスクール",
  },
  {
    label: "YouTube",
    detail: "任意項目",
    placeholder: "例: https://youtube.com/@komonity",
  },
  {
    label: "X / Twitter",
    detail: "任意項目",
    placeholder: "例: https://x.com/komonity",
  },
  {
    label: "Instagram",
    detail: "任意項目",
    placeholder: "例: https://instagram.com/komonity",
  },
  {
    label: "相談受付可否",
    detail: "任意項目",
    placeholder: "例: 受付可 / 現在は受付停止中",
  },
  {
    label: "有料相談可否",
    detail: "任意項目",
    placeholder: "例: 対応可 / 準備中 / 対応不可",
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
export const DEFAULT_OG_IMAGE_URL = `${DEFAULT_PUBLIC_SITE_URL}/ogp.png`;
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
  strengths: "",
  supportTopics: "",
  certifications: "",
  organization: "",
  youtubeUrl: "",
  xUrl: "",
  instagramUrl: "",
  consultationAvailable: false,
  paidConsultationAvailable: false,
};

export const myPageTabs = [
  { key: "posts", label: "投稿" },
  { key: "answers", label: "回答" },
  { key: "best_answers", label: "ベストアンサー" },
  { key: "likes", label: "いいね" },
  { key: "bookmarks", label: "保存" },
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
  strengths: "",
  supportTopics: "",
  certifications: "",
  organization: "",
  youtubeUrl: "",
  xUrl: "",
  instagramUrl: "",
  consultationAvailable: "",
  paidConsultationAvailable: "",
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

export const initialPracticeMenu: PracticeMenuTemplate = {
  sport: "",
  targetLevel: "",
  grade: "",
  participants: "",
  durationMinutes: "",
  tools: "",
  purpose: "",
  steps: "",
  cautions: "",
  commonMistakes: "",
  arrangements: "",
  conditionTags: [],
};

export const initialPracticeStrategy: PracticeStrategyTemplate = {
  sport: "",
  targetLevel: "",
  grade: "",
  participants: "",
  phase: "",
  objective: "",
  formation: "",
  roles: "",
  triggers: "",
  steps: "",
  cautions: "",
  commonMistakes: "",
  practiceDrill: "",
};

export const feedKindOptions = [
  {
    key: "menu",
    label: "メニュー",
    description: "練習時間・道具・手順まで、そのまま現場で使える形で投稿します。",
  },
  {
    key: "strategy",
    label: "戦術",
    description: "試合の局面、役割、判断基準、練習への落とし込みを投稿します。",
  },
] as const;

export const practiceLevelOptions = ["初心者", "初級", "中級", "上級", "大会前"] as const;

export const schoolGradeOptions = [
  "小学生",
  "中学1年",
  "中学2年",
  "中学3年",
  "高校1年",
  "高校2年",
  "高校3年",
  "全学年",
] as const;

export const todayMenuConditionOptions: Array<{
  key: TodayMenuConditionKey;
  label: string;
  description: string;
}> = [
  { key: "under60", label: "60分以内", description: "短時間で回せるメニュー" },
  { key: "beginner", label: "初心者多め", description: "基礎から始めやすい" },
  { key: "rainy", label: "雨・室内", description: "外が使えない日向け" },
  { key: "preTournament", label: "大会前", description: "調整や確認に使える" },
  { key: "fewTools", label: "道具少なめ", description: "準備物が少ない" },
  { key: "mixedAbility", label: "体力差あり", description: "差があっても回しやすい" },
];

export const todayMenuAdvancedConditionOptions: Array<{
  key: TodayMenuConditionKey;
  label: string;
  description: string;
}> = [
  { key: "fewPeople", label: "少人数", description: "人数が少ない日向け" },
  { key: "juniorHigh", label: "中学生", description: "中学生に合わせやすい" },
  { key: "highSchool", label: "高校生", description: "高校生に合わせやすい" },
  { key: "basicPractice", label: "基礎づくり", description: "基本動作を固める" },
  { key: "injuryPrevention", label: "怪我予防", description: "ケアやフォーム確認" },
  { key: "teamwork", label: "チーム連携", description: "役割や声かけを整理" },
  { key: "warmup", label: "ウォームアップ", description: "練習前の導入に使いやすい" },
  { key: "stamina", label: "体力づくり", description: "走力や持久力を高める" },
  { key: "defense", label: "守備強化", description: "守備やカバーを整理" },
  { key: "offense", label: "攻撃づくり", description: "得点や崩しを練習" },
  { key: "smallSpace", label: "省スペース", description: "狭い場所でも実施しやすい" },
  { key: "gameSituation", label: "実戦形式", description: "試合に近い状況で練習" },
];

export const initialComposeState: ComposeState = {
  target: "feed",
  feedKind: "menu",
  title: "",
  body: "",
  selectedSports: [],
  practiceMenu: initialPracticeMenu,
  strategyTemplate: initialPracticeStrategy,
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
  feedKind: "menu",
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

export const seoLandingPages: SeoLandingPageConfig[] = [
  {
    screen: "for-advisors",
    path: "/for-advisors",
    eyebrow: "顧問の先生向け",
    title: "専門外の部活指導で悩む顧問の先生へ",
    description:
      "Komonityは、部活の練習メニュー検索、戦術相談、怪我予防の知見共有を通じて、顧問の先生が今日の指導を組み立てやすくするサービスです。",
    primaryKeywords: [
      "顧問 練習メニュー検索",
      "部活 顧問 相談",
      "専門外 部活 顧問",
      "今日の部活メニュー",
      "部活 指導案",
      "部活 練習計画",
    ],
    heroBullets: ["今日の練習メニューを探せる", "専門外の種目でも相談できる", "回答や保存数で参考度が見える"],
    sections: [
      {
        title: "練習メニューを探しやすい",
        body: "60分しかない日、初心者が多い日、雨で外が使えない日など、現場の条件に合わせて投稿を探せます。",
        points: ["短時間練習", "初心者対応", "雨天・室内", "大会前"],
      },
      {
        title: "顧問の悩みを相談できる",
        body: "戦術、声かけ、怪我予防、練習の組み立てなどを相談広場で投稿し、指導者や他の顧問から回答を受けられます。",
        points: ["相談広場", "ベストアンサー", "顧問同士の知見共有"],
      },
      {
        title: "子どもたちにより良い指導を届ける",
        body: "外部指導者をすぐ雇えない状況でも、知見を持つ人の練習メニューや考え方を参考にできます。",
        points: ["部活支援", "現場で使える型付き知識", "無料で利用可能"],
      },
    ],
    ctaLabel: "練習メニューを探す",
    ctaScreen: "search",
    secondaryCtaLabel: "顧問として登録する",
    secondaryCtaScreen: "advisor-registration",
  },
  {
    screen: "for-coaches",
    path: "/for-coaches",
    eyebrow: "指導者・経験者向け",
    title: "あなたの指導経験を、部活現場で必要としている先生に届ける",
    description:
      "Komonityは、指導者・外部コーチ・競技経験者が練習メニューや戦術を発信し、プロフィールや活動バッジで信頼を積み上げられるサービスです。",
    primaryKeywords: [
      "指導者 登録",
      "部活 指導者",
      "外部コーチ",
      "指導経験 発信",
      "指導者 プロフィール",
      "部活 指導者 募集",
    ],
    heroBullets: ["練習メニューを発信できる", "プロフィールが名刺代わりになる", "活動バッジで信頼を見せられる"],
    sections: [
      {
        title: "指導者の営業ページとして使える",
        body: "専門種目、得意分野、相談受付可否、外部サイトをまとめ、Komonity上のプロフィールを活動紹介として活用できます。",
        points: ["指導可能種目", "得意分野", "外部リンク", "相談受付"],
      },
      {
        title: "活動するほど見つけてもらいやすくなる",
        body: "投稿、保存、いいね、再投稿、ベストアンサーなどの実績が増えるほど、指導者としての信頼が伝わりやすくなります。",
        points: ["投稿実績", "保存数", "ベストアンサー", "継続投稿"],
      },
      {
        title: "将来的な収益化にもつなげやすい",
        body: "まずは知見共有で信頼をつくり、将来的には有料相談やスクール集客につなげる導線を育てていきます。",
        points: ["有料相談", "スクール認知", "指導者PR"],
      },
    ],
    ctaLabel: "指導者として登録する",
    ctaScreen: "coach-registration",
    secondaryCtaLabel: "話題の指導者を見る",
    secondaryCtaScreen: "experts",
  },
  {
    screen: "coach-marketing",
    path: "/coach-marketing",
    eyebrow: "指導者の集客",
    title: "スポーツコーチ・文化部指導者の集客を、信頼の積み上げから始める",
    description:
      "指導者の集客は広告だけではなく、現場で使える知見を発信し、保存数・回答実績・バッジで信頼を可視化することが重要です。",
    primaryKeywords: [
      "指導者 集客",
      "コーチ 集客 方法",
      "スポーツコーチ 集客",
      "スポーツスクール 集客",
      "外部コーチ 集客",
      "指導者 PR",
    ],
    heroBullets: ["知見発信で信頼を作る", "プロフィールで活動を伝える", "顧問に見つけてもらう導線を作る"],
    sections: [
      {
        title: "広告に頼りすぎない集客導線",
        body: "練習メニューや戦術の投稿は、顧問の先生にとって実用的な入口になり、指導者の専門性を自然に伝えます。",
        points: ["知見発信", "保存される投稿", "専門性の可視化"],
      },
      {
        title: "プロフィールが名刺になる",
        body: "資格、所属スクール、YouTube、SNS、相談受付可否などをまとめ、問い合わせ前の安心材料を増やします。",
        points: ["資格", "所属スクール", "SNS連携", "相談受付"],
      },
      {
        title: "評価が検索順位や露出につながる",
        body: "フォロワー数だけでなく、いいね、保存、再投稿、ベストアンサー、更新頻度を組み合わせて活動量を評価します。",
        points: ["信頼スコア", "活動バッジ", "更新頻度"],
      },
    ],
    ctaLabel: "指導者として登録する",
    ctaScreen: "coach-registration",
    secondaryCtaLabel: "プロフィール例を見る",
    secondaryCtaScreen: "experts",
  },
  {
    screen: "practice-menu-search",
    path: "/practice-menu-search",
    eyebrow: "今日の練習メニュー検索",
    title: "今日の部活に合う練習メニューを条件から探す",
    description:
      "60分しかない、初心者が多い、雨で外が使えない、大会前、道具が少ないなど、顧問の先生が直面する条件から練習メニューを探せます。",
    primaryKeywords: [
      "今日の練習メニュー",
      "練習メニュー 検索",
      "部活 練習メニュー 検索",
      "60分 練習メニュー",
      "初心者 練習メニュー",
      "雨の日 部活 練習",
    ],
    heroBullets: ["時間で探す", "レベルで探す", "環境や道具で探す"],
    sections: [
      {
        title: "条件から探せる",
        body: "練習時間、対象レベル、学年、人数、道具、目的を組み合わせて、今日の現場に近い投稿を見つけやすくします。",
        points: ["60分", "初心者", "少人数", "道具が少ない"],
      },
      {
        title: "型付きナレッジとして読める",
        body: "手順、注意点、よくある失敗、アレンジ方法まで入った投稿なら、そのまま部活で使いやすくなります。",
        points: ["手順", "注意点", "失敗例", "アレンジ"],
      },
      {
        title: "複数種目に対応",
        body: "運動部だけでなく、吹奏楽、美術、演劇など文化部の活動にも使える知見共有を目指しています。",
        points: ["運動部", "文化部", "多種目対応"],
      },
    ],
    ctaLabel: "検索画面で探す",
    ctaScreen: "search",
    secondaryCtaLabel: "投稿を見る",
    secondaryCtaScreen: "top",
  },
  {
    screen: "practice-menu-soccer",
    path: "/practice-menu/soccer",
    eyebrow: "サッカー部の練習メニュー",
    title: "サッカー部の練習メニュー・戦術相談を探す",
    description:
      "サッカー部のビルドアップ、守備、少人数練習、初心者指導、大会前調整に使える練習メニューを探せます。",
    primaryKeywords: ["サッカー 部活 練習メニュー", "サッカー 顧問", "サッカー 戦術 部活", "サッカー 初心者 指導"],
    heroBullets: ["ビルドアップ", "守備の連動", "少人数でも回せる練習"],
    sections: [
      {
        title: "顧問が使いやすいサッカーメニュー",
        body: "人数や時間が限られていても、目的がわかる練習メニューを探しやすくします。",
        points: ["パス&コントロール", "守備", "ポジショニング"],
      },
      {
        title: "戦術の悩みも相談できる",
        body: "ビルドアップ、プレス回避、守備ブロックなど、試合で出る課題を相談できます。",
        points: ["相談広場", "戦術共有", "ベストアンサー"],
      },
    ],
    ctaLabel: "サッカーの投稿を探す",
    ctaScreen: "search",
  },
  {
    screen: "practice-menu-baseball",
    path: "/practice-menu/baseball",
    eyebrow: "野球部の練習メニュー",
    title: "野球部の練習メニュー・守備練習・打撃練習を探す",
    description:
      "野球部のキャッチボール、守備連携、打撃、走塁、少人数練習に使えるメニューを探せます。",
    primaryKeywords: ["野球 部活 練習メニュー", "野球 顧問", "野球 守備練習", "野球 打撃練習"],
    heroBullets: ["守備連携", "打撃練習", "走塁判断"],
    sections: [
      {
        title: "基礎から実戦まで探せる",
        body: "キャッチボールの質、ゴロ捕球、カットプレー、打撃の目的設定などを整理して探せます。",
        points: ["基礎練習", "守備連携", "打撃"],
      },
      {
        title: "人数不足の日にも使いやすい",
        body: "少人数でも回せる反復メニューや、短時間で目的を絞った練習を探しやすくします。",
        points: ["少人数", "短時間", "目的別"],
      },
    ],
    ctaLabel: "野球の投稿を探す",
    ctaScreen: "search",
  },
  {
    screen: "practice-menu-basketball",
    path: "/practice-menu/basketball",
    eyebrow: "バスケットボール部の練習メニュー",
    title: "バスケ部の練習メニュー・1on1・ディフェンス練習を探す",
    description:
      "バスケットボール部の1on1、ステップワーク、ディフェンス、速攻、初心者向け練習メニューを探せます。",
    primaryKeywords: ["バスケ 部活 練習メニュー", "バスケットボール 顧問", "バスケ 1on1 練習", "バスケ 初心者 指導"],
    heroBullets: ["1on1", "ディフェンス", "初心者の基礎"],
    sections: [
      {
        title: "試合につながる基礎を探せる",
        body: "ドリブル、ステップ、シュート、守備姿勢を試合で使える形に落とし込む練習を探せます。",
        points: ["ステップワーク", "シュート", "守備"],
      },
      {
        title: "学年差や体力差に対応",
        body: "体力差が大きいチームでも取り組みやすい、段階的な練習メニューを見つけやすくします。",
        points: ["体力差", "段階練習", "U15"],
      },
    ],
    ctaLabel: "バスケの投稿を探す",
    ctaScreen: "search",
  },
  {
    screen: "practice-menu-tennis",
    path: "/practice-menu/tennis",
    eyebrow: "テニス部の練習メニュー",
    title: "テニス部の練習メニュー・ラリー・サーブ練習を探す",
    description:
      "テニス部のラリー、サーブ、フットワーク、少人数コート練習、大会前調整に使えるメニューを探せます。",
    primaryKeywords: ["テニス 部活 練習メニュー", "テニス 顧問", "テニス サーブ練習", "テニス ラリー練習"],
    heroBullets: ["ラリー練習", "サーブ", "フットワーク"],
    sections: [
      {
        title: "限られたコートでも回せる",
        body: "人数が多くコートが少ない部活でも、待ち時間を減らす練習設計を探せます。",
        points: ["コート不足", "待ち時間削減", "ローテーション"],
      },
      {
        title: "大会前の調整にも対応",
        body: "試合形式、サーブからの展開、ミスを減らす練習などを目的別に探しやすくします。",
        points: ["大会前", "試合形式", "展開練習"],
      },
    ],
    ctaLabel: "テニスの投稿を探す",
    ctaScreen: "search",
  },
  {
    screen: "practice-menu-brass-band",
    path: "/practice-menu/brass-band",
    eyebrow: "吹奏楽部の練習メニュー",
    title: "吹奏楽部の基礎合奏・パート練習・本番前練習を探す",
    description:
      "吹奏楽部の基礎合奏、音程、リズム、パート練習、本番前の仕上げに使える練習メニューを探せます。",
    primaryKeywords: ["吹奏楽 部活 練習メニュー", "吹奏楽 顧問", "基礎合奏 メニュー", "吹奏楽 パート練習"],
    heroBullets: ["基礎合奏", "音程づくり", "本番前調整"],
    sections: [
      {
        title: "文化部の練習にも対応",
        body: "Komonityは運動部だけでなく、吹奏楽や演劇、美術など文化部の知見共有にも対応します。",
        points: ["文化部", "基礎合奏", "本番前"],
      },
      {
        title: "専門外顧問でも進めやすい",
        body: "目的、手順、注意点が整理された投稿により、専門外の顧問でも練習を組み立てやすくします。",
        points: ["専門外", "進行手順", "注意点"],
      },
    ],
    ctaLabel: "吹奏楽の投稿を探す",
    ctaScreen: "search",
  },
  {
    screen: "practice-menu-rainy-day",
    path: "/practice-menu/rainy-day",
    eyebrow: "雨の日・室内練習",
    title: "雨で外が使えない日の部活練習メニューを探す",
    description:
      "雨天時、体育館が使えない日、教室や廊下でできる基礎練習、戦術理解、体づくりのメニューを探せます。",
    primaryKeywords: ["雨の日 部活 練習", "室内 練習メニュー 部活", "雨天 練習 サッカー", "教室でできる練習"],
    heroBullets: ["室内練習", "戦術理解", "怪我予防"],
    sections: [
      {
        title: "外が使えない日の選択肢",
        body: "天候に左右されやすい部活でも、映像確認、体幹、ステップ、作戦共有などの代替メニューを探せます。",
        points: ["雨天", "室内", "代替メニュー"],
      },
      {
        title: "安全に取り組める内容を重視",
        body: "狭い場所でも事故につながりにくい、目的が明確なメニューを見つけやすくします。",
        points: ["安全", "少スペース", "目的別"],
      },
    ],
    ctaLabel: "雨の日メニューを探す",
    ctaScreen: "search",
  },
  {
    screen: "practice-menu-60-minutes",
    path: "/practice-menu/60-minutes",
    eyebrow: "60分練習",
    title: "60分で回せる部活練習メニューを探す",
    description:
      "放課後の限られた時間でも、ウォームアップ、基礎、実戦、振り返りまで組み立てやすい60分練習メニューを探せます。",
    primaryKeywords: ["60分 練習メニュー", "短時間 練習メニュー 部活", "放課後 練習メニュー", "部活 時間がない"],
    heroBullets: ["短時間", "放課後", "効率重視"],
    sections: [
      {
        title: "時間配分が見える",
        body: "何分で何をするかが整理された投稿は、顧問の先生がそのまま練習計画に落とし込みやすくなります。",
        points: ["時間配分", "練習計画", "短時間"],
      },
      {
        title: "目的を絞って成果につなげる",
        body: "限られた時間でも、今日の目的を絞ることで練習の質を上げやすくします。",
        points: ["目的設定", "集中練習", "振り返り"],
      },
    ],
    ctaLabel: "60分メニューを探す",
    ctaScreen: "search",
  },
  {
    screen: "practice-menu-beginner",
    path: "/practice-menu/beginner",
    eyebrow: "初心者向け練習",
    title: "初心者が多い部活の練習メニューを探す",
    description:
      "新入部員や未経験者が多いチームで、基礎を楽しく身につけるための段階的な練習メニューを探せます。",
    primaryKeywords: ["初心者 練習メニュー 部活", "新入部員 練習メニュー", "未経験 部活 指導", "基礎練習 部活"],
    heroBullets: ["新入部員", "未経験者", "基礎づくり"],
    sections: [
      {
        title: "できることを少しずつ増やす",
        body: "初心者には成功体験を積みやすい段階設計が重要です。レベルに合うメニューを探しやすくします。",
        points: ["段階設計", "成功体験", "基礎"],
      },
      {
        title: "経験者との差を埋める",
        body: "体力差や経験差があっても、全員が参加しやすい練習を探せます。",
        points: ["体力差", "経験差", "全員参加"],
      },
    ],
    ctaLabel: "初心者メニューを探す",
    ctaScreen: "search",
  },
  {
    screen: "practice-menu-tournament-prep",
    path: "/practice-menu/tournament-prep",
    eyebrow: "大会前練習",
    title: "大会前に使える部活練習メニュー・調整方法を探す",
    description:
      "大会前の確認、コンディション調整、試合形式、メンタル面の準備に使える練習メニューを探せます。",
    primaryKeywords: ["大会前 練習メニュー", "大会前 部活 練習", "試合前 練習メニュー", "部活 調整メニュー"],
    heroBullets: ["試合前確認", "コンディション調整", "メンタル準備"],
    sections: [
      {
        title: "大会前にやることを整理",
        body: "技術の詰め込みではなく、確認、調整、安心感づくりを重視した投稿を探せます。",
        points: ["確認", "調整", "安心感"],
      },
      {
        title: "試合形式で課題を見つける",
        body: "本番に近い形で、連携や判断を確認する練習メニューを探しやすくします。",
        points: ["試合形式", "連携", "判断"],
      },
    ],
    ctaLabel: "大会前メニューを探す",
    ctaScreen: "search",
  },
];

export const seoLandingPageMap = seoLandingPages.reduce(
  (acc, page) => {
    acc[page.screen] = page;
    return acc;
  },
  {} as Partial<Record<ScreenKey, SeoLandingPageConfig>>
);

export const featureArticles: FeatureArticleConfig[] = [
  {
    screen: "feature-practice-menu-template",
    path: "/features/practice-menu-template",
    category: "練習メニュー投稿テンプレ",
    title: "部活現場でそのまま使える練習メニュー投稿テンプレート",
    description:
      "種目、対象レベル、学年、人数、練習時間、道具、目的、手順、注意点、失敗例、アレンジ方法まで整理して投稿できるKomonityの型付きナレッジです。",
    lead: "普通のSNS投稿では流れてしまう練習メニューを、顧問の先生が部活で再現しやすい形に整えるためのテンプレートです。",
    keywords: [
      "練習メニュー 投稿テンプレート",
      "部活 練習メニュー 作り方",
      "部活 指導案 テンプレート",
      "練習 手順 注意点",
      "部活 ナレッジ",
    ],
    updatedAt: "2026年5月13日",
    sections: [
      {
        title: "投稿に入れる基本項目",
        body: "種目、対象レベル、学年、人数、練習時間、必要な道具を先にそろえると、顧問の先生が自分の部活に合うかをすぐ判断できます。",
        points: ["種目", "対象レベル", "人数", "練習時間", "必要な道具"],
      },
      {
        title: "目的と手順を分けて書く",
        body: "練習の目的、手順、注意点を分けることで、専門外の顧問でも進行しやすくなります。",
        points: ["練習の目的", "手順", "注意点"],
      },
      {
        title: "失敗例とアレンジが現場で効く",
        body: "よくある失敗とアレンジ方法まで残すことで、人数や場所が変わっても応用しやすい投稿になります。",
        points: ["よくある失敗", "アレンジ方法", "再現性"],
      },
    ],
    relatedLinks: [
      { label: "今日の練習メニュー検索", screen: "feature-today-practice-menu-search" },
      { label: "60分練習の組み立て方", screen: "feature-60-minute-practice" },
      { label: "初心者向け練習特集", screen: "feature-beginner-practice" },
      { label: "顧問の先生向けページ", screen: "for-advisors" },
    ],
  },
  {
    screen: "feature-today-practice-menu-search",
    path: "/features/today-practice-menu-search",
    category: "今日の練習メニュー検索",
    title: "60分・初心者・雨の日など条件から今日の練習メニューを探す",
    description:
      "今日は60分しかない、初心者が多い、雨で外が使えない、大会前、道具が少ない、体力差が大きいといった条件から練習メニューを探す考え方です。",
    lead: "顧問の先生が朝や放課後前に短時間で練習を組めるように、現場条件から探せる検索体験を目指しています。",
    keywords: [
      "今日の練習メニュー",
      "60分 練習メニュー",
      "初心者 練習メニュー",
      "雨の日 部活 練習",
      "大会前 練習メニュー",
      "道具が少ない 練習",
    ],
    updatedAt: "2026年5月13日",
    sections: [
      {
        title: "時間で探す",
        body: "60分、90分、短時間など練習時間から絞ると、放課後の限られた時間でも組み立てやすくなります。",
        points: ["60分", "短時間", "放課後"],
      },
      {
        title: "環境で探す",
        body: "雨天、室内、少人数、道具が少ない日など、制約がある日の代替メニューを探しやすくします。",
        points: ["雨天", "室内", "少人数", "道具不足"],
      },
      {
        title: "目的で探す",
        body: "大会前、初心者育成、怪我予防、体力差への対応など、今日の目的から投稿を探せます。",
        points: ["大会前", "初心者", "怪我予防", "体力差"],
      },
    ],
    relatedLinks: [
      { label: "練習メニュー検索ページ", screen: "practice-menu-search" },
      { label: "雨の日練習特集", screen: "feature-rainy-day-practice" },
      { label: "60分練習の組み立て方", screen: "feature-60-minute-practice" },
      { label: "初心者向け練習特集", screen: "feature-beginner-practice" },
      { label: "少人数・省スペース練習", screen: "feature-small-space-practice" },
    ],
  },
  {
    screen: "feature-60-minute-practice",
    path: "/features/60-minute-practice",
    category: "60分練習設計",
    title: "放課後60分で回せる部活練習メニューの組み立て方",
    description:
      "ウォームアップ、基礎づくり、守備強化、攻撃づくり、実戦形式、振り返りを60分に収めるための考え方を整理します。",
    lead: "放課後の練習時間が短い日でも、目的を絞れば十分に成果を出せます。60分をどう区切るか、何を削るか、どこを検索で補うかをまとめます。",
    keywords: [
      "60分 練習メニュー",
      "放課後 練習メニュー",
      "短時間 部活 練習",
      "部活 時短練習",
      "実戦形式 練習",
    ],
    updatedAt: "2026年5月18日",
    sections: [
      {
        title: "60分を4つのブロックに分ける",
        body: "最初の10分でウォームアップ、次の20分で基礎、次の20分で今日のテーマ、最後の10分で実戦形式または振り返りにすると、説明が長引いても崩れにくくなります。",
        points: ["ウォームアップ", "基礎づくり", "実戦形式", "振り返り"],
      },
      {
        title: "移動と準備で時間を溶かさない",
        body: "コートを大きく作り替える練習を避け、半面や省スペースで回せるメニューを選ぶと、活動時間を確保しやすくなります。",
        points: ["省スペース", "道具不足", "タイマー", "少人数"],
      },
      {
        title: "仕上げは1テーマに絞る",
        body: "守備強化、攻撃づくり、大会前の確認など、最後に見たい成果を1つに絞ると、短時間でも生徒に狙いが伝わります。",
        points: ["守備強化", "攻撃づくり", "大会前"],
      },
    ],
    relatedLinks: [
      { label: "今日の練習メニュー検索", screen: "feature-today-practice-menu-search" },
      { label: "練習メニュー投稿テンプレ", screen: "feature-practice-menu-template" },
      { label: "初心者向け練習特集", screen: "feature-beginner-practice" },
    ],
  },
  {
    screen: "feature-beginner-practice",
    path: "/features/beginner-practice",
    category: "初心者指導",
    title: "初心者が多い部活で最初に整えたい練習メニュー",
    description:
      "初心者が多い部活で、基礎づくり、怪我予防、経験者との体力差、チーム連携をどう扱うかを整理します。",
    lead: "初心者が多い日は、難しいメニューを薄くやるより、成功基準を小さくして反復しやすい形にする方が伸びやすくなります。",
    keywords: [
      "初心者 練習メニュー",
      "部活 初心者 指導",
      "基礎練習 メニュー",
      "体力差 部活",
      "怪我予防 練習",
    ],
    updatedAt: "2026年5月18日",
    sections: [
      {
        title: "最初は成功基準を小さくする",
        body: "フォーム、姿勢、足運び、声かけなど、今日できるようになってほしい動作を1つに絞ると、初心者も経験者も振り返りやすくなります。",
        points: ["初心者", "基礎づくり", "フォーム確認"],
      },
      {
        title: "経験者と初心者を同時に動かす",
        body: "経験者には条件を追加し、初心者には距離や速度を下げるなど、同じ練習の中で難易度を分けると待ち時間が減ります。",
        points: ["体力差", "チーム連携", "少人数"],
      },
      {
        title: "怪我予防を練習の一部にする",
        body: "ウォームアップ、可動域、フォーム確認を最初からメニューに入れておくと、初心者が無理をして崩れるリスクを減らせます。",
        points: ["怪我予防", "ウォームアップ", "中学生", "高校生"],
      },
    ],
    relatedLinks: [
      { label: "今日の練習メニュー検索", screen: "feature-today-practice-menu-search" },
      { label: "顧問の相談投稿の作り方", screen: "feature-advisor-consultation" },
      { label: "60分練習の組み立て方", screen: "feature-60-minute-practice" },
    ],
  },
  {
    screen: "feature-small-space-practice",
    path: "/features/small-space-practice",
    category: "少人数・省スペース練習",
    title: "少人数・狭い場所でも成立する部活練習メニュー",
    description:
      "少人数、半面、教室、廊下、道具が少ない日でも練習の質を落とさないためのメニュー設計をまとめます。",
    lead: "人数や場所が足りない日は、できないことを数えるより、役割を増やして反復の密度を上げるチャンスにできます。",
    keywords: [
      "少人数 練習メニュー",
      "省スペース 練習",
      "道具が少ない 練習",
      "室内 部活 練習",
      "半面 練習メニュー",
    ],
    updatedAt: "2026年5月18日",
    sections: [
      {
        title: "人数が少ない日は役割を増やす",
        body: "プレーヤーだけでなく、記録係、声かけ係、観察係を作ると、少人数でも学びが止まりにくくなります。",
        points: ["少人数", "チーム連携", "役割"],
      },
      {
        title: "狭い場所では安全と目的を先に決める",
        body: "省スペースでは強度を上げすぎず、守備の構え、攻撃の判断、フォーム確認など、接触が少ないテーマへ切り替えます。",
        points: ["省スペース", "室内", "守備強化", "攻撃づくり"],
      },
      {
        title: "最後は実戦形式へ接続する",
        body: "基礎練習で終わらず、ミニゲーム、ケース練習、判断練習へつなぐと、限られた環境でも本番に近い学びになります。",
        points: ["実戦形式", "判断", "大会前"],
      },
    ],
    relatedLinks: [
      { label: "雨の日練習特集", screen: "feature-rainy-day-practice" },
      { label: "今日の練習メニュー検索", screen: "feature-today-practice-menu-search" },
      { label: "60分練習の組み立て方", screen: "feature-60-minute-practice" },
    ],
  },
  {
    screen: "feature-coach-profile",
    path: "/features/coach-profile",
    category: "指導者プロフィール強化",
    title: "指導者プロフィールを営業ページとして使うための作り方",
    description:
      "指導可能種目、得意分野、対応できる悩み、指導歴、資格、所属スクール、YouTube、X、Instagram、相談受付可否を整理するプロフィール設計です。",
    lead: "Komonityのプロフィールは、顧問の先生が「この人に相談してよさそう」と判断するための名刺代わりになります。",
    keywords: [
      "指導者 プロフィール",
      "コーチ プロフィール 作り方",
      "スポーツコーチ 集客",
      "部活 指導者 登録",
      "外部コーチ プロフィール",
    ],
    updatedAt: "2026年5月13日",
    sections: [
      {
        title: "対応できる悩みを明確にする",
        body: "指導可能種目だけでなく、初心者指導、怪我予防、戦術、保護者対応など得意な相談テーマを書いておくと見つけてもらいやすくなります。",
        points: ["得意分野", "対応できる悩み", "相談受付"],
      },
      {
        title: "外部活動につなげる",
        body: "所属スクール、YouTube、X、Instagramなどを整理すると、Komonity外での活動にも自然につながります。",
        points: ["所属スクール", "YouTube", "X", "Instagram"],
      },
      {
        title: "信頼の入口を増やす",
        body: "指導歴、資格、投稿実績、バッジを合わせて見せることで、初めて見る顧問の先生にも安心感を届けられます。",
        points: ["指導歴", "資格", "活動バッジ"],
      },
    ],
    relatedLinks: [
      { label: "指導者向けページ", screen: "for-coaches" },
      { label: "指導者集客ページ", screen: "coach-marketing" },
    ],
  },
  {
    screen: "feature-badge-trust-score",
    path: "/features/badge-trust-score",
    category: "メダル・信頼スコア",
    title: "活動バッジと信頼スコアで指導者の継続的な貢献を見える化する",
    description:
      "ベストアンサー、保存数、返信数、継続投稿日数、プロフィール完成度、相談対応率などをもとに、指導者の活動と信頼を伝える仕組みです。",
    lead: "単なるフォロワー数だけではなく、顧問の先生に役立つ行動を評価することで、良い指導者が見つかりやすい状態を目指します。",
    keywords: [
      "指導者 バッジ",
      "信頼スコア",
      "部活 指導者 評価",
      "ベストアンサー 指導者",
      "指導者 実績",
    ],
    updatedAt: "2026年5月13日",
    sections: [
      {
        title: "反応だけでなく貢献を見る",
        body: "いいねや再投稿だけでなく、保存、返信、ベストアンサーなど、現場に役立った行動を重視します。",
        points: ["保存数", "返信数", "ベストアンサー"],
      },
      {
        title: "更新頻度を評価に入れる",
        body: "最終投稿からの日数を加味することで、更新が止まっているアカウントが上位に残り続けるのを避けます。",
        points: ["継続投稿日数", "最終投稿", "更新頻度"],
      },
      {
        title: "将来の収益化につなげる",
        body: "高評価の指導者だけが有料相談を開けるなど、信頼を土台にした収益化へ発展できます。",
        points: ["有料相談", "認証済み指導者", "高評価"],
      },
    ],
    relatedLinks: [
      { label: "話題の指導者を見る", screen: "experts" },
      { label: "指導者向けページ", screen: "for-coaches" },
    ],
  },
  {
    screen: "feature-advisor-consultation",
    path: "/features/advisor-consultation",
    category: "顧問の相談設計",
    title: "専門外の部活顧問が相談しやすい投稿の作り方",
    description:
      "専門外の顧問が練習メニュー、戦術、声かけ、怪我予防を相談するときに、回答が集まりやすい投稿の書き方を整理します。",
    lead: "相談広場では、状況が伝わるほど指導者や他の顧問から具体的な回答をもらいやすくなります。",
    keywords: ["部活 顧問 相談", "専門外 部活 顧問", "部活 Q&A", "顧問 悩み", "部活 ベストアンサー"],
    updatedAt: "2026年5月13日",
    sections: [
      {
        title: "状況を先に伝える",
        body: "種目、学年、人数、練習時間、困っている場面を先に書くと回答者が具体的に提案できます。",
        points: ["種目", "学年", "人数", "練習時間"],
      },
      {
        title: "困りごとを1つに絞る",
        body: "一度に全部聞くより、今日解決したい悩みを1つに絞ると回答が集まりやすくなります。",
        points: ["質問を絞る", "具体化", "回答しやすい"],
      },
      {
        title: "ベストアンサーで知見を残す",
        body: "良い回答をベストアンサーにすることで、あとから同じ悩みを持つ顧問の先生が見つけやすくなります。",
        points: ["ベストアンサー", "知見共有", "再利用"],
      },
    ],
    relatedLinks: [
      { label: "顧問の先生向けページ", screen: "for-advisors" },
      { label: "相談広場を見る", screen: "questions" },
    ],
  },
  {
    screen: "feature-rainy-day-practice",
    path: "/features/rainy-day-practice",
    category: "雨の日・室内練習",
    title: "雨で外が使えない日の部活練習メニューの考え方",
    description:
      "雨の日、体育館が使えない日、教室や廊下でできる部活練習の考え方を整理し、怪我予防や戦術理解につなげます。",
    lead: "雨の日は練習を諦める日ではなく、普段できない基礎確認や戦術理解、怪我予防に切り替えるチャンスです。",
    keywords: ["雨の日 部活 練習", "室内 練習メニュー 部活", "雨天 練習", "教室でできる練習", "怪我予防 部活"],
    updatedAt: "2026年5月13日",
    sections: [
      {
        title: "狭い場所では目的を変える",
        body: "外での実戦練習ができない日は、判断、姿勢、基礎動作、映像確認など目的を切り替えると効果的です。",
        points: ["判断", "姿勢", "映像確認"],
      },
      {
        title: "室内でできる基礎を選ぶ",
        body: "ステップ、体幹、リズム、作戦共有など、安全にできるメニューを選びます。",
        points: ["ステップ", "体幹", "作戦共有"],
      },
      {
        title: "怪我予防の日にする",
        body: "ストレッチやセルフケア、フォーム確認に時間を使うと、普段の練習の質も上がります。",
        points: ["ストレッチ", "セルフケア", "フォーム確認"],
      },
    ],
    relatedLinks: [
      { label: "雨の日メニュー検索", screen: "practice-menu-rainy-day" },
      { label: "今日の練習メニュー検索", screen: "feature-today-practice-menu-search" },
      { label: "少人数・省スペース練習", screen: "feature-small-space-practice" },
    ],
  },
];

export const featureArticleMap = featureArticles.reduce(
  (acc, article) => {
    acc[article.screen] = article;
    return acc;
  },
  {} as Partial<Record<ScreenKey, FeatureArticleConfig>>
);

export const staticScreenPathMap: Partial<Record<ScreenKey, string>> = {
  top: "/",
  "service-detail": "/service-detail",
  "for-advisors": "/for-advisors",
  "for-coaches": "/for-coaches",
  "coach-marketing": "/coach-marketing",
  "practice-menu-search": "/practice-menu-search",
  "practice-menu-soccer": "/practice-menu/soccer",
  "practice-menu-baseball": "/practice-menu/baseball",
  "practice-menu-basketball": "/practice-menu/basketball",
  "practice-menu-tennis": "/practice-menu/tennis",
  "practice-menu-brass-band": "/practice-menu/brass-band",
  "practice-menu-rainy-day": "/practice-menu/rainy-day",
  "practice-menu-60-minutes": "/practice-menu/60-minutes",
  "practice-menu-beginner": "/practice-menu/beginner",
  "practice-menu-tournament-prep": "/practice-menu/tournament-prep",
  features: "/features",
  "feature-practice-menu-template": "/features/practice-menu-template",
  "feature-today-practice-menu-search": "/features/today-practice-menu-search",
  "feature-coach-profile": "/features/coach-profile",
  "feature-badge-trust-score": "/features/badge-trust-score",
  "feature-advisor-consultation": "/features/advisor-consultation",
  "feature-rainy-day-practice": "/features/rainy-day-practice",
  "feature-60-minute-practice": "/features/60-minute-practice",
  "feature-beginner-practice": "/features/beginner-practice",
  "feature-small-space-practice": "/features/small-space-practice",
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
