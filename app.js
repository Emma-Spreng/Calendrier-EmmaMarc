/* Annual calendar (2026) — static, no-build */

const YEAR = 2026;

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const DOW = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// Mock "shared Google Calendar" events.
// Keyed by YYYY-MM-DD -> array of events.
const MOCK_EVENTS = {
  "2026-01-01": [
    {
      title: "New Year brunch",
      time: "11:00",
      desc: "Pancakes, fruit, and a tiny toast to us.",
      kind: "date",
      tags: ["at home", "cozy"],
    },
  ],
  "2026-02-14": [
    {
      title: "Valentine’s night",
      time: "19:30",
      desc: "Dinner + a surprise playlist.",
      kind: "date",
      tags: ["reservation", "dress up"],
    },
  ],
  "2026-03-22": [
    {
      title: "Weekend getaway",
      time: "All day",
      desc: "Train + little bookstore hunt.",
      kind: "trip",
      tags: ["pack light", "photos"],
    },
  ],
  "2026-05-04": [
    {
      title: "Family lunch",
      time: "12:30",
      desc: "Bring dessert (something lemony).",
      kind: "family",
      tags: ["bring dessert"],
    },
  ],
  "2026-06-21": [
    {
      title: "Picnic at golden hour",
      time: "18:00",
      desc: "Blanket + grapes + silly card game.",
      kind: "date",
      tags: ["outdoors", "sunset"],
    },
  ],
  "2026-07-14": [
    {
      title: "Fireworks stroll",
      time: "22:00",
      desc: "Meet by the river; bring a light jacket.",
      kind: "fun",
      tags: ["night walk"],
    },
  ],
  "2026-09-01": [
    {
      title: "Reset day",
      time: "10:00",
      desc: "Coffee + planning + tidy the desk together.",
      kind: "home",
      tags: ["fresh start"],
    },
  ],
  "2026-10-31": [
    {
      title: "Costume chaos",
      time: "20:00",
      desc: "Movie night + candy taste test.",
      kind: "fun",
      tags: ["spooky", "snacks"],
    },
  ],
  "2026-12-24": [
    {
      title: "Christmas Eve",
      time: "18:30",
      desc: "Lights, cocoa, and the annual ornament photo.",
      kind: "family",
      tags: ["tradition"],
    },
  ],
  "2026-12-31": [
    {
      title: "Year wrap + wishes",
      time: "21:00",
      desc: "Scrapbook recap and 3 wishes each.",
      kind: "date",
      tags: ["sentimental", "sparkly"],
    },
  ],
};

const EVENT_ACCENTS = {
  date: "rgba(255, 111, 162, .95)",
  trip: "rgba(47, 140, 255, .92)",
  family: "rgba(255, 159, 47, .92)",
  fun: "rgba(47, 191, 113, .92)",
  home: "rgba(138, 77, 255, .90)",
  default: "rgba(255, 111, 162, .95)",
};

function pad2(n) {
  return String(n).padStart(2, "0");
}

function ymd(year, monthIndex, day) {
  return `${year}-${pad2(monthIndex + 1)}-${pad2(day)}`;
}

function isToday(year, monthIndex, day) {
  const now = new Date();
  return (
    now.getFullYear() === year &&
    now.getMonth() === monthIndex &&
    now.getDate() === day
  );
}

function daysInMonth(year, monthIndex) {
  // day 0 of next month = last day of current month
  return new Date(year, monthIndex + 1, 0).getDate();
}

function mondayIndexOfFirst(year, monthIndex) {
  // JS: Sun=0..Sat=6 -> convert to Mon=0..Sun=6
  const js = new Date(year, monthIndex, 1).getDay();
  return (js + 6) % 7;
}

function formatLongDate(year, monthIndex, day) {
  const d = new Date(year, monthIndex, day);
  return d.toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === "class") node.className = v;
    else if (k === "dataset") {
      for (const [dk, dv] of Object.entries(v)) node.dataset[dk] = dv;
    } else if (k.startsWith("on") && typeof v === "function") {
      node.addEventListener(k.slice(2).toLowerCase(), v);
    } else if (k === "text") node.textContent = v;
    else if (k === "html") node.innerHTML = v;
    else if (v === true) node.setAttribute(k, "");
    else if (v !== false && v != null) node.setAttribute(k, String(v));
  }
  for (const c of children) node.append(c);
  return node;
}

