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
  if (text.includes("ヒストグラム")) {
    tip = "簡単に言うと、数字の並びから「どこにデータが集まっているか」「外れ値が左右どちらにあるか」を読み、グラフの形を選ぶ問題です。右に大きな値が少数あれば右に裾が長くなります。";
  } else if (text.includes("散布図")) {
    tip = "簡単に言うと、xが増えたときにyも増えるのか、減るのか、ばらつくのかを表から読む問題です。点を頭の中で並べ、右上がり・右下がり・関係が弱い、を判断します。";
  } else if (text.includes("95%信頼区間")) {
    tip = "簡単に言うと「本当の平均がだいたいこの範囲に入りそう」と見積もる問題です。95%信頼区間は、この方法で区間を100回作ると、そのうち約95回は真の母平均を含む、という意味です。1つの区間について『真の値が95%の確率で動く』という意味ではありません。";
  } else if (text.includes("CBT実戦") || item.difficulty === "CBT実戦") {
    tip = "簡単に言うと、長い文章や表の中から、必要な条件だけを抜き出して使う問題です。CBTでは問題文が親切に式を教えてくれないので、データの型、比較したいもの、推定か検定かを先に決めます。";
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
    tip = `簡単に言うと「一定時間や一定範囲で、まれな出来事が何回起きるか」を考える問題です。平均発生回数 ${math("\\lambda")} が中心になります。`;
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

function dataTable(headers, rows) {
  return `<table class="data-table"><thead><tr>${headers.map((h) => `<th>${h}</th>`).join("")}</tr></thead><tbody>${rows.map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join("")}</tr>`).join("")}</tbody></table>`;
}

function shapeCard(label, bars) {
  const max = Math.max(...bars);
  const width = 118;
  const height = 46;
  const gap = 4;
  const barWidth = (width - gap * (bars.length - 1)) / bars.length;
  const rects = bars.map((v, i) => {
    const h = Math.max(4, (v / max) * height);
    const x = i * (barWidth + gap);
    const y = height - h;
    return `<rect x="${x}" y="${y}" width="${barWidth}" height="${h}" rx="2"></rect>`;
  }).join("");
  return `<span class="shape-choice"><svg viewBox="0 0 ${width} ${height}" aria-hidden="true">${rects}</svg><span>${label}</span></span>`;
}

function renderGiven(given) {
  if (!given) return "";
  if (Array.isArray(given)) return given.map((line) => `<div>${line}</div>`).join("");
  if (given.includes("<table")) return given;
  return given.split("、").map((line) => `<div>${line}</div>`).join("");
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
    return q("分布", "標準", `${math("X")} が二項分布 ${math("B(n,p)")} に従う。${math("P(X=k)")} として最も近いものを選べ。`, `n=${n}, p=${p}, k=${k}`, prob, [p ** k * (1 - p) ** (n - k), combination(n, k) * p ** (n - k) * (1 - p) ** k, n * p, k / n], detail("二項分布の確率質量", [
      ["考え方", `独立な ${math("n")} 回の試行で、成功がちょうど ${math("k")} 回起きる確率です。`],
      ["計算", `<div class="formula">${math(`P(X=${k})={${n}\\choose ${k}}${p}^{${k}}(1-${p})^{${n - k}}=${fmt(prob)}`)}</div>`],
      ["注意点", `成功の並び方が複数あるため、組合せ係数 ${math(`{${n}\\choose ${k}}`)} が必要です。`]
    ]));
  },
  () => {
    const lambda = rnd(2, 5);
    const k = rnd(0, 3);
    const prob = Math.exp(-lambda) * lambda ** k / factorial(k);
    return q("分布", "標準", `${math("X")} がポアソン分布 ${math("Pois(\\lambda)")} に従う。${math("P(X=k)")} として最も近いものを選べ。`, `${math(`\\lambda=${lambda}`)}, k=${k}`, prob, [Math.exp(-lambda) * lambda ** (k + 1) / factorial(k), lambda * Math.exp(-lambda), 1 - prob, lambda], detail("ポアソン分布の確率", [
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
    return q("分布", "やや難", `${math("X")} が正規分布 ${math("N(\\mu,\\sigma^2)")} に従う。${math("P(X>x)")} として最も近いものを選べ。`, `${math(`\\mu=${mu}`)}, ${math(`\\sigma=${sigma}`)}, x=${x}`, prob, [1 - prob, normalCdfApprox((x - mu) / sigma), prob / 2, 0.5 - prob], detail("正規分布は標準化して右側を見る", [
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
    return q("検定", "標準", `母標準偏差既知の片側検定 ${math("H_0:\\mu=50")}, ${math("H_1:\\mu>50")} を行う。検定統計量として最も近いものを選べ。`, `標本平均 ${mean}、母標準偏差 ${sd}、n=${n}`, z, [(mean - mu0) / sd, (mean - mu0) / Math.sqrt(n), (mu0 - mean) / (sd / Math.sqrt(n)), z ** 2], detail("母標準偏差既知の平均検定", [
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
    return q("回帰", "基礎", `回帰分析で総平方和 ${math("SST")}、残差平方和 ${math("SSE")} が次のとき、決定係数 ${math("R^2")} はいくつか。`, `${math(`SST=${sst}`)}, ${math(`SSE=${sse}`)}`, r2, [sse / sst, 1 + sse / sst, Math.sqrt(r2), sst / sse], detail("決定係数の意味", [
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
    return q("検定", "難", `母比率の検定 ${math("H_0:p=p_0")} における検定統計量として最も近いものを選べ。`, `${math(`p_0=${p0}`)}, n=${n}, 成功数=${x}`, z, [(phat - p0) / Math.sqrt(phat * (1 - phat) / n), phat, (x - p0) / Math.sqrt(n), z ** 2], detail("比率検定では帰無仮説の比率で標準化", [
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
    return q("検定", "難", `正規母集団の母分散について ${math("H_0:\\sigma^2=\\sigma_0^2")} を検定する。カイ二乗統計量として最も近いものを選べ。`, `n=${n}, 標本分散 ${math(`s^2=${s2}`)}, ${math(`\\sigma_0^2=${sigma02}`)}`, stat, [s2 / sigma02, n * s2 / sigma02, Math.sqrt(stat), (n - 1) * sigma02 / s2], detail("母分散の検定統計量", [
      ["考え方", `正規母集団の母分散の検定では、カイ二乗分布を使います。`],
      ["計算", `<div class="formula">${math(`\\chi^2=\\frac{(n-1)s^2}{\\sigma_0^2}=\\frac{(${n}-1)${s2}}{${sigma02}}=${fmt(stat)}`)}</div>`],
      ["注意点", `自由度は ${math("n-1")} です。平均の検定と分散の検定で使う分布が違う点を押さえます。`]
    ]));
  },
  () => {
    const pvalue = pick([0.012, 0.032, 0.081, 0.18]);
    const alpha = pick([0.01, 0.05]);
    const ans = pvalue < alpha ? "帰無仮説を棄却する" : "帰無仮説を棄却しない";
    return q("検定", "判断", `p値と有意水準に基づく判断として最も適切なものを選べ。`, `p値=${pvalue}, 有意水準 ${math(`\\alpha=${alpha}`)}`, ans, [pvalue < alpha ? "帰無仮説を棄却しない" : "帰無仮説を棄却する", "帰無仮説が正しい確率はp値である", "対立仮説が正しい確率は1-p値である", "有意水準よりp値が大きいほど強い証拠である"], detail("p値の正しい読み方", [
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
    return q("検定", "難", "母比率の両側検定で、近似的なp値として最も近いものを選べ。", `${math("H_0:p=0.5")}, n=${n}, 成功数=${x}`, pTwo, [pOne, 1 - pOne, phat, Math.abs(z)], detail("両側p値は片側確率を2倍する", [
      ["考え方", `両側検定では、観測された ${math("|z|")} 以上に極端な左右両側の確率を足します。`],
      ["計算", `<div class="formula">${math(`z=\\frac{${fmt(phat)}-0.5}{\\sqrt{0.5(1-0.5)/${n}}}=${fmt(z)}`)}<br>${math(`p\\値\\approx 2\\{1-\\Phi(|${fmt(z)}|)\\}=${fmt(pTwo)}`)}</div>`],
      ["注意点", `片側p値と両側p値を取り違えると、結論が変わることがあります。`]
    ]));
  },
  () => {
    const n = pick([120, 160, 200]);
    const mean = pick([51.2, 52.4, 53.1]);
    const sigma = pick([8.0, 9.5, 10.0]);
    const se = sigma / Math.sqrt(n);
    const lower = mean - 1.96 * se;
    const upper = mean + 1.96 * se;
    const ans = `${fmt(lower, 2)} から ${fmt(upper, 2)}`;
    return q("推定", "CBT実戦", "ある自治体では、成人の睡眠時間に関する調査を行った。無作為に抽出した住民の平均睡眠時間から、自治体全体の平均睡眠時間を推定したい。母標準偏差は過去調査から既知とみなせる。95%信頼区間として最も適切なものを選べ。", [
      `標本サイズ n=${n}`,
      `標本平均 ${mean} 時間`,
      `母標準偏差 ${sigma} 時間`
    ], ans, [`${fmt(mean - se, 2)} から ${fmt(mean + se, 2)}`, `${fmt(mean - 2.58 * se, 2)} から ${fmt(mean + 2.58 * se, 2)}`, `${fmt(mean - 1.96 * sigma, 2)} から ${fmt(mean + 1.96 * sigma, 2)}`, `${fmt(lower - 0.5, 2)} から ${fmt(upper + 0.5, 2)}`], detail("文章から信頼区間の型を選ぶ", [
      ["考え方", `母標準偏差が既知とみなせるので、母平均の95%信頼区間は ${math("\\bar{x}\\pm 1.96\\sigma/\\sqrt{n}")} です。`],
      ["計算", `<div class="formula">${math(`SE=\\frac{${sigma}}{\\sqrt{${n}}}=${fmt(se, 3)}`)}<br>${math(`${mean}\\pm 1.96\\times ${fmt(se, 3)}=[${fmt(lower, 2)}, ${fmt(upper, 2)}]`)}</div>`],
      ["CBT視点", `文章が長くても、読むべき条件は「母標準偏差既知」「母平均」「95%」の3つです。`]
    ]));
  },
  () => {
    const before = pick([128.4, 132.1, 76.8]);
    const after = before - pick([3.2, 4.5, 5.1]);
    const dbar = round(after - before, 2);
    const sd = pick([6.0, 7.5, 8.2]);
    const n = pick([18, 24, 30]);
    const t = dbar / (sd / Math.sqrt(n));
    return q("検定", "CBT実戦", "同じ患者に対して、服薬前後で指標を測定した。薬の効果により平均値が変化したかを検討したい。対応のあるt検定を行うとき、検定統計量として最も近いものを選べ。", [
      `前後差は「服薬後 - 服薬前」と定義する`,
      `差の平均 ${dbar}`,
      `差の標準偏差 ${sd}`,
      `患者数 n=${n}`
    ], t, [dbar / sd, Math.abs(t), dbar / Math.sqrt(n), sd / Math.sqrt(n)], detail("対応ありの設定を見抜く", [
      ["考え方", `同じ患者の前後比較なので、2群を独立に扱わず、各患者の差を1つの標本として扱います。`],
      ["計算", `<div class="formula">${math(`t=\\frac{\\bar{d}}{s_d/\\sqrt{n}}=\\frac{${dbar}}{${sd}/\\sqrt{${n}}}=${fmt(t)}`)}</div>`],
      ["CBT視点", `「同じ対象」「前後」「ペア」は対応のある検定のサインです。符号も差の定義に従います。`]
    ]));
  },
  () => {
    const rows = [
      ["広告A", rnd(38, 60), rnd(160, 240)],
      ["広告B", rnd(55, 85), rnd(160, 240)]
    ];
    const p1 = rows[0][1] / rows[0][2];
    const p2 = rows[1][1] / rows[1][2];
    const pooled = (rows[0][1] + rows[1][1]) / (rows[0][2] + rows[1][2]);
    const se = Math.sqrt(pooled * (1 - pooled) * (1 / rows[0][2] + 1 / rows[1][2]));
    const z = (p2 - p1) / se;
    return q("検定", "CBT実戦", "ECサイトで2種類の広告をランダムに表示し、購入率に差があるかを検討した。帰無仮説を「2つの広告の購入率は等しい」とするとき、検定統計量として最も近いものを選べ。", dataTable(["広告", "購入者数", "表示人数"], rows), z, [(p2 - p1) / Math.sqrt(p1 * (1 - p1) / rows[0][2] + p2 * (1 - p2) / rows[1][2]), p2 - p1, z ** 2, (rows[1][1] - rows[0][1]) / (rows[0][2] + rows[1][2])], detail("2標本比率検定の読み取り", [
      ["考え方", `帰無仮説で2つの比率が等しいと置くため、標準誤差にはプールした比率 ${math("\\hat{p}")} を使います。`],
      ["計算", `<div class="formula">${math(`\\hat{p}_A=${fmt(p1)},\\quad \\hat{p}_B=${fmt(p2)},\\quad \\hat{p}=${fmt(pooled)}`)}<br>${math(`z=\\frac{\\hat{p}_B-\\hat{p}_A}{\\sqrt{\\hat{p}(1-\\hat{p})(1/n_A+1/n_B)}}=${fmt(z)}`)}</div>`],
      ["CBT視点", `A/Bテスト、購入率、割合の差、ランダム表示、という語がそろったら2標本比率の検定を疑います。`]
    ]));
  },
  () => {
    const tableRows = [
      ["男性", rnd(42, 70), rnd(30, 55)],
      ["女性", rnd(48, 78), rnd(28, 52)]
    ];
    const row1 = tableRows[0][1] + tableRows[0][2];
    const col1 = tableRows[0][1] + tableRows[1][1];
    const total = tableRows.flat().filter((x) => typeof x === "number").reduce((s, x) => s + x, 0);
    const expected = row1 * col1 / total;
    return q("カテゴリ", "CBT実戦", "ある資格試験について、性別と合否に関連があるかを調べたい。独立性のカイ二乗検定を行うため、男性かつ合格セルの期待度数として最も近いものを選べ。", dataTable(["性別", "合格", "不合格"], tableRows), expected, [tableRows[0][1], col1 / total, row1 / total, (tableRows[0][1] + tableRows[1][2]) / 2], detail("クロス集計表の期待度数", [
      ["考え方", `独立なら、各セルの期待度数は ${math("行合計\\times 列合計/総数")} で求めます。`],
      ["計算", `<div class="formula">${math(`E=\\frac{${row1}\\times ${col1}}{${total}}=${fmt(expected)}`)}</div>`],
      ["CBT視点", `「性別と合否に関連」ならカテゴリ同士の関連です。平均の検定ではなく独立性の検定です。`]
    ]));
  },
  () => {
    const groups = [
      ["低用量", rnd(18, 28), rnd(4, 8)],
      ["中用量", rnd(22, 34), rnd(4, 8)],
      ["高用量", rnd(27, 40), rnd(4, 8)]
    ];
    const ans = "一元配置分散分析";
    return q("分散分析", "CBT実戦", "3種類の投与量で、ある連続量の平均に差があるかを調べたい。各群は別々の被験者からなる。最初に用いる方法として最も適切なものを選べ。", dataTable(["群", "標本平均", "標準偏差"], groups), ans, ["対応のあるt検定", "独立性のカイ二乗検定", "単回帰分析", "適合度検定"], detail("3群以上の平均比較", [
      ["考え方", `量的変数の平均を3群以上で比較するので、一元配置分散分析を使います。`],
      ["判断", `群は低用量・中用量・高用量の3つで、被験者は別々です。対応のある検定ではありません。`],
      ["CBT視点", `2群ならt検定、3群以上なら分散分析、カテゴリ同士ならカイ二乗検定、という分岐を先に作ります。`]
    ]));
  },
  () => {
    const b0 = rnd(35, 55);
    const b1 = pick([1.8, 2.2, -1.5]);
    const se = pick([0.35, 0.45, 0.6]);
    const t = b1 / se;
    const x = rnd(6, 12);
    const yhat = b0 + b1 * x;
    return q("回帰", "CBT実戦", "学習時間から試験得点を予測する単回帰分析を行った。回帰係数の有意性と予測値に関する記述として最も適切なものを選べ。", [
      `推定式: 得点 = ${b0} + ${b1} × 学習時間`,
      `学習時間の係数の標準誤差: ${se}`,
      `学習時間が ${x} 時間の人の予測得点を考える`
    ], `t値は ${fmt(t)}、予測値は ${fmt(yhat)}`, [`t値は ${fmt(b1 * se)}、予測値は ${fmt(yhat)}`, `t値は ${fmt(t)}、予測値は ${fmt(b1 * x)}`, `t値は ${fmt(se / b1)}、予測値は ${fmt(b0)}`, `t値は ${fmt(Math.abs(t))}、予測値は ${fmt(b0 - b1 * x)}`], detail("回帰出力を複数読む", [
      ["考え方", `係数のt値は係数を標準誤差で割ります。予測値は回帰式に ${math("x")} を代入します。`],
      ["計算", `<div class="formula">${math(`t=\\frac{${b1}}{${se}}=${fmt(t)}`)}<br>${math(`\\hat{y}=${b0}+${b1}\\times ${x}=${fmt(yhat)}`)}</div>`],
      ["CBT視点", `回帰問題では、係数の解釈、t値、予測値、決定係数が同じ設問で混ざることがあります。`]
    ]), "");
  },
  () => {
    const statements = [
      ["p値が0.03であれば、帰無仮説が正しい確率は3%である", "この記述は誤り。p値は帰無仮説のもとで今回以上に極端な結果が出る確率である"],
      ["95%信頼区間に0が含まれなければ、対応する両側5%検定で有意といえる", "この記述は正しい。係数や平均差の検定では0を含むかが判断材料になる"],
      ["標準誤差は、標本平均などの推定量のばらつきを表す", "この記述は正しい。個々のデータのばらつきではなく推定量のばらつきである"],
      ["相関係数が0.8なら、xがyの原因であることが示された", "この記述は誤り。相関だけでは因果関係は示されない"]
    ];
    const chosen = pick(statements);
    return q("検定", "CBT実戦", "統計的推測に関する次の記述の正誤と理由として最も適切なものを選べ。", chosen[0], chosen[1], [
      "この記述は正しい。p値は帰無仮説が正しい確率を表す",
      "この記述は正しい。相関係数が大きければ必ず因果関係がある",
      "この記述は誤り。標準誤差は必ず標準偏差と等しい",
      "この記述は誤り。95%信頼区間は1つの区間に真の値が95%の確率で入るという意味である"
    ], detail("用語の誤解をつぶす", [
      ["考え方", `CBTでは計算だけでなく、p値・信頼区間・標準誤差・相関の意味を文章で問われます。`],
      ["判断", `記述「${chosen[0]}」について、正誤だけでなく理由まで一致する選択肢を選びます。`],
      ["CBT視点", `特に「p値=帰無仮説が正しい確率」「相関=因果」は典型的な誤りです。`]
    ]));
  },
  () => {
    const n = pick([36, 49, 64]);
    const sigma = pick([12, 14, 16]);
    const mu = 100;
    const threshold = mu + pick([3, 4]) * sigma / Math.sqrt(n);
    const z = (threshold - mu) / (sigma / Math.sqrt(n));
    const prob = 1 - normalCdfApprox(z);
    return q("分布", "CBT実戦", `ある製品の重量は平均100g、標準偏差 ${math("\\sigma")} gの母集団から独立に抽出される。${math("n")} 個の平均重量が基準値を超える確率を、中心極限定理に基づき近似したい。最も近いものを選べ。`, [
      `母平均 ${math(`\\mu=${mu}`)}`,
      `母標準偏差 ${math(`\\sigma=${sigma}`)}`,
      `標本サイズ n=${n}`,
      `基準値 ${fmt(threshold, 2)}`
    ], prob, [1 - normalCdfApprox((threshold - mu) / sigma), normalCdfApprox(z), sigma / Math.sqrt(n), 0.5], detail("中心極限定理の実戦読解", [
      ["考え方", `標本平均の分布は、平均 ${math("\\mu")}、標準偏差 ${math("\\sigma/\\sqrt{n}")} で近似します。`],
      ["計算", `<div class="formula">${math(`z=\\frac{${fmt(threshold, 2)}-${mu}}{${sigma}/\\sqrt{${n}}}=${fmt(z)}`)}<br>${math(`P(\\bar{X}>${fmt(threshold, 2)})=1-\\Phi(${fmt(z)})=${fmt(prob)}`)}</div>`],
      ["CBT視点", `個々の重量ではなく「平均重量」なので、標準偏差をそのまま使わないことがポイントです。`]
    ]));
  },
  () => {
    const n = pick([400, 600, 800]);
    const x = Math.round(n * pick([0.42, 0.47, 0.53]));
    const phat = x / n;
    const se = Math.sqrt(phat * (1 - phat) / n);
    const lower = phat - 1.96 * se;
    const upper = phat + 1.96 * se;
    return q("推定", "CBT実戦", "無作為抽出した有権者に候補者Aを支持するかを尋ねた。支持率の95%信頼区間として最も適切なものを選べ。", [
      `回答者数 n=${n}`,
      `候補者Aを支持: ${x} 人`
    ], `${fmt(lower, 3)} から ${fmt(upper, 3)}`, [`${fmt(phat - se, 3)} から ${fmt(phat + se, 3)}`, `${fmt(lower * 100, 1)}% から ${fmt(upper * 100, 1)}%`, `${fmt(phat, 3)} から ${fmt(se, 3)}`, `${fmt(lower - 0.03, 3)} から ${fmt(upper + 0.03, 3)}`], detail("比率の信頼区間", [
      ["考え方", `支持する/しないの2値データなので、標本比率 ${math("\\hat{p}")} の信頼区間を作ります。`],
      ["計算", `<div class="formula">${math(`\\hat{p}=\\frac{${x}}{${n}}=${fmt(phat)}`)}<br>${math(`SE=\\sqrt{\\frac{\\hat{p}(1-\\hat{p})}{n}}=${fmt(se)}`)}<br>${math(`\\hat{p}\\pm 1.96SE=[${fmt(lower, 3)}, ${fmt(upper, 3)}]`)}</div>`],
      ["CBT視点", `人数の問題でも、聞かれているのが支持率なら比率の区間です。%表記と小数表記の混在にも注意します。`]
    ]));
  },
  () => {
    const data = [
      ["店舗A", rnd(22, 35), rnd(180, 260)],
      ["店舗B", rnd(18, 32), rnd(160, 240)],
      ["店舗C", rnd(25, 40), rnd(190, 280)]
    ];
    const totalComplaints = data.reduce((s, row) => s + row[1], 0);
    const totalCustomers = data.reduce((s, row) => s + row[2], 0);
    const rate = totalComplaints / totalCustomers;
    return q("記述統計", "CBT実戦", "複数店舗の苦情率を全体で要約したい。店舗ごとの苦情率を単純平均するのではなく、全顧客数で重み付けした全体の苦情率として最も近いものを選べ。", dataTable(["店舗", "苦情件数", "顧客数"], data), rate, [data.reduce((s, row) => s + row[1] / row[2], 0) / data.length, totalComplaints / data.length, totalCustomers / totalComplaints, rate + 0.05], detail("重み付きの全体率", [
      ["考え方", `店舗ごとの母数が違うため、率の単純平均ではなく、全苦情件数を全顧客数で割ります。`],
      ["計算", `<div class="formula">${math(`全体率=\\frac{${totalComplaints}}{${totalCustomers}}=${fmt(rate)}`)}</div>`],
      ["CBT視点", `平均の平均、率の平均は落とし穴です。母数が違う表では、何を分母にするかを確認します。`]
    ]));
  },
  () => {
    const type = pick(["right", "left", "symmetric", "bimodal"]);
    const configs = {
      right: {
        data: [12, 14, 15, 16, 18, 19, 21, 23, 27, 35, 48, 72],
        correct: shapeCard("右に裾が長いヒストグラム", [9, 7, 4, 2, 1]),
        reason: "小さい値が多く、大きい外れ値が少数あるため、右側に裾が伸びます。"
      },
      left: {
        data: [18, 42, 55, 61, 66, 70, 72, 73, 74, 75, 76, 78],
        correct: shapeCard("左に裾が長いヒストグラム", [1, 2, 4, 7, 9]),
        reason: "大きい値が多く、小さい外れ値が少数あるため、左側に裾が伸びます。"
      },
      symmetric: {
        data: [42, 45, 48, 49, 50, 51, 52, 53, 55, 58],
        correct: shapeCard("中央が高いほぼ対称なヒストグラム", [1, 4, 8, 4, 1]),
        reason: "中心付近に値が集まり、左右の広がりがほぼ同じです。"
      },
      bimodal: {
        data: [12, 14, 15, 17, 19, 48, 51, 53, 55, 58],
        correct: shapeCard("山が2つあるヒストグラム", [5, 1, 0.5, 1, 5]),
        reason: "低い値の集団と高い値の集団に分かれており、中央が少ないです。"
      }
    };
    const c = configs[type];
    return q("記述統計", "CBT実戦", "次のデータから作られるヒストグラムの形として最も適切なものを選べ。", `データ: ${c.data.join(", ")}`, c.correct, [
      shapeCard("右に裾が長いヒストグラム", [9, 7, 4, 2, 1]),
      shapeCard("左に裾が長いヒストグラム", [1, 2, 4, 7, 9]),
      shapeCard("中央が高いほぼ対称なヒストグラム", [1, 4, 8, 4, 1]),
      shapeCard("山が2つあるヒストグラム", [5, 1, 0.5, 1, 5])
    ].filter((x) => x !== c.correct), detail("数字から分布の形を読む", [
      ["考え方", `データを小さい順に見て、値がどこに密集しているか、外れた値がどちら側にあるかを確認します。`],
      ["判断", c.reason],
      ["CBT視点", `図がなくても、数字の並びからヒストグラムの概形を選ばせる問題があります。平均・中央値の大小とも結びつけて考えます。`]
    ]));
  },
  () => {
    const points = pick([
      {
        rows: [[1, 2], [2, 4], [3, 5], [4, 8], [5, 9], [6, 12]],
        ans: "右上がりの強い正の相関",
        note: "xが増えるほどyも増える傾向が明確です。"
      },
      {
        rows: [[1, 12], [2, 10], [3, 9], [4, 7], [5, 5], [6, 3]],
        ans: "右下がりの強い負の相関",
        note: "xが増えるほどyは小さくなる傾向が明確です。"
      },
      {
        rows: [[1, 5], [2, 10], [3, 6], [4, 11], [5, 4], [6, 9]],
        ans: "明確な直線的関係は弱い",
        note: "上下にばらつき、直線的な増加・減少が読み取りにくいです。"
      }
    ]);
    return q("記述統計", "CBT実戦", "次の2変量データを散布図にしたときの特徴として最も適切なものを選べ。", dataTable(["x", "y"], points.rows), points.ans, ["右上がりの強い正の相関", "右下がりの強い負の相関", "明確な直線的関係は弱い", "完全な曲線関係で相関係数は必ず1"].filter((x) => x !== points.ans), detail("散布図の形を数字から読む", [
      ["考え方", `${math("x")} が増えたとき ${math("y")} が増えるか、減るか、ばらつくかを表で追います。`],
      ["判断", points.note],
      ["CBT視点", `散布図そのものが出なくても、表から相関の向きや強さを選ばせることがあります。相関は因果とは限りません。`]
    ]));
  },
  () => {
    const p = pick([0.6, 0.55]);
    const qLose = 1 - p;
    const probAEnds5 = combination(4, 3) * p ** 3 * qLose * p;
    const probEitherEnds5 = combination(4, 3) * p ** 3 * qLose * p + combination(4, 3) * qLose ** 3 * p * qLose;
    return q("確率", "CBT実戦", "AとBが1日に1回勝負し、先に4勝した方を優勝とする。各日の勝敗は独立で、Aが1日に勝つ確率はpで一定である。5日目にAの優勝が決まる確率として最も近いものを選べ。", `p=${p}, Bが勝つ確率=${fmt(qLose)}`, probAEnds5, [probEitherEnds5, combination(5, 4) * p ** 4 * qLose, p ** 4, combination(4, 3) * p ** 3 * qLose], detail("5日目に決まる反復試行", [
      ["考え方", `5日目にAが4勝目を取るには、最初の4日間でAが3勝1敗、5日目にAが勝つ必要があります。`],
      ["計算", `<div class="formula">${math(`{4\\choose 3}p^3(1-p)\\times p={4\\choose 3}${p}^4(1-${p})=${fmt(probAEnds5)}`)}</div>`],
      ["CBT視点", `「5日目に勝つ」なのか「5日目にAが優勝」なのか「5日目にどちらかの優勝が決まる」なのかで式が変わります。文章の主語を必ず確認します。`]
    ]));
  },
  () => {
    const lambda = pick([2, 3, 4]);
    const ans = shapeCard("0付近が高く、右に裾を引く離散分布", [10, 9, 6, 3, 1]);
    return q("分布", "CBT実戦", `平均発生回数が ${math("\\lambda")} のポアソン分布について、${math("\\lambda")} が小さいときの確率分布の形として最も適切なものを選べ。`, math(`\\lambda=${lambda}`), ans, [
      shapeCard("左右対称の釣鐘型", [1, 4, 9, 4, 1]),
      shapeCard("0付近が高く、右に裾を引く離散分布", [10, 9, 6, 3, 1]),
      shapeCard("両端が高く中央が低いU字型", [8, 2, 1, 2, 8]),
      shapeCard("全区間でほぼ一定の高さ", [5, 5, 5, 5, 5])
    ], detail("分布の形を読む", [
      ["考え方", `ポアソン分布は非負整数の分布です。${math("\\lambda")} が小さいと0や1付近の確率が高く、右に裾を引きます。`],
      ["判断", `左右対称の釣鐘型は正規分布、全区間で一定は一様分布のイメージです。`],
      ["CBT視点", `分布名から平均・分散だけでなく、グラフの形と使う場面を選ばせる問題があります。`]
    ]));
  },
  () => {
    const n = pick([36, 64, 100]);
    const sigma = pick([12, 15, 20]);
    const se = sigma / Math.sqrt(n);
    const ans = math(`\\bar{X}\\ \\text{は平均}\\ \\mu,\\ \\text{標準偏差}\\ ${fmt(se)}\\ \\text{の分布で近似できる`);
    return q("分布", "CBT実戦", `母平均 ${math("\\mu")}、母標準偏差 ${math("\\sigma")} の母集団から大きさ ${math("n")} の標本を抽出する。中心極限定理に基づく標本平均の分布に関する記述として最も適切なものを選べ。`, `${math(`\\sigma=${sigma}`)}, n=${n}`, ans, [
      math(`\\bar{X}\\ \\text{の標準偏差は}\\ ${sigma}\\ \\text{である`),
      math(`\\bar{X}\\ \\text{の平均は}\\ 0\\ \\text{である`),
      math(`\\bar{X}\\ \\text{の分散は}\\ \\sigma^2 n\\ \\text{である`),
      math(`n\\ \\text{が大きいほど標準誤差は大きくなる`)
    ], detail("標本平均の分布の式選択", [
      ["考え方", `標本平均は、平均 ${math("\\mu")}、標準偏差 ${math("\\sigma/\\sqrt{n}")} の分布で近似できます。`],
      ["計算", `<div class="formula">${math(`SE=\\frac{\\sigma}{\\sqrt{n}}=\\frac{${sigma}}{\\sqrt{${n}}}=${fmt(se)}`)}</div>`],
      ["CBT視点", `数値を最後まで計算させるより、どの式が正しいかを選ばせる出題が多いです。`]
    ]));
  },
  () => {
    const p = 0.62;
    const qLose = 1 - p;
    const alpha = p ** 3 + qLose ** 3;
    return q("検定", "CBT実戦", `ある画鋲を投げると針が上向きになる確率を ${math("p")} とする。帰無仮説 ${math("H_0:p=0.62")} を検定したい。3回投げ、3回とも上向きまたは3回とも下向きなら ${math("H_0")} を棄却し、それ以外では棄却しない。このとき第1種の誤りと、その確率 ${math("\\alpha")} の組合せとして最も適切なものを選べ。`, [
      `第1種の誤り: ${math("H_0")} が正しいにもかかわらず ${math("H_0")} を棄却する誤り`,
      "棄却域: 3回とも上向き、または3回とも下向き"
    ], `${math("H_0")} が正しいのに棄却する誤り、${math(`\\alpha=${fmt(alpha, 4)}`)}`, [
      `${math("H_0")} が正しいのに棄却しない誤り、${math(`\\alpha=${fmt(alpha, 4)}`)}`,
      `${math("H_0")} が正しいのに棄却する誤り、${math(`\\alpha=${fmt(1 - alpha, 4)}`)}`,
      `${math("H_0")} が誤りなのに棄却する誤り、${math(`\\alpha=${fmt(alpha, 4)}`)}`,
      `${math("H_0")} が正しいのに棄却する誤り、${math(`\\alpha=${fmt(p ** 3, 4)}`)}`
    ], detail("スクリーンイメージ型: 第1種の誤り", [
      ["考え方", `第1種の誤りは、${math("H_0")} が正しいのに棄却してしまう誤りです。したがって ${math("p=0.62")} のもとで棄却域に入る確率を計算します。`],
      ["計算", `<div class="formula">${math(`\\alpha=P(3回上向き)+P(3回下向き)=0.62^3+0.38^3=${fmt(alpha, 4)}`)}</div>`],
      ["CBT視点", `スクリーンイメージのように、誤りの種類と確率式を同時に選ばせる問題があります。言葉と式の両方を一致させます。`]
    ]));
  },
  () => {
    const series = [120, 132, 141, 156, 168, 177];
    const ma = (series[2] + series[3] + series[4]) / 3;
    return q("記述統計", "CBT実戦", "月次売上の時系列データについて、3か月移動平均を用いて短期的な変動をならしたい。4か月目を中心とする3か月移動平均として最も近いものを選べ。", dataTable(["月", "1", "2", "3", "4", "5", "6"], [["売上", ...series]]), ma, [(series[3] + series[4] + series[5]) / 3, series[3], series.reduce((s, x) => s + x, 0) / series.length, (series[1] + series[2] + series[3]) / 3], detail("時系列データの移動平均", [
      ["考え方", `中心化した3か月移動平均では、対象月の前後を含めて平均を取ります。4か月目なら3,4,5か月目を使います。`],
      ["計算", `<div class="formula">${math(`\\frac{${series[2]}+${series[3]}+${series[4]}}{3}=${fmt(ma)}`)}</div>`],
      ["CBT視点", `時系列は「どの期間を平均するか」が問われます。全期間平均や直近3か月平均との違いに注意します。`]
    ]));
  },
  () => {
    const shares = [0.04, 0.08, 0.14, 0.24, 0.5];
    const cum = shares.reduce((acc, x) => [...acc, round((acc.at(-1) || 0) + x, 2)], []);
    return q("記述統計", "判断", "所得を低い順に5等分したときの所得シェアが次の通りである。ローレンツ曲線とジニ係数に関する説明として最も適切なものを選べ。", dataTable(["階級", "第1", "第2", "第3", "第4", "第5"], [["所得シェア", ...shares], ["累積所得シェア", ...cum]]), "ローレンツ曲線は完全平等線より下に位置し、曲線が大きく下に膨らむほどジニ係数は大きい", ["ローレンツ曲線は完全平等線より必ず上に位置する", "所得シェアが均等でないほどジニ係数は0に近づく", "累積所得シェアは必ず途中で減少する", "ジニ係数は負の値になるほど不平等が大きい"], detail("ローレンツ曲線とジニ係数", [
      ["考え方", `ローレンツ曲線は、低い方から累積した人口割合と所得割合を対応させた曲線です。不平等が大きいほど完全平等線から下に離れます。`],
      ["判断", `上位20%の所得シェアが大きく、累積所得シェアは完全平等線より下になります。`],
      ["CBT視点", `グラフそのものではなく、表から曲線の位置やジニ係数の大小を問う問題があります。`]
    ]));
  },
  () => {
    const principle = pick([
      ["同じ処理を複数の実験単位に割り付ける", "反復"],
      ["処理の割付を乱数で決める", "無作為化"],
      ["似た実験単位をまとめて比較する", "局所管理"]
    ]);
    return q("記述統計", "判断", "実験研究におけるフィッシャーの3原則に関する説明として、最も適切な名称を選べ。", principle[0], principle[1], ["反復", "無作為化", "局所管理", "層化抽出"].filter((x) => x !== principle[1]), detail("フィッシャーの3原則", [
      ["考え方", `実験計画では、反復・無作為化・局所管理により、偶然変動や偏りの影響を抑えて比較します。`],
      ["判断", `「${principle[0]}」は ${principle[1]} に対応します。`],
      ["CBT視点", `データ収集法は計算が少ないため、用語と意味を正確に対応させる問題が出やすいです。`]
    ]));
  },
  () => {
    const prop = pick([
      ["標本サイズを大きくすると推定量が真の値に近づく性質", "一致性"],
      ["推定量の期待値が推定したい母数に等しい性質", "不偏性"]
    ]);
    return q("推定", "判断", "推定量の性質に関する説明として最も適切なものを選べ。", prop[0], prop[1], ["一致性", "不偏性", "有意水準", "検出力"].filter((x) => x !== prop[1]), detail("一致性と不偏性", [
      ["考え方", `一致性は大標本で真の値に近づく性質、不偏性は平均的に真の値を当てる性質です。`],
      ["判断", `「${prop[0]}」は ${prop[1]} です。`],
      ["CBT視点", `計算より語句の定義を選ばせる問題が多く、普遍性ではなく「不偏性」です。`]
    ]));
  },
  () => {
    const n1 = pick([36, 49, 64]);
    const n2 = pick([36, 49, 64]);
    const diff = pick([4.2, -3.6, 5.1]);
    const s1 = pick([8, 10, 12]);
    const s2 = pick([9, 11, 13]);
    const se = Math.sqrt(s1 ** 2 / n1 + s2 ** 2 / n2);
    const lower = diff - 1.96 * se;
    const upper = diff + 1.96 * se;
    return q("推定", "CBT実戦", `独立な2群の母平均の差 ${math("\\mu_1-\\mu_2")} の95%信頼区間を、大標本近似で構成したい。最も適切な区間を選べ。`, [
      `標本平均の差 x̄1-x̄2=${diff}`,
      `群1: n1=${n1}, s1=${s1}`,
      `群2: n2=${n2}, s2=${s2}`
    ], `${fmt(lower, 2)} から ${fmt(upper, 2)}`, [`${fmt(diff - se, 2)} から ${fmt(diff + se, 2)}`, `${fmt(diff - 1.96 * (s1 + s2), 2)} から ${fmt(diff + 1.96 * (s1 + s2), 2)}`, `${fmt(lower - 1, 2)} から ${fmt(upper + 1, 2)}`, `${fmt(diff, 2)} から ${fmt(se, 2)}`], detail("2標本平均差の信頼区間", [
      ["考え方", `独立2標本の平均差では、標準誤差を ${math("\\sqrt{s_1^2/n_1+s_2^2/n_2}")} として合成します。`],
      ["計算", `<div class="formula">${math(`SE=\\sqrt{${s1}^2/${n1}+${s2}^2/${n2}}=${fmt(se)}`)}<br>${math(`${diff}\\pm 1.96\\times ${fmt(se)}=[${fmt(lower, 2)}, ${fmt(upper, 2)}]`)}</div>`],
      ["CBT視点", `標準偏差を足すのではなく、分散を標本サイズで割って足します。`]
    ]));
  },
  () => {
    const n1 = pick([200, 300, 400]);
    const n2 = pick([200, 300, 400]);
    const x1 = Math.round(n1 * pick([0.36, 0.42, 0.48]));
    const x2 = Math.round(n2 * pick([0.28, 0.34, 0.4]));
    const p1 = x1 / n1;
    const p2 = x2 / n2;
    const diff = p1 - p2;
    const se = Math.sqrt(p1 * (1 - p1) / n1 + p2 * (1 - p2) / n2);
    const lower = diff - 1.96 * se;
    const upper = diff + 1.96 * se;
    return q("推定", "CBT実戦", "独立な2群の母比率の差 p1-p2 の95%信頼区間として最も適切なものを選べ。", dataTable(["群", "成功数", "標本サイズ"], [["1", x1, n1], ["2", x2, n2]]), `${fmt(lower, 3)} から ${fmt(upper, 3)}`, [`${fmt(diff - se, 3)} から ${fmt(diff + se, 3)}`, `${fmt(lower * 100, 1)}% から ${fmt(upper * 100, 1)}%`, `${fmt(p1, 3)} から ${fmt(p2, 3)}`, `${fmt(diff - 1.96 * Math.sqrt((p1 + p2) / (n1 + n2)), 3)} から ${fmt(diff + 1.96 * Math.sqrt((p1 + p2) / (n1 + n2)), 3)}`], detail("2標本比率差の信頼区間", [
      ["考え方", `信頼区間では各群の標本比率を使って、差の標準誤差を作ります。検定のプール比率とは区別します。`],
      ["計算", `<div class="formula">${math(`\\hat{p}_1=${fmt(p1)},\\quad \\hat{p}_2=${fmt(p2)}`)}<br>${math(`SE=\\sqrt{\\frac{\\hat{p}_1(1-\\hat{p}_1)}{n_1}+\\frac{\\hat{p}_2(1-\\hat{p}_2)}{n_2}}=${fmt(se)}`)}<br>${math(`${fmt(diff)}\\pm 1.96\\times ${fmt(se)}=[${fmt(lower, 3)}, ${fmt(upper, 3)}]`)}</div>`],
      ["CBT視点", `検定ではプール、信頼区間では非プール、という違いを問われやすいです。`]
    ]));
  },
  () => {
    const n = pick([100, 200, 400]);
    const p = pick([0.2, 0.3, 0.4]);
    const k = Math.round(n * p + pick([1, 1.5]) * Math.sqrt(n * p * (1 - p)));
    const z = (k + 0.5 - n * p) / Math.sqrt(n * p * (1 - p));
    return q("分布", "難", `${math("X")} が二項分布 ${math("B(n,p)")} に従う。正規近似を用いて ${math("P(X\\le k)")} を求めるときの標準化として最も適切なものを選べ。`, `n=${n}, p=${p}, k=${k}`, math(`z=\\frac{${k}+0.5-${n}\\times ${p}}{\\sqrt{${n}\\times ${p}(1-${p})}}`), [math(`z=\\frac{${k}-${n}\\times ${p}}{${n}\\times ${p}(1-${p})}`), math(`z=\\frac{${k}+0.5-${p}}{\\sqrt{${p}(1-${p})/${n}}}`), math(`z=\\frac{${k}-${n}\\times ${p}}{\\sqrt{${n}}}`), math(`z=\\frac{${k}+0.5}{${n}\\times ${p}}`)], detail("二項分布の正規近似", [
      ["考え方", `二項分布 ${math("B(n,p)")} は平均 ${math("np")}、分散 ${math("np(1-p)")} の正規分布で近似できます。${math("P(X\\le k)")} では連続性補正で ${math("k+0.5")} を使います。`],
      ["計算", `<div class="formula">${math(`z=\\frac{k+0.5-np}{\\sqrt{np(1-p)}}=\\frac{${k}+0.5-${n}\\times ${p}}{\\sqrt{${n}\\times ${p}(1-${p})}}=${fmt(z)}`)}</div>`],
      ["CBT視点", `式選択問題では、分母が分散なのか標準偏差なのか、連続性補正が入っているかを見ます。`]
    ]));
  },
  () => {
    const n1 = pick([12, 15, 20]);
    const n2 = pick([10, 14, 18]);
    const s1 = pick([4.2, 5.0, 6.4]);
    const s2 = pick([2.8, 3.5, 4.0]);
    const f = (s1 ** 2) / (s2 ** 2);
    return q("検定", "難", "2つの正規母集団の母分散が等しいかを調べるF検定を行う。検定統計量として最も近いものを選べ。", `群1: n1=${n1}, s1=${s1}。群2: n2=${n2}, s2=${s2}`, f, [s1 / s2, s2 ** 2 / s1 ** 2, (n1 - 1) * s1 ** 2 / ((n2 - 1) * s2 ** 2), Math.sqrt(f)], detail("等分散性のF検定", [
      ["考え方", `2つの母分散を比較するF検定では、標本分散の比を使います。通常は大きい方を分子に置くことが多いです。`],
      ["計算", `<div class="formula">${math(`F=\\frac{s_1^2}{s_2^2}=\\frac{${s1}^2}{${s2}^2}=${fmt(f)}`)}</div>`],
      ["CBT視点", `標準偏差の比ではなく分散の比です。自由度はそれぞれ ${math("n_1-1, n_2-1")} です。`]
    ]));
  },
  () => {
    const distribution = pick([
      ["t分布", "左右対称で標準正規分布より裾が厚く、自由度が大きいほど標準正規分布に近づく"],
      ["カイ二乗分布", "0以上の値を取り、右に裾が長い。自由度が大きいほど右に中心が移る"],
      ["F分布", "0以上の値を取り、右に裾が長い。2つの分散比の分布として使う"]
    ]);
    return q("分布", "判断", "分布の形状と用途に関する説明として最も適切なものを選べ。", distribution[0], distribution[1], ["左右対称で常に一様な高さをもつ", "負の値だけを取り左に裾が長い", "平均0、分散1に必ず固定される", "カテゴリデータの度数そのものを表し、連続値を取らない"].filter((x) => x !== distribution[1]), detail("t・カイ二乗・F分布の形", [
      ["考え方", `標本分布では、平均の検定にt分布、分散の検定にカイ二乗分布、分散比や分散分析にF分布が出ます。`],
      ["判断", `${distribution[0]} は「${distribution[1]}」です。`],
      ["CBT視点", `分布の式だけでなく、形状・値域・用途を対応させる問題があります。`]
    ]));
  },
  () => {
    const rate = pick([0.02, 0.03, 0.05]);
    const years = pick([5, 8, 10]);
    const mean = rate * years;
    const survival = Math.exp(-mean);
    return q("分布", "CBT実戦", `ある船舶について、航行不能になる重大事故の発生回数はポアソン過程に従い、1年あたり平均 ${math("\\lambda")} 回発生すると考える。今後 ${math("t")} 年間に重大事故が1回も起こらず、船舶が航行可能なままである確率として最も近いものを選べ。`, [
      `1年あたり平均事故回数 ${math(`\\lambda=${rate}`)}`,
      `期間 ${math(`t=${years}`)} 年`,
      "重大事故が1回でも起きると航行不能になるとする"
    ], survival, [1 - survival, Math.exp(-rate), mean * Math.exp(-mean), Math.exp(-rate) * years], detail("ポアソン過程の生存確率", [
      ["考え方", `期間 ${math("t")} 年の事故回数を ${math("X")} とすると、${math("X\\sim Pois(\\lambda t)")} です。船が生存するとは、重大事故が0回ということです。`],
      ["計算", `<div class="formula">${math(`P(X=0)=e^{-\\lambda t}\\frac{(\\lambda t)^0}{0!}=e^{-${rate}\\times ${years}}=${fmt(survival)}`)}</div>`],
      ["CBT視点", `「少なくとも1回事故が起こる確率」は ${math("1-e^{-\\lambda t}")} です。生存確率を聞かれているなら補集合にしないで0回の確率を選びます。`]
    ]));
  },
  () => {
    const a = rnd(3, 5);
    const b = rnd(2, 4);
    const r = rnd(3, 6);
    const n = a * b * r;
    const ans = `要因A: ${a - 1}, 要因B: ${b - 1}, 交互作用: ${(a - 1) * (b - 1)}, 誤差: ${a * b * (r - 1)}`;
    return q("分散分析", "難", "二元配置分散分析で、要因Aがa水準、要因Bがb水準、各組合せにr個の反復がある。自由度の組合せとして最も適切なものを選べ。", `a=${a}, b=${b}, r=${r}, 総観測数=${n}`, ans, [`要因A: ${a}, 要因B: ${b}, 交互作用: ${a * b}, 誤差: ${n - 1}`, `要因A: ${a - 1}, 要因B: ${b - 1}, 交互作用: ${a + b - 2}, 誤差: ${n - a - b}`, `要因A: ${n - a}, 要因B: ${n - b}, 交互作用: ${(a - 1) * (b - 1)}, 誤差: ${a + b}`, `要因A: ${a - 1}, 要因B: ${b - 1}, 交互作用: ${a * b - 1}, 誤差: ${r - 1}`], detail("二元配置分散分析の自由度", [
      ["考え方", `二元配置では、要因A、要因B、交互作用、誤差に平方和と自由度を分解します。`],
      ["計算", `<div class="formula">${math(`df_A=a-1=${a - 1}`)}<br>${math(`df_B=b-1=${b - 1}`)}<br>${math(`df_{AB}=(a-1)(b-1)=${(a - 1) * (b - 1)}`)}<br>${math(`df_E=ab(r-1)=${a * b * (r - 1)}`)}</div>`],
      ["CBT視点", `実験計画の問題では、自由度表の空欄補充が出やすいです。`]
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
  const requested = Math.max(5, Math.min(120, Number($("count-input").value) || 70));
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
  if (state.mode === "exam") {
    const hardPool = pool.filter((gen) => ["CBT実戦", "難", "判断", "やや難"].includes(gen().difficulty));
    const easyPool = pool.filter((gen) => !["CBT実戦", "難", "判断", "やや難"].includes(gen().difficulty));
    return Array.from({ length: count }, () => pick(Math.random() < 0.8 && hardPool.length ? hardPool : easyPool.length ? easyPool : pool)());
  }
  const questions = [];
  let remaining = count;
  while (remaining > 0) {
    const roundPool = shuffle(pool);
    const take = Math.min(remaining, roundPool.length);
    questions.push(...roundPool.slice(0, take).map((gen) => gen()));
    remaining -= take;
  }
  return questions;
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
  $("given-box").innerHTML = renderGiven(item.given);
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
  $("bank-summary").innerHTML = `問題生成パターン: <strong>${generators.length}</strong><br>CBT実戦: ${difficultyCounts["CBT実戦"] || 0} / 難問: ${difficultyCounts["難"] || 0} / 判断: ${difficultyCounts["判断"] || 0}`;
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
