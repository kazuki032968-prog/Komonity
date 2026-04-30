import type {
  CommunityPost,
  FeedPost,
  QuestionPost,
  SearchAccountItem,
  TodayMenuConditionKey,
  UserDirectoryMeta,
} from "../types/app";

const sports = [
  "サッカー",
  "野球",
  "バスケットボール",
  "バレーボール",
  "テニス",
  "卓球",
  "陸上競技",
  "水泳",
  "バドミントン",
  "吹奏楽",
  "合唱",
  "演劇",
  "美術",
  "書道",
  "科学",
  "ロボット",
] as const;

const coachNames = [
  "青葉トレーニングラボ",
  "北斗メニュー研究所",
  "桜川アカデミー",
  "みなと戦術室",
  "白鳥コンディショニング",
  "風間コーチング",
  "藤沢ベースアップ",
  "千歳スキル工房",
] as const;

const advisorNames = [
  "夕凪顧問",
  "北町クラブ顧問",
  "青空部活ノート",
  "緑丘サポート",
  "南風先生",
  "はじめて顧問",
] as const;

const levelOptions = ["初心者", "初級", "中級", "上級", "大会前"] as const;
const gradeOptions = ["中学生", "高校生", "全学年", "中学1年", "高校1年"] as const;
const conditionKeys: TodayMenuConditionKey[] = [
  "under60",
  "beginner",
  "rainy",
  "preTournament",
  "fewTools",
  "mixedAbility",
];

const baseTime = Date.UTC(2026, 3, 30, 9, 0, 0);
const dayMs = 24 * 60 * 60 * 1000;

const pick = <T,>(items: readonly T[], index: number) => items[index % items.length];
const pad = (value: number) => String(value).padStart(3, "0");

export const mockCoachAccounts: SearchAccountItem[] = Array.from({ length: 100 }, (_, index) => {
  const number = index + 1;
  const sportA = pick(sports, index);
  const sportB = pick(sports, index + 5);
  const baseName = pick(coachNames, index);

  return {
    id: `mock-coach-${pad(number)}`,
    name: `${baseName} ${number}`,
    handle: `@mock_coach_${pad(number)}`,
    bio: `${sportA}を中心に、顧問の先生がそのまま使いやすい練習設計と声かけ例を発信しています。`,
    followers: String(18 + ((index * 37) % 2400)),
    featured: index < 12,
    role: index % 9 === 0 ? "指導員組織アカウント" : "指導員アカウント",
    selectedSports: Array.from(new Set([sportA, sportB])),
    strengths: `${sportA}の基礎づくり、短時間メニュー、試合前の確認`,
    supportTopics: "初心者対応、人数差がある日の運営、怪我予防、練習のマンネリ解消",
    certifications: index % 3 === 0 ? "公認指導者資格 / 救急講習修了" : "地域クラブ指導経験あり",
    organization: index % 4 === 0 ? `${baseName}スクール` : "",
    youtubeUrl: index % 5 === 0 ? `https://example.com/youtube/mock-coach-${number}` : "",
    xUrl: index % 4 === 0 ? `https://example.com/x/mock-coach-${number}` : "",
    instagramUrl: index % 6 === 0 ? `https://example.com/instagram/mock-coach-${number}` : "",
    consultationAvailable: index % 2 === 0,
    paidConsultationAvailable: index % 5 === 0,
  };
});

export const mockAdvisorAccounts: SearchAccountItem[] = Array.from({ length: 50 }, (_, index) => {
  const number = index + 1;
  const sportA = pick(sports, index + 2);
  const sportB = pick(sports, index + 9);
  const baseName = pick(advisorNames, index);

  return {
    id: `mock-advisor-${pad(number)}`,
    name: `${baseName} ${number}`,
    handle: `@mock_advisor_${pad(number)}`,
    bio: `${sportA}を担当中。専門外の種目も横断して情報収集しながら、部活運営を改善しています。`,
    followers: String(2 + ((index * 11) % 120)),
    featured: false,
    role: "顧問アカウント",
    selectedSports: Array.from(new Set([sportA, sportB])),
  };
});

export const mockDirectoryAccounts: SearchAccountItem[] = [
  ...mockCoachAccounts,
  ...mockAdvisorAccounts,
];

export const mockDirectoryMetaMap: Record<string, UserDirectoryMeta> =
  mockDirectoryAccounts.reduce<Record<string, UserDirectoryMeta>>((accumulator, account) => {
    accumulator[account.id] = {
      externalLinks: account.youtubeUrl
        ? [{ id: `${account.id}-youtube`, label: "YouTube", url: account.youtubeUrl }]
        : [],
    };
    return accumulator;
  }, {});

