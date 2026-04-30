import { DEFAULT_OG_IMAGE_URL, DEFAULT_PUBLIC_SITE_URL, timelineSections } from "../constants/app";
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
};

const createSeoMeta = ({
  title,
  description,
  canonicalUrl,
  imageUrl = DEFAULT_OG_IMAGE_URL,
}: SeoMeta): SeoMeta => ({
  title,
  description,
  canonicalUrl,
  imageUrl,
});

const createAbsoluteUrl = (pathname: string) => {
  const normalizedPath = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return `${DEFAULT_PUBLIC_SITE_URL}${normalizedPath === "/" ? "" : normalizedPath}`;
};

const sectionLabelMap = Object.fromEntries(
  timelineSections.map((section) => [section.key, section.label])
) as Record<TimelineSectionKey, string>;

/**
 * 画面状態から Web 向けの title / description / canonical を生成します。
 * 完全な SEO を保証するものではありませんが、共有時と検索時の基礎情報を整えます。
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
          ? "Komonity | タイムライン"
          : `Komonity | ${sectionLabel}`,
      description:
        activeTimelineSection === "all"
          ? "メニュー・戦術、相談広場、コミュニティなどの投稿をまとめて確認できる Komonity のタイムラインです。"
          : `${sectionLabel} に関する投稿を確認できる Komonity のタイムラインです。`,
      canonicalUrl,
      imageUrl: DEFAULT_OG_IMAGE_URL,
    });
  }

  const standalonePageMeta: Partial<Record<ScreenKey, Pick<SeoMeta, "title" | "description">>> = {
    feed: {
      title: "Komonity | メニュー・戦術",
      description:
        "指導者が共有する練習メニューや戦術を確認できるKomonityの投稿一覧です。",
    },
    questions: {
      title: "Komonity | 相談広場",
      description:
        "顧問の先生が部活指導の悩みを相談し、指導者や他の顧問から回答を得られるページです。",
    },
    community: {
      title: "Komonity | コミュニティ",
      description:
        "顧問同士の情報交換や資料共有など、部活運営に関する交流を行うページです。",
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
    });
  }

  if (currentScreen === "service-detail") {
    return createSeoMeta({
      title: "Komonity | サービス詳細",
      description:
        "専門外の部活指導で悩む顧問の先生と、知見を持つ指導者をつなぐ Komonity のサービス詳細ページです。",
      canonicalUrl,
      imageUrl: DEFAULT_OG_IMAGE_URL,
    });
  }

  if (currentScreen === "search") {
    return createSeoMeta({
      title: searchQuery ? `Komonity | 「${searchQuery}」の検索結果` : "Komonity | 検索",
      description: searchQuery
        ? `Komonity 内で「${searchQuery}」に関する投稿やアカウントを検索した結果です。`
        : "Komonity 内の投稿やアカウントを検索できるページです。",
      canonicalUrl,
      imageUrl: DEFAULT_OG_IMAGE_URL,
    });
  }

  if (currentScreen === "user-profile") {
    return createSeoMeta({
      title: `Komonity | ${selectedUserProfile.name}`,
      description:
        selectedUserProfile.bio?.trim() ||
        `${selectedUserProfile.name} さんのプロフィールと投稿一覧です。`,
      canonicalUrl,
      imageUrl: DEFAULT_OG_IMAGE_URL,
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
        "種目や活動実績、バッジ、フォロワー数などを参考に、部活指導の知見を持つ指導者を探せるページです。",
      canonicalUrl,
      imageUrl: DEFAULT_OG_IMAGE_URL,
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
        "指導経験、専門種目、外部サイト、相談受付可否などを登録し、指導者として知見を届けるためのページです。",
      canonicalUrl,
      imageUrl: DEFAULT_OG_IMAGE_URL,
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