function renderYear() {
  const root = document.getElementById("months");
  root.textContent = "";

  for (let m = 0; m < 12; m++) {
    const card = renderMonth(YEAR, m);
    root.append(card);
  }
}

function renderMonth(year, monthIndex) {
  const firstOffset = mondayIndexOfFirst(year, monthIndex);
  const dim = daysInMonth(year, monthIndex);

  const header = el("div", { class: "month__header" }, [
    // Big month label as poster statement (angled/vertical via CSS)
    el("h3", { class: "month__name", text: MONTHS[monthIndex].toUpperCase() }),
    el("div", { class: "month__meta", text: String(year) }),
  ]);

  const dowRow = el(
    "div",
    { class: "dow", "aria-hidden": "true" },
    DOW.map((d) => el("div", { class: "dow__cell", text: d }))
  );

  const daysGrid = el("div", { class: "days" });

  // Padding before the 1st
  for (let i = 0; i < firstOffset; i++) {
    const pad = el("button", {
      class: "day day--pad",
      type: "button",
      tabindex: "-1",
      "aria-hidden": "true",
      disabled: true,
    });
    daysGrid.append(pad);
  }

  for (let day = 1; day <= dim; day++) {
    const key = ymd(year, monthIndex, day);
    const hasEvents = Array.isArray(MOCK_EVENTS[key]) && MOCK_EVENTS[key].length > 0;
    const today = isToday(year, monthIndex, day);

    const btn = el("button", {
      class:
        "day" +
        (hasEvents ? " day--hasEvents" : "") +
        (today ? " day--today" : ""),
      type: "button",
      dataset: { date: key, month: String(monthIndex) },
      "aria-label": `${formatLongDate(year, monthIndex, day)}${
        hasEvents ? `, ${MOCK_EVENTS[key].length} event(s)` : ", no events"
      }`,
    }, [
      el("span", { class: "day__num", text: String(day) }),
    ]);

    daysGrid.append(btn);
  }

  // Pad to full weeks (nice card rhythm)
  const totalCells = firstOffset + dim;
  const padAfter = (7 - (totalCells % 7)) % 7;
  for (let i = 0; i < padAfter; i++) {
    const pad = el("button", {
      class: "day day--pad",
      type: "button",
      tabindex: "-1",
      "aria-hidden": "true",
      disabled: true,
    });
    daysGrid.append(pad);
  }

  const grid = el("div", { class: "month__grid" }, [dowRow, daysGrid]);

  const month = el(
    "article",
    { class: "month", dataset: { month: String(monthIndex) } },
    [header, grid]
  );
  return month;
}

// Drawer logic
const drawer = {
  el: /** @type {HTMLDivElement} */ (document.getElementById("drawer")),
  title: /** @type {HTMLHeadingElement} */ (document.getElementById("drawerTitle")),
  kicker: /** @type {HTMLDivElement} */ (document.getElementById("drawerKicker")),
  meta: /** @type {HTMLDivElement} */ (document.getElementById("dayMeta")),
  list: /** @type {HTMLOListElement} */ (document.getElementById("eventsList")),
  hint: /** @type {HTMLDivElement} */ (document.getElementById("eventsHint")),
  empty: /** @type {HTMLDivElement} */ (document.getElementById("eventsEmpty")),
  closeBtn: /** @type {HTMLButtonElement} */ (document.getElementById("closeDrawerBtn")),
  backdrop: /** @type {HTMLDivElement} */ (document.getElementById("drawerBackdrop")),
  openForDate: null,
  lastFocus: null,
};

function openDrawerForDate(key, monthIndex) {
  drawer.openForDate = key;
  drawer.lastFocus = document.activeElement;

  const [y, m, d] = key.split("-").map((x) => Number(x));
  drawer.kicker.textContent = `${MONTHS[monthIndex]} vibes`;
  drawer.title.textContent = formatLongDate(y, monthIndex, d);

  const events = MOCK_EVENTS[key] || [];
  drawer.hint.textContent = events.length ? `${events.length} item(s)` : "No plans yet";

  // Meta pills
  drawer.meta.textContent = "";
  drawer.meta.append(
    pill("Year", String(y), "blue"),
    pill("Month", MONTHS[monthIndex], "yellow"),
    pill("Day", String(d), "green")
  );

  // Events list
  drawer.list.textContent = "";
  if (!events.length) {
    drawer.empty.hidden = false;
  } else {
    drawer.empty.hidden = true;
    for (const ev of events) drawer.list.append(renderEvent(ev));
  }

  // Visual selection in grid
  document.querySelectorAll(".day--selected").forEach((n) => n.classList.remove("day--selected"));
  const btn = document.querySelector(`.day[data-date="${cssEscape(key)}"]`);
  if (btn) btn.classList.add("day--selected");

  drawer.el.classList.add("isOpen");
  drawer.el.setAttribute("aria-hidden", "false");

  // Focus management
  requestAnimationFrame(() => drawer.closeBtn.focus());
}

