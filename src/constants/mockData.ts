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

const regions = [
  "青葉",
  "北町",
  "桜川",
  "みなと",
  "白鳥",
  "風間",
  "藤沢",
  "千歳",
  "若葉",
  "東雲",
  "晴海",
  "清瀬",
  "朝凪",
  "瑞穂",
  "高森",
  "南丘",
] as const;

const coachProfileLabels = [
  "実践ラボ",
  "メニュー研究室",
  "育成ノート",
  "戦術クリニック",
  "基礎づくり工房",
  "コンディション室",
  "現場サポート",
  "スキルデザイン",
] as const;

const advisorProfileLabels = [
  "部活ノート",
  "顧問メモ",
  "放課後記録",
  "運営ログ",
  "相談メモ",
  "活動ノート",
] as const;

const toHandleText = (value: string) =>
  value
    .replace(/[・〜]/g, "_")
    .replace(/[^a-zA-Z0-9_\u3040-\u30ff\u3400-\u9fff]/g, "")
    .toLowerCase();

type PracticeMenuSeed = {
  sport: string;
  title: string;
  body: string;
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
  tags: string[];
  conditionTags: TodayMenuConditionKey[];
};

type QuestionSeed = {
  sport: string;
  title: string;
  body: string;
  answer: string;
};

type CommunitySeed = {
  sport: string;
  title: string;
  body: string;
  reply: string;
};

const scenarioLabels = [
  "放課後60分版",
  "初心者多めの日",
  "大会前の確認",
  "雨天・室内対応",
  "少人数でも回せる形",
  "体力差があるチーム向け",
] as const;

