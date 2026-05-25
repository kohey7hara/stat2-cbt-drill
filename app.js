const topics = [
  "記述統計",
  "確率",
  "分布",
  "推定",
  "検定",
  "回帰",
  "分散分析",
  "カテゴリ"
];

const state = {
  mode: "practice",
  current: 0,
  selected: null,
  questions: [],
  answers: [],
  stats: JSON.parse(localStorage.getItem("stat2_stats") || "{}"),
  streak: Number(localStorage.getItem("stat2_streak") || 0)
};

const $ = (id) => document.getElementById(id);
const rnd = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = (arr) => arr[rnd(0, arr.length - 1)];
const round = (x, d = 3) => Number(x.toFixed(d));
const fmt = (x, d = 3) => String(round(x, d));
const math = (s) => `\\(${s}\\)`;

function detail(title, rows) {
  return `<h3>${title}</h3><dl>${rows.map(([label, body]) => `<div><dt>${label}</dt><dd>${body}</dd></div>`).join("")}</dl>`;
}

function tipHtml(item) {
  const text = item.text;
  let tip = "";
  if (text.includes("95%信頼区間")) {
    tip = "簡単に言うと「本当の平均がだいたいこの範囲に入りそう」と見積もる問題です。95%信頼区間は、この方法で区間を100回作ると、そのうち約95回は真の母平均を含む、という意味です。1つの区間について『真の値が95%の確率で動く』という意味ではありません。";
  } else if (text.includes("標準誤差")) {
    tip = "簡単に言うと「標本から計算した値が、サンプリングのたびにどれくらいブレるか」を求める問題です。標準偏差は個々のデータのばらつき、標準誤差は平均や比率などの推定値のばらつきです。";
  } else if (text.includes("検定統計量")) {
    tip = "簡単に言うと「帰無仮説からどれくらい離れているか」を、標準誤差で割ってものさし化する問題です。値が大きいほど、偶然だけでは説明しにくいと判断しやすくなります。";
  } else if (text.includes("p値")) {
    tip = "簡単に言うと「帰無仮説が正しい世界で、今回くらい極端な結果がどれくらい珍しいか」を見る問題です。p値は帰無仮説が正しい確率ではありません。";
  } else if (text.includes("信頼区間から")) {
    tip = "簡単に言うと「推定した効果が0をまたぐか」を見る問題です。平均差や回帰係数なら、95%信頼区間に0が含まれなければ5%水準の両側検定で有意と対応します。";
  } else if (text.includes("最初に選ぶ分析") || text.includes("使う検定")) {
    tip = "簡単に言うと「この文章はどの道具で解く問題か」を選ぶ問題です。計算の前に、量的データかカテゴリデータか、1群か2群か、差を見るのか関連を見るのかを読み取ります。";
  } else if (text.includes("標本平均")) {
    tip = "簡単に言うと「1人の値」ではなく「何人かの平均」がどれくらいブレるかを見る問題です。標本平均は個々のデータよりブレが小さくなり、標準誤差は標準偏差を√nで割ります。";
  } else if (text.includes("二項分布")) {
    tip = "簡単に言うと「同じ条件の成功・失敗をn回くり返したとき、成功が何回になるか」を考える問題です。成功確率が一定で、試行が独立という前提を確認します。";
  } else if (text.includes("ポアソン分布")) {
    tip = "簡単に言うと「一定時間や一定範囲で、まれな出来事が何回起きるか」を考える問題です。平均発生回数λが中心になります。";
  } else if (text.includes("正規分布")) {
    tip = "簡単に言うと「平均から標準偏差何個分ズレているか」に直して、表や近似で確率を読む問題です。右側確率か左側確率かを最初に確認します。";
  } else if (text.includes("適合度検定")) {
    tip = "簡単に言うと「観測されたカテゴリの人数が、想定していた割合からどれくらいズレているか」を見る問題です。サイコロが公平か、比率が期待通りか、という場面で使います。";
  } else if (text.includes("独立性検定")) {
    tip = "簡単に言うと「2つのカテゴリ項目に関係がありそうか」を見る問題です。性別と合否、喫煙と疾患のようなクロス集計で使います。";
  } else if (text.includes("回帰") || text.includes("相関")) {
    tip = "簡単に言うと「一方の値が変わると、もう一方がどう変わるか」を読む問題です。ただし相関や回帰だけで因果関係が証明されたとは言えません。";
  } else if (text.includes("分散分析")) {
    tip = "簡単に言うと「3つ以上のグループの平均に差がありそうか」を見る問題です。群間のばらつきが群内のばらつきより十分大きいかをF値で見ます。";
  } else if (text.includes("標本抽出") || text.includes("調査データ")) {
    tip = "簡単に言うと「データの集め方に偏りがないか」を読む問題です。統計手法が正しくても、集め方が偏っていると結論も偏ります。";
  } else {
    tip = `簡単に言うと、この問題は「${item.topic}」の考え方を、公式の形に当てはめる前に文脈から読み取る練習です。何の値を求めるのか、どの条件が与えられているのかを先に整理します。`;
  }
  return `<div class="tip-box"><b>まず何を求める問題？</b>${tip}</div>`;
}

function typesetMath(root = document.body, attempt = 0) {
  if (window.MathJax?.typesetPromise) {
    window.MathJax.typesetPromise([root]).catch(() => {});
    return;
  }
  if (attempt < 20) {
    window.setTimeout(() => typesetMath(root, attempt + 1), 150);
  }
}

function normalCdfApprox(z) {
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const d = 0.3989423 * Math.exp(-z * z / 2);
  const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  return z > 0 ? 1 - p : p;
}

function shuffle(arr) {
  return arr
    .map((value) => ({ value, key: Math.random() }))
    .sort((a, b) => a.key - b.key)
    .map((item) => item.value);
}

function makeChoices(correct, distractors, suffix = "") {
  const isNumeric = typeof correct === "number";
  const values = [correct, ...distractors]
    .map((x) => (typeof x === "number" ? fmt(x) : String(x)))
    .filter((v, i, a) => a.indexOf(v) === i)
    .slice(0, 5);
  while (isNumeric && values.length < 5) values.push(fmt(Number(correct) + rnd(-4, 4) / 10));
  return shuffle(values.map((v) => `${v}${suffix}`));
}

function q(topic, difficulty, text, given, correct, distractors, explanation, suffix = "") {
  const choices = makeChoices(correct, distractors, suffix);
  const answer = choices.indexOf(`${typeof correct === "number" ? fmt(correct) : correct}${suffix}`);
  return { topic, difficulty, text, given, choices, answer, explanation };
}

