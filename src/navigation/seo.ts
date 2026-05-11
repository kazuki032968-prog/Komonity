import {
  DEFAULT_OG_IMAGE_URL,
  DEFAULT_PUBLIC_SITE_URL,
  sportGroups,
  timelineSections,
} from "../constants/app";
import type {
  PostDetailState,
  ProfileState,
  ReplyDetailState,
  ScreenKey,
  TimelineSectionKey,
  UserProfileState,
} from "../types/app";
import { formatDateTimeWithSeconds } from "../utils/appUtils";

type BuildSeoMetaParams = {
  currentScreen: ScreenKey;
  activeTimelineSection: TimelineSectionKey;
  searchQuery: string;
  profileState: ProfileState;
  selectedUserProfile: UserProfileState;
  postDetail: PostDetailState;
  replyDetail: ReplyDetailState;
  pathname: string;
};

export type SeoMeta = {
  title: string;
  description: string;
  canonicalUrl: string;
  imageUrl: string;
  keywords: string[];
  structuredData: Record<string, unknown>[];
};

const advisorSearchKeywords = [
  "部活 顧問",
  "部活 顧問 悩み",
  "部活 顧問 相談",
  "部活指導",
  "部活動 指導",
  "専門外 部活 顧問",
  "教員 部活 負担",
  "中学校 部活 指導",
  "高校 部活 指導",
  "部活 練習メニュー",
  "部活動 練習メニュー",
  "部活 戦術",
  "大会前 練習",
  "短時間 練習メニュー",
  "雨の日 練習",
  "初心者 指導",
  "少人数 練習",
  "道具 少ない 練習",
  "怪我予防 部活",
  "ストレッチ 部活",
  "顧問同士 コミュニティ",
  "部活 コミュニティ",
  "部活 Q&A",
  "部活 ベストアンサー",
  "外部指導者 探す",
  "部活 外部コーチ",
  "地域クラブ 指導者",
];

const coachSearchKeywords = [
  "指導者 登録",
  "部活 指導者",
  "外部指導者",
  "外部コーチ",
  "スポーツ指導者",
  "文化部 指導者",
  "コーチ 集客",
  "コーチ プロフィール",
  "指導者 プロフィール",
  "練習メニュー 投稿",
  "戦術 解説",
  "指導経験 発信",
  "指導実績",
  "指導者 バッジ",
  "指導者 信頼スコア",
  "ベストアンサー 指導者",
  "オンライン相談 指導者",
  "有料相談 指導者",
  "スクール 宣伝",
  "YouTube 指導者",
  "Instagram 指導者",
  "X 指導者",
  "トレーナー 活動",
  "怪我予防 指導",
  "ストレッチ 指導",
];

const sportSearchKeywords = sportGroups.flatMap((group) =>
  group.items.flatMap((sport) => [
    `${sport} 部活`,
    `${sport} 指導`,
    `${sport} 練習メニュー`,
    `${sport} 戦術`,
    `${sport} コーチ`,
  ])
);

const baseSeoKeywords = [
  "Komonity",
  "コモニティ",
  "部活支援",
  "部活SNS",
  "部活動SNS",
  "部活 ナレッジ共有",
  "練習メニュー共有",
  "戦術共有",
  "指導者検索",
  ...advisorSearchKeywords,
  ...coachSearchKeywords,
  ...sportSearchKeywords,
];

const uniqueKeywords = (...keywordGroups: Array<Array<string | undefined>>) =>
  Array.from(new Set(keywordGroups.flat().filter((keyword): keyword is string => Boolean(keyword))));