const practiceMenuSeeds: PracticeMenuSeed[] = [
  {
    sport: "サッカー",
    title: "3色ポゼッションで首振りとサポート角度を作る",
    body:
      "攻撃側2色、守備側1色でボール保持を行い、受ける前の確認と三角形のサポートを習慣化します。狭いスペースでも判断量を確保できるメニューです。",
    targetLevel: "初級〜中級",
    grade: "中学生〜高校生",
    participants: "9〜18人",
    durationMinutes: "45分",
    tools: "ボール、マーカー、ビブス3色、タイマー",
    purpose: "受ける前の首振り、パスコース作り、奪われた直後の切り替えを高めること。",
    steps:
      "1. 15m四方を作り3色に分ける\n2. 攻撃2色対守備1色で6対3を行う\n3. 5本つないだら1点、奪った色が守備に交代\n4. 慣れたら2タッチ制限を加える\n5. 最後は同じルールをミニゲームに接続する",
    cautions: "ボール保持だけが目的にならないよう、受ける前に見た方向と次の選択肢を声に出させます。",
    commonMistakes: "ボール保持者に近づきすぎて味方同士の距離が詰まり、パスコースが消えること。",
    arrangements: "初心者が多い場合はコートを広げ、上級者には逆足限定やダイレクトパス得点を追加します。",
    tags: ["ポゼッション", "判断", "首振り"],
    conditionTags: ["under60", "beginner", "mixedAbility"],
  },
  {
    sport: "サッカー",
    title: "ゴール前2対1からシュート判断を速くする",
    body:
      "中央突破、横パス、シュートの判断を短時間で繰り返します。大会前にゴール前の迷いを減らしたい時に使いやすい練習です。",
    targetLevel: "中級",
    grade: "中学生〜高校生",
    participants: "8〜16人",
    durationMinutes: "50分",
    tools: "ボール、ゴール、マーカー、ビブス",
    purpose: "数的優位でのシュート選択、ラストパスの質、守備者を見た判断を高めること。",
    steps:
      "1. ペナルティエリア手前に攻撃2人、守備1人を置く\n2. 配球者から攻撃へパスして開始\n3. 攻撃は8秒以内にシュート\n4. 守備が奪ったらミニゴールへ運ぶ\n5. 3分ごとに役割を入れ替える",
    cautions: "横パスを選ぶ前にシュートコースがあるかを必ず確認させます。",
    commonMistakes: "味方を探しすぎてシュートタイミングを逃すこと。",
    arrangements: "守備者を遅れて入れる、タッチ数を制限する、サイドからのクロス開始に変えるなどで調整できます。",
    tags: ["シュート", "2対1", "大会前"],
    conditionTags: ["under60", "preTournament", "fewTools"],
  },
  {
    sport: "野球",
    title: "内野ゴロの一歩目と送球リズムを整える",
    body:
      "捕る技術だけでなく、打球への入り方、捕球後の足運び、送球までを一連の流れで反復します。初心者の守備基礎作りに向いています。",
    targetLevel: "初心者〜初級",
    grade: "中学生",
    participants: "6〜18人",
    durationMinutes: "55分",
    tools: "軟式球、グラブ、ベース、ノックバット",
    purpose: "打球への一歩目、正面に入る感覚、捕球から送球までのリズムを身につけること。",
    steps:
      "1. ボールなしで右左の一歩目を確認\n2. 正面の緩いゴロを素手で捕る\n3. グラブ捕球からステップ送球へ進める\n4. 角度をつけたゴロで左右移動を入れる\n5. 最後に一塁送球までを連続で行う",
    cautions: "強いノックを増やす前に、捕球姿勢と送球方向への体重移動をそろえます。",
    commonMistakes: "腰が高いまま待ってしまい、バウンドに合わせられないこと。",
    arrangements: "雨天時は体育館で柔らかいボールを使い、捕球姿勢とステップだけに絞ります。",
    tags: ["内野守備", "基礎", "送球"],
    conditionTags: ["beginner", "rainy", "mixedAbility"],
  },
  {
    sport: "野球",
    title: "走者一塁のケース守備を短時間で確認する",
    body:
      "バント、盗塁、エンドランを想定し、守備位置と声かけを整理します。試合前日に確認すると守備の迷いが減ります。",
    targetLevel: "中級〜大会前",
    grade: "中学生〜高校生",
    participants: "9〜20人",
    durationMinutes: "60分",
    tools: "ボール、ベース、ノックバット、ホワイトボード",
    purpose: "走者一塁での役割分担、カバー位置、状況判断の声を統一すること。",
    steps:
      "1. ホワイトボードで各ポジションの初期位置を確認\n2. バント処理を投手・一塁・三塁で反復\n3. 盗塁時の捕手送球と内野カバーを確認\n4. エンドランのゴロ対応を入れる\n5. 最後にランダムでケースノックを行う",
    cautions: "プレー後に必ず誰が何を見て判断したかを短く振り返ります。",
    commonMistakes: "ボールに全員が寄ってしまい、二塁や本塁のカバーが空くこと。",
    arrangements: "人数が少ない場合は外野を置かず、内野と投捕の連携だけに絞ります。",
    tags: ["ケース守備", "大会前", "連携"],
    conditionTags: ["preTournament", "under60", "mixedAbility"],
  },
  {
    sport: "バスケットボール",
    title: "3メンから速攻の走るコースをそろえる",
    body:
      "速攻で中央、サイド、リムランの役割を明確にします。走るだけで終わらせず、最後のレイアップ精度まで確認できます。",
    targetLevel: "初級〜中級",
    grade: "中学生〜高校生",
    participants: "6〜15人",
    durationMinutes: "40分",
    tools: "ボール、コート、タイマー",
    purpose: "速攻時の走路、パスの角度、フィニッシュの安定感を高めること。",
    steps:
      "1. 3人組で中央と両サイドの走路を確認\n2. ハーフまでパス交換してレイアップ\n3. リバウンド後に逆方向へ戻る\n4. 慣れたら後追いディフェンスを1人入れる\n5. 2対1の判断練習につなげる",
    cautions: "ボールマンより前を走る選手が外に膨らみすぎないようにします。",
    commonMistakes: "全員がボールへ寄り、横幅がなくなって守備に止められること。",
    arrangements: "初心者はパス回数を減らし、上級者はドリブルなしや制限時間を追加します。",
    tags: ["速攻", "3メン", "レイアップ"],
    conditionTags: ["under60", "beginner", "fewTools"],
  },
  {
    sport: "バスケットボール",
    title: "クローズアウトから1対1守備を作る",
    body:
      "シュートチェックで終わらず、抜かれない角度と次のスライドまで練習します。守備の強度を上げたい時に効果的です。",
    targetLevel: "中級",
    grade: "高校生",
    participants: "8〜16人",
    durationMinutes: "50分",
    tools: "ボール、コーン、リング",
    purpose: "クローズアウト、間合い、ドライブ対応のフットワークを改善すること。",
    steps:
      "1. コーンからウイングへクローズアウト\n2. 攻撃はジャブかドライブを選択\n3. 守備は中央を切ってサイドへ誘導\n4. 3秒以内の1対1で勝負\n5. 最後にヘルプ位置を加えて2対2にする",
    cautions: "勢いよく近づきすぎて一歩で抜かれないよう、最後の2歩を細かくします。",
    commonMistakes: "手だけで止めようとして足が止まること。",
    arrangements: "体力差がある場合は攻撃の選択肢を限定して成功体験を作ります。",
    tags: ["ディフェンス", "1対1", "クローズアウト"],
    conditionTags: ["mixedAbility", "preTournament", "fewTools"],
  },
  {
    sport: "バレーボール",
    title: "サーブレシーブの面作りを3人組で安定させる",
    body:
      "フォーム確認、短い距離の反復、実際のサーブ対応まで段階的に進めます。初心者が多いチームでも崩れにくい構成です。",
    targetLevel: "初心者〜初級",
    grade: "中学生",
    participants: "6〜18人",
    durationMinutes: "45分",
    tools: "ボール、ネット、マーカー",
    purpose: "腕の面、膝の使い方、レシーブ後の次動作を安定させること。",
    steps:
      "1. 2mの距離で下投げボールを面で返す\n2. 3人組で投げ手・レシーバー・キャッチ役に分かれる\n3. 距離を伸ばして正面と左右を混ぜる\n4. 実際のサーブを弱めに入れる\n5. セッター位置への返球率を記録する",
    cautions: "腕を振らせず、足で落下点へ入って面を残すことを優先します。",
    commonMistakes: "ボールを迎えにいって腕が上がり、返球が伸びすぎること。",
    arrangements: "体育館半面でもできるよう、ネットなしでターゲットマーカーへ返す形にできます。",
    tags: ["サーブレシーブ", "基礎", "初心者"],
    conditionTags: ["beginner", "under60", "mixedAbility"],
  },
  {
    sport: "バレーボール",
    title: "ブロック後の切り返しをチームでそろえる",
    body:
      "ブロックで終わらず、着地後の開き、助走、カバーまでを連続で練習します。攻守の切り替えが遅いチームに向いています。",
    targetLevel: "中級〜大会前",
    grade: "高校生",
    participants: "9〜18人",
    durationMinutes: "60分",
    tools: "ボール、ネット、アンテナ、ビブス",
    purpose: "ブロック後の着地、助走準備、スパイクカバーの連動を速くすること。",
    steps:
      "1. 前衛がブロックジャンプから着地姿勢を確認\n2. セッターから反対側へトスを出す\n3. ブロッカーはすぐ開いて助走に入る\n4. 後衛はカバー位置へ移動\n5. ラリー形式で切り返し得点を競う",
    cautions: "着地直後にボールを見失わないよう、声で次の攻撃方向を共有します。",
    commonMistakes: "ブロック後に止まってしまい、攻撃参加が遅れること。",
    arrangements: "人数が少ない場合は前衛2人と後衛2人だけで切り返しの形を作ります。",
    tags: ["ブロック", "切り返し", "大会前"],
    conditionTags: ["preTournament", "mixedAbility", "under60"],
  },
  {
    sport: "テニス",
    title: "クロスラリーで深さと戻りを作る",
    body:
      "クロス方向に限定して、打った後のリカバリーと相手を動かす深いボールを練習します。少人数でも質を保ちやすいメニューです。",
    targetLevel: "初級〜中級",
    grade: "中学生〜高校生",
    participants: "2〜8人",
    durationMinutes: "50分",
    tools: "ラケット、ボール、コーン",
    purpose: "クロスへの安定、打点後の戻り、深いボールで相手を下げる感覚を作ること。",
    steps:
      "1. サービスライン内でミニラリー\n2. ベースラインからクロス限定で10往復を目標\n3. コーンより深く入ったら1点\n4. 打った後はセンターへ半歩戻る\n5. 最後にクロスからストレート展開を入れる",
    cautions: "強打よりもネットの高い位置を通して深く入れることを評価します。",
    commonMistakes: "打った場所で止まり、次のボールに遅れること。",
    arrangements: "初心者はサービスラインから、上級者は左右のコース指定を細かくします。",
    tags: ["ラリー", "クロス", "フットワーク"],
    conditionTags: ["fewTools", "mixedAbility", "under60"],
  },
  {
    sport: "テニス",
    title: "セカンドサーブの回転量を増やすターゲット練習",
    body:
      "入れるだけのサーブから、回転で落として安全に攻めるサーブへつなげます。大会前のダブルフォルト対策にも使えます。",
    targetLevel: "中級",
    grade: "中学生〜高校生",
    participants: "2〜12人",
    durationMinutes: "35分",
    tools: "ラケット、ボール、ターゲットコーン",
    purpose: "セカンドサーブの回転、弾道、狙う場所を安定させること。",
    steps:
      "1. サービスラインから山なりに回転をかける\n2. ベースラインへ下がってネット上1mを通す\n3. ワイドとボディにターゲットを置く\n4. 10球中の成功数を記録\n5. リターンを入れて次の1球まで行う",
    cautions: "速さではなく、回転で落ちる軌道を作れているかを見ます。",
    commonMistakes: "入れにいって腕だけになり、回転も深さもなくなること。",
    arrangements: "雨天時は素振りとタオルスイングで回内動作だけ確認できます。",
    tags: ["サーブ", "回転", "大会前"],
    conditionTags: ["preTournament", "fewTools", "rainy"],
  },
  {
    sport: "卓球",
    title: "下回転サーブから3球目攻撃を作る",
    body:
      "サーブ、レシーブ想定、3球目のコースまでをセットで練習します。試合で最初の攻撃を作りたい選手に効果的です。",
    targetLevel: "中級",
    grade: "中学生〜高校生",
    participants: "2〜10人",
    durationMinutes: "45分",
    tools: "卓球台、ラケット、ボール、得点表",
    purpose: "下回転サーブの質、返球予測、3球目攻撃の準備を高めること。",
    steps:
      "1. フォア前とバック前に下回転サーブを出す\n2. 相手はツッツキで指定方向へ返す\n3. 3球目をドライブかスマッシュで攻撃\n4. 成功した配球を記録\n5. 最後に自由レシーブで判断を入れる",
    cautions: "サーブ後に止まらず、半歩下がって3球目の打点を作ります。",
    commonMistakes: "サーブの回転だけに集中して、次の準備が遅れること。",
    arrangements: "初心者は3球目を強打ではなくコース打ちにして成功率を上げます。",
    tags: ["サーブ", "3球目", "戦術"],
    conditionTags: ["fewTools", "preTournament", "mixedAbility"],
  },
  {
    sport: "卓球",
    title: "フットワーク多球で戻りの基準位置を覚える",
    body:
      "左右に振られても台から離れすぎないよう、打った後の戻りを反復します。短時間でも運動量を確保できます。",
    targetLevel: "初級〜中級",
    grade: "全学年",
    participants: "2〜12人",
    durationMinutes: "30分",
    tools: "卓球台、ラケット、ボールかご",
    purpose: "左右移動、打球後の戻り、体勢を崩さず連続で打つ力を高めること。",
    steps:
      "1. 送り手がフォア側へ3球出す\n2. 次にバック側へ3球出す\n3. 1球ごとに中央へ戻る\n4. 20球で交代し成功数を記録\n5. 最後はランダム配球にする",
    cautions: "足が止まった状態で腕だけ振らないよう、打つ前に小さくステップします。",
    commonMistakes: "戻る位置が毎回違い、次の球に遅れること。",
    arrangements: "体力差が大きい場合は球数を10球単位に分け、休憩を短く挟みます。",
    tags: ["フットワーク", "多球", "基礎"],
    conditionTags: ["under60", "beginner", "mixedAbility"],
  },
  {
    sport: "陸上競技",
    title: "加速走で最初の10歩をそろえる",
    body:
      "スタート直後の姿勢、接地、腕振りを10歩に絞って確認します。短距離だけでなく球技の走り出し改善にも使えます。",
    targetLevel: "初心者〜中級",
    grade: "中学生〜高校生",
    participants: "4〜20人",
    durationMinutes: "40分",
    tools: "マーカー、メジャー、タイマー",
    purpose: "低い姿勢からの加速、接地位置、腕振りの方向を整えること。",
    steps:
      "1. その場で前傾姿勢と腕振りを確認\n2. 10mを70%で3本走る\n3. 10歩目の位置にマーカーを置く\n4. 20m加速走を4本行う\n5. ペアで姿勢と接地音をチェックする",
    cautions: "最初から全力にせず、姿勢が崩れない速度で始めます。",
    commonMistakes: "顔が早く上がり、上体が起きて加速が途切れること。",
    arrangements: "雨天時は廊下や体育館で5歩の姿勢確認に短縮できます。",
    tags: ["短距離", "加速", "フォーム"],
    conditionTags: ["under60", "rainy", "fewTools"],
  },
  {
    sport: "陸上競技",
    title: "リレーのバトンゾーンを可視化してミスを減らす",
    body:
      "走力差があるメンバーでも、出る位置と声のタイミングをそろえます。大会前の確認に特に向いています。",
    targetLevel: "初級〜大会前",
    grade: "中学生〜高校生",
    participants: "4〜16人",
    durationMinutes: "50分",
    tools: "バトン、マーカー、メジャー",
    purpose: "受け手のスタート位置、声の合図、渡す手の高さを安定させること。",
    steps:
      "1. 受け手の出る位置をマーカーで仮設定\n2. 歩きながら手の出し方を確認\n3. 50%速度でバトンパス\n4. 成功位置を記録してマーカーを調整\n5. 80%速度で3本通す",
    cautions: "一度で固定せず、走力差に合わせてマーカー位置を微調整します。",
    commonMistakes: "受け手が後ろを見て減速し、渡し手との距離が詰まること。",
    arrangements: "人数が少ない日は2人組で出る位置だけ反復し、動画で確認します。",
    tags: ["リレー", "バトン", "大会前"],
    conditionTags: ["preTournament", "fewTools", "mixedAbility"],
  },
  {
    sport: "水泳",
    title: "けのびからストリームラインを整える",
    body:
      "泳ぎ込みの前に、水の抵抗を減らす姿勢を確認します。初心者でも上達を実感しやすい基礎メニューです。",
    targetLevel: "初心者〜初級",
    grade: "全学年",
    participants: "4〜20人",
    durationMinutes: "35分",
    tools: "プール、ビート板、壁の目印",
    purpose: "頭の位置、体幹の締め、壁蹴り後の姿勢を安定させること。",
    steps:
      "1. 陸上で腕を重ねる姿勢を確認\n2. 壁を蹴って5mけのび\n3. どこで失速したかをペアで見る\n4. ビート板キックで姿勢を維持\n5. クロールの最初の3かきにつなげる",
    cautions: "距離を競わせすぎず、姿勢が崩れた地点を確認します。",
    commonMistakes: "顔が前を向き、腰が沈んで抵抗が大きくなること。",
    arrangements: "泳力差が大きい場合は、距離ではなく姿勢維持の秒数で評価します。",
    tags: ["けのび", "姿勢", "初心者"],
    conditionTags: ["beginner", "mixedAbility", "under60"],
  },
  {
    sport: "水泳",
    title: "ターン前後5mを速くする壁際練習",
    body:
      "泳ぐ距離を増やさず、ターン前後だけを切り出してタイム短縮を狙います。大会前の仕上げに使いやすい内容です。",
    targetLevel: "中級〜大会前",
    grade: "中学生〜高校生",
    participants: "4〜16人",
    durationMinutes: "45分",
    tools: "プール、タイマー、コースロープ",
    purpose: "壁への入り方、蹴り出し角度、浮き上がりのタイミングを改善すること。",
    steps:
      "1. 壁5m手前から泳いでターン\n2. 蹴り出し後5mまでを計測\n3. 入る距離と呼吸位置を確認\n4. 3本ごとにペアで改善点を伝える\n5. 25mの中でターンを入れて確認する",
    cautions: "無理な潜水をさせず、安全確認と休息を徹底します。",
    commonMistakes: "壁に近づきすぎて膝が詰まり、蹴り出しが弱くなること。",
    arrangements: "初心者はクイックターンではなくタッチターンで壁を強く蹴る練習にします。",
    tags: ["ターン", "大会前", "タイム短縮"],
    conditionTags: ["preTournament", "under60", "mixedAbility"],
  },
  {
    sport: "バドミントン",
    title: "ヘアピンからロブまで前後の動きをつなげる",
    body:
      "ネット前の細かいタッチと、下がって返すロブをセットで練習します。前後に揺さぶられた時の対応力が上がります。",
    targetLevel: "初級〜中級",
    grade: "中学生〜高校生",
    participants: "2〜12人",
    durationMinutes: "45分",
    tools: "ラケット、シャトル、ネット",
    purpose: "ネット前への入り方、ロブの高さ、前後移動後の姿勢を安定させること。",
    steps:
      "1. ネット前でヘアピンを10球\n2. 送り手が奥へロブを上げる\n3. 受け手は下がってクリアで返す\n4. 前へ戻って再びヘアピン\n5. 1分交代で成功回数を記録する",
    cautions: "前へ突っ込みすぎず、次に下がれる姿勢で止まることを意識させます。",
    commonMistakes: "ネット前で体重が前に残り、奥の球に反応できないこと。",
    arrangements: "初心者は移動距離を短くし、上級者はスマッシュへの展開を追加します。",
    tags: ["ネット前", "ロブ", "前後移動"],
    conditionTags: ["under60", "beginner", "fewTools"],
  },
  {
    sport: "バドミントン",
    title: "スマッシュ後の次球対応を作る半面ゲーム",
    body:
      "強く打つだけでなく、返ってきた球への構え直しを練習します。ラリーの主導権を取り切るためのメニューです。",
    targetLevel: "中級",
    grade: "高校生",
    participants: "4〜16人",
    durationMinutes: "50分",
    tools: "ラケット、シャトル、ネット",
    purpose: "スマッシュ後の戻り、前への詰め、連続攻撃の判断を高めること。",
    steps:
      "1. 半面でクリアから開始\n2. 攻撃側はスマッシュを打つ\n3. 守備側はネット前か奥へ返す\n4. 攻撃側は次球まで必ず処理\n5. 5点先取で役割交代する",
    cautions: "スマッシュの威力より、打った後にラケットを上げ直す速さを評価します。",
    commonMistakes: "打って終わりになり、返球に対して足が止まること。",
    arrangements: "体力差がある場合は半面の幅を狭め、連続本数を短くします。",
    tags: ["スマッシュ", "連続攻撃", "半面ゲーム"],
    conditionTags: ["mixedAbility", "preTournament", "under60"],
  },
  {
    sport: "吹奏楽",
    title: "ロングトーンで音程と息の支えをそろえる",
    body:
      "個人練習になりがちなロングトーンを、合奏前の共通基準作りとして行います。音の出だし、伸ばし、切りを全員で合わせます。",
    targetLevel: "初心者〜中級",
    grade: "中学生〜高校生",
    participants: "5〜60人",
    durationMinutes: "25分",
    tools: "楽器、チューナー、メトロノーム",
    purpose: "音程、息のスピード、音の入りと終わりをそろえること。",
    steps:
      "1. 4拍吸って8拍伸ばす\n2. チューナーを見ずに隣の音を聴く\n3. セクションごとに同じ音を重ねる\n4. 強弱をpからmfへ変える\n5. 最後に曲中の長い音へ接続する",
    cautions: "チューナーの数値だけを追わせず、周囲の音に溶ける感覚を確認します。",
    commonMistakes: "音の入りが雑になり、伸ばしてから音程を直そうとすること。",
    arrangements: "初心者は4拍、上級者は12拍に伸ばして息の配分を変えます。",
    tags: ["基礎合奏", "音程", "ロングトーン"],
    conditionTags: ["rainy", "beginner", "mixedAbility"],
  },
  {
    sport: "吹奏楽",
    title: "曲の難所をリズム分解して通す",
    body:
      "速いパッセージを最初から通さず、リズムと指の動きを分けて確認します。コンクール前の精度上げに有効です。",
    targetLevel: "中級〜大会前",
    grade: "中学生〜高校生",
    participants: "5〜60人",
    durationMinutes: "40分",
    tools: "楽譜、メトロノーム、鉛筆",
    purpose: "難所のリズム、指回し、入りのタイミングを安定させること。",
    steps:
      "1. 難所を2小節単位に区切る\n2. リズムだけを手拍子で確認\n3. 遅いテンポで音を入れる\n4. 付点、逆付点、通常の順で吹く\n5. 前後2小節をつなげて通す",
    cautions: "できない箇所を長く通し続けず、短く区切って成功率を上げます。",
    commonMistakes: "テンポを上げることだけを目標にして、発音がそろわないこと。",
    arrangements: "人数が少ない日はパートごとに録音し、合奏前に共有します。",
    tags: ["基礎合奏", "難所練習", "大会前"],
    conditionTags: ["preTournament", "rainy", "under60"],
  },
  {
    sport: "合唱",
    title: "母音をそろえてハーモニーの濁りを減らす",
    body:
      "音程だけでなく、母音の形を合わせることで響きを整えます。短時間でも合唱全体のまとまりが出やすい練習です。",
    targetLevel: "初心者〜中級",
    grade: "全学年",
    participants: "6〜50人",
    durationMinutes: "30分",
    tools: "ピアノ、楽譜、録音機器",
    purpose: "母音の統一、響きの方向、パート間の聴き合いを高めること。",
    steps:
      "1. あ・え・い・お・うを同じ高さで発声\n2. 口の開け方を鏡やペアで確認\n3. 曲中の伸ばす母音だけを抜き出す\n4. パートごとに重ねる\n5. 録音して母音のばらつきを確認する",
    cautions: "大きな声を出すことより、隣と響きが混ざることを優先します。",
    commonMistakes: "子音に力が入りすぎて、母音の響きが浅くなること。",
    arrangements: "初心者はユニゾン、上級者は和音で同じ母音をそろえます。",
    tags: ["発声", "母音", "ハーモニー"],
    conditionTags: ["rainy", "beginner", "under60"],
  },
  {
    sport: "合唱",
    title: "歌詞の山を決めて表現をそろえる",
    body:
      "全員が同じ場所を盛り上げられるよう、歌詞の意味とフレーズの頂点を確認します。表現が平坦な時に効果があります。",
    targetLevel: "中級",
    grade: "中学生〜高校生",
    participants: "8〜60人",
    durationMinutes: "35分",
    tools: "楽譜、鉛筆、ホワイトボード",
    purpose: "歌詞理解、フレーズの方向、強弱の共有を深めること。",
    steps:
      "1. 歌詞を朗読して意味を確認\n2. 各フレーズで一番伝えたい言葉に印をつける\n3. その言葉へ向かってクレッシェンドする\n4. パートごとに表現を合わせる\n5. 最後に通して録音する",
    cautions: "感情だけで大きくせず、息の流れと子音の出し方をそろえます。",
    commonMistakes: "全ての言葉を同じ強さで歌い、伝えたい山が見えなくなること。",
    arrangements: "短時間の日はサビだけに絞り、表現記号を全員で共有します。",
    tags: ["表現", "歌詞理解", "フレージング"],
    conditionTags: ["under60", "preTournament", "rainy"],
  },
  {
    sport: "演劇",
    title: "ステータスゲームで関係性を身体化する",
    body:
      "台詞を読む前に、役同士の力関係を立ち位置と視線で表します。芝居が平面的になる時に効く練習です。",
    targetLevel: "初級〜中級",
    grade: "中学生〜高校生",
    participants: "4〜20人",
    durationMinutes: "45分",
    tools: "稽古場、椅子、台本",
    purpose: "役の関係性、距離感、視線の使い方を身体で理解すること。",
    steps:
      "1. 2人組で高いステータスと低いステータスを決める\n2. 台詞なしで入退場する\n3. 視線、距離、椅子の使い方を変える\n4. 同じ場面の台詞を入れる\n5. 観ていた人が関係性を言語化する",
    cautions: "大げさな演技に寄せず、相手への反応が変わっているかを見ます。",
    commonMistakes: "台詞の言い方だけを変えて、身体の距離や視線が変わらないこと。",
    arrangements: "初心者は無言劇、上級者はステータスを途中で逆転させます。",
    tags: ["役作り", "身体表現", "関係性"],
    conditionTags: ["rainy", "beginner", "mixedAbility"],
  },
  {
    sport: "演劇",
    title: "台詞の目的語を明確にして会話を動かす",
    body:
      "台詞を暗記して読むだけでなく、相手に何をさせたい台詞なのかを確認します。会話のテンポと説得力が上がります。",
    targetLevel: "中級",
    grade: "中学生〜高校生",
    participants: "3〜15人",
    durationMinutes: "50分",
    tools: "台本、鉛筆、稽古場",
    purpose: "台詞の目的、相手への働きかけ、間の使い方を明確にすること。",
    steps:
      "1. 各台詞に『相手に何をしてほしいか』を書く\n2. 動詞を一語で決める\n3. 台詞を読まずに目的だけで即興する\n4. 台詞を戻して演じる\n5. 観客役が伝わった目的を答える",
    cautions: "感情名ではなく、相手への行動目標として考えさせます。",
    commonMistakes: "悲しい、怒るなど感情だけを決めて、相手との関係が動かないこと。",
    arrangements: "大会前は重要場面だけを抜き出し、目的語の確認に絞ります。",
    tags: ["台詞", "役作り", "大会前"],
    conditionTags: ["preTournament", "rainy", "under60"],
  },
  {
    sport: "美術",
    title: "明暗5段階で立体感を作るデッサン練習",
    body:
      "いきなり描き込まず、光の方向と明暗の段階を整理します。初心者でも立体感を出す考え方がつかみやすい練習です。",
    targetLevel: "初心者〜初級",
    grade: "全学年",
    participants: "1〜30人",
    durationMinutes: "50分",
    tools: "鉛筆、練り消し、画用紙、白い立方体か球体",
    purpose: "光源、影、反射光を見分け、立体感を出す基礎を身につけること。",
    steps:
      "1. 光源の位置を全員で確認\n2. 紙の端に5段階のグレースケールを作る\n3. モチーフを大きな面で捉える\n4. 最暗部から置き、反射光を残す\n5. 作品を並べて明暗差を比較する",
    cautions: "輪郭線で立体を作ろうとせず、面の明るさで見せるよう声をかけます。",
    commonMistakes: "全体が同じ濃さになり、光がどちらから来ているか分からなくなること。",
    arrangements: "道具が少ない日はスマホライトと紙コップでも代用できます。",
    tags: ["デッサン", "明暗", "基礎"],
    conditionTags: ["rainy", "beginner", "fewTools"],
  },
  {
    sport: "美術",
    title: "配色カードでポスターの視線誘導を作る",
    body:
      "色を感覚だけで選ばず、主役、補助、背景の役割に分けます。文化祭ポスターや大会告知制作に使いやすい練習です。",
    targetLevel: "初級〜中級",
    grade: "中学生〜高校生",
    participants: "1〜30人",
    durationMinutes: "60分",
    tools: "色紙、はさみ、のり、画用紙、カラーペン",
    purpose: "配色の役割、視線誘導、情報の優先順位を理解すること。",
    steps:
      "1. 伝えたい情報を3つに絞る\n2. 主役色、補助色、背景色を選ぶ\n3. 色紙だけでラフを作る\n4. 遠くから見て最初に見える場所を確認\n5. 文字を入れて完成案にする",
    cautions: "好きな色を増やしすぎず、読ませたい情報が目立つかを基準にします。",
    commonMistakes: "全てを目立たせようとして、かえって読みにくくなること。",
    arrangements: "時間が短い日は既存ポスターの配色分析だけでも効果があります。",
    tags: ["配色", "ポスター", "デザイン"],
    conditionTags: ["rainy", "fewTools", "under60"],
  },
  {
    sport: "書道",
    title: "横画と縦画の入りをそろえる基本点画練習",
    body:
      "作品を書く前に、起筆、送筆、収筆を分解して確認します。字形が崩れやすい初心者に効果的です。",
    targetLevel: "初心者〜初級",
    grade: "全学年",
    participants: "1〜30人",
    durationMinutes: "35分",
    tools: "筆、墨、半紙、下敷き、文鎮",
    purpose: "筆圧、入り方、止めと払いの基本を安定させること。",
    steps:
      "1. 筆を立てて起筆だけを10回練習\n2. 横画を太さ一定で書く\n3. 縦画で筆圧の変化を確認\n4. 永字八法の一部に接続する\n5. 最後に課題字を1枚清書する",
    cautions: "速く書かせず、筆先がどこを通っているかを意識させます。",
    commonMistakes: "手首だけで動かし、線の太さが途中で不安定になること。",
    arrangements: "道具が少ない日は水書き用紙で起筆と収筆だけ反復します。",
    tags: ["基本点画", "筆使い", "初心者"],
    conditionTags: ["rainy", "beginner", "fewTools"],
  },
  {
    sport: "書道",
    title: "余白設計で作品全体の見え方を整える",
    body:
      "一文字ずつの上手さだけでなく、紙面全体の余白と重心を見ます。展覧会前の仕上げに使いやすい練習です。",
    targetLevel: "中級〜大会前",
    grade: "中学生〜高校生",
    participants: "1〜25人",
    durationMinutes: "55分",
    tools: "筆、墨、半紙、鉛筆、作品例",
    purpose: "字間、行間、余白、作品全体の重心を整えること。",
    steps:
      "1. 半紙に薄く中心線を意識する\n2. 文字の大きさを鉛筆で仮配置\n3. 余白が詰まる場所を確認\n4. 2枚書いて余白の違いを比べる\n5. 良い配置を選んで清書する",
    cautions: "一画の修正だけでなく、作品全体を少し離れて見る時間を入れます。",
    commonMistakes: "下に詰まりすぎて、作品全体が重く見えること。",
    arrangements: "初心者には文字数を減らし、余白の変化だけを比較させます。",
    tags: ["作品構成", "余白", "大会前"],
    conditionTags: ["preTournament", "rainy", "under60"],
  },
  {
    sport: "科学",
    title: "仮説から実験条件を1つだけ変える練習",
    body:
      "自由研究や探究活動で、何を比べているのかを明確にする練習です。失敗しても考察につながる形にできます。",
    targetLevel: "初心者〜中級",
    grade: "中学生〜高校生",
    participants: "2〜30人",
    durationMinutes: "50分",
    tools: "ワークシート、計量カップ、温度計、身近な実験材料",
    purpose: "仮説、変える条件、そろえる条件、記録方法を理解すること。",
    steps:
      "1. 身近な疑問を一文で書く\n2. 結果を予想して仮説にする\n3. 変える条件を1つだけ決める\n4. そろえる条件を3つ書く\n5. 小実験を行い、結果と考察を分けて記録する",
    cautions: "結果の正解より、条件を整理して比較できているかを評価します。",
    commonMistakes: "温度、量、時間など複数の条件を同時に変えてしまうこと。",
    arrangements: "道具が少ない日は実験計画書だけを作り、次回に実験します。",
    tags: ["探究", "実験計画", "仮説"],
    conditionTags: ["rainy", "fewTools", "beginner"],
  },
  {
    sport: "科学",
    title: "発表前にグラフの読み取りを強くする",
    body:
      "実験結果をただ貼るのではなく、グラフから何が言えるかを言語化します。研究発表前の仕上げに向いています。",
    targetLevel: "中級〜大会前",
    grade: "中学生〜高校生",
    participants: "2〜25人",
    durationMinutes: "45分",
    tools: "実験データ、表計算、ホワイトボード",
    purpose: "グラフ選択、傾向の読み取り、根拠を持った説明を強化すること。",
    steps:
      "1. データに合うグラフ種類を選ぶ\n2. 縦軸と横軸の意味を説明する\n3. 一番大きな変化を一文で書く\n4. なぜそうなったかを仮説とつなげる\n5. 30秒発表で聞き手に伝える",
    cautions: "見た目の装飾より、軸と単位が正しいかを先に確認します。",
    commonMistakes: "グラフを示しているのに、そこから何が言えるかを説明できないこと。",
    arrangements: "初心者はサンプルデータで読み取りだけ練習します。",
    tags: ["研究発表", "グラフ", "考察"],
    conditionTags: ["preTournament", "rainy", "under60"],
  },
  {
    sport: "ロボット",
    title: "ライントレースのセンサー閾値を調整する",
    body:
      "プログラムを大きく変える前に、センサー値の読み取りと閾値設定を確認します。走行が安定しない時に効果的です。",
    targetLevel: "初級〜中級",
    grade: "中学生〜高校生",
    participants: "2〜20人",
    durationMinutes: "60分",
    tools: "ロボット、PC、ラインコース、記録表",
    purpose: "センサー値、閾値、左右モーター出力の関係を理解すること。",
    steps:
      "1. 白と黒のセンサー値を測る\n2. 中間値を仮の閾値にする\n3. 低速で直線を走らせる\n4. カーブで外れる場所を記録\n5. 閾値か速度を1つずつ変えて再走行する",
    cautions: "一度に複数の設定を変えず、何が効いたか記録させます。",
    commonMistakes: "速度だけを上げて、センサーが読み切れずコースアウトすること。",
    arrangements: "PC台数が少ない場合は、測定係、記録係、調整係に分けて回します。",
    tags: ["ライントレース", "センサー", "調整"],
    conditionTags: ["rainy", "fewTools", "mixedAbility"],
  },
  {
    sport: "ロボット",
    title: "大会前チェックリストで故障リスクを減らす",
    body:
      "走行練習だけでなく、ネジ、配線、バッテリー、予備部品を確認します。大会当日のトラブルを減らすための実践メニューです。",
    targetLevel: "大会前",
    grade: "中学生〜高校生",
    participants: "2〜20人",
    durationMinutes: "50分",
    tools: "ロボット、工具、予備バッテリー、チェック表",
    purpose: "機体の再現性、配線の安定、当日の準備漏れを防ぐこと。",
    steps:
      "1. ネジの緩みをペアで確認\n2. 配線がタイヤやギアに触れていないか見る\n3. バッテリー電圧と予備を確認\n4. 同じプログラムで3回連続走行\n5. 失敗した条件をチェック表に残す",
    cautions: "調整を始める前に、まず現状で再現性があるかを確認します。",
    commonMistakes: "本番直前に大きな改造をして、安定していた動きが崩れること。",
    arrangements: "時間が短い日は安全確認と3回連続走行だけに絞ります。",
    tags: ["大会前", "チェックリスト", "再現性"],
    conditionTags: ["preTournament", "rainy", "under60"],
  },
];

