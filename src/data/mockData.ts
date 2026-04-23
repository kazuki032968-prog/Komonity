export type TabKey =
  | "feed"
  | "questions"
  | "experts"
  | "community"
  | "mypage";

export const tabs: Array<{ key: TabKey; label: string }> = [
  { key: "feed", label: "タイムライン" },
  { key: "questions", label: "相談広場" },
  { key: "experts", label: "指導者" },
  { key: "community", label: "コミュニティ" },
  { key: "mypage", label: "マイページ" },
];

export const overviewStats = [
  { label: "月間相談数", value: "1,248", note: "ベストアンサー率 78%" },
  { label: "登録指導者", value: "216", note: "個人 / 組織どちらも参加" },
  { label: "公開ナレッジ投稿", value: "3,482", note: "毎日のメニュー共有が活発" },
];

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
    items: [
      "陸上",
      "駅伝",
      "水泳",
      "体操",
      "剣道",
      "柔道",
      "空手道",
      "弓道",
      "登山",
    ],
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
];

export const feedPosts = [
  {
    id: "post-1",
    author: "桜川アカデミー",
    role: "組織アカウント",
    title: "今日の守備連動メニュー",
    body:
      "10分の対人ステップ、15分の2対1、最後にゲーム形式で声かけ評価。顧問の先生でも回しやすいように、笛のタイミングまでテンプレ化しています。",
    tags: ["毎日メニュー", "中学サッカー", "動画付き"],
    sports: ["サッカー"],
    likes: 284,
    reposts: 61,
    comments: 18,
    replies: [
      { id: "feed-reply-1", author: "北中サッカー顧問", body: "この流れなら現場でも回しやすそうです。" },
    ],
  },
  {
    id: "post-2",
    author: "山本 真理",
    role: "元全国大会コーチ",
    title: "新人戦前に見直したい練習設計",
    body:
      "強度を上げる前に、目的が共有されているかを確認するだけで練習効率はかなり変わります。顧問向けに1週間の配分例を公開しました。",
    tags: ["指導ノウハウ", "新人戦", "顧問向け"],
    sports: ["バスケットボール"],
    likes: 512,
    reposts: 143,
    comments: 42,
    replies: [
      { id: "feed-reply-2", author: "女子バスケ顧問B", body: "配分例がとても参考になりました。" },
    ],
  },
  {
    id: "post-3",
    author: "響ブラスラボ",
    role: "指導員アカウント",
    title: "本番前2週間の合奏メニュー",
    body:
      "集中が切れやすい時期は、30分ごとに録音を挟むと改善しやすいです。顧問の先生でも進行しやすい流れを共有します。",
    tags: ["本番対策", "吹奏楽", "毎日メニュー"],
    sports: ["吹奏楽"],
    likes: 163,
    reposts: 27,
    comments: 11,
    replies: [
      { id: "feed-reply-3", author: "吹奏楽顧問A", body: "録音を挟む案、次回試してみます。" },
    ],
  },
  {
    id: "post-4",
    author: "アトリエノート",
    role: "組織アカウント",
    title: "美術部の新歓で使いやすい体験メニュー",
    body:
      "新入部員が入りやすくなるように、20分で終わる作品体験を3種類まとめました。展示の見せ方もセットで紹介しています。",
    tags: ["新歓", "美術", "部活運営"],
    sports: ["美術"],
    likes: 94,
    reposts: 19,
    comments: 7,
    replies: [
      { id: "feed-reply-4", author: "美術部顧問", body: "新歓にそのまま使えそうです。" },
    ],
  },
];