export const mockFeedPosts: FeedPost[] = Array.from({ length: 140 }, (_, index) => {
  const coach = mockCoachAccounts[index % mockCoachAccounts.length];
  const sport = coach.selectedSports[index % coach.selectedSports.length];
  const level = pick(levelOptions, index);
  const minutes = 30 + ((index * 10) % 70);
  const conditionTags = Array.from(
    new Set([
      pick(conditionKeys, index),
      minutes <= 60 ? "under60" : pick(conditionKeys, index + 2),
    ])
  );

  return {
    id: `mock-feed-${pad(index + 1)}`,
    author: coach.name,
    authorHandle: coach.handle,
    createdByUid: coach.id,
    role: coach.role,
    title: `${sport}の${level}向け練習メニュー ${index + 1}`,
    body: `${minutes}分で回せるメニューです。#${sport} #練習メニュー\n顧問の先生がそのまま使えるよう、声かけと進行順をセットにしています。`,
    tags: [sport, "練習メニュー", level],
    sports: [sport],
    likes: 4 + ((index * 13) % 180),
    reposts: (index * 7) % 60,
    comments: 1 + ((index * 5) % 24),
    replies: [
      {
        id: `mock-feed-${index + 1}-reply-1`,
        author: pick(mockAdvisorAccounts, index).name,
        authorHandle: pick(mockAdvisorAccounts, index).handle,
        createdByUid: pick(mockAdvisorAccounts, index).id,
        body: "この流れなら現場でも回しやすそうです。人数が少ない日にも試してみます。",
        replies: [],
      },
    ],
    practiceMenu: {
      sport,
      targetLevel: level,
      grade: pick(gradeOptions, index),
      participants: `${8 + (index % 25)}人`,
      durationMinutes: `${minutes}分`,
      tools: index % 4 === 0 ? "ボール、コーン、タイマー" : "ボール、マーカー",
      purpose: "基礎の反復と判断スピードを高めること",
      steps: "1. ウォームアップ 2. ペア練習 3. 状況判断ドリル 4. ミニゲームで確認",
      cautions: "待ち時間が長くならないよう、少人数グループで回します。",
      commonMistakes: "説明が長くなり、実際に動く時間が短くなること。",
      arrangements: "初心者が多い場合は距離を短くし、上級者は条件を追加します。",
      conditionTags,
    },
    createdAtMs: baseTime - index * 6 * 60 * 60 * 1000,
  };
});

export const mockQuestionPosts: QuestionPost[] = Array.from({ length: 70 }, (_, index) => {
  const advisor = mockAdvisorAccounts[index % mockAdvisorAccounts.length];
  const coach = mockCoachAccounts[(index * 3) % mockCoachAccounts.length];
  const sport = advisor.selectedSports[0];

  return {
    id: `mock-question-${pad(index + 1)}`,
    category: sport,
    title: `${sport}で初心者が多い日の練習設計について`,
    body: `経験者と初心者の差が大きく、全員が退屈しないメニューに悩んでいます。#${sport} #初心者対応`,
    author: advisor.name,
    authorHandle: advisor.handle,
    createdByUid: advisor.id,
    answers: 1 + (index % 8),
    bestAnswer: index % 3 === 0 ? "段階別に同じテーマを扱うと、全員が参加しやすくなります。" : "まだベストアンサーはありません。",
    bestAnswerReplyId: index % 3 === 0 ? `mock-question-${index + 1}-reply-1` : undefined,
    replies: [
      {
        id: `mock-question-${index + 1}-reply-1`,
        author: coach.name,
        authorHandle: coach.handle,
        createdByUid: coach.id,
        body: "同じドリルを難易度別に3段階用意すると、経験差があっても同じ時間で進めやすいです。",
        replies: [],
      },
    ],
    createdAtMs: baseTime - index * 10 * 60 * 60 * 1000,
  };
});

export const mockCommunityPosts: CommunityPost[] = Array.from({ length: 50 }, (_, index) => {
  const advisor = mockAdvisorAccounts[(index * 2) % mockAdvisorAccounts.length];
  const sport = advisor.selectedSports[0];

  return {
    id: `mock-community-${pad(index + 1)}`,
    title: `${sport}担当者の情報交換スレッド ${index + 1}`,
    author: advisor.name,
    authorHandle: advisor.handle,
    createdByUid: advisor.id,
    body: `練習場所や人数が限られる日の工夫を共有しましょう。#${sport} #部活運営`,
    cta: "スレッドを見る",
    replies: [
      {
        id: `mock-community-${index + 1}-reply-1`,
        author: pick(mockCoachAccounts, index).name,
        authorHandle: pick(mockCoachAccounts, index).handle,
        createdByUid: pick(mockCoachAccounts, index).id,
        body: "活動時間が短い日は、目的を1つに絞ると成果が見えやすいです。",
        replies: [],
      },
    ],
    createdAtMs: baseTime - index * dayMs,
  };
});