const questionSeeds: QuestionSeed[] = [
  {
    sport: "サッカー",
    title: "経験者と初心者が混ざる日のポゼッション練習はどう分けるべきですか？",
    body: "初心者がボールに触れないまま終わることがあり、経験者も物足りなさそうです。全員が参加できる組み方を知りたいです。",
    answer: "同じルールで難易度だけ変えるのがおすすめです。初心者は広いグリッド、経験者はタッチ制限を入れると同時進行できます。",
  },
  {
    sport: "野球",
    title: "雨でグラウンドが使えない日の守備練習は何をしていますか？",
    body: "体育館は使えますがボールを強く打てません。内野守備につながる練習を探しています。",
    answer: "柔らかいボールで捕球姿勢とステップを分けると効果があります。送球はシャドーで十分確認できます。",
  },
  {
    sport: "バスケットボール",
    title: "速攻練習で走るコースが毎回バラバラになります",
    body: "3メンをしても試合になると中央に集まってしまいます。どのような声かけが有効でしょうか。",
    answer: "中央、右レーン、左レーンの名前を決め、走り出し前に役割を宣言させると定着しやすいです。",
  },
  {
    sport: "バレーボール",
    title: "サーブレシーブが苦手な初心者に最初に教えることは何ですか？",
    body: "腕を振ってしまい、ボールが安定しません。短時間で改善しやすいポイントを知りたいです。",
    answer: "腕ではなく足で落下点に入ることを最初に徹底すると安定します。短い距離の下投げから始めるのが安全です。",
  },
  {
    sport: "テニス",
    title: "ラリーが3球以上続かない初心者におすすめの練習はありますか？",
    body: "強く打とうとしてミスが増えます。楽しさを残しながら続ける感覚を作りたいです。",
    answer: "サービスライン内のミニラリーから始め、ネットの高い場所を通す目標にすると自然に安定します。",
  },
  {
    sport: "吹奏楽",
    title: "合奏前の基礎練習が毎回流れ作業になっています",
    body: "ロングトーンはしていますが、何を改善する時間なのか生徒に伝わっていない気がします。",
    answer: "今日は音の入り、次回は切り、というように観点を1つに絞ると集中度が上がります。",
  },
  {
    sport: "美術",
    title: "デッサンで全体が薄くなって立体感が出ません",
    body: "初心者が多く、どこを濃くすればよいか分からないようです。導入で使える方法はありますか？",
    answer: "先に5段階の明暗表を作り、最暗部から置く練習にすると立体感が出やすくなります。",
  },
  {
    sport: "ロボット",
    title: "ライントレースが日によって成功したり失敗したりします",
    body: "同じプログラムのはずなのに、照明や床で動きが変わります。確認すべき点を知りたいです。",
    answer: "白黒のセンサー値を毎回測り、閾値を記録するのが先です。速度変更より先に読み取りを安定させましょう。",
  },
];