export const questions = [
  {
    id: "question-1",
    category: "バスケットボール",
    title: "初心者が多いチームで、45分しか取れない日に何を優先すべき？",
    body: "基礎練習と実戦感覚のどちらを優先するべきか悩んでいます。短時間でも達成感が出る進め方が知りたいです。",
    author: "県立北高校 女子バスケ部",
    answers: 12,
    bestAnswer:
      "基礎ドリブルと2対1の判断をセットにする構成がおすすめです。技術とゲーム理解を一度に進められます。",
    replies: [
      { id: "question-reply-1", author: "元実業団コーチ", body: "判断系を混ぜるのは短時間練習と相性がいいです。" },
    ],
  },
  {
    id: "question-2",
    category: "吹奏楽",
    title: "本番2週間前の集中力維持の工夫を知りたいです",
    body: "合奏が続くと集中が切れやすく、部員の温度差も出てきます。限られた時間で空気を整える工夫が知りたいです。",
    author: "緑ヶ丘中 吹奏楽部",
    answers: 8,
    bestAnswer:
      "顧問だけで抱えず、OBやパートリーダーに役割を分散して短い成功体験を積ませる方法が効果的です。",
    replies: [
      { id: "question-reply-2", author: "吹奏楽トレーナー", body: "短い成功体験を積ませるのは本当に効きます。" },
    ],
  },
];

export const experts = [
  {
    id: "expert-1",
    name: "高橋 亮介",
    type: "個人",
    headline: "全国優勝経験あり / 現在は指導者育成事業を運営",
    followers: "12.4K",
    likes: "28.1K",
    reposts: "3.3K",
    promotions: "オンライン講座 / 合宿メニュー監修",
  },
  {
    id: "expert-2",
    name: "Next Play Lab",
    type: "組織",
    headline: "学校部活動向けの練習設計テンプレートを提供",
    followers: "8.9K",
    likes: "19.7K",
    reposts: "2.1K",
    promotions: "顧問研修 / 地域連携プログラム",
  },
];

export const communityItems = [
  {
    id: "community-1",
    title: "顧問向け資料共有",
    author: "Komonity運営",
    body: "部員募集、保護者説明会、年間計画のテンプレートを持ち寄って、現場で使える形に磨いていくスレッドです。",
    cta: "共有スレッドを見る",
    replies: [
      { id: "community-reply-1", author: "演劇部顧問", body: "保護者説明会のテンプレが助かりました。" },
    ],
  },
  {
    id: "community-2",
    title: "顧問同士の相互支援",
    author: "Komonity運営",
    body: "新年度の部員集め、保護者説明会、遠征準備などを公開相談で支え合える場として設計しています。",
    cta: "コミュニティを見る",
    replies: [
      { id: "community-reply-2", author: "科学部顧問", body: "文化部向けの運営相談も増やしたいです。" },
    ],
  },
];

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
];

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
];

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
];

export const myPageProfile = {
  name: "Coach Nexus",
  handle: "@coach_nexus",
  role: "指導員アカウント",
  bio:
    "部活動の現場で使いやすい練習設計と、顧問の先生が相談しやすい発信を続けています。毎日のメニュー共有と公開Q&Aを中心に活動中です。",
  link: "komonity.jp/profile/coach-nexus",
  externalLinks: [],
  joined: "2026年4月からKomonityを利用",
  following: "128",
  followers: "2,430",
  posts: "48",
  selectedSports: ["バスケットボール", "吹奏楽"],
};

export const myPageTabs = [
  { key: "posts", label: "投稿" },
  { key: "answers", label: "回答" },
  { key: "best_answers", label: "ベストアンサー" },
];

export const myPagePosts = [
  {
    id: "mypost-1",
    title: "今日のメニュー共有",
    body:
      "新入生が多い日は、最初の15分で共通理解を作るだけで全体の質が上がります。今日はウォームアップから判断要素を入れた構成にしました。",
    meta: "2時間前",
    comments: 12,
    reposts: 8,
    likes: 94,
  },
  {
    id: "mypost-2",
    title: "ベストアンサーに選ばれた相談",
    body:
      "45分練習の組み方について、技術練習とゲーム理解を分けすぎない構成を提案しました。短時間でも手応えを作りやすいです。",
    meta: "昨日",
    comments: 6,
    reposts: 4,
    likes: 57,
  },
];

export const searchTabs = [
  { key: "trending-posts", label: "話題の投稿" },
  { key: "recent", label: "最近" },
  { key: "accounts", label: "アカウント" },
];