const generators = [
  () => {
    const data = shuffle([rnd(3, 8), rnd(9, 14), rnd(15, 22), rnd(23, 35), rnd(36, 48), rnd(49, 60), rnd(61, 75)]);
    const mean = data.reduce((a, b) => a + b, 0) / data.length;
    const variance = data.reduce((s, x) => s + (x - mean) ** 2, 0) / (data.length - 1);
    return q("記述統計", "標準", "次のデータの不偏分散として最も近いものを選べ。", `データ: ${data.join(", ")}`, variance, [variance * data.length / (data.length - 1), Math.sqrt(variance), variance * 0.8, variance * 1.25], detail("不偏分散の確認", [
      ["考え方", `不偏分散は、標本から母分散を推定するために偏差平方和を ${math("n-1")} で割ります。`],
      ["計算", `<div class="formula">${math(`\\bar{x}=${fmt(mean)},\\quad s^2=\\frac{\\sum (x_i-\\bar{x})^2}{${data.length - 1}}=${fmt(variance)}`)}</div>`],
      ["注意点", `${math("n")} で割る分散、標準偏差 ${math("s")}、不偏分散 ${math("s^2")} を選択肢で混ぜられやすいです。`]
    ]));
  },
  () => {
    const meanX = rnd(40, 80);
    const sdX = rnd(8, 15);
    const x = meanX + rnd(1, 2) * sdX;
    const z = (x - meanX) / sdX;
    return q("記述統計", "基礎", "偏差値を求める式 50 + 10z を用いる。次の場合の偏差値はいくつか。", `平均 ${meanX}、標準偏差 ${sdX}、観測値 ${x}`, 50 + 10 * z, [50 + z, 50 + 100 * z, 10 + 50 * z, 50 - 10 * z], detail("標準化してから偏差値へ変換", [
      ["考え方", `観測値が平均から標準偏差何個分だけ離れているかを ${math("z")} で表します。`],
      ["計算", `<div class="formula">${math(`z=\\frac{x-\\mu}{\\sigma}=\\frac{${x}-${meanX}}{${sdX}}=${fmt(z)}`)}<br>${math(`50+10z=50+10\\times ${fmt(z)}=${fmt(50 + 10 * z)}`)}</div>`],
      ["注意点", `偏差値は標準化得点そのものではなく、平均50・標準偏差10へ変換した値です。`]
    ]));
  },
  () => {
    const a = rnd(2, 5);
    const b = rnd(2, 5);
    const c = rnd(1, Math.min(a, b));
    const p = (a + b - c) / 20;
    return q("確率", "標準", "20人のうちAに該当する人、Bに該当する人、両方に該当する人が次の通りである。AまたはBに該当する確率はどれか。", `A: ${a}人、B: ${b}人、AかつB: ${c}人`, p, [(a + b) / 20, (a * b) / 400, c / 20, (20 - a - b + c) / 20], detail("和事象は重複を1回引く", [
      ["考え方", `${math("A\\cup B")} は「AまたはB」です。両方に該当する人を二重に数えないようにします。`],
      ["計算", `<div class="formula">${math(`P(A\\cup B)=P(A)+P(B)-P(A\\cap B)=\\frac{${a}+${b}-${c}}{20}=${fmt(p)}`)}</div>`],
      ["注意点", `${math("P(A)P(B)")} は独立な事象の積事象で使う形です。この問題は人数から直接数えるのが安全です。`]
    ]));
  },
  () => {
    const p = pick([0.2, 0.25, 0.3, 0.4]);
    const n = rnd(4, 7);
    const k = rnd(1, n - 2);
    const prob = combination(n, k) * p ** k * (1 - p) ** (n - k);
    return q("分布", "標準", "Xが二項分布 B(n,p) に従う。P(X=k)として最も近いものを選べ。", `n=${n}, p=${p}, k=${k}`, prob, [p ** k * (1 - p) ** (n - k), combination(n, k) * p ** (n - k) * (1 - p) ** k, n * p, k / n], detail("二項分布の確率質量", [
      ["考え方", `独立な ${math("n")} 回の試行で、成功がちょうど ${math("k")} 回起きる確率です。`],
      ["計算", `<div class="formula">${math(`P(X=${k})={${n}\\choose ${k}}${p}^{${k}}(1-${p})^{${n - k}}=${fmt(prob)}`)}</div>`],
      ["注意点", `成功の並び方が複数あるため、組合せ係数 ${math(`{${n}\\choose ${k}}`)} が必要です。`]
    ]));
  },
  () => {
    const lambda = rnd(2, 5);
    const k = rnd(0, 3);
    const prob = Math.exp(-lambda) * lambda ** k / factorial(k);
    return q("分布", "標準", "Xがポアソン分布 Pois(λ) に従う。P(X=k)として最も近いものを選べ。", `λ=${lambda}, k=${k}`, prob, [Math.exp(-lambda) * lambda ** (k + 1) / factorial(k), lambda * Math.exp(-lambda), 1 - prob, lambda], detail("ポアソン分布の確率", [
      ["考え方", `一定時間・一定範囲に起こる回数を表す分布です。平均発生回数が ${math("\\lambda")} です。`],
      ["計算", `<div class="formula">${math(`P(X=${k})=e^{-${lambda}}\\frac{${lambda}^{${k}}}{${k}!}=${fmt(prob)}`)}</div>`],
      ["注意点", `平均も分散も ${math("\\lambda")} ですが、この問題で問われているのは確率 ${math("P(X=k)")} です。`]
    ]));
  },
  () => {
    const mu = rnd(50, 100);
    const sigma = rnd(8, 20);
    const x = mu + pick([1, 1.5, 2]) * sigma;
    const prob = 1 - normalCdfApprox((x - mu) / sigma);
    return q("分布", "やや難", "Xが正規分布 N(μ,σ^2) に従う。P(X>x)として最も近いものを選べ。", `μ=${mu}, σ=${sigma}, x=${x}`, prob, [1 - prob, normalCdfApprox((x - mu) / sigma), prob / 2, 0.5 - prob], detail("正規分布は標準化して右側を見る", [
      ["考え方", `まず標準正規分布 ${math("Z")} に直します。求めたいのは ${math("P(X>x)")} なので右側確率です。`],
      ["計算", `<div class="formula">${math(`z=\\frac{x-\\mu}{\\sigma}=\\frac{${x}-${mu}}{${sigma}}=${fmt((x - mu) / sigma)}`)}<br>${math(`P(X>${x})=1-\\Phi(${fmt((x - mu) / sigma)})=${fmt(prob)}`)}</div>`],
      ["注意点", `${math("\\Phi(z)")} は左側確率です。右側を聞かれたら ${math("1-\\Phi(z)")} にします。`]
    ]));
  },
  () => {
    const n = pick([25, 36, 49, 64, 100]);
    const mean = rnd(40, 80);
    const sd = rnd(8, 20);
    const se = sd / Math.sqrt(n);
    const lower = mean - 1.96 * se;
    const upper = mean + 1.96 * se;
    const ans = `${fmt(lower, 2)} から ${fmt(upper, 2)}`;
    return q("推定", "標準", "母分散既知とみなし、母平均の95%信頼区間として最も適切なものを選べ。", `標本平均 ${mean}、母標準偏差 ${sd}、n=${n}`, ans, [`${fmt(mean - se, 2)} から ${fmt(mean + se, 2)}`, `${fmt(mean - 2.58 * se, 2)} から ${fmt(mean + 2.58 * se, 2)}`, `${fmt(mean - 1.96 * sd, 2)} から ${fmt(mean + 1.96 * sd, 2)}`, `${fmt(lower - 1, 2)} から ${fmt(upper + 1, 2)}`], detail("95%信頼区間は標準誤差を使う", [
      ["考え方", `母平均の推定では、標本平均のばらつきである標準誤差 ${math("\\sigma/\\sqrt{n}")} を使います。`],
      ["計算", `<div class="formula">${math(`SE=\\frac{\\sigma}{\\sqrt{n}}=\\frac{${sd}}{\\sqrt{${n}}}=${fmt(se, 3)}`)}<br>${math(`\\bar{x}\\pm 1.96SE=${mean}\\pm 1.96\\times ${fmt(se, 3)}`)}<br>${math(`${fmt(lower, 2)}\\le \\mu \\le ${fmt(upper, 2)}`)}</div>`],
      ["注意点", `選択肢に ${math("\\sigma")} をそのまま使った幅が出ることがあります。信頼区間で使うのは ${math("\\sigma/\\sqrt{n}")} です。`]
    ]));
  },
  () => {
    const n = pick([100, 200, 400, 500]);
    const x = Math.round(n * pick([0.18, 0.24, 0.35, 0.42]));
    const phat = x / n;
    const se = Math.sqrt(phat * (1 - phat) / n);
    return q("推定", "標準", "母比率の標準誤差として最も近いものを選べ。", `n=${n}, 成功数=${x}`, se, [Math.sqrt(phat * (1 - phat)), phat / Math.sqrt(n), Math.sqrt(phat / n), se * 1.96], detail("母比率の標準誤差", [
      ["考え方", `成功・失敗のデータなので、標本比率 ${math("\\hat{p}")} のばらつきを使います。`],
      ["計算", `<div class="formula">${math(`\\hat{p}=\\frac{${x}}{${n}}=${fmt(phat)}`)}<br>${math(`SE=\\sqrt{\\frac{\\hat{p}(1-\\hat{p})}{n}}=\\sqrt{\\frac{${fmt(phat)}(1-${fmt(phat)})}{${n}}}=${fmt(se)}`)}</div>`],
      ["注意点", `95%信頼区間の半幅なら ${math("1.96\\times SE")} ですが、この問題は標準誤差そのものを聞いています。`]
    ]));
  },
  () => {
    const n = pick([16, 25, 36, 64]);
    const mean = rnd(52, 62);
    const mu0 = 50;
    const sd = rnd(8, 12);
    const z = (mean - mu0) / (sd / Math.sqrt(n));
    return q("検定", "標準", "母標準偏差既知の片側検定 H0: μ=50, H1: μ>50 を行う。検定統計量として最も近いものを選べ。", `標本平均 ${mean}、母標準偏差 ${sd}、n=${n}`, z, [(mean - mu0) / sd, (mean - mu0) / Math.sqrt(n), (mu0 - mean) / (sd / Math.sqrt(n)), z ** 2], detail("母標準偏差既知の平均検定", [
      ["考え方", `母標準偏差 ${math("\\sigma")} が既知なので、標準正規分布に基づく ${math("z")} 統計量を使います。`],
      ["計算", `<div class="formula">${math(`z=\\frac{\\bar{x}-\\mu_0}{\\sigma/\\sqrt{n}}=\\frac{${mean}-${mu0}}{${sd}/\\sqrt{${n}}}=${fmt(z)}`)}</div>`],
      ["注意点", `片側か両側かは棄却域やp値の判断で効きます。検定統計量そのものは同じ式です。`]
    ]));
  },
  () => {
    const obs = [rnd(18, 35), rnd(18, 35), rnd(18, 35), rnd(18, 35)];
    const total = obs.reduce((a, b) => a + b, 0);
    const exp = total / 4;
    const stat = obs.reduce((s, o) => s + (o - exp) ** 2 / exp, 0);
    return q("カテゴリ", "標準", "4カテゴリが等確率であるかを調べる適合度検定のカイ二乗統計量として最も近いものを選べ。", `観測度数: ${obs.join(", ")}`, stat, [obs.reduce((s, o) => s + (o - exp) ** 2, 0), stat / 4, Math.sqrt(stat), total / stat], detail("適合度検定の統計量", [
      ["考え方", `観測度数 ${math("O_i")} と期待度数 ${math("E_i")} のずれを、期待度数で割って足し上げます。`],
      ["計算", `<div class="formula">${math(`E_i=\\frac{${total}}{4}=${fmt(exp)}`)}<br>${math(`\\chi^2=\\sum \\frac{(O_i-E_i)^2}{E_i}=${fmt(stat)}`)}</div>`],
      ["注意点", `4カテゴリが等確率かを見るので自由度は ${math("4-1=3")} です。`]
    ]));
  },
  () => {
    const r = pick([0.4, 0.55, 0.7, -0.45, -0.6]);
    const sx = rnd(4, 10);
    const sy = rnd(6, 16);
    const b = r * sy / sx;
    return q("回帰", "標準", "単回帰 y=a+bx の傾き b として最も近いものを選べ。", `相関係数 r=${r}、xの標準偏差 ${sx}、yの標準偏差 ${sy}`, b, [r * sx / sy, r, sy / sx, -b], detail("回帰直線の傾き", [
      ["考え方", `単回帰の傾きは相関係数に、目的変数と説明変数の標準偏差比を掛けたものです。`],
      ["計算", `<div class="formula">${math(`b=r\\frac{s_y}{s_x}=${r}\\times\\frac{${sy}}{${sx}}=${fmt(b)}`)}</div>`],
      ["注意点", `相関係数 ${math("r")} は単位を持ちません。傾き ${math("b")} は ${math("x")} が1増えたときの ${math("y")} の変化量です。`]
    ]));
  },
  () => {
    const sst = rnd(120, 240);
    const sse = rnd(30, 90);
    const r2 = 1 - sse / sst;
    return q("回帰", "基礎", "回帰分析で総平方和SST、残差平方和SSEが次のとき、決定係数R^2はいくつか。", `SST=${sst}, SSE=${sse}`, r2, [sse / sst, 1 + sse / sst, Math.sqrt(r2), sst / sse], detail("決定係数の意味", [
      ["考え方", `総変動のうち、回帰式で説明できた割合が決定係数 ${math("R^2")} です。`],
      ["計算", `<div class="formula">${math(`R^2=1-\\frac{SSE}{SST}=1-\\frac{${sse}}{${sst}}=${fmt(r2)}`)}</div>`],
      ["注意点", `${math("SSE/SST")} は説明できなかった割合です。決定係数はその反対側、つまり ${math("1-SSE/SST")} です。`]
    ]));
  },
  () => {
    const groups = rnd(3, 5);
    const n = groups * rnd(6, 10);
    const dfb = groups - 1;
    const dfw = n - groups;
    return q("分散分析", "基礎", "一元配置分散分析で群数k、総標本数nが次のとき、群間と群内の自由度の組合せはどれか。", `k=${groups}, n=${n}`, `群間 ${dfb}, 群内 ${dfw}`, [`群間 ${groups}, 群内 ${n - 1}`, `群間 ${dfw}, 群内 ${dfb}`, `群間 ${dfb}, 群内 ${n - 1}`, `群間 ${n - groups}, 群内 ${groups - 1}`], detail("一元配置分散分析の自由度", [
      ["考え方", `群間は「群平均がいくつ自由に動けるか」、群内は「各群の中の残差がいくつ自由に動けるか」です。`],
      ["計算", `<div class="formula">${math(`df_{between}=k-1=${groups}-1=${dfb}`)}<br>${math(`df_{within}=n-k=${n}-${groups}=${dfw}`)}</div>`],
      ["注意点", `全体の自由度は ${math("n-1")} で、${math("(k-1)+(n-k)=n-1")} になります。`]
    ]));
  },
  () => {
    const msb = rnd(20, 60);
    const msw = rnd(4, 15);
    const f = msb / msw;
    return q("分散分析", "標準", "一元配置分散分析のF値として最も近いものを選べ。", `群間平均平方 MSB=${msb}, 群内平均平方 MSW=${msw}`, f, [msw / msb, msb - msw, msb + msw, Math.sqrt(f)], detail("F値は平均平方の比", [
      ["考え方", `群間のばらつきが、群内の自然なばらつきに比べて大きいかを見ます。`],
      ["計算", `<div class="formula">${math(`F=\\frac{MSB}{MSW}=\\frac{${msb}}{${msw}}=${fmt(f)}`)}</div>`],
      ["注意点", `引き算ではなく比です。群間平均平方を分子、群内平均平方を分母にします。`]
    ]));
  },
  () => {
    const n = pick([30, 50, 80]);
    const sx = rnd(8, 15);
    const sy = rnd(8, 15);
    const diff = rnd(3, 8);
    const se = Math.sqrt(sx ** 2 / n + sy ** 2 / n);
    const z = diff / se;
    return q("検定", "やや難", "独立2標本の平均差検定で、母分散既知近似を用いる。検定統計量として最も近いものを選べ。", `標本平均差 ${diff}、各群 n=${n}、標準偏差 ${sx} と ${sy}`, z, [diff / (sx + sy), diff / Math.sqrt((sx ** 2 + sy ** 2) / (2 * n)), se / diff, diff / sx], detail("独立2標本の平均差検定", [
      ["考え方", `2つの標本平均の差は、それぞれの標本平均のばらつきを合成した標準誤差で割って標準化します。`],
      ["計算", `<div class="formula">${math(`SE=\\sqrt{\\frac{\\sigma_1^2}{n_1}+\\frac{\\sigma_2^2}{n_2}}=\\sqrt{\\frac{${sx}^2}{${n}}+\\frac{${sy}^2}{${n}}}=${fmt(se)}`)}<br>${math(`z=\\frac{\\bar{x}_1-\\bar{x}_2}{SE}=\\frac{${diff}}{${fmt(se)}}=${fmt(z)}`)}</div>`],
      ["注意点", `標準偏差を足すのではなく、分散を標本サイズで割ったものを足します。ここがCBTで崩れやすいポイントです。`]
    ]));
  },
  () => {
    const n = pick([40, 60, 100]);
    const r = pick([0.25, 0.35, 0.5, -0.4]);
    const t = r * Math.sqrt((n - 2) / (1 - r ** 2));
    return q("回帰", "やや難", "相関係数が0かどうかを検定するt統計量として最も近いものを選べ。", `n=${n}, r=${r}`, t, [r * Math.sqrt(n), r / Math.sqrt(1 - r ** 2), Math.sqrt((n - 2) / (1 - r ** 2)), -t], detail("相関係数の検定", [
      ["考え方", `母相関が0かどうかは、標本相関係数 ${math("r")} を ${math("t")} 統計量へ変換して判定します。`],
      ["計算", `<div class="formula">${math(`t=r\\sqrt{\\frac{n-2}{1-r^2}}=${r}\\sqrt{\\frac{${n}-2}{1-${r}^2}}=${fmt(t)}`)}</div>`],
      ["注意点", `自由度は ${math("n-2")} です。回帰の傾き検定と同じ自由度になる、と覚えるとつながります。`]
    ]));
  },
  () => {
    const situation = pick([
      ["新しい広告A/Bで購入率が変わったかを調べたい", "母比率の差の検定", "2群の平均差の検定", "適合度検定", "単回帰分析"],
      ["サイコロの各目が等確率に出ているかを調べたい", "適合度検定", "独立性の検定", "母平均の検定", "相関係数の検定"],
      ["喫煙習慣の有無と疾患の有無に関連があるかを調べたい", "独立性の検定", "適合度検定", "対応のあるt検定", "単回帰分析"],
      ["勉強時間から得点を予測する直線モデルを作りたい", "単回帰分析", "適合度検定", "母分散の検定", "二項分布"]
    ]);
    return q("検定", "判断", "次の状況で最初に選ぶ分析・検定として最も適切なものはどれか。", situation[0], situation[1], situation.slice(2), detail("手法選択の読み方", [
      ["考え方", `CBTでは式を覚えているだけではなく、問題文からデータの型と目的を読む問題が出ます。`],
      ["判断手順", `まず量的変数かカテゴリ変数かを分けます。次に、差を見たいのか、関連を見たいのか、分布への適合を見たいのかを確認します。`],
      ["注意点", `「割合」「有無」「カテゴリ」はカイ二乗検定や比率の検定につながりやすく、「得点」「時間」「身長」のような量的変数は平均・回帰につながりやすいです。`]
    ]), "");
  },
  () => {
    const n = pick([12, 18, 25]);
    const mean = rnd(70, 78);
    const mu0 = 70;
    const s = rnd(8, 12);
    const t = (mean - mu0) / (s / Math.sqrt(n));
    return q("検定", "判断", "母分散が未知で標本数が小さい。母平均の検定統計量として最も適切なものを選べ。", `標本平均 ${mean}、帰無仮説の平均 ${mu0}、標本標準偏差 ${s}、n=${n}`, t, [(mean - mu0) / s, (mean - mu0) / Math.sqrt(n), (mu0 - mean) / (s / Math.sqrt(n)), t ** 2], detail("母分散未知の平均検定", [
      ["考え方", `母標準偏差 ${math("\\sigma")} が未知なので、標本標準偏差 ${math("s")} を使う ${math("t")} 検定になります。`],
      ["計算", `<div class="formula">${math(`t=\\frac{\\bar{x}-\\mu_0}{s/\\sqrt{n}}=\\frac{${mean}-${mu0}}{${s}/\\sqrt{${n}}}=${fmt(t)}`)}</div>`],
      ["注意点", `分母は ${math("s")} ではなく ${math("s/\\sqrt{n}")} です。自由度は ${math("n-1")} です。`]
    ]));
  },
  () => {
    const p = pick([0.1, 0.2, 0.25, 0.4]);
    const ans = 1 / p;
    return q("分布", "判断", "成功確率pの独立試行を、初めて成功するまで繰り返す。試行回数の期待値として最も近いものを選べ。", `p=${p}`, ans, [p, 1 - p, p * (1 - p), Math.sqrt(p * (1 - p))], detail("幾何分布の期待値", [
      ["考え方", `「初めて成功するまでの試行回数」は幾何分布です。`],
      ["計算", `<div class="formula">${math(`E[X]=\\frac{1}{p}=\\frac{1}{${p}}=${fmt(ans)}`)}</div>`],
      ["注意点", `「${math("n")} 回中の成功回数」なら二項分布、「初めて成功するまで」なら幾何分布です。`]
    ]));
  },
  () => {
    const a = rnd(18, 40);
    const b = rnd(18, 40);
    const c = rnd(18, 40);
    const total = a + b + c;
    const mean = (a + b + c) / 3;
    const median = [a, b, c].sort((x, y) => x - y)[1];
    const ans = mean > median ? "平均 > 中央値" : mean < median ? "平均 < 中央値" : "平均 = 中央値";
    return q("記述統計", "判断", "外れ値が少ない3つの値について、平均と中央値の大小関係として正しいものを選べ。", `値: ${a}, ${b}, ${c}、合計: ${total}`, ans, ["平均 > 中央値", "平均 < 中央値", "平均 = 中央値", "標準偏差がないと判断できない"].filter((x) => x !== ans), detail("平均と中央値を分けて計算", [
      ["考え方", `平均は合計を個数で割った値、中央値は小さい順に並べた中央の値です。`],
      ["計算", `<div class="formula">${math(`\\bar{x}=\\frac{${total}}{3}=${fmt(mean)}`)}<br>${math(`中央値=${median}`)}</div>`],
      ["注意点", `歪んだ分布や外れ値があると平均と中央値の差が広がります。CBTでは文章から「どちらが影響を受けやすいか」を問われることもあります。`]
    ]));
  },
  () => {
    const data = [rnd(12, 18), rnd(19, 24), rnd(25, 30), rnd(31, 38), rnd(70, 95)].sort((x, y) => x - y);
    const mean = data.reduce((s, x) => s + x, 0) / data.length;
    const median = data[2];
    const ans = "平均は中央値より大きい";
    return q("記述統計", "判断", "右に外れ値があるデータで、平均と中央値の関係として最も適切なものを選べ。", `データ: ${data.join(", ")}`, ans, ["平均は中央値より小さい", "平均と中央値は必ず等しい", "中央値は外れ値の影響を平均より強く受ける", "標準偏差がないと大小は判断できない"], detail("外れ値と代表値", [
      ["考え方", `大きな外れ値があると、平均 ${math("\\bar{x}")} は外れ値側へ引っ張られます。一方、中央値は順位で決まるため影響が小さいです。`],
      ["計算", `<div class="formula">${math(`\\bar{x}=\\frac{${data.join("+")}}{5}=${fmt(mean)}`)}<br>${math(`中央値=${median}`)}</div>`],
      ["注意点", `右に歪んだ分布では、多くの場合 ${math("平均>中央値")} になります。箱ひげ図やヒストグラムの読解でも頻出です。`]
    ]));
  },
  () => {
    const mean1 = rnd(80, 120);
    const sd1 = rnd(8, 20);
    const mean2 = rnd(300, 800);
    const sd2 = rnd(45, 180);
    const cv1 = sd1 / mean1;
    const cv2 = sd2 / mean2;
    const ans = cv1 > cv2 ? "Aの相対的なばらつきが大きい" : "Bの相対的なばらつきが大きい";
    return q("記述統計", "標準", "単位や平均が異なる2つのデータのばらつきを比較する。変動係数に基づく判断として正しいものを選べ。", `A: 平均 ${mean1}, 標準偏差 ${sd1}。B: 平均 ${mean2}, 標準偏差 ${sd2}`, ans, ["標準偏差が大きい方を必ず選ぶ", "平均が大きい方を必ず選ぶ", cv1 > cv2 ? "Bの相対的なばらつきが大きい" : "Aの相対的なばらつきが大きい", "変動係数では比較できない"], detail("変動係数で相対比較する", [
      ["考え方", `単位や平均水準が違うときは、標準偏差を平均で割った変動係数 ${math("CV=s/\\bar{x}")} を使います。`],
      ["計算", `<div class="formula">${math(`CV_A=\\frac{${sd1}}{${mean1}}=${fmt(cv1)}`)}<br>${math(`CV_B=\\frac{${sd2}}{${mean2}}=${fmt(cv2)}`)}</div>`],
      ["注意点", `標準偏差の大小だけで決めると、平均水準の違いに引っかかります。`]
    ]));
  },
  () => {
    const sens = pick([0.88, 0.9, 0.95]);
    const spec = pick([0.9, 0.92, 0.96]);
    const prev = pick([0.01, 0.03, 0.05]);
    const ppv = (sens * prev) / (sens * prev + (1 - spec) * (1 - prev));
    return q("確率", "難", "ある検査で陽性だった人が実際に疾患を持つ確率として最も近いものを選べ。", `感度 ${sens}, 特異度 ${spec}, 有病率 ${prev}`, ppv, [sens, spec, prev, sens * prev], detail("ベイズの定理で陽性的中率を求める", [
      ["考え方", `求めたいのは ${math("P(疾患\\mid 陽性)")} です。陽性者には真陽性と偽陽性が混ざります。`],
      ["計算", `<div class="formula">${math(`P(D\\mid +)=\\frac{P(+\\mid D)P(D)}{P(+\\mid D)P(D)+P(+\\mid D^c)P(D^c)}`)}<br>${math(`=\\frac{${sens}\\times ${prev}}{${sens}\\times ${prev}+(1-${spec})(1-${prev})}=${fmt(ppv)}`)}</div>`],
      ["注意点", `有病率が低いと、感度・特異度が高くても陽性的中率は思ったほど高くなりません。CBTの条件付き確率で狙われます。`]
    ]));
  },
  () => {
    const pA = pick([0.25, 0.3, 0.4]);
    const pB = pick([0.2, 0.35, 0.5]);
    const joint = round(pA * pB, 3);
    const ans = "独立であると判断できる";
    return q("確率", "判断", "事象AとBについて、独立性の判断として最も適切なものを選べ。", `P(A)=${pA}, P(B)=${pB}, P(A∩B)=${joint}`, ans, ["排反であると判断できる", "独立ではないと判断できる", "Aならば必ずBである", "Bならば必ずAである"], detail("独立と排反を区別する", [
      ["考え方", `独立なら ${math("P(A\\cap B)=P(A)P(B)")} が成り立ちます。排反なら ${math("P(A\\cap B)=0")} です。`],
      ["計算", `<div class="formula">${math(`P(A)P(B)=${pA}\\times ${pB}=${fmt(pA * pB)}`)}<br>${math(`P(A\\cap B)=${joint}`)}</div>`],
      ["注意点", `独立と排反は別物です。どちらも選択肢に出ると混同しやすいです。`]
    ]));
  },
  () => {
    const p = pick([0.2, 0.3, 0.4]);
    const n = pick([5, 6, 8]);
    const prob = 1 - (1 - p) ** n;
    return q("分布", "標準", "成功確率pの独立試行をn回行う。少なくとも1回成功する確率として最も近いものを選べ。", `p=${p}, n=${n}`, prob, [p ** n, (1 - p) ** n, n * p, 1 - p ** n], detail("少なくとも1回は補集合で考える", [
      ["考え方", `「少なくとも1回」は直接足すより、0回成功の補集合で考えると速いです。`],
      ["計算", `<div class="formula">${math(`P(X\\ge 1)=1-P(X=0)=1-(1-p)^n=1-(1-${p})^{${n}}=${fmt(prob)}`)}</div>`],
      ["注意点", `CBTでは「ちょうど1回」と「少なくとも1回」を入れ替えた選択肢が出ます。`]
    ]));
  },
  () => {
    const mu = rnd(8, 15);
    const sigma = rnd(2, 5);
    const n = pick([25, 36, 64]);
    const xbar = mu + pick([0.5, 1, 1.5]) * sigma / Math.sqrt(n);
    const z = (xbar - mu) / (sigma / Math.sqrt(n));
    const prob = 1 - normalCdfApprox(z);
    return q("分布", "難", "標本平均の分布を用いる。P(標本平均 > 指定値)として最も近いものを選べ。", `母平均 ${mu}, 母標準偏差 ${sigma}, n=${n}, 指定値 ${fmt(xbar, 2)}`, prob, [1 - normalCdfApprox((xbar - mu) / sigma), normalCdfApprox(z), 0.5, sigma / Math.sqrt(n)], detail("標本平均の標準誤差を使う", [
      ["考え方", `標本平均 ${math("\\bar{X}")} の標準偏差は ${math("\\sigma/\\sqrt{n}")} です。個々の観測値の標準偏差 ${math("\\sigma")} ではありません。`],
      ["計算", `<div class="formula">${math(`z=\\frac{\\bar{x}-\\mu}{\\sigma/\\sqrt{n}}=\\frac{${fmt(xbar, 2)}-${mu}}{${sigma}/\\sqrt{${n}}}=${fmt(z)}`)}<br>${math(`P(\\bar{X}>${fmt(xbar, 2)})=1-\\Phi(${fmt(z)})=${fmt(prob)}`)}</div>`],
      ["注意点", `標本分布は2級CBTで差がつきやすい分野です。問題文に「標本平均」と出たら分母に ${math("\\sqrt{n}")} が入るか確認します。`]
    ]));
  },
  () => {
    const n = pick([100, 200, 400]);
    const p0 = pick([0.3, 0.4, 0.5]);
    const x = Math.round(n * (p0 + pick([0.06, 0.08, -0.07])));
    const phat = x / n;
    const z = (phat - p0) / Math.sqrt(p0 * (1 - p0) / n);
    return q("検定", "難", "母比率の検定 H0: p=p0 における検定統計量として最も近いものを選べ。", `p0=${p0}, n=${n}, 成功数=${x}`, z, [(phat - p0) / Math.sqrt(phat * (1 - phat) / n), phat, (x - p0) / Math.sqrt(n), z ** 2], detail("比率検定では帰無仮説の比率で標準化", [
      ["考え方", `検定統計量では、帰無仮説が正しいと仮定したときの標準誤差を使います。`],
      ["計算", `<div class="formula">${math(`\\hat{p}=\\frac{${x}}{${n}}=${fmt(phat)}`)}<br>${math(`z=\\frac{\\hat{p}-p_0}{\\sqrt{p_0(1-p_0)/n}}=\\frac{${fmt(phat)}-${p0}}{\\sqrt{${p0}(1-${p0})/${n}}}=${fmt(z)}`)}</div>`],
      ["注意点", `信頼区間では ${math("\\hat{p}")}、検定では ${math("p_0")} を標準誤差に入れる、という違いが問われやすいです。`]
    ]));
  },
  () => {
    const n = pick([16, 25, 36]);
    const s2 = rnd(18, 35);
    const sigma02 = rnd(12, 20);
    const stat = (n - 1) * s2 / sigma02;
    return q("検定", "難", "正規母集団の母分散について H0: σ^2=σ0^2 を検定する。カイ二乗統計量として最も近いものを選べ。", `n=${n}, 標本分散 s^2=${s2}, σ0^2=${sigma02}`, stat, [s2 / sigma02, n * s2 / sigma02, Math.sqrt(stat), (n - 1) * sigma02 / s2], detail("母分散の検定統計量", [
      ["考え方", `正規母集団の母分散の検定では、カイ二乗分布を使います。`],
      ["計算", `<div class="formula">${math(`\\chi^2=\\frac{(n-1)s^2}{\\sigma_0^2}=\\frac{(${n}-1)${s2}}{${sigma02}}=${fmt(stat)}`)}</div>`],
      ["注意点", `自由度は ${math("n-1")} です。平均の検定と分散の検定で使う分布が違う点を押さえます。`]
    ]));
  },
  () => {
    const pvalue = pick([0.012, 0.032, 0.081, 0.18]);
    const alpha = pick([0.01, 0.05]);
    const ans = pvalue < alpha ? "帰無仮説を棄却する" : "帰無仮説を棄却しない";
    return q("検定", "判断", "p値と有意水準に基づく判断として最も適切なものを選べ。", `p値=${pvalue}, 有意水準 α=${alpha}`, ans, [pvalue < alpha ? "帰無仮説を棄却しない" : "帰無仮説を棄却する", "帰無仮説が正しい確率はp値である", "対立仮説が正しい確率は1-p値である", "有意水準よりp値が大きいほど強い証拠である"], detail("p値の正しい読み方", [
      ["考え方", `p値は、帰無仮説のもとで観測結果以上に極端な結果が出る確率です。${math("p<\\alpha")} なら棄却します。`],
      ["判断", `<div class="formula">${math(`${pvalue} ${pvalue < alpha ? "<" : "\\ge"} ${alpha}`)}</div>${ans}。`],
      ["注意点", `p値は「帰無仮説が正しい確率」ではありません。CBTではこの誤解を直接問われることがあります。`]
    ]));
  },
  () => {
    const cases = [
      ["有意水準を5%から1%に下げる", "第1種の過誤は小さくなり、第2種の過誤は大きくなりやすい"],
      ["標本サイズを大きくする", "検出力は大きくなりやすい"],
      ["真の差が小さくなる", "検出力は小さくなりやすい"]
    ];
    const picked = pick(cases);
    return q("検定", "難", "仮説検定の過誤・検出力に関する説明として正しいものを選べ。", picked[0], picked[1], ["第1種の過誤は必ず大きくなる", "第2種の過誤は必ず0になる", "p値は必ず小さくなる", "検定統計量の分布は標本サイズに依存しない"], detail("過誤と検出力の関係", [
      ["考え方", `第1種の過誤は、本当は ${math("H_0")} が正しいのに棄却する誤りです。第2種の過誤は、本当は差があるのに棄却できない誤りです。`],
      ["判断", `有意水準を厳しくすると第1種の過誤は抑えられますが、同じ標本サイズでは棄却しにくくなるため第2種の過誤が増えやすくなります。`],
      ["注意点", `計算だけでなく、検定の意味を問う読解問題はCBTで重要です。`]
    ]));
  },
  () => {
    const a = rnd(20, 50);
    const b = rnd(20, 50);
    const c = rnd(20, 50);
    const d = rnd(20, 50);
    const total = a + b + c + d;
    const row1 = a + b;
    const col1 = a + c;
    const expected = row1 * col1 / total;
    return q("カテゴリ", "標準", "2×2分割表の独立性検定で、左上セルの期待度数として最も近いものを選べ。", `観測度数: [[${a}, ${b}], [${c}, ${d}]]`, expected, [row1 / total, col1 / total, a, (a + d) / 2], detail("独立性検定の期待度数", [
      ["考え方", `独立性検定では、各セルの期待度数を ${math("行合計\\times 列合計/総数")} で求めます。`],
      ["計算", `<div class="formula">${math(`E_{11}=\\frac{${row1}\\times ${col1}}{${total}}=${fmt(expected)}`)}</div>`],
      ["注意点", `観測度数そのものではなく、独立なら期待される度数を計算します。`]
    ]));
  },
  () => {
    const r = pick([0.62, -0.58, 0.74, -0.7]);
    const ans = r > 0 ? "xが大きいほどyも大きい傾向がある" : "xが大きいほどyは小さい傾向がある";
    return q("回帰", "判断", "相関係数の解釈として最も適切なものを選べ。", `相関係数 r=${r}`, ans, ["xが1増えるとyが必ずrだけ増える", "相関があるので因果関係が証明された", "rが負なので関係の強さは0である", "外れ値の影響は受けない"], detail("相関係数の解釈", [
      ["考え方", `相関係数は線形関係の向きと強さを表します。符号は向き、絶対値は強さの目安です。`],
      ["判断", `${math(`r=${r}`)} なので、${r > 0 ? "正の相関" : "負の相関"}があります。`],
      ["注意点", `相関は因果を意味しません。また外れ値の影響を強く受けることがあります。`]
    ]));
  },
  () => {
    const b0 = rnd(20, 50);
    const b1 = pick([1.5, 2, 2.5, -1.2]);
    const x = rnd(5, 12);
    const yhat = b0 + b1 * x;
    return q("回帰", "基礎", "単回帰モデルの予測値として最も近いものを選べ。", `推定式: y=${b0}+${b1}x, x=${x}`, yhat, [b0, b1 * x, b0 - b1 * x, yhat + rnd(4, 8)], detail("回帰式へ代入する", [
      ["考え方", `予測値 ${math("\\hat{y}")} は、説明変数 ${math("x")} を推定された回帰式に代入して求めます。`],
      ["計算", `<div class="formula">${math(`\\hat{y}=${b0}+${b1}\\times ${x}=${fmt(yhat)}`)}</div>`],
      ["注意点", `切片を落とした ${math("b_1x")} だけの選択肢に注意します。`]
    ]));
  },
  () => {
    const beta = pick([1.8, -2.4, 0.75]);
    const se = pick([0.3, 0.4, 0.5]);
    const t = beta / se;
    return q("回帰", "難", "回帰係数のt値として最も近いものを選べ。", `推定係数 ${beta}, 標準誤差 ${se}`, t, [beta * se, se / beta, beta + se, Math.abs(t)], detail("係数を標準誤差で割る", [
      ["考え方", `回帰係数が0からどれだけ離れているかを、係数の標準誤差で割って測ります。`],
      ["計算", `<div class="formula">${math(`t=\\frac{\\hat{\\beta}}{SE(\\hat{\\beta})}=\\frac{${beta}}{${se}}=${fmt(t)}`)}</div>`],
      ["注意点", `符号も意味があります。片側・両側の判断や係数の向きに関わります。`]
    ]));
  },
  () => {
    const n = rnd(30, 80);
    const k = pick([2, 3, 4]);
    const sse = rnd(100, 300);
    const mse = sse / (n - k - 1);
    return q("回帰", "難", "重回帰で説明変数がk個ある。残差平方和SSEから残差平均平方MSEを求めるとどれか。", `n=${n}, 説明変数 k=${k}, SSE=${sse}`, mse, [sse / (n - 1), sse / k, sse / (n - k), Math.sqrt(mse)], detail("重回帰の残差自由度", [
      ["考え方", `切片を含む重回帰では、残差自由度は ${math("n-k-1")} です。`],
      ["計算", `<div class="formula">${math(`MSE=\\frac{SSE}{n-k-1}=\\frac{${sse}}{${n}-${k}-1}=${fmt(mse)}`)}</div>`],
      ["注意点", `説明変数の個数だけでなく切片の1も引く点が落とし穴です。`]
    ]));
  },
  () => {
    const k = pick([3, 4, 5]);
    const nPer = pick([8, 10, 12]);
    const n = k * nPer;
    const ssb = rnd(40, 120);
    const ssw = rnd(80, 240);
    const f = (ssb / (k - 1)) / (ssw / (n - k));
    return q("分散分析", "難", "一元配置分散分析で、平方和からF値を求める。最も近いものを選べ。", `群数 k=${k}, 各群 ${nPer} 個, 群間平方和 ${ssb}, 群内平方和 ${ssw}`, f, [ssb / ssw, (ssw / (n - k)) / (ssb / (k - 1)), ssb / (k - 1), ssw / (n - k)], detail("平方和から平均平方へ", [
      ["考え方", `F値は平方和をそのまま割るのではなく、それぞれ自由度で割って平均平方にしてから比を取ります。`],
      ["計算", `<div class="formula">${math(`MSB=\\frac{${ssb}}{${k}-1}=${fmt(ssb / (k - 1))}`)}<br>${math(`MSW=\\frac{${ssw}}{${n}-${k}}=${fmt(ssw / (n - k))}`)}<br>${math(`F=\\frac{MSB}{MSW}=${fmt(f)}`)}</div>`],
      ["注意点", `平方和の比 ${math("SSB/SSW")} ではありません。`]
    ]));
  },
  () => {
    const situations = [
      ["同じ20人のダイエット前後の体重差を調べる", "対応のあるt検定"],
      ["別々の2クラスの平均点を比較する", "独立2標本の平均差の検定"],
      ["男女と合格/不合格の関連を見る", "独立性のカイ二乗検定"],
      ["ある母集団の平均が基準値と異なるかを見る", "1標本の平均検定"]
    ];
    const s = pick(situations);
    return q("検定", "判断", "次の状況で使う検定として最も適切なものを選べ。", s[0], s[1], situations.map((x) => x[1]).filter((x) => x !== s[1]), detail("対応あり・なしを読む", [
      ["考え方", `同じ対象を前後で測るなら対応あり、別々の集団を比較するなら独立2標本です。カテゴリ同士の関連ならカイ二乗検定です。`],
      ["判断", `${s[0]} では「対象が同じか」「変数が量的かカテゴリか」を最初に読みます。`],
      ["注意点", `CBTでは問題文の設定を読ませる問題が増えます。計算式より先にデータ構造を決めます。`]
    ]));
  },
  () => {
    const n = pick([12, 16, 20]);
    const dbar = pick([2.1, -1.8, 3.2]);
    const sd = pick([4.2, 5.0, 6.4]);
    const t = dbar / (sd / Math.sqrt(n));
    return q("検定", "難", "対応のある2標本で差の平均を検定する。t統計量として最も近いものを選べ。", `差の平均 ${dbar}, 差の標準偏差 ${sd}, ペア数 n=${n}`, t, [dbar / sd, dbar / Math.sqrt(n), sd / Math.sqrt(n), -t], detail("対応のあるt検定は差を1標本として扱う", [
      ["考え方", `対応のあるデータでは、各ペアの差 ${math("d_i")} を作り、その平均が0かどうかを1標本t検定します。`],
      ["計算", `<div class="formula">${math(`t=\\frac{\\bar{d}-0}{s_d/\\sqrt{n}}=\\frac{${dbar}}{${sd}/\\sqrt{${n}}}=${fmt(t)}`)}</div>`],
      ["注意点", `2群を独立とみなして別々の標準誤差を合成する問題ではありません。`]
    ]));
  },
  () => {
    const ciLow = pick([1.2, -0.8, 0.3]);
    const width = pick([0.8, 1.4, 2.0]);
    const ciHigh = round(ciLow + width, 2);
    const ans = ciLow > 0 || ciHigh < 0 ? "5%水準の両側検定で有意と判断できる" : "5%水準の両側検定で有意とは判断できない";
    return q("推定", "判断", "回帰係数の95%信頼区間から、係数が0かどうかの判断として最も適切なものを選べ。", `95%信頼区間: [${ciLow}, ${ciHigh}]`, ans, [ciLow > 0 || ciHigh < 0 ? "5%水準の両側検定で有意とは判断できない" : "5%水準の両側検定で有意と判断できる", "信頼区間の幅だけでは符号は判断できない", "信頼区間に1が含まれるかだけを見ればよい", "標本サイズがないので必ず判断不能"], detail("信頼区間と検定の対応", [
      ["考え方", `95%信頼区間に0が含まれなければ、5%水準の両側検定で係数0を棄却できます。`],
      ["判断", `${math(`[${ciLow}, ${ciHigh}]`)} ${ciLow <= 0 && ciHigh >= 0 ? "には0が含まれます" : "には0が含まれません"}。したがって ${ans}。`],
      ["注意点", `回帰係数や平均差では0を含むかを見るのが基本です。オッズ比などでは1を見るので、文脈で変わります。`]
    ]));
  },
  () => {
    const sampling = pick([
      ["母集団を性別で層に分け、各層から無作為抽出する", "層化抽出"],
      ["都道府県をいくつか無作為に選び、選ばれた都道府県内の対象を調べる", "クラスター抽出"],
      ["名簿から乱数で対象者を選ぶ", "単純無作為抽出"],
      ["名簿の先頭を乱数で決め、その後は一定間隔で選ぶ", "系統抽出"]
    ]);
    return q("記述統計", "判断", "標本抽出法として最も適切な名称を選べ。", sampling[0], sampling[1], ["層化抽出", "クラスター抽出", "単純無作為抽出", "系統抽出"].filter((x) => x !== sampling[1]), detail("標本抽出法の見分け方", [
      ["考え方", `層化抽出は層ごとに抽出、クラスター抽出は集団のまとまりを選んで調べます。`],
      ["判断", `${sampling[0]} なので、答えは ${sampling[1]} です。`],
      ["注意点", `データ収集法は計算が少ないぶん、用語の違いを正確に読めるかが問われます。`]
    ]));
  },
  () => {
    const missing = pick([
      ["回答しない人が特定の属性に偏っている", "非回答バイアス"],
      ["調査対象がインターネット利用者だけに限られている", "選択バイアス"],
      ["質問文が特定の回答を誘導している", "測定バイアス"]
    ]);
    return q("記述統計", "判断", "調査データの偏りに関する説明として最も適切なものを選べ。", missing[0], missing[1], ["非回答バイアス", "選択バイアス", "測定バイアス", "標本誤差"].filter((x) => x !== missing[1]), detail("データ収集のバイアス", [
      ["考え方", `統計検定2級では計算だけでなく、データがどう集められたかも問われます。`],
      ["判断", `${missing[0]} 場合は ${missing[1]} と呼ぶのが適切です。`],
      ["注意点", `標本サイズを増やしても、調査設計の偏りがあると推定は改善しません。`]
    ]));
  },
  () => {
    const a = rnd(10, 25);
    const b = rnd(10, 25);
    const c = rnd(10, 25);
    const d = rnd(10, 25);
    const oddsRatio = (a * d) / (b * c);
    return q("カテゴリ", "難", "2×2表からオッズ比を求める。最も近いものを選べ。", `表: [[${a}, ${b}], [${c}, ${d}]]`, oddsRatio, [(a / b) / (c + d), (a + b) / (c + d), (a * b) / (c * d), 1 / oddsRatio], detail("2×2表のオッズ比", [
      ["考え方", `2×2表 ${math("\\begin{pmatrix}a&b\\\\c&d\\end{pmatrix}")} のオッズ比は ${math("ad/bc")} です。`],
      ["計算", `<div class="formula">${math(`OR=\\frac{ad}{bc}=\\frac{${a}\\times ${d}}{${b}\\times ${c}}=${fmt(oddsRatio)}`)}</div>`],
      ["注意点", `リスク比や差とは違います。表の向きによって逆数になることもあります。`]
    ]));
  },
  () => {
    const n = pick([60, 80, 100]);
    const x = Math.round(n * pick([0.55, 0.6, 0.65]));
    const p0 = 0.5;
    const phat = x / n;
    const z = (phat - p0) / Math.sqrt(p0 * (1 - p0) / n);
    const pOne = 1 - normalCdfApprox(z);
    const pTwo = 2 * Math.min(pOne, 1 - pOne);
    return q("検定", "難", "母比率の両側検定で、近似的なp値として最も近いものを選べ。", `H0: p=0.5, n=${n}, 成功数=${x}`, pTwo, [pOne, 1 - pOne, phat, Math.abs(z)], detail("両側p値は片側確率を2倍する", [
      ["考え方", `両側検定では、観測された ${math("|z|")} 以上に極端な左右両側の確率を足します。`],
      ["計算", `<div class="formula">${math(`z=\\frac{${fmt(phat)}-0.5}{\\sqrt{0.5(1-0.5)/${n}}}=${fmt(z)}`)}<br>${math(`p\\値\\approx 2\\{1-\\Phi(|${fmt(z)}|)\\}=${fmt(pTwo)}`)}</div>`],
      ["注意点", `片側p値と両側p値を取り違えると、結論が変わることがあります。`]
    ]));
  }
];