function closeDrawer() {
  drawer.el.classList.remove("isOpen");
  drawer.el.setAttribute("aria-hidden", "true");

  document.querySelectorAll(".day--selected").forEach((n) => n.classList.remove("day--selected"));

  const restore = drawer.lastFocus;
  drawer.openForDate = null;
  drawer.lastFocus = null;
  if (restore && typeof restore.focus === "function") restore.focus();
}

function pill(label, value, color) {
  const dotClass =
    color === "blue"
      ? "pill__dot pill__dot--blue"
      : color === "green"
        ? "pill__dot pill__dot--green"
        : color === "yellow"
          ? "pill__dot pill__dot--yellow"
          : "pill__dot";

  return el("div", { class: "pill" }, [
    el("span", { class: dotClass, "aria-hidden": "true" }),
    el("span", { text: `${label}: ` }),
    el("strong", { text: value }),
  ]);
}

function renderEvent(ev) {
  const accent = EVENT_ACCENTS[ev.kind] || EVENT_ACCENTS.default;
  const node = el("li", { class: "event" });
  node.style.setProperty("--event-accent", accent);

  const top = el("div", { class: "event__top" }, [
    el("h5", { class: "event__title", text: ev.title || "Event" }),
    el("div", { class: "event__time", text: ev.time || "" }),
  ]);

  const desc = ev.desc ? el("p", { class: "event__desc", text: ev.desc }) : el("div");

  const tags = el("div", { class: "event__tags" });
  const allTags = Array.isArray(ev.tags) ? ev.tags : [];
  for (const t of allTags) {
    tags.append(
      el("span", { class: "tag" }, [
        el("span", { class: "tag__dot", "aria-hidden": "true" }),
        el("span", { text: t }),
      ])
    );
  }

  node.append(top, desc, tags);
  return node;
}

function cssEscape(value) {
  if (window.CSS && typeof window.CSS.escape === "function") return window.CSS.escape(value);
  return value.replace(/["\\]/g, "\\$&");
}

function jumpToDate(key) {
  const btn = document.querySelector(`.day[data-date="${cssEscape(key)}"]`);
  if (!btn) return;

  // Scroll to month card; slightly above for nice framing
  const card = btn.closest(".month");
  if (card) {
    card.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  requestAnimationFrame(() => btn.focus({ preventScroll: true }));
  const monthIndex = Number(btn.dataset.month || "0");
  openDrawerForDate(key, monthIndex);
}

function getTodayKeyIfInYear() {
  const now = new Date();
  if (now.getFullYear() !== YEAR) return null;
  return ymd(YEAR, now.getMonth(), now.getDate());
}

function randomDateKey() {
  const month = Math.floor(Math.random() * 12);
  const day = 1 + Math.floor(Math.random() * daysInMonth(YEAR, month));
  return ymd(YEAR, month, day);
}

function wireUI() {
  // Day click delegation
  document.addEventListener("click", (e) => {
    const t = /** @type {HTMLElement} */ (e.target);
    const btn = t.closest && t.closest(".day[data-date]");
    if (!btn) return;
    if (btn.classList.contains("day--pad")) return;
    const key = btn.getAttribute("data-date");
    const monthIndex = Number(btn.getAttribute("data-month") || "0");
    if (key) openDrawerForDate(key, monthIndex);
  });

  drawer.closeBtn.addEventListener("click", closeDrawer);
  drawer.backdrop.addEventListener("click", closeDrawer);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && drawer.el.classList.contains("isOpen")) closeDrawer();
  });

  // Top controls
  const todayBtn = document.getElementById("todayBtn");

  todayBtn.addEventListener("click", () => {
    const key = getTodayKeyIfInYear();
    if (key) jumpToDate(key);
    else jumpToDate(`${YEAR}-01-01`);
  });
}

function init() {
  renderYear();
  wireUI();

  // Open a cute default day on first load
  jumpToDate(`${YEAR}-02-14`);
}

init();

