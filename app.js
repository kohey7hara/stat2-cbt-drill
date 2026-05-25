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
    return q("記述統計", "標準", "次のデータの不偏分散として最も近いものを選べ。", `データ: ${data.join(", ")}`, variance, [variance * data.length / (data.length - 1), Math.sqrt(variance), variance * 0.8, variance * 1.25], `平均は ${fmt(mean)}。偏差平方和を n-1=${data.length - 1} で割るので、不偏分散は ${fmt(variance)}。CBTでは「nで割る分散」と取り違えやすい。`);
  },
  () => {
    const meanX = rnd(40, 80);
    const sdX = rnd(8, 15);
    const x = meanX + rnd(1, 2) * sdX;
    const z = (x - meanX) / sdX;
    return q("記述統計", "基礎", "偏差値を求める式 50 + 10z を用いる。次の場合の偏差値はいくつか。", `平均 ${meanX}、標準偏差 ${sdX}、観測値 ${x}`, 50 + 10 * z, [50 + z, 50 + 100 * z, 10 + 50 * z, 50 - 10 * z], `標準化得点は z=(${x}-${meanX})/${sdX}=${fmt(z)}。偏差値は 50+10z=${fmt(50 + 10 * z)}。`);
  },
  () => {
    const a = rnd(2, 5);
    const b = rnd(2, 5);
    const c = rnd(1, Math.min(a, b));
    const p = (a + b - c) / 20;
    return q("確率", "標準", "20人のうちAに該当する人、Bに該当する人、両方に該当する人が次の通りである。AまたはBに該当する確率はどれか。", `A: ${a}人、B: ${b}人、AかつB: ${c}人`, p, [(a + b) / 20, (a * b) / 400, c / 20, (20 - a - b + c) / 20], `和事象は P(A∪B)=P(A)+P(B)-P(A∩B)。人数で考えると ${a}+${b}-${c}=${a + b - c} 人。`);
  },
  () => {
    const p = pick([0.2, 0.25, 0.3, 0.4]);
    const n = rnd(4, 7);
    const k = rnd(1, n - 2);
    const prob = combination(n, k) * p ** k * (1 - p) ** (n - k);
    return q("分布", "標準", "Xが二項分布 B(n,p) に従う。P(X=k)として最も近いものを選べ。", `n=${n}, p=${p}, k=${k}`, prob, [p ** k * (1 - p) ** (n - k), combination(n, k) * p ** (n - k) * (1 - p) ** k, n * p, k / n], `二項分布は C(n,k)p^k(1-p)^(n-k)。組合せ係数を落とす誤答が多い。`);
  },
  () => {
    const lambda = rnd(2, 5);
    const k = rnd(0, 3);
    const prob = Math.exp(-lambda) * lambda ** k / factorial(k);
    return q("分布", "標準", "Xがポアソン分布 Pois(λ) に従う。P(X=k)として最も近いものを選べ。", `λ=${lambda}, k=${k}`, prob, [Math.exp(-lambda) * lambda ** (k + 1) / factorial(k), lambda * Math.exp(-lambda), 1 - prob, lambda], `ポアソン分布の確率は e^-λ λ^k/k!。平均も分散も λ だが、ここでは確率質量を問われている。`);
  },
  () => {
    const mu = rnd(50, 100);
    const sigma = rnd(8, 20);
    const x = mu + pick([1, 1.5, 2]) * sigma;
    const prob = 1 - normalCdfApprox((x - mu) / sigma);
    return q("分布", "やや難", "Xが正規分布 N(μ,σ^2) に従う。P(X>x)として最も近いものを選べ。", `μ=${mu}, σ=${sigma}, x=${x}`, prob, [1 - prob, normalCdfApprox((x - mu) / sigma), prob / 2, 0.5 - prob], `z=(${x}-${mu})/${sigma}=${fmt((x - mu) / sigma)}。右側確率なので 1-Φ(z) を選ぶ。`);
  },
  () => {
    const n = pick([25, 36, 49, 64, 100]);
    const mean = rnd(40, 80);
    const sd = rnd(8, 20);
    const se = sd / Math.sqrt(n);
    const lower = mean - 1.96 * se;
    const upper = mean + 1.96 * se;
    const ans = `${fmt(lower, 2)} から ${fmt(upper, 2)}`;
    return q("推定", "標準", "母分散既知とみなし、母平均の95%信頼区間として最も適切なものを選べ。", `標本平均 ${mean}、母標準偏差 ${sd}、n=${n}`, ans, [`${fmt(mean - se, 2)} から ${fmt(mean + se, 2)}`, `${fmt(mean - 2.58 * se, 2)} から ${fmt(mean + 2.58 * se, 2)}`, `${fmt(mean - 1.96 * sd, 2)} から ${fmt(mean + 1.96 * sd, 2)}`, `${fmt(lower - 1, 2)} から ${fmt(upper + 1, 2)}`], `標準誤差は σ/√n=${fmt(se, 3)}。95%では 1.96×標準誤差を標本平均に足し引きする。`);
  },
  () => {
    const n = pick([100, 200, 400, 500]);
    const x = Math.round(n * pick([0.18, 0.24, 0.35, 0.42]));
    const phat = x / n;
    const se = Math.sqrt(phat * (1 - phat) / n);
    return q("推定", "標準", "母比率の標準誤差として最も近いものを選べ。", `n=${n}, 成功数=${x}`, se, [Math.sqrt(phat * (1 - phat)), phat / Math.sqrt(n), Math.sqrt(phat / n), se * 1.96], `標本比率 p^=${fmt(phat)}。母比率の標準誤差は √{p^(1-p^)/n}=${fmt(se)}。`);
  },
  () => {
    const n = pick([16, 25, 36, 64]);
    const mean = rnd(52, 62);
    const mu0 = 50;
    const sd = rnd(8, 12);
    const z = (mean - mu0) / (sd / Math.sqrt(n));
    return q("検定", "標準", "母標準偏差既知の片側検定 H0: μ=50, H1: μ>50 を行う。検定統計量として最も近いものを選べ。", `標本平均 ${mean}、母標準偏差 ${sd}、n=${n}`, z, [(mean - mu0) / sd, (mean - mu0) / Math.sqrt(n), (mu0 - mean) / (sd / Math.sqrt(n)), z ** 2], `z=(標本平均-帰無仮説の平均)/(σ/√n)。分母は標準偏差ではなく標準誤差。`);
  },
  () => {
    const obs = [rnd(18, 35), rnd(18, 35), rnd(18, 35), rnd(18, 35)];
    const total = obs.reduce((a, b) => a + b, 0);
    const exp = total / 4;
    const stat = obs.reduce((s, o) => s + (o - exp) ** 2 / exp, 0);
    return q("カテゴリ", "標準", "4カテゴリが等確率であるかを調べる適合度検定のカイ二乗統計量として最も近いものを選べ。", `観測度数: ${obs.join(", ")}`, stat, [obs.reduce((s, o) => s + (o - exp) ** 2, 0), stat / 4, Math.sqrt(stat), total / stat], `期待度数は各カテゴリ ${fmt(exp)}。Σ(観測-期待)^2/期待 を計算する。自由度は4-1=3。`);
  },
  () => {
    const r = pick([0.4, 0.55, 0.7, -0.45, -0.6]);
    const sx = rnd(4, 10);
    const sy = rnd(6, 16);
    const b = r * sy / sx;
    return q("回帰", "標準", "単回帰 y=a+bx の傾き b として最も近いものを選べ。", `相関係数 r=${r}、xの標準偏差 ${sx}、yの標準偏差 ${sy}`, b, [r * sx / sy, r, sy / sx, -b], `単回帰の傾きは b=r×(s_y/s_x)。相関係数そのものではなく、単位の比でスケールされる。`);
  },
  () => {
    const sst = rnd(120, 240);
    const sse = rnd(30, 90);
    const r2 = 1 - sse / sst;
    return q("回帰", "基礎", "回帰分析で総平方和SST、残差平方和SSEが次のとき、決定係数R^2はいくつか。", `SST=${sst}, SSE=${sse}`, r2, [sse / sst, 1 + sse / sst, Math.sqrt(r2), sst / sse], `R^2=1-SSE/SST。残差が小さいほど1に近づく。`);
  },
  () => {
    const groups = rnd(3, 5);
    const n = groups * rnd(6, 10);
    const dfb = groups - 1;
    const dfw = n - groups;
    return q("分散分析", "基礎", "一元配置分散分析で群数k、総標本数nが次のとき、群間と群内の自由度の組合せはどれか。", `k=${groups}, n=${n}`, `群間 ${dfb}, 群内 ${dfw}`, [`群間 ${groups}, 群内 ${n - 1}`, `群間 ${dfw}, 群内 ${dfb}`, `群間 ${dfb}, 群内 ${n - 1}`, `群間 ${n - groups}, 群内 ${groups - 1}`], `一元配置分散分析では群間自由度 k-1=${dfb}、群内自由度 n-k=${dfw}。`);
  },
  () => {
    const msb = rnd(20, 60);
    const msw = rnd(4, 15);
    const f = msb / msw;
    return q("分散分析", "標準", "一元配置分散分析のF値として最も近いものを選べ。", `群間平均平方 MSB=${msb}, 群内平均平方 MSW=${msw}`, f, [msw / msb, msb - msw, msb + msw, Math.sqrt(f)], `F=MSB/MSW。群間のばらつきが群内のばらつきより十分大きいかを見る。`);
  },
  () => {
    const n = pick([30, 50, 80]);
    const sx = rnd(8, 15);
    const sy = rnd(8, 15);
    const diff = rnd(3, 8);
    const se = Math.sqrt(sx ** 2 / n + sy ** 2 / n);
    const z = diff / se;
    return q("検定", "やや難", "独立2標本の平均差検定で、母分散既知近似を用いる。検定統計量として最も近いものを選べ。", `標本平均差 ${diff}、各群 n=${n}、標準偏差 ${sx} と ${sy}`, z, [diff / (sx + sy), diff / Math.sqrt((sx ** 2 + sy ** 2) / (2 * n)), se / diff, diff / sx], `標準誤差は √(σ1^2/n1 + σ2^2/n2)=${fmt(se)}。平均差をこれで割る。`);
  },
  () => {
    const n = pick([40, 60, 100]);
    const r = pick([0.25, 0.35, 0.5, -0.4]);
    const t = r * Math.sqrt((n - 2) / (1 - r ** 2));
    return q("回帰", "やや難", "相関係数が0かどうかを検定するt統計量として最も近いものを選べ。", `n=${n}, r=${r}`, t, [r * Math.sqrt(n), r / Math.sqrt(1 - r ** 2), Math.sqrt((n - 2) / (1 - r ** 2)), -t], `相関係数の検定では t=r√{(n-2)/(1-r^2)}、自由度は n-2。`);
  },
  () => {
    const situation = pick([
      ["新しい広告A/Bで購入率が変わったかを調べたい", "母比率の差の検定", "2群の平均差の検定", "適合度検定", "単回帰分析"],
      ["サイコロの各目が等確率に出ているかを調べたい", "適合度検定", "独立性の検定", "母平均の検定", "相関係数の検定"],
      ["喫煙習慣の有無と疾患の有無に関連があるかを調べたい", "独立性の検定", "適合度検定", "対応のあるt検定", "単回帰分析"],
      ["勉強時間から得点を予測する直線モデルを作りたい", "単回帰分析", "適合度検定", "母分散の検定", "二項分布"]
    ]);
    return q("検定", "判断", "次の状況で最初に選ぶ分析・検定として最も適切なものはどれか。", situation[0], situation[1], situation.slice(2), `CBTでは計算式が直接見えない問題が出る。まず「量的かカテゴリか」「1群か2群か」「関連か差か」を分ける。`, "");
  },
  () => {
    const n = pick([12, 18, 25]);
    const mean = rnd(70, 78);
    const mu0 = 70;
    const s = rnd(8, 12);
    const t = (mean - mu0) / (s / Math.sqrt(n));
    return q("検定", "判断", "母分散が未知で標本数が小さい。母平均の検定統計量として最も適切なものを選べ。", `標本平均 ${mean}、帰無仮説の平均 ${mu0}、標本標準偏差 ${s}、n=${n}`, t, [(mean - mu0) / s, (mean - mu0) / Math.sqrt(n), (mu0 - mean) / (s / Math.sqrt(n)), t ** 2], `母分散未知かつ小標本なのでt統計量を使う。分母は標本標準偏差ではなく s/√n、自由度は n-1。`);
  },
  () => {
    const p = pick([0.1, 0.2, 0.25, 0.4]);
    const ans = 1 / p;
    return q("分布", "判断", "成功確率pの独立試行を、初めて成功するまで繰り返す。試行回数の期待値として最も近いものを選べ。", `p=${p}`, ans, [p, 1 - p, p * (1 - p), Math.sqrt(p * (1 - p))], `初めて成功するまでの試行回数は幾何分布。期待値は1/p。二項分布と混同しやすい。`);
  },
  () => {
    const a = rnd(18, 40);
    const b = rnd(18, 40);
    const c = rnd(18, 40);
    const total = a + b + c;
    const mean = (a + b + c) / 3;
    const median = [a, b, c].sort((x, y) => x - y)[1];
    const ans = mean > median ? "平均 > 中央値" : mean < median ? "平均 < 中央値" : "平均 = 中央値";
    return q("記述統計", "判断", "外れ値が少ない3つの値について、平均と中央値の大小関係として正しいものを選べ。", `値: ${a}, ${b}, ${c}、合計: ${total}`, ans, ["平均 > 中央値", "平均 < 中央値", "平均 = 中央値", "標準偏差がないと判断できない"].filter((x) => x !== ans), `3個の中央値は中央の値。平均は合計/3=${fmt(mean)}、中央値は${median}。外れ値や歪みの文脈でも頻出。`);
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
  $("explanation").innerHTML = `<strong>${correct ? "正解" : "不正解"}</strong><br>${item.explanation}`;
  $("check-btn").disabled = true;
  $("next-btn").disabled = false;
  renderStats();
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
    .map((a) => `<div class="review-item"><strong>${a.item.topic}</strong><br>${a.item.text}<br>正答: ${a.item.choices[a.item.answer]}<br>${a.item.explanation}</div>`)
    .join("") || `<div class="review-item">全問正解です。この状態なら模試モードで時間をかけずに解く練習へ進めます。</div>`;
  $("next-btn").disabled = true;
  $("check-btn").disabled = true;
  $("result-panel").scrollIntoView({ behavior: "smooth", block: "start" });
}

function renderStats() {
  const total = Object.values(state.stats).reduce((s, x) => s + x.total, 0);
  const correct = Object.values(state.stats).reduce((s, x) => s + x.correct, 0);
  $("score-label").textContent = `${state.answers.filter((a) => a.correct).length} / ${state.answers.length}`;
  $("accuracy").textContent = total ? `${Math.round((correct / total) * 100)}%` : "-";
  $("streak").textContent = state.streak;
  $("weak-count").textContent = Object.values(state.stats).reduce((s, x) => s + x.weak, 0);
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