function factorial(n) {
  return n <= 1 ? 1 : n * factorial(n - 1);
}

function combination(n, k) {
  return factorial(n) / (factorial(k) * factorial(n - k));
}

function ensureTopicStats(topic) {
  if (!state.stats[topic]) state.stats[topic] = { correct: 0, total: 0, weak: 0 };
  return state.stats[topic];
}

function buildQuestionSet() {
  const requested = Math.max(5, Math.min(50, Number($("count-input").value) || 20));
  const topic = $("topic-select").value;
  let pool = generators;
  if (topic !== "all") {
    pool = generators.filter((gen) => gen().topic === topic);
  }
  if (state.mode === "weak") {
    const weakTopics = topics.filter((t) => (state.stats[t]?.weak || 0) > 0);
    pool = generators.filter((gen) => weakTopics.includes(gen().topic));
    if (!pool.length) pool = generators;
  }
  const count = state.mode === "exam" ? 35 : requested;
  return Array.from({ length: count }, () => pick(pool)());
}

function startSession() {
  state.questions = buildQuestionSet();
  state.current = 0;
  state.selected = null;
  state.answers = [];
  $("result-panel").hidden = true;
  $("session-label").textContent = state.mode === "exam" ? "模試モード" : state.mode === "weak" ? "弱点モード" : "演習モード";
  renderQuestion();
  renderStats();
}