const createStructuredData = ({
  title,
  description,
  canonicalUrl,
  imageUrl,
  keywords,
}: Omit<SeoMeta, "structuredData">): Record<string, unknown>[] => [
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Komonity",
    alternateName: "コモニティ",
    url: DEFAULT_PUBLIC_SITE_URL,
    inLanguage: "ja-JP",
    description:
      "顧問の先生と指導者をつなぎ、部活の練習メニュー・戦術・相談・コミュニティを共有できるサービスです。",
    potentialAction: {
      "@type": "SearchAction",
      target: `${DEFAULT_PUBLIC_SITE_URL}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  },
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Komonity",
    url: DEFAULT_PUBLIC_SITE_URL,
    logo: imageUrl,
    sameAs: [DEFAULT_PUBLIC_SITE_URL],
  },
  {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: title,
    url: canonicalUrl,
    description,
    image: imageUrl,
    inLanguage: "ja-JP",
    keywords: keywords.join(", "),
    isPartOf: {
      "@type": "WebSite",
      name: "Komonity",
      url: DEFAULT_PUBLIC_SITE_URL,
    },
  },
];

const createSeoMeta = ({
  title,
  description,
  canonicalUrl,
  imageUrl = DEFAULT_OG_IMAGE_URL,
  keywords = [],
  structuredData = [],
}: Omit<SeoMeta, "keywords" | "structuredData"> &
  Partial<Pick<SeoMeta, "keywords" | "structuredData">>): SeoMeta => {
  const mergedKeywords = uniqueKeywords(baseSeoKeywords, keywords).slice(0, 220);
  const baseStructuredData = createStructuredData({
    title,
    description,
    canonicalUrl,
    imageUrl,
    keywords: mergedKeywords,
  });

  return {
    title,
    description,
    canonicalUrl,
    imageUrl,
    keywords: mergedKeywords,
    structuredData: [...baseStructuredData, ...structuredData],
  };
};

const createAbsoluteUrl = (pathname: string) => {
  const normalizedPath = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return `${DEFAULT_PUBLIC_SITE_URL}${normalizedPath === "/" ? "" : normalizedPath}`;
};

const sectionLabelMap = Object.fromEntries(
  timelineSections.map((section) => [section.key, section.label])
) as Record<TimelineSectionKey, string>;

const sectionKeywordMap: Record<TimelineSectionKey, string[]> = {
  all: [
    "部活 投稿一覧",
    "部活ナレッジ",
    "顧問 相談",
    "指導者 投稿",
    "練習メニュー 検索",
  ],
  feed: [
    "今日の練習メニュー",
    "練習メニュー テンプレート",
    "部活 メニュー",
    "部活 戦術",
    "指導者 練習メニュー",
  ],
  questions: [
    "部活 顧問 相談",
    "部活 Q&A",
    "顧問 悩み",
    "専門外 部活 相談",
    "ベストアンサー 部活",
  ],
  community: [
    "顧問 コミュニティ",
    "部活 コミュニティ",
    "顧問同士",
    "部活運営 相談",
    "部活 資料共有",
  ],
  following: [
    "フォロー中 投稿",
    "指導者 投稿通知",
    "見逃さない 投稿",
    "コーチ 投稿一覧",
  ],
};

const serviceStructuredData = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Komonity",
  alternateName: "コモニティ",
  applicationCategory: "EducationalApplication",
  operatingSystem: "Web",
  url: DEFAULT_PUBLIC_SITE_URL,
  image: DEFAULT_OG_IMAGE_URL,
  inLanguage: "ja-JP",
  description:
    "専門外の部活指導で悩む顧問の先生と、練習メニュー・戦術・怪我予防などの知見を持つ指導者をつなぐ部活支援SNSです。",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "JPY",
  },
  audience: [
    {
      "@type": "Audience",
      audienceType: "部活顧問・教員",
    },
    {
      "@type": "Audience",
      audienceType: "部活指導者・外部コーチ・競技経験者",
    },
  ],
};

/**
 * 画面状態から Web 向けの title / description / canonical を生成します。
 * 完全な検索順位を保証するものではありませんが、共有時と検索時の基礎情報を整えます。
 */
export function buildSeoMeta({
  currentScreen,
  activeTimelineSection,
  searchQuery,
  profileState,
  selectedUserProfile,
  postDetail,
  replyDetail,
  pathname,
}: BuildSeoMetaParams): SeoMeta {
  const canonicalUrl = createAbsoluteUrl(pathname);

  if (currentScreen === "top") {
    const sectionLabel = sectionLabelMap[activeTimelineSection];
    return createSeoMeta({
      title:
        activeTimelineSection === "all"
          ? "Komonity | 部活の練習メニュー・戦術・相談を探せるタイムライン"
          : `Komonity | ${sectionLabel}の投稿一覧`,
      description:
        activeTimelineSection === "all"
          ? "顧問の先生が部活指導の悩みを相談し、指導者の練習メニュー・戦術・怪我予防・コミュニティ投稿をまとめて探せる Komonity のタイムラインです。"
          : `${sectionLabel}に関する投稿を確認できます。部活顧問の先生が現場で使える知見や、指導者が共有する実践的な情報を探せます。`,
      canonicalUrl,
      imageUrl: DEFAULT_OG_IMAGE_URL,
      keywords: sectionKeywordMap[activeTimelineSection],
      structuredData: activeTimelineSection === "all" ? [serviceStructuredData] : [],
    });
  }

  const standalonePageMeta: Partial<Record<ScreenKey, Pick<SeoMeta, "title" | "description">>> = {
    feed: {
      title: "Komonity | 部活のメニュー・戦術投稿",
      description:
        "指導者が共有する部活の練習メニュー、戦術、対象レベル、人数、時間、道具、注意点を確認できる投稿一覧です。",
    },
    questions: {
      title: "Komonity | 部活顧問の相談広場",
      description:
        "顧問の先生が専門外の部活指導、練習メニュー、怪我予防、部活運営の悩みを相談し、指導者や他の顧問から回答を得られるページです。",
    },
    community: {
      title: "Komonity | 顧問同士の部活コミュニティ",
      description:
        "顧問同士の情報交換、部活運営の相談、資料共有、練習の工夫を共有できるコミュニティページです。",
    },
    "following-feed": {
      title: "Komonity | フォロー中の投稿",
      description:
        "フォローしている指導者や顧問の投稿をまとめて確認できるページです。",
    },
  };
  const standaloneMeta = standalonePageMeta[currentScreen];

  if (standaloneMeta) {
    return createSeoMeta({
      ...standaloneMeta,
      canonicalUrl,
      imageUrl: DEFAULT_OG_IMAGE_URL,
      keywords:
        currentScreen === "feed"
          ? sectionKeywordMap.feed
          : currentScreen === "questions"
            ? sectionKeywordMap.questions
            : currentScreen === "community"
              ? sectionKeywordMap.community
              : sectionKeywordMap.following,
    });
  }

  if (currentScreen === "service-detail") {
    return createSeoMeta({
      title: "Komonity | 専門外の部活指導で悩む顧問と指導者をつなぐサービス",
      description:
        "専門外の部活指導で悩む顧問の先生と、練習メニュー・戦術・怪我予防の知見を持つ指導者をつなぐ部活支援SNSです。先行公開中で、指導者・経験者の参加を歓迎しています。",
      canonicalUrl,
      imageUrl: DEFAULT_OG_IMAGE_URL,
      keywords: [
        "部活支援サービス",
        "部活 顧問 サービス",
        "外部指導者 マッチング",
        "指導者 募集",
        "部活 練習メニュー 共有",
      ],
      structuredData: [serviceStructuredData],
    });
  }

  if (currentScreen === "search") {
    return createSeoMeta({
      title: searchQuery ? `Komonity | 「${searchQuery}」の検索結果` : "Komonity | 検索",
      description: searchQuery
        ? `Komonity 内で「${searchQuery}」に関する練習メニュー、戦術、相談、コミュニティ投稿、指導者アカウントを検索した結果です。`
        : "部活の練習メニュー、戦術、相談、指導者、顧問コミュニティを検索できるページです。",
      canonicalUrl,
      imageUrl: DEFAULT_OG_IMAGE_URL,
      keywords: searchQuery
        ? [searchQuery, `${searchQuery} 部活`, `${searchQuery} 練習メニュー`, `${searchQuery} 指導`]
        : ["部活 検索", "指導者 検索", "練習メニュー 検索", "顧問 相談 検索"],
    });
  }

  if (currentScreen === "user-profile") {
    return createSeoMeta({
      title: `Komonity | ${selectedUserProfile.name}`,
      description:
        selectedUserProfile.bio?.trim() ||
        `${selectedUserProfile.name} さんのプロフィール、指導可能種目、投稿、回答、ベストアンサーを確認できるページです。`,
      canonicalUrl,
      imageUrl: DEFAULT_OG_IMAGE_URL,
      keywords: [
        selectedUserProfile.name,
        selectedUserProfile.role,
        ...selectedUserProfile.selectedSports,
        ...selectedUserProfile.selectedSports.map((sport) => `${sport} 指導者`),
      ],
    });
  }

  if (currentScreen === "mypage") {
    return createSeoMeta({
      title: `Komonity | ${profileState.name} のマイページ`,
      description: "Komonity における自分の投稿、回答、通知状況を確認できるマイページです。",
      canonicalUrl,
      imageUrl: DEFAULT_OG_IMAGE_URL,
    });
  }

  if (currentScreen === "experts") {
    return createSeoMeta({
      title: "Komonity | 話題の指導者",
      description:
        "種目、活動実績、バッジ、フォロワー数、ベストアンサー数などを参考に、部活指導の知見を持つ話題の指導者を探せるページです。",
      canonicalUrl,
      imageUrl: DEFAULT_OG_IMAGE_URL,
      keywords: ["話題の指導者", "部活 指導者 探す", "外部コーチ 探す", "指導者 ランキング"],
    });
  }

  if (currentScreen === "notifications") {
    return createSeoMeta({
      title: "Komonity | 通知",
      description:
        "いいね、返信、保存、再投稿、投稿通知など、Komonity内の反応を確認できる通知ページです。",
      canonicalUrl,
      imageUrl: DEFAULT_OG_IMAGE_URL,
    });
  }

  if (currentScreen === "post-compose") {
    return createSeoMeta({
      title: "Komonity | 投稿する",
      description:
        "練習メニュー、相談、コミュニティ投稿を作成し、部活現場で使える知見を共有するページです。",
      canonicalUrl,
      imageUrl: DEFAULT_OG_IMAGE_URL,
    });
  }

  if (currentScreen === "profile-edit") {
    return createSeoMeta({
      title: "Komonity | プロフィール編集",
      description:
        "表示名、アイコン、ヘッダー画像、種目、指導者プロフィールなどを編集できるページです。",
      canonicalUrl,
      imageUrl: DEFAULT_OG_IMAGE_URL,
    });
  }

  if (currentScreen === "registration-role") {
    return createSeoMeta({
      title: "Komonity | 新規登録",
      description:
        "顧問アカウントまたは指導者アカウントを選んで、Komonityへの登録を始めるページです。",
      canonicalUrl,
      imageUrl: DEFAULT_OG_IMAGE_URL,
    });
  }

  if (currentScreen === "advisor-registration") {
    return createSeoMeta({
      title: "Komonity | 顧問登録",
      description:
        "部活顧問として相談投稿やコミュニティ参加を始めるためのアカウント登録ページです。",
      canonicalUrl,
      imageUrl: DEFAULT_OG_IMAGE_URL,
    });
  }

  if (currentScreen === "coach-registration") {
    return createSeoMeta({
      title: "Komonity | 指導者登録",
      description:
        "指導経験、専門種目、得意分野、資格、所属スクール、YouTubeやSNS、相談受付可否を登録し、指導者として部活現場へ知見を届けるためのページです。",
      canonicalUrl,
      imageUrl: DEFAULT_OG_IMAGE_URL,
      keywords: ["指導者 登録", "コーチ 登録", "外部指導者 登録", "指導者 プロフィール"],
    });
  }

  if (currentScreen === "login") {
    return createSeoMeta({
      title: "Komonity | ログイン",
      description:
        "Komonityにログインして、投稿、返信、保存、通知、プロフィール管理を利用するページです。",
      canonicalUrl,
      imageUrl: DEFAULT_OG_IMAGE_URL,
    });
  }

  if (currentScreen === "forgot-password") {
    return createSeoMeta({
      title: "Komonity | パスワード再設定",
      description: "Komonityアカウントのパスワード再設定メールを送信するページです。",
      canonicalUrl,
      imageUrl: DEFAULT_OG_IMAGE_URL,
    });
  }

  if (currentScreen === "contact") {
    return createSeoMeta({
      title: "Komonity | お問い合わせ",
      description:
        "Komonityへのお問い合わせ、改善要望、不具合連絡、スパム報告などを送信できるページです。",
      canonicalUrl,
      imageUrl: DEFAULT_OG_IMAGE_URL,
    });
  }

  if (currentScreen === "relationship-list") {
    return createSeoMeta({
      title: "Komonity | フォロー一覧",
      description:
        "Komonityでフォローしているアカウントやフォロワーを確認できるページです。",
      canonicalUrl,
      imageUrl: DEFAULT_OG_IMAGE_URL,
    });
  }

  if (currentScreen === "post-detail" && postDetail.id) {
    return createSeoMeta({
      title: `Komonity | ${postDetail.title || "投稿詳細"}`,
      description:
        postDetail.body.slice(0, 120) ||
        `${postDetail.author} さんによる投稿詳細ページです。`,
      canonicalUrl,
      imageUrl: DEFAULT_OG_IMAGE_URL,
      keywords: [
        postDetail.title,
        postDetail.author,
        postDetail.source,
        ...postDetail.tags,
        ...postDetail.sports,
      ],
    });
  }

  if (currentScreen === "reply-detail" && replyDetail.reply.id) {
    return createSeoMeta({
      title: `Komonity | 返信の詳細`,
      description:
        replyDetail.reply.body.slice(0, 120) ||
        `返信の詳細ページです。最終更新 ${formatDateTimeWithSeconds(Date.now())}`,
      canonicalUrl,
      imageUrl: DEFAULT_OG_IMAGE_URL,
    });
  }

  if (currentScreen === "privacy-policy") {
    return createSeoMeta({
      title: "Komonity | プライバシーポリシー",
      description: "Komonity の個人情報の取扱い方針です。",
      canonicalUrl,
      imageUrl: DEFAULT_OG_IMAGE_URL,
    });
  }

  if (currentScreen === "terms") {
    return createSeoMeta({
      title: "Komonity | 利用規約",
      description: "Komonity を利用する際の基本的なルールです。",
      canonicalUrl,
      imageUrl: DEFAULT_OG_IMAGE_URL,
    });
  }

  return createSeoMeta({
    title: "Komonity",
    description:
      "顧問の先生と指導者をつなぎ、メニュー・戦術、相談、コミュニティを通じて知見を共有できるサービスです。",
    canonicalUrl,
    imageUrl: DEFAULT_OG_IMAGE_URL,
  });
}
