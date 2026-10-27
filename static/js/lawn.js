/* Kisan Dost - Lawn & Home panel (Hamza Ejaz).
   Three tools for the home side of gardening: a month-by-month lawn planner, a kitchen-garden sowing guide, and a pots and indoor plant problem-solver.
   All text is in English and Urdu. Guide values only: confirm with a local nursery or the Agriculture Department. */
(function () {
"use strict";
const $ = s => document.querySelector(s), root = $("#lawnroot");
if (!root) return;
const ls = {
  get(k, d) { try { const v = localStorage.getItem(k); return v === null ? d : v; } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
};
const ur = () => document.body.classList.contains("ur");
const L = o => (ur() ? o[1] : o[0]);                     /* o = [English, Urdu] */
const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const MON = [["Jan", "جنوری"], ["Feb", "فروری"], ["Mar", "مارچ"], ["Apr", "اپریل"], ["May", "مئی"], ["Jun", "جون"], ["Jul", "جولائی"], ["Aug", "اگست"], ["Sep", "ستمبر"], ["Oct", "اکتوبر"], ["Nov", "نومبر"], ["Dec", "دسمبر"]];
const MONFULL = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

/* ------------------------------------------------------------------ lawn data */
const GROUP = { dormant: "rest", slow: "rest", greenup: "grow", grow: "grow", transition: "grow", peak: "hot", monsoon: "rain", winter: "winter", overseed: "winter", establish: "winter" };
const GROUPS = { rest: ["Resting", "آرام"], grow: ["Growing", "بڑھوتری"], hot: ["Peak heat", "شدید گرمی"], rain: ["Monsoon", "مون سون"], winter: ["Green winter lawn", "سردیوں کا ہرا لان"] };
/* Bermuda (dhub / khabal) goes brown in winter. Overseeding with winter ryegrass keeps the lawn green from December to March. */
const PH_B = ["dormant", "dormant", "greenup", "grow", "grow", "peak", "monsoon", "monsoon", "grow", "slow", "dormant", "dormant"];
const PH_O = ["winter", "winter", "winter", "transition", "grow", "peak", "monsoon", "monsoon", "grow", "overseed", "establish", "winter"];
/* mow = cm [low, high]; w = litres per square metre per week at full sun; f = share of a full feed (urea 6.5 g per square metre); gap = weeks to next feed */
const PH = {
  dormant: { mow: null, w: 4, f: 0, gap: 0, times: ["Once in 2 to 3 weeks, only if it is dry", "2 سے 3 ہفتوں میں ایک بار، صرف خشک ہو تو"],
    head: ["Resting season: the grass is brown, not dead", "آرام کا موسم: گھاس بھوری ہے، مری نہیں"],
    tasks: [["Do not feed or mow. The lawn is asleep, not dead.", "کھاد نہ ڈالیں اور کٹائی نہ کریں۔ لان سویا ہوا ہے، مرا نہیں۔"],
            ["Water lightly every 2 to 3 weeks only if there has been no rain.", "بارش نہ ہو تو ہی ہر 2 سے 3 ہفتے بعد ہلکا پانی دیں۔"],
            ["Pull winter weeds by hand and keep fallen leaves off the grass.", "سردیوں کی جھاڑیاں ہاتھ سے نکالیں اور گرے ہوئے پتے گھاس سے ہٹا دیں۔"]] },
  greenup: { mow: [2.5, 3.5], w: 12, f: 1, gap: 5, times: ["2 times a week", "ہفتے میں 2 بار"],
    head: ["Waking up: the first green shows", "جاگنے کا وقت: ہریالی لوٹ رہی ہے"],
    tasks: [["Cut the dead tops short once, then mow every 7 to 10 days as it grows.", "ایک بار سوکھی نوکیں چھوٹی کاٹ دیں، پھر بڑھنے پر ہر 7 سے 10 دن بعد کٹائی کریں۔"],
            ["Give the first feed now. Spread it evenly and water it in.", "اب پہلی کھاد دیں۔ برابر پھیلائیں اور فوراً پانی لگا دیں۔"],
            ["Rake out dead thatch and fill low patches with sand and compost.", "سوکھی تہہ کو ریک سے نکال دیں اور نیچے دبے حصے ریت اور کمپوسٹ سے بھر دیں۔"]] },
  grow: { mow: [3, 4], w: 20, f: 1, gap: 5, times: ["2 to 3 times a week", "ہفتے میں 2 سے 3 بار"],
    head: ["Growing season", "بڑھوتری کا موسم"],
    tasks: [["Mow every 5 to 7 days. Never take off more than a third of the blade.", "ہر 5 سے 7 دن بعد کٹائی کریں۔ پتی کا تہائی سے زیادہ حصہ نہ کاٹیں۔"],
            ["Water deeply in the early morning, less often, rather than a little every day.", "روز تھوڑا دینے کے بجائے صبح سویرے گہرا پانی دیں، کم بار۔"],
            ["Feed every 5 to 6 weeks while it grows. Pull weeds before they seed.", "بڑھوتری کے دوران ہر 5 سے 6 ہفتے بعد کھاد دیں۔ جھاڑیاں بیج بننے سے پہلے نکال دیں۔"]] },
  peak: { mow: [4, 5], w: 30, f: .5, gap: 6, times: ["3 times a week, early morning", "ہفتے میں 3 بار، صبح سویرے"],
    head: ["Peak heat: water is the main job", "شدید گرمی: اصل کام پانی ہے"],
    tasks: [["Mow a little higher (4 to 5 cm). Taller grass shades its own roots.", "ذرا اونچی کٹائی کریں (4 سے 5 سینٹی میٹر)۔ اونچی گھاس اپنی جڑوں کو سایہ دیتی ہے۔"],
            ["Water in the early morning or after sunset. Avoid midday.", "صبح سویرے یا غروب کے بعد پانی دیں۔ دوپہر میں نہ دیں۔"],
            ["Brown patches that do not recover may be ground insects or fungus. Lift a little turf and check the roots.", "جو بھورے دھبے ٹھیک نہ ہوں وہ زمینی کیڑوں یا پھپھوندی کی وجہ سے ہو سکتے ہیں۔ تھوڑی گھاس اٹھا کر جڑیں دیکھیں۔"]] },
  monsoon: { mow: [3.5, 4.5], w: 8, f: .5, gap: 0, times: ["Only if there is no rain for 4 to 5 days", "صرف تب جب 4 سے 5 دن بارش نہ ہو"],
    head: ["Monsoon: let the rain do the work", "مون سون: بارش کو کام کرنے دیں"],
    tasks: [["Skip watering after good rain. Water only if the soil is dry 5 cm down.", "اچھی بارش کے بعد پانی نہ لگائیں۔ صرف تب دیں جب 5 سینٹی میٹر نیچے مٹی خشک ہو۔"],
            ["Keep drains open so water does not stand on the lawn.", "نالیاں کھلی رکھیں تاکہ لان پر پانی کھڑا نہ ہو۔"],
            ["Mow when the grass is dry and rake up the cuttings. Wet clippings spread fungus.", "گھاس خشک ہو تو کٹائی کریں اور کٹی ہوئی گھاس اکٹھی کر لیں۔ گیلی گھاس سے پھپھوندی پھیلتی ہے۔"]] },
  slow: { mow: [3, 4], w: 10, f: 0, gap: 0, times: ["Once a week", "ہفتے میں ایک بار"],
    head: ["Slowing down for winter", "سردی کے لیے رفتار کم"],
    tasks: [["Stop feeding now. Late feeding gives soft growth that the cold will damage.", "اب کھاد بند کریں۔ دیر سے کھاد دینے سے نرم بڑھوتری ہوتی ہے جسے سردی نقصان دیتی ہے۔"],
            ["Water less as the nights cool.", "راتیں ٹھنڈی ہونے پر پانی کم کر دیں۔"],
            ["Tidy the edges and pull weeds before winter. Decide now whether you want a green winter lawn.", "کناروں کی صفائی کریں اور سردی سے پہلے جھاڑیاں نکالیں۔ طے کر لیں کہ سردیوں میں ہرا لان چاہیے یا نہیں۔"]] },
  winter: { mow: [4, 5], w: 10, f: .5, gap: 6, times: ["Once a week", "ہفتے میں ایک بار"],
    head: ["Green winter lawn", "سردیوں کا ہرا لان"],
    tasks: [["Mow every 7 days at 4 to 5 cm.", "ہر 7 دن بعد 4 سے 5 سینٹی میٹر پر کٹائی کریں۔"],
            ["Water about once a week if there is no rain.", "بارش نہ ہو تو ہفتے میں ایک بار پانی دیں۔"],
            ["Feed lightly every 6 weeks. Winter grass likes nitrogen, but too much burns it.", "ہر 6 ہفتے بعد ہلکی کھاد دیں۔ سردیوں کی گھاس کو نائٹروجن پسند ہے مگر زیادہ سے جل جاتی ہے۔"]] },
  transition: { mow: [3, 4], w: 15, f: 1, gap: 5, times: ["2 times a week", "ہفتے میں 2 بار"],
    head: ["Spring changeover", "بہار کی تبدیلی"],
    tasks: [["As heat arrives the winter grass fades. Lower the mower step by step and let the Bermuda take over.", "گرمی آنے پر سردیوں کی گھاس ختم ہونے لگتی ہے۔ مشین آہستہ آہستہ نیچے کریں تاکہ برمودا آگے آئے۔"],
            ["Feed to help the Bermuda fill in.", "برمودا کو بھرنے کے لیے کھاد دیں۔"],
            ["Water deeply in the early morning, not a little at a time.", "تھوڑا تھوڑا نہیں، صبح سویرے گہرا پانی دیں۔"]] },
  overseed: { mow: [2, 2.5], w: 14, f: 0, gap: 0, times: ["Light watering twice a day until it sprouts", "اگنے تک دن میں دو بار ہلکا پانی"],
    head: ["Time to overseed", "سردیوں کی گھاس کی بوائی کا وقت"],
    tasks: [["Near the end of the month: mow short, rake out dead grass, spread the seed and a thin layer of sand or compost.", "مہینے کے آخر میں: گھاس چھوٹی کاٹیں، سوکھی گھاس ریک سے نکالیں، بیج اور ریت یا کمپوسٹ کی پتلی تہہ پھیلائیں۔"],
            ["Keep the top 2 cm moist with a light watering twice a day until the seed sprouts, about 7 to 10 days.", "بیج اگنے تک (تقریباً 7 سے 10 دن) اوپر کی 2 سینٹی میٹر مٹی دن میں دو بار ہلکے پانی سے نم رکھیں۔"],
            ["Do not spray weed killer around sowing time.", "بوائی کے وقت جھاڑی مار دوا کا سپرے نہ کریں۔"]] },
  establish: { mow: [4, 5], w: 12, f: .5, gap: 4, times: ["Every 2 to 3 days, lightly", "ہر 2 سے 3 دن بعد، ہلکا"],
    head: ["New seedlings are settling in", "نئے پودے جم رہے ہیں"],
    tasks: [["First mow when seedlings reach about 6 cm. Cut to 4 or 5 cm with a sharp blade.", "پودے تقریباً 6 سینٹی میٹر ہوں تو پہلی کٹائی کریں۔ تیز بلیڈ سے 4 یا 5 سینٹی میٹر پر کاٹیں۔"],
            ["Keep the soil damp, not soggy, until the roots hold.", "جڑیں مضبوط ہونے تک مٹی نم رکھیں، پانی کھڑا نہ ہو۔"],
            ["Give a light first feed 3 to 4 weeks after sowing.", "بوائی کے 3 سے 4 ہفتے بعد ہلکی پہلی کھاد دیں۔"]] }
};
const SUN = { full: [1, ["Full sun (6+ hours)", "پوری دھوپ (6+ گھنٹے)"]], half: [.8, ["Half shade (3 to 6 hours)", "آدھا سایہ (3 سے 6 گھنٹے)"]], deep: [.6, ["Deep shade (under 3 hours)", "گہرا سایہ (3 گھنٹے سے کم)"]] };
const UNITS = { marla: [25.29, ["Marla", "مرلہ"]], kanal: [505.86, ["Kanal", "کنال"]], sqft: [.0929, ["Square feet", "مربع فٹ"]], sqm: [1, ["Square metres", "مربع میٹر"]] };
const GRASS = { b: ["Bermuda (dhub / khabal), brown in winter", "برمودا (ڈھب / کھبل)، سردیوں میں بھوری"], o: ["Bermuda with winter ryegrass, green all year", "برمودا اور سردیوں کی رائی گھاس، سارا سال ہری"] };

/* ------------------------------------------------------------------ kitchen garden data */
/* [emoji, English, Urdu, sowing months, days to first harvest, grows well in a pot, tip English, tip Urdu] */
const VEG = [
  ["🥬", "Spinach", "پالک", [10, 11, 12, 1, 2], "40 to 50", 1, "Sow seed 1 cm deep and keep the soil damp. Cut the outer leaves and the plant keeps growing.", "بیج 1 سینٹی میٹر گہرا بوئیں، مٹی نم رکھیں۔ باہر کے پتے کاٹتے رہیں، پودا بڑھتا رہے گا۔"],
  ["🌿", "Coriander", "دھنیا", [10, 11, 12, 1, 2, 3], "30 to 40", 1, "Crush the seed lightly, sprinkle it and cover. Heat makes it flower, so sow in the cool months.", "بیج ہلکا سا توڑ کر بکھیریں اور مٹی ڈھانپ دیں۔ گرمی میں پھول آ جاتے ہیں، اس لیے ٹھنڈے مہینوں میں بوئیں۔"],
  ["🌱", "Fenugreek", "میتھی", [10, 11, 12, 1, 2], "25 to 35", 1, "Quick and easy. Cut at 10 cm and it grows back once or twice.", "جلدی اگتی ہے۔ 10 سینٹی میٹر پر کاٹیں، ایک دو بار دوبارہ اگ آتی ہے۔"],
  ["🌿", "Mint", "پودینہ", [2, 3, 4, 9, 10], "30 (from a cutting)", 1, "Plant a stem cutting in damp soil. Keep it in its own pot because it spreads.", "تنے کا ٹکڑا نم مٹی میں لگائیں۔ الگ گملے میں رکھیں کیونکہ یہ پھیلتا ہے۔"],
  ["🥕", "Radish", "مولی", [9, 10, 11, 12, 1, 2], "30 to 45", 1, "Needs loose soil with no stones. Sow thinly and water evenly or the roots crack.", "ڈھیلی مٹی چاہیے جس میں پتھر نہ ہوں۔ پتلا بوئیں اور برابر پانی دیں ورنہ جڑیں پھٹ جاتی ہیں۔"],
  ["🥕", "Carrot", "گاجر", [9, 10, 11, 12], "70 to 90", 1, "Use a deep pot, 30 cm or more. Thin the seedlings to 3 cm apart.", "گہرا گملا (30 سینٹی میٹر یا زیادہ) لیں۔ پودے 3 سینٹی میٹر کے فاصلے پر رکھیں۔"],
  ["🥬", "Lettuce", "سلاد پتہ", [10, 11, 12, 1], "45 to 60", 1, "Likes cool weather and a little shade in the afternoon.", "ٹھنڈا موسم اور دوپہر کا ہلکا سایہ پسند ہے۔"],
  ["🧅", "Spring onion", "ہرا پیاز", [9, 10, 11, 12, 1, 2], "40 to 60", 1, "Plant small bulbs or seed. Cut the green tops as you need them.", "چھوٹے پیاز یا بیج لگائیں۔ ضرورت کے مطابق ہرے پتے کاٹیں۔"],
  ["🫛", "Peas", "مٹر", [10, 11], "70 to 90", 1, "Give a stick or string to climb. Sow in October or November for the best pods.", "چڑھنے کے لیے لکڑی یا دھاگہ دیں۔ اچھی پھلیوں کے لیے اکتوبر یا نومبر میں بوئیں۔"],
  ["🧄", "Garlic", "لہسن", [10, 11], "150 to 180", 1, "Push cloves 3 cm deep with the pointed end up. Dig up when the leaves turn yellow in spring.", "پھانکیں 3 سینٹی میٹر گہری، نوک اوپر کی طرف لگائیں۔ بہار میں پتے پیلے ہوں تو کھودیں۔"],
  ["🥬", "Turnip", "شلجم", [9, 10, 11], "50 to 60", 0, "Needs space and loose soil. Sow in rows 20 cm apart.", "جگہ اور ڈھیلی مٹی چاہیے۔ قطاریں 20 سینٹی میٹر دور رکھیں۔"],
  ["🥦", "Cauliflower and cabbage", "پھول گوبھی اور بند گوبھی", [8, 9, 10, 11], "90 to 120", 0, "Start in a nursery tray and move to the bed after 4 weeks. Needs sun and steady water.", "پہلے نرسری ٹرے میں اگائیں اور 4 ہفتے بعد کیاری میں لگائیں۔ دھوپ اور مسلسل پانی چاہیے۔"],
  ["🍅", "Tomato", "ٹماٹر", [1, 2, 8, 9], "70 to 90 after planting out", 1, "Start in a tray and plant out at 15 cm. Needs a stake, and protection from frost and the worst heat.", "ٹرے میں شروع کریں اور 15 سینٹی میٹر کا ہو تو منتقل کریں۔ سہارا چاہیے، اور پالے اور شدید گرمی سے بچائیں۔"],
  ["🌶️", "Chilli", "مرچ", [1, 2, 3, 6, 7], "70 to 90", 1, "Start in a tray and plant out when the nights are warm. Pick often to get more.", "ٹرے میں شروع کریں اور راتیں گرم ہوں تو منتقل کریں۔ بار بار توڑیں تو زیادہ لگتی ہے۔"],
  ["🍆", "Brinjal", "بینگن", [1, 2, 3, 6, 7], "70 to 80 after planting out", 1, "Needs full sun and regular feeding. Pick while the skin is still shiny.", "پوری دھوپ اور باقاعدہ کھاد چاہیے۔ چھلکا چمکدار ہو تو توڑ لیں۔"],
  ["🥒", "Cucumber", "کھیرا", [2, 3, 7, 8], "50 to 60", 1, "Give a net or string to climb. Water at the base, not on the leaves.", "چڑھنے کے لیے جال یا دھاگہ دیں۔ پتوں پر نہیں، جڑ میں پانی دیں۔"],
  ["🌿", "Okra", "بھنڈی", [3, 4, 5, 6, 7], "50 to 60", 1, "Soak the seed overnight. It loves heat. Pick every 2 days while the pods are small.", "بیج رات بھر بھگوئیں۔ گرمی پسند ہے۔ پھلیاں چھوٹی ہوں تو ہر 2 دن بعد توڑیں۔"],
  ["🥒", "Bottle gourd and ridge gourd", "لوکی اور توری", [2, 3, 6, 7], "60 to 80", 0, "Grow along a fence or frame. Needs lots of sun and water.", "باڑ یا فریم پر چڑھائیں۔ بہت دھوپ اور پانی چاہیے۔"]
];

/* ------------------------------------------------------------------ pots and indoor plants data */
const SYM = [
  { k: "yl", n: ["Lower leaves turn yellow", "نیچے کے پتے پیلے ہو رہے ہیں"],
    c: ["Too much water is the most common cause. Poor drainage or a lack of feed can also do it.", "سب سے عام وجہ ضرورت سے زیادہ پانی ہے۔ نکاسی کی خرابی یا کھاد کی کمی سے بھی ہوتا ہے۔"],
    f: [["Check the pot has holes and the saucer is empty.", "دیکھیں کہ گملے میں سوراخ ہیں اور نیچے کی پلیٹ خالی ہے۔"], ["Water only when the top 2 cm is dry.", "صرف تب پانی دیں جب اوپر کی 2 سینٹی میٹر مٹی خشک ہو۔"], ["If it stays yellow for 2 weeks, give a weak liquid feed or a spoon of compost.", "اگر 2 ہفتے پیلا رہے تو ہلکی مائع کھاد یا ایک چمچ کمپوسٹ دیں۔"]] },
  { k: "bt", n: ["Leaf tips turn brown and dry", "پتوں کی نوکیں بھوری اور خشک ہو رہی ہیں"],
    c: ["Dry air, long gaps between watering, salty water, or scorching afternoon sun.", "خشک ہوا، پانی میں لمبے وقفے، کھاری پانی یا دوپہر کی تیز دھوپ۔"],
    f: [["Water deeply and regularly so the whole pot is wet.", "گہرا اور باقاعدہ پانی دیں تاکہ پورا گملا بھیگ جائے۔"], ["Once a month, run plain water through the pot to wash out salts.", "مہینے میں ایک بار سادہ پانی گملے سے گزاریں تاکہ نمک بہہ جائے۔"], ["Move it out of harsh afternoon sun. Trim brown tips with clean scissors.", "اسے دوپہر کی تیز دھوپ سے ہٹائیں۔ بھوری نوکیں صاف قینچی سے کاٹ دیں۔"]] },
  { k: "wp", n: ["White powder on the leaves", "پتوں پر سفید پاؤڈر"],
    c: ["Powdery mildew. It spreads in humid weather where the air does not move.", "سفوفی پھپھوندی۔ یہ نم موسم اور رکی ہوئی ہوا میں پھیلتی ہے۔"],
    f: [["Cut off the worst leaves and throw them away, not in the compost.", "زیادہ متاثرہ پتے کاٹ کر پھینک دیں، کمپوسٹ میں نہ ڈالیں۔"], ["Water the soil, not the leaves, and give the plant more air and morning sun.", "پتوں پر نہیں، مٹی میں پانی دیں اور پودے کو زیادہ ہوا اور صبح کی دھوپ دیں۔"], ["Spray 5 ml neem oil and 2 drops of mild soap in 1 litre of water in the evening. Repeat after 7 days.", "شام کو 1 لیٹر پانی میں 5 ملی لیٹر نیم کا تیل اور صابن کے 2 قطرے ملا کر سپرے کریں۔ 7 دن بعد دہرائیں۔"]] },
  { k: "st", n: ["Sticky leaves, tiny insects or ants", "چپچپے پتے، چھوٹے کیڑے یا چیونٹیاں"],
    c: ["Aphids, mealybugs or whitefly. Ants come for the sweet sticky juice they leave.", "چیپا، مہکی (میلی بگ) یا سفید مکھی۔ ان کے چھوڑے میٹھے رس کی وجہ سے چیونٹیاں آتی ہیں۔"],
    f: [["Wash the plant with a strong stream of water. Wipe leaves with cotton dipped in soapy water.", "پودے کو تیز دھار پانی سے دھوئیں۔ پتوں کو صابن والے پانی میں بھیگی روئی سے صاف کریں۔"], ["Spray neem oil mix (as above) in the evening every 5 to 7 days for 3 weeks.", "ہر 5 سے 7 دن بعد 3 ہفتے تک شام کو نیم کا سپرے کریں (اوپر والی ترکیب)۔"], ["Keep it apart from other plants until the insects are gone.", "کیڑے ختم ہونے تک اسے دوسرے پودوں سے الگ رکھیں۔"]] },
  { k: "dw", n: ["Drooping, but the soil is wet", "پودا مرجھایا ہوا ہے مگر مٹی گیلی ہے"],
    c: ["Roots are rotting from too much water or a pot with no drainage.", "ضرورت سے زیادہ پانی یا نکاسی کے بغیر گملے کی وجہ سے جڑیں سڑ رہی ہیں۔"],
    f: [["Stop watering. Slide the plant out and look at the roots.", "پانی بند کریں۔ پودا گملے سے نکال کر جڑیں دیکھیں۔"], ["Cut off black, soft or smelly roots with clean scissors.", "کالی، نرم یا بدبودار جڑیں صاف قینچی سے کاٹ دیں۔"], ["Repot in fresh, loose soil in a pot with holes. Keep in bright shade for a week.", "سوراخ والے گملے میں تازہ ڈھیلی مٹی میں دوبارہ لگائیں۔ ایک ہفتہ روشن سائے میں رکھیں۔"]] },
  { k: "dd", n: ["Drooping, and the soil is dry", "پودا مرجھایا ہوا ہے اور مٹی خشک ہے"],
    c: ["It needs water, or the afternoon heat is too much for it.", "اسے پانی چاہیے، یا دوپہر کی گرمی اس کے لیے بہت زیادہ ہے۔"],
    f: [["Water slowly until it drains from the bottom. Dry soil can repel water, so go in two rounds.", "آہستہ آہستہ پانی دیں جب تک نیچے سے نہ نکلے۔ خشک مٹی پانی کو پیچھے ہٹاتی ہے، اس لیے دو مرتبہ میں دیں۔"], ["Move it out of the hottest afternoon sun.", "اسے دوپہر کی سخت دھوپ سے ہٹا دیں۔"], ["Cover the soil with dry leaves or coco peat to keep the water in.", "پانی روکنے کے لیے مٹی کو سوکھے پتوں یا ناریل کے برادے سے ڈھانپ دیں۔"]] },
  { k: "lg", n: ["Tall, thin, pale stems", "لمبے، پتلے اور زرد تنے"],
    c: ["Not enough light. The plant is stretching to find it.", "روشنی کم ہے۔ پودا روشنی کی تلاش میں لمبا ہو رہا ہے۔"],
    f: [["Move it somewhere brighter. Most vegetables and flowering plants want 5 to 6 hours of sun.", "اسے روشن جگہ پر لے جائیں۔ زیادہ تر سبزیوں اور پھول والے پودوں کو 5 سے 6 گھنٹے دھوپ چاہیے۔"], ["Turn the pot a quarter turn each week so it grows evenly.", "ہر ہفتے گملا چوتھائی چکر گھمائیں تاکہ پودا برابر بڑھے۔"], ["Pinch off the top 2 cm of the stems to make it bushier.", "گھنا کرنے کے لیے تنوں کی اوپر کی 2 سینٹی میٹر نوک توڑ دیں۔"]] },
  { k: "nf", n: ["Lots of leaves but no flowers or fruit", "پتے بہت ہیں مگر پھول یا پھل نہیں"],
    c: ["Too much nitrogen (urea or leaf feed), too little sun, or heat.", "نائٹروجن (یوریا یا پتوں کی کھاد) زیادہ ہے، دھوپ کم ہے، یا گرمی ہے۔"],
    f: [["Stop urea and leaf feed. Use a small amount of a feed rich in phosphorus and potash.", "یوریا اور پتوں کی کھاد بند کریں۔ فاسفورس اور پوٹاش والی کھاد تھوڑی سی دیں۔"], ["Give 6 hours of sun if it is a fruiting plant.", "پھل دینے والے پودے کو 6 گھنٹے دھوپ دیں۔"], ["For gourds, touch a male flower to a female flower with a small brush in the morning.", "لوکی اور توری میں صبح کے وقت چھوٹے برش سے نر پھول کو مادہ پھول سے لگائیں۔"]] },
  { k: "gn", n: ["Tiny flies or white mould on the soil", "مٹی پر چھوٹی مکھیاں یا سفید پھپھوندی"],
    c: ["The soil stays wet for too long.", "مٹی بہت دیر تک گیلی رہتی ہے۔"],
    f: [["Let the top 3 cm dry out between waterings.", "پانی کے درمیان اوپر کی 3 سینٹی میٹر مٹی کو سوکھنے دیں۔"], ["Scrape off the top 2 cm of soil and replace it with fresh, dry soil.", "اوپر کی 2 سینٹی میٹر مٹی کھرچ کر تازہ خشک مٹی ڈال دیں۔"], ["Check the drainage holes. Yellow sticky cards catch the flies.", "نکاسی کے سوراخ دیکھیں۔ پیلے چپکنے والے کارڈ مکھیوں کو پکڑ لیتے ہیں۔"]] }
];

/* ------------------------------------------------------------------ state */
const cm = new Date().getMonth();
let S = { tab: "lawn", grass: "b", size: "", unit: "marla", sun: "full", month: cm, shown: false, vmonth: cm, pots: "0", sym: "yl" };
try { Object.assign(S, JSON.parse(ls.get("kd_lawn", "{}")), { month: cm, vmonth: cm, shown: false }); } catch (e) {}
const keep = () => ls.set("kd_lawn", JSON.stringify({ tab: S.tab, grass: S.grass, size: S.size, unit: S.unit, sun: S.sun, pots: S.pots, sym: S.sym }));

const opts = (obj, cur, lab) => Object.keys(obj).map(k => '<option value="' + k + '"' + (k === cur ? " selected" : "") + ">" + esc(L(lab(obj[k]))) + "</option>").join("");
const monthOpts = cur => MON.map((m, i) => '<option value="' + i + '"' + (i === cur ? " selected" : "") + ">" + esc(L([MONFULL[i], m[1]])) + "</option>").join("");
const fmtG = g => g >= 1000 ? (g / 1000).toFixed(1).replace(/\.0$/, "") + " kg" : Math.max(10, Math.round(g / 10) * 10) + " g";
const fmtL = l => l >= 1000 ? (l / 1000).toFixed(1).replace(/\.0$/, "") + (ur() ? " ہزار لیٹر" : " thousand litres") : Math.round(l / 10) * 10 + (ur() ? " لیٹر" : " litres");
const ask = text => { window.go("chat"); send(text); };

/* ------------------------------------------------------------------ render */
function shell() {
  const tabs = [["lawn", ["Lawn", "لان"]], ["veg", ["Kitchen garden", "کچن گارڈن"]], ["pots", ["Pots and indoor", "گملے اور گھر کے پودے"]]];
  root.innerHTML =
    "<h3>" + esc(L(["Lawn & Home", "لان اور گھر"])) + "</h3>" +
    '<p class="sub">' + esc(L(["Look after your lawn, kitchen garden and pots at home. Plain monthly guidance for the plains of Pakistan.", "گھر کے لان، کچن گارڈن اور گملوں کی دیکھ بھال۔ پاکستان کے میدانی علاقوں کے لیے ماہانہ سادہ مشورے۔"])) + "</p>" +
    '<div class="seg lw-tabs" role="tablist">' + tabs.map(t => '<button type="button" role="tab" data-t="' + t[0] + '" aria-selected="' + (S.tab === t[0]) + '" class="' + (S.tab === t[0] ? "on" : "") + '">' + esc(L(t[1])) + "</button>").join("") + "</div>" +
    '<div id="lw-body"></div>';
  root.querySelectorAll(".lw-tabs button").forEach(b => b.onclick = () => { S.tab = b.dataset.t; S.shown = false; keep(); shell(); });
  ({ lawn: lawnTab, veg: vegTab, pots: potsTab })[S.tab]();
}

/* ---- lawn */
function lawnTab() {
  const b = $("#lw-body");
  b.innerHTML =
    '<div class="g2">' +
    '<div><label for="lw-gr">' + esc(L(["Grass", "گھاس"])) + '</label><select id="lw-gr">' + opts(GRASS, S.grass, v => v) + "</select></div>" +
    '<div><label for="lw-sz">' + esc(L(["Lawn size", "لان کا سائز"])) + '</label><div class="lw-size"><input id="lw-sz" type="number" min="0.1" step="any" inputmode="decimal" placeholder="' + esc(L(["e.g. 5", "مثلاً 5"])) + '" value="' + esc(S.size) + '"><select id="lw-un" aria-label="' + esc(L(["Unit", "پیمانہ"])) + '">' + opts(UNITS, S.unit, v => v[1]) + "</select></div></div>" +
    '<div><label for="lw-su">' + esc(L(["Sunlight", "دھوپ"])) + '</label><select id="lw-su">' + opts(SUN, S.sun, v => v[1]) + "</select></div>" +
    '<div><label for="lw-mo">' + esc(L(["Month", "مہینہ"])) + '</label><select id="lw-mo">' + monthOpts(S.month) + "</select></div></div>" +
    '<button class="go" id="lw-go" type="button">' + esc(L(["Make my lawn plan", "میرے لان کا منصوبہ بنائیں"])) + "</button>" +
    '<div id="lw-out" aria-live="polite"></div>';
  const bind = (id, key, num) => { const el = $(id); el.onchange = el.oninput = () => { S[key] = num ? +el.value : el.value; keep(); if (S.shown && id !== "#lw-sz") plan(); }; };
  bind("#lw-gr", "grass"); bind("#lw-sz", "size"); bind("#lw-un", "unit"); bind("#lw-su", "sun"); bind("#lw-mo", "month", true);
  $("#lw-go").onclick = () => { S.shown = true; plan(true); };
  if (S.shown) plan();
}

function plan(scroll) {
  const out = $("#lw-out"), v = parseFloat(S.size);
  if (!(v > 0)) { out.innerHTML = '<div class="res lw-warn">' + esc(L(["Enter the size of your lawn first.", "پہلے اپنے لان کا سائز لکھیں۔"])) + "</div>"; $("#lw-sz").focus(); return; }
  const ph = (S.grass === "o" ? PH_O : PH_B)[S.month], P = PH[ph], m2 = v * UNITS[S.unit][0], sunf = SUN[S.sun][0];
  const wl = P.w * sunf * m2, ug = 6.5 * m2 * P.f;
  const waterNote = ph === "monsoon" ? L([" a week, minus the rain", " ہفتہ وار، بارش نکال کر"]) : L([" a week", " ہفتہ وار"]);
  const feedTile = P.f
    ? '<div><b>' + fmtG(ug) + "</b>" + esc(L([ph === "monsoon" ? "Urea, only if the grass is pale" : "Urea for one feed", ph === "monsoon" ? "یوریا، صرف گھاس پیلی ہو تو" : "ایک بار کی یوریا"])) + "</div>"
    : '<div><b>' + esc(L(["None", "نہیں"])) + "</b>" + esc(L(["No feeding this month", "اس مہینے کھاد نہیں"])) + "</div>";
  const mowTile = P.mow
    ? '<div><b>' + esc(P.mow[1] !== P.mow[0] ? L([P.mow[0] + " to " + P.mow[1] + " cm", P.mow[0] + " سے " + P.mow[1] + " سینٹی میٹر"]) : L([P.mow[0] + " cm", P.mow[0] + " سینٹی میٹر"])) + "</b>" + esc(L(["Mowing height", "کٹائی کی اونچائی"])) + "</div>"
    : '<div><b>' + esc(L(["No mowing", "کٹائی نہیں"])) + "</b>" + esc(L(["Mowing height", "کٹائی کی اونچائی"])) + "</div>";
  const strip = MON.map((mm, i) => { const p = (S.grass === "o" ? PH_O : PH_B)[i], g = GROUP[p]; return '<div class="lw-m g-' + g + (i === S.month ? " cur" : "") + '" title="' + esc(L(GROUPS[g])) + '"><span>' + esc(L(mm)) + "</span></div>"; }).join("");
  const legend = Object.keys(GROUPS).map(g => '<span><b class="g-' + g + '"></b>' + esc(L(GROUPS[g])) + "</span>").join("");
  const shade = S.sun === "deep" ? '<div class="adv warn"><span class="e">🌳</span><div><b>' + esc(L(["Very little sun", "دھوپ بہت کم ہے"])) + "</b><span>" + esc(L(["Bermuda needs about 6 hours of sun and thins out in deep shade. Consider a path, pots or a shade plant in that spot.", "برمودا کو تقریباً 6 گھنٹے دھوپ چاہیے اور گہرے سائے میں کمزور ہو جاتا ہے۔ اس جگہ راستہ، گملے یا سایہ پسند پودا لگانے پر غور کریں۔"])) + "</span></div></div>" : "";
  out.innerHTML =
    '<div class="res lw-res"><span class="tag">' + esc(L(GROUPS[GROUP[ph]])) + '</span><h3 class="lw-h">' + esc(L(P.head)) + "</h3>" +
    '<p class="lw-s">' + esc(L([MONFULL[S.month], MON[S.month][1]])) + " · " + esc(L(GRASS[S.grass]).split(",")[0]) + " · " + esc(v) + " " + esc(L(UNITS[S.unit][1])) + "</p>" +
    '<div class="stat">' + mowTile +
    '<div><b>' + esc(fmtL(wl)) + "</b>" + esc(L(["Water", "پانی"]) + waterNote) + "</div>" +
    '<div><b class="lw-t">' + esc(L(P.times)) + "</b>" + esc(L(["How often", "کتنی بار"])) + "</div>" + feedTile + "</div>" +
    '<p class="lw-bk">' + esc(L(["About", "تقریباً"])) + " " + Math.max(1, Math.round(wl / 15)) + " " + esc(L(["buckets (15 litres) a week", "بالٹیاں (15 لیٹر) ہفتہ وار"])) + "</p>" +
    '<b class="lw-lb">' + esc(L(["Do this month", "اس مہینے کریں"])) + '</b><ul class="lw-ul">' + P.tasks.map(t => "<li>" + esc(L(t)) + "</li>").join("") + "</ul>" + shade +
    '<b class="lw-lb">' + esc(L(["Your lawn through the year", "سال بھر آپ کا لان"])) + '</b><div class="lw-strip">' + strip + '</div><div class="leg">' + legend + "</div>" +
    '<div class="row lw-act">' + (P.f && P.gap ? '<button class="btn ghost" id="lw-rm" type="button">⏰ ' + esc(L(["Remind me to feed in " + P.gap + " weeks", P.gap + " ہفتے بعد کھاد کی یاد دہانی"])) + "</button>" : "") +
    '<button class="btn ghost" id="lw-ask" type="button">💬 ' + esc(L(["Ask Kisan Dost", "کسان دوست سے پوچھیں"])) + "</button></div>" +
    '<p class="note">' + esc(L(["Guide rates for home lawns. Urea is 6.5 g per square metre for a full feed: spread it evenly, water it in straight away and never put it on wet leaves in hot sun. If unsure, use half. Confirm with your local nursery.", "گھریلو لان کے لیے رہنما مقدار۔ مکمل کھاد میں یوریا 6.5 گرام فی مربع میٹر ہے: برابر پھیلائیں، فوراً پانی لگائیں اور تیز دھوپ میں گیلے پتوں پر نہ ڈالیں۔ یقین نہ ہو تو آدھی مقدار دیں۔ اپنی مقامی نرسری سے تصدیق کریں۔"])) + "</p></div>";
  const rm = $("#lw-rm");
  if (rm) rm.onclick = () => {
    const d = new Date(); d.setDate(d.getDate() + P.gap * 7);
    try { rems.push({ id: Date.now(), d: d.toISOString().slice(0, 10), t: L(["Feed the lawn: urea about " + fmtG(ug) + ", then water it in", "لان کو کھاد دیں: یوریا تقریباً " + fmtG(ug) + "، پھر پانی لگائیں"]), done: false, pid: apid }); saveR(); drawDue(); toast(L(["Reminder added", "یاد دہانی شامل ہو گئی"])); } catch (e) { toast(L(["Could not add the reminder", "یاد دہانی شامل نہیں ہو سکی"])); }
  };
  $("#lw-ask").onclick = () => ask("My lawn is " + L([GRASS[S.grass][0], GRASS[S.grass][0]]) + ", about " + v + " " + UNITS[S.unit][1][0] + ", " + SUN[S.sun][1][0] + ". It is " + MONFULL[S.month] + ". What should I do this month, how much urea, and what mistakes should I avoid?");
  if (scroll) out.scrollIntoView({ behavior: "smooth", block: "start" });
}

/* ---- kitchen garden */
function vegTab() {
  const b = $("#lw-body"), m = S.vmonth + 1, nm = m % 12 + 1;
  const fit = x => x[3].includes(m) && (S.pots !== "1" || x[5]);
  const now = VEG.filter(fit), next = VEG.filter(x => x[3].includes(nm) && !x[3].includes(m) && (S.pots !== "1" || x[5]));
  const card = x => '<div class="lw-veg"><div class="lw-e" aria-hidden="true">' + x[0] + '</div><div><b>' + esc(L([x[1], x[2]])) + "</b><span class=\"lw-d\">" + esc(L(["Harvest in about " + x[4] + " days", "تقریباً " + x[4] + " دن میں کٹائی"])) + (x[5] ? "" : " · " + esc(L(["needs a garden bed", "کیاری چاہیے"]))) + "</span><p>" + esc(L([x[6], x[7]])) + "</p></div></div>";
  b.innerHTML =
    '<div class="g2"><div><label for="lw-vm">' + esc(L(["Month", "مہینہ"])) + '</label><select id="lw-vm">' + monthOpts(S.vmonth) + "</select></div>" +
    '<div><label for="lw-vp">' + esc(L(["Where will you grow?", "کہاں اگائیں گے؟"])) + '</label><select id="lw-vp"><option value="0"' + (S.pots !== "1" ? " selected" : "") + ">" + esc(L(["Pots + garden bed", "گملے اور کیاری"])) + '</option><option value="1"' + (S.pots === "1" ? " selected" : "") + ">" + esc(L(["Pots only", "صرف گملے"])) + "</option></select></div></div>" +
    '<div class="res"><b class="lw-lb" style="margin-top:0">' + esc(L(["Sow in " + MONFULL[S.vmonth], MON[S.vmonth][1] + " میں بوئیں"])) + '</b><div class="lw-vg">' +
    (now.length ? now.map(card).join("") : '<p class="sub" style="margin:.4rem 0 0">' + esc(L(["Nothing is ideal to sow in this month. Plan the next one below, or prepare soil and compost.", "اس مہینے بوائی کے لیے کچھ بہتر نہیں۔ نیچے اگلے مہینے کا سوچیں، یا مٹی اور کمپوسٹ تیار کریں۔"])) + "</p>") +
    "</div></div>" +
    (next.length ? '<div class="res"><b class="lw-lb" style="margin-top:0">' + esc(L(["Coming next month", "اگلے مہینے آنے والی"])) + '</b><div class="lw-chips">' + next.map(x => '<span class="lw-chip">' + x[0] + " " + esc(L([x[1], x[2]])) + "</span>").join("") + "</div></div>" : "") +
    '<div class="row lw-act"><button class="btn ghost" id="lw-va" type="button">💬 ' + esc(L(["Ask Kisan Dost", "کسان دوست سے پوچھیں"])) + "</button></div>" +
    '<p class="note">' + esc(L(["Dates suit the plains of Punjab and Sindh. In the hills (Murree, Swat, Gilgit) sow 1 to 2 months later in spring and earlier in autumn. Your local nursery knows your area best.", "تاریخیں پنجاب اور سندھ کے میدانوں کے لیے ہیں۔ پہاڑی علاقوں (مری، سوات، گلگت) میں بہار میں 1 سے 2 مہینے دیر سے اور خزاں میں پہلے بوئیں۔ آپ کی مقامی نرسری اپنے علاقے کو بہتر جانتی ہے۔"])) + "</p>";
  $("#lw-vm").onchange = e => { S.vmonth = +e.target.value; vegTab(); };
  $("#lw-vp").onchange = e => { S.pots = e.target.value; keep(); vegTab(); };
  $("#lw-va").onclick = () => ask("I want to grow vegetables and herbs at home in " + MONFULL[S.vmonth] + (S.pots === "1" ? " in pots on a balcony" : " in pots and a small bed") + ". What should I sow, what size pots and how often should I water?");
}

/* ---- pots and indoor */
function potsTab() {
  const b = $("#lw-body"), hot = cm >= 3 && cm <= 8, s = SYM.find(x => x.k === S.sym) || SYM[0];
  b.innerHTML =
    '<div class="res"><b class="lw-lb" style="margin-top:0">' + esc(L(["How often to water a pot", "گملے کو کتنی بار پانی دیں"])) + '</b>' +
    '<p style="margin:.3rem 0">' + esc(L(["Push a finger 2 cm into the soil. If it is dry, water until it runs out of the bottom. If it is damp, wait a day.", "انگلی 2 سینٹی میٹر مٹی میں ڈالیں۔ خشک ہو تو پانی اتنا دیں کہ نیچے سے نکلنے لگے۔ نم ہو تو ایک دن رکیں۔"])) + "</p>" +
    '<div class="stat"><div class="' + (hot ? "lw-on" : "") + '"><b>' + esc(L(["Every day", "روزانہ"])) + "</b>" + esc(L(["April to September. Small pots may need water morning and evening in peak heat.", "اپریل سے ستمبر۔ شدید گرمی میں چھوٹے گملوں کو صبح اور شام پانی چاہیے ہو سکتا ہے۔"])) + "</div>" +
    '<div class="' + (!hot ? "lw-on" : "") + '"><b>' + esc(L(["Every 3 to 5 days", "ہر 3 سے 5 دن بعد"])) + "</b>" + esc(L(["October to March. Water in the morning so the soil is not cold and wet overnight.", "اکتوبر سے مارچ۔ صبح پانی دیں تاکہ رات بھر مٹی ٹھنڈی اور گیلی نہ رہے۔"])) + "</div></div></div>" +
    '<div class="res"><b class="lw-lb" style="margin-top:0">' + esc(L(["What is wrong with my plant?", "میرے پودے کو کیا ہوا ہے؟"])) + '</b>' +
    '<label for="lw-sy" class="fl" style="margin-top:.5rem">' + esc(L(["Pick what you see", "جو نظر آ رہا ہے منتخب کریں"])) + '</label><select id="lw-sy" style="width:100%">' + SYM.map(x => '<option value="' + x.k + '"' + (x.k === s.k ? " selected" : "") + ">" + esc(L(x.n)) + "</option>").join("") + "</select>" +
    '<div id="lw-sr"></div></div>' +
    '<div class="row lw-act"><button class="btn ghost" id="lw-pa" type="button">💬 ' + esc(L(["Ask Kisan Dost about my plant", "اپنے پودے کے بارے میں کسان دوست سے پوچھیں"])) + "</button></div>";
  const draw = () => {
    const x = SYM.find(q => q.k === S.sym) || SYM[0];
    $("#lw-sr").innerHTML = '<p class="lw-cause"><b>' + esc(L(["Likely cause", "ممکنہ وجہ"])) + ":</b> " + esc(L(x.c)) + '</p><b class="lw-lb">' + esc(L(["What to do", "کیا کریں"])) + '</b><ul class="lw-ul">' + x.f.map(t => "<li>" + esc(L(t)) + "</li>").join("") + "</ul>" +
      '<p class="note">' + esc(L(["Keep sprays away from children and pets, and wash any leaves you eat. Use only products whose label says they are safe for vegetables, and wait for the gap it states before picking.", "سپرے بچوں اور پالتو جانوروں سے دور رکھیں اور کھانے والے پتے خوب دھوئیں۔ صرف وہی دوا استعمال کریں جس کے لیبل پر سبزیوں کے لیے محفوظ لکھا ہو، اور توڑنے سے پہلے لیبل پر لکھا وقفہ ضرور گزاریں۔"])) + "</p>";
  };
  $("#lw-sy").onchange = e => { S.sym = e.target.value; keep(); draw(); };
  $("#lw-pa").onclick = () => { const x = SYM.find(q => q.k === S.sym) || SYM[0]; ask("My home plant has this problem: " + x.n[0] + ". What is the cause and what should I do? It is " + MONFULL[cm] + "."); };
  draw();
}

/* ------------------------------------------------------------------ hooks */
const _go = window.go;
window.go = function (v) { _go(v); if (v === "lawn") { S.month = cm; S.vmonth = S.vmonth == null ? cm : S.vmonth; shell(); const sc = $("#v-lawn"); if (sc) sc.scrollTop = 0; } };
document.addEventListener("kd-lang", () => { if ($("#v-lawn") && $("#v-lawn").style.display !== "none") shell(); });
shell();
})();
