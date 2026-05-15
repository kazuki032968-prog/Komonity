export type OfficialContentKind = "menu" | "strategy";

export type OfficialMenuEnvironment = "normal" | "outdoor" | "rainy";

export type OfficialPostSchedule = {
  kind: OfficialContentKind;
  label: string;
  weekdays: readonly number[];
  hour: number;
  minuteWindow: readonly [number, number];
  description: string;
};

export const OFFICIAL_CONTENT_REUSE_DAYS = 14;

export const OFFICIAL_OUTDOOR_SPORTS = [
  "サッカー",
  "野球",
  "ソフトボール",
  "テニス",
  "ソフトテニス",
  "陸上",
  "陸上競技",
  "駅伝",
  "ラグビー",
  "ハンドボール",
  "登山",
] as const;

export const OFFICIAL_POST_SCHEDULES = [
  {
    kind: "menu",
    label: "朝練メニュー",
    weekdays: [1, 2, 3, 4, 5],
    hour: 5,
    minuteWindow: [0, 19],
    description: "平日の朝5時ごろに、その日の朝練で使いやすい短時間メニューを投稿します。",
  },
  {
    kind: "menu",
    label: "午後練メニュー",
    weekdays: [1, 2, 3, 4, 5],
    hour: 12,
    minuteWindow: [0, 19],
    description: "平日の12時ごろに、放課後の午後練で使いやすい練習メニューを投稿します。",
  },
  {
    kind: "menu",
    label: "土日の練習メニュー",
    weekdays: [5, 6],
    hour: 20,
    minuteWindow: [0, 19],
    description: "金曜・土曜の20時ごろに、土日の長めの練習で使いやすいメニューを投稿します。",
  },
  {
    kind: "strategy",
    label: "朝の戦術共有",
    weekdays: [0, 1, 2, 3, 4, 5, 6],
    hour: 7,
    minuteWindow: [0, 19],
    description: "毎朝7時ごろに、試合や練習前に確認しやすい戦術の要点を投稿します。",
  },
  {
    kind: "strategy",
    label: "夜の戦術共有",
    weekdays: [0, 1, 2, 3, 4, 5, 6],
    hour: 20,
    minuteWindow: [20, 39],
    description: "毎晩20時ごろに、翌日の指導へつなげやすい戦術整理を投稿します。",
  },
] as const satisfies readonly OfficialPostSchedule[];

export const OFFICIAL_CONTENT_QUALITY_CHECKLIST = [
  "種目ごとの専門用語・現場課題・道具条件を必ず入れる",
  "目的、手順、注意点、失敗例、アレンジ方法を具体的に書く",
  "同じ内容の再投稿は最低14日以上あけ、同じ順番のサイクルにしない",
  "屋外種目は外練習と雨天練習を分け、天候に合うメニューにする",
  "顧問の先生がそのまま部活で使える粒度まで落とし込む",
] as const;

export const getOfficialMenuAccountName = (
  sport: string,
  environment: OfficialMenuEnvironment = "normal"
) => {
  if (environment === "outdoor") {
    return `Komonity公式${sport}外練習メニュー`;
  }

  if (environment === "rainy") {
    return `Komonity公式${sport}雨天練習メニュー`;
  }

  return `Komonity公式${sport}練習メニュー`;
};

export const getOfficialStrategyAccountName = (sport: string) =>
  `Komonity公式${sport}戦術`;

export const getOfficialAccountName = ({
  sport,
  kind,
  environment = "normal",
}: {
  sport: string;
  kind: OfficialContentKind;
  environment?: OfficialMenuEnvironment;
}) =>
  kind === "strategy"
    ? getOfficialStrategyAccountName(sport)
    : getOfficialMenuAccountName(sport, environment);