function renderQuestion() {
  const item = state.questions[state.current];
  $("question-number").textContent = `No. ${state.current + 1} / ${state.questions.length}`;
  $("question-topic").textContent = item.topic;
  $("question-difficulty").textContent = item.difficulty;
  $("question-text").textContent = item.text;
  $("given-box").innerHTML = item.given ? item.given.split("、").map((x) => `<div>${x}</div>`).join("") : "";
  $("choices").innerHTML = item.choices
    .map((choice, index) => `<button class="choice" type="button" data-index="${index}"><span class="mark">${index + 1}</span><span>${choice}</span></button>`)
    .join("");
  $("explanation").hidden = true;
  $("explanation").innerHTML = "";
  $("check-btn").disabled = false;
  $("next-btn").disabled = true;
  state.selected = null;
  document.querySelectorAll(".choice").forEach((btn) => {
    btn.addEventListener("click", () => {
      if ($("check-btn").disabled) return;
      state.selected = Number(btn.dataset.index);
      document.querySelectorAll(".choice").forEach((b) => b.classList.remove("is-selected"));
      btn.classList.add("is-selected");
    });
  });
  typesetMath($("question-panel"));
}

function checkAnswer() {
  if (state.selected === null) return;
  const item = state.questions[state.current];
  const correct = state.selected === item.answer;
  const topicStat = ensureTopicStats(item.topic);
  topicStat.total += 1;
  topicStat.correct += correct ? 1 : 0;
  topicStat.weak = Math.max(0, topicStat.weak + (correct ? -1 : 2));
  state.streak = correct ? state.streak + 1 : 0;
  state.answers.push({ item, selected: state.selected, correct });
  localStorage.setItem("stat2_stats", JSON.stringify(state.stats));
  localStorage.setItem("stat2_streak", String(state.streak));

  document.querySelectorAll(".choice").forEach((btn) => {
    const index = Number(btn.dataset.index);
    if (index === item.answer) btn.classList.add("is-correct");
    if (index === state.selected && !correct) btn.classList.add("is-wrong");
  });
  $("explanation").hidden = false;
  $("explanation").innerHTML = `<strong>${correct ? "正解" : "不正解"}</strong>${tipHtml(item)}${item.explanation}`;
  $("check-btn").disabled = true;
  $("next-btn").disabled = false;
  renderStats();
  typesetMath($("explanation"));
}