const communitySeeds: CommunitySeed[] = [
  {
    sport: "サッカー",
    title: "雨天時に体育館でできるボールを使わない判断練習を共有しませんか",
    body: "狭い場所でもできる首振り、立ち位置、声かけの練習を集めたいです。",
    reply: "色カードを使って、見る方向と次の動きを決める練習が使いやすいです。",
  },
  {
    sport: "野球",
    title: "少人数の日の守備練習をどう回していますか",
    body: "部員が8人以下の日でも守備の質を落とさない工夫を共有したいです。",
    reply: "捕球、送球、カバーを3ステーションにすると待ち時間が減ります。",
  },
  {
    sport: "バスケットボール",
    title: "初心者が多いチームのレイアップ成功率を上げる工夫",
    body: "踏み切り足が混乱しやすい生徒に伝わった声かけがあれば知りたいです。",
    reply: "リングなしで最後の2歩だけをリズム練習すると、かなり入りやすくなります。",
  },
  {
    sport: "吹奏楽",
    title: "基礎合奏で生徒が飽きにくい進め方を共有したいです",
    body: "毎回同じ流れにならないよう、短時間で成果が見える進め方を集めたいです。",
    reply: "今日は音程、明日は入り、というように評価ポイントを1つに絞ると集中しやすいです。",
  },
  {
    sport: "美術",
    title: "道具が少ない日の制作・鑑賞活動アイデア",
    body: "絵の具や紙が十分にない日でも学びになる活動を共有しましょう。",
    reply: "既存ポスターの配色分析は、紙とペンだけでもかなり盛り上がります。",
  },
  {
    sport: "科学",
    title: "探究活動で仮説を立てるのが苦手な生徒への支援",
    body: "疑問は出るものの、実験可能な形に落とすところで止まりがちです。",
    reply: "『何を変えるか』『何をそろえるか』をカードにして並べると整理しやすいです。",
  },
];

const mockStartTime = Date.UTC(2026, 3, 21, 8, 13, 27);
const mockEndTime = Date.UTC(2026, 4, 10, 14, 46, 38);

const pick = <T,>(items: readonly T[], index: number) => items[index % items.length];
const pad = (value: number) => String(value).padStart(3, "0");
const createMockTimestamp = (index: number, total: number, offsetMinutes = 0) => {
  const range = mockEndTime - mockStartTime;
  const ratio = total <= 1 ? 0 : index / (total - 1);
  const base = mockEndTime - Math.floor(range * ratio);
  const jitter =
    ((index * 37) % 17) * 60 * 1000 +
    ((index * 71) % 53) * 1000 +
    offsetMinutes * 60 * 1000;

  return base - jitter;
};

export const mockCoachAccounts: SearchAccountItem[] = Array.from({ length: 100 }, (_, index) => {
  const number = index + 1;
  const sportA = pick(sports, index);
  const sportB = pick(sports, index + 5);
  const baseName = pick(coachNames, index);
  const region = pick(regions, index);
  const profileLabel = pick(coachProfileLabels, index + 2);
  const displayName =
    index % 5 === 0
      ? `${region}${baseName}`
      : `${region}${sportA}${profileLabel}`;
  const handleBase = toHandleText(`${region}_${sportA}_${profileLabel}`);

  return {
    id: `mock-coach-${pad(number)}`,
    name: displayName,
    handle: `@${handleBase}_${pad(number)}`,
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
  const region = pick(regions, index + 4);
  const profileLabel = pick(advisorProfileLabels, index);
  const displayName = index % 4 === 0 ? `${region}${baseName}` : `${region}${sportA}${profileLabel}`;
  const handleBase = toHandleText(`${region}_${sportA}_${profileLabel}`);

  return {
    id: `mock-advisor-${pad(number)}`,
    name: displayName,
    handle: `@${handleBase}_${pad(number)}`,
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

export const mockFeedPosts: FeedPost[] = Array.from({ length: 180 }, (_, index) => {
  const seed = pick(practiceMenuSeeds, index);
  const coach =
    mockCoachAccounts.find((account) => account.selectedSports.includes(seed.sport)) ??
    mockCoachAccounts[index % mockCoachAccounts.length];
  const scenario = pick(scenarioLabels, index);
  const naturalTags = Array.from(new Set([seed.sport, ...seed.tags]));

  return {
    id: `mock-feed-${pad(index + 1)}`,
    author: coach.name,
    authorHandle: coach.handle,
    createdByUid: coach.id,
    role: coach.role,
    title: `${seed.title}（${scenario}）`,
    body: `${seed.body}\n\n現場で見るポイント: ${seed.purpose}\n#${seed.sport} #${seed.tags[0]} #部活メニュー`,
    tags: naturalTags,
    sports: [seed.sport],
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
      sport: seed.sport,
      targetLevel: seed.targetLevel,
      grade: seed.grade,
      participants: seed.participants,
      durationMinutes: seed.durationMinutes,
      tools: seed.tools,
      purpose: seed.purpose,
      steps: seed.steps,
      cautions: seed.cautions,
      commonMistakes: seed.commonMistakes,
      arrangements: seed.arrangements,
      conditionTags: seed.conditionTags,
    },
    createdAtMs: createMockTimestamp(index, 180),
  };
});

export const mockQuestionPosts: QuestionPost[] = Array.from({ length: 96 }, (_, index) => {
  const seed = pick(questionSeeds, index);
  const advisor =
    mockAdvisorAccounts.find((account) => account.selectedSports.includes(seed.sport)) ??
    mockAdvisorAccounts[index % mockAdvisorAccounts.length];
  const coach =
    mockCoachAccounts.find((account) => account.selectedSports.includes(seed.sport)) ??
    mockCoachAccounts[(index * 3) % mockCoachAccounts.length];

  return {
    id: `mock-question-${pad(index + 1)}`,
    category: seed.sport,
    title: seed.title,
    body: `${seed.body}\n#${seed.sport} #相談広場`,
    author: advisor.name,
    authorHandle: advisor.handle,
    createdByUid: advisor.id,
    answers: 1 + (index % 8),
    bestAnswer: index % 3 === 0 ? seed.answer : "まだベストアンサーはありません。",
    bestAnswerReplyId: index % 3 === 0 ? `mock-question-${index + 1}-reply-1` : undefined,
    replies: [
      {
        id: `mock-question-${index + 1}-reply-1`,
        author: coach.name,
        authorHandle: coach.handle,
        createdByUid: coach.id,
        body: seed.answer,
        replies: [],
      },
    ],
    createdAtMs: createMockTimestamp(index, 96, 23),
  };
});

export const mockCommunityPosts: CommunityPost[] = Array.from({ length: 78 }, (_, index) => {
  const seed = pick(communitySeeds, index);
  const advisor =
    mockAdvisorAccounts.find((account) => account.selectedSports.includes(seed.sport)) ??
    mockAdvisorAccounts[(index * 2) % mockAdvisorAccounts.length];
  const coach =
    mockCoachAccounts.find((account) => account.selectedSports.includes(seed.sport)) ??
    pick(mockCoachAccounts, index);

  return {
    id: `mock-community-${pad(index + 1)}`,
    title: seed.title,
    author: advisor.name,
    authorHandle: advisor.handle,
    createdByUid: advisor.id,
    body: `${seed.body}\n#${seed.sport} #部活運営`,
    cta: "スレッドを見る",
    replies: [
      {
        id: `mock-community-${index + 1}-reply-1`,
        author: coach.name,
        authorHandle: coach.handle,
        createdByUid: coach.id,
        body: seed.reply,
        replies: [],
      },
    ],
    createdAtMs: createMockTimestamp(index, 78, 41),
  };
});