function nextQuestion() {
  if (state.current + 1 >= state.questions.length) {
    finishSession();
    return;
  }
  state.current += 1;
  renderQuestion();
}

function finishSession() {
  const correct = state.answers.filter((a) => a.correct).length;
  const total = state.answers.length;
  $("result-panel").hidden = false;
  $("result-summary").textContent = `${total}問中${correct}問正解、正答率${Math.round((correct / total) * 100)}%。70%未満の分野は、公式問題集を解いたあとに「なぜその手法を選ぶか」を言語化してから再演習すると伸びやすいです。`;
  $("review-list").innerHTML = state.answers
    .filter((a) => !a.correct)
    .map((a) => `<div class="review-item"><strong>${a.item.topic}</strong><br>${a.item.text}<br>正答: ${a.item.choices[a.item.answer]}${tipHtml(a.item)}${a.item.explanation}</div>`)
    .join("") || `<div class="review-item">全問正解です。この状態なら模試モードで時間をかけずに解く練習へ進めます。</div>`;
  $("next-btn").disabled = true;
  $("check-btn").disabled = true;
  $("result-panel").scrollIntoView({ behavior: "smooth", block: "start" });
  typesetMath($("result-panel"));
}

function renderStats() {
  const total = Object.values(state.stats).reduce((s, x) => s + x.total, 0);
  const correct = Object.values(state.stats).reduce((s, x) => s + x.correct, 0);
  const difficultyCounts = generators.reduce((acc, gen) => {
    const difficulty = gen().difficulty;
    acc[difficulty] = (acc[difficulty] || 0) + 1;
    return acc;
  }, {});
  $("score-label").textContent = `${state.answers.filter((a) => a.correct).length} / ${state.answers.length}`;
  $("accuracy").textContent = total ? `${Math.round((correct / total) * 100)}%` : "-";
  $("streak").textContent = state.streak;
  $("weak-count").textContent = Object.values(state.stats).reduce((s, x) => s + x.weak, 0);
  $("bank-summary").innerHTML = `問題生成パターン: <strong>${generators.length}</strong><br>難問: ${difficultyCounts["難"] || 0} / 判断: ${difficultyCounts["判断"] || 0} / やや難: ${difficultyCounts["やや難"] || 0}`;
  $("topic-stats").innerHTML = topics.map((topic) => {
    const stat = ensureTopicStats(topic);
    const pct = stat.total ? Math.round((stat.correct / stat.total) * 100) : 0;
    return `<div class="progress-row"><span>${topic} ${stat.total ? `${pct}% (${stat.correct}/${stat.total})` : "未演習"}</span><div class="bar"><i style="width:${pct}%"></i></div></div>`;
  }).join("");
}

function init() {
  const select = $("topic-select");
  topics.forEach((topic) => {
    const option = document.createElement("option");
    option.value = topic;
    option.textContent = topic;
    select.appendChild(option);
  });
  document.querySelectorAll(".tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      state.mode = tab.dataset.mode;
      document.querySelectorAll(".tab").forEach((t) => t.classList.remove("is-active"));
      tab.classList.add("is-active");
      $("count-input").disabled = state.mode === "exam";
    });
  });
  $("start-btn").addEventListener("click", startSession);
  $("check-btn").addEventListener("click", checkAnswer);
  $("next-btn").addEventListener("click", nextQuestion);
  startSession();
}

init();
