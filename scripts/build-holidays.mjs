/**
 * Generates the versioned statutory-holiday JSON files from the official
 * State Council notices. The JSON files are the source of truth consumed by
 * the app; this script only removes hand-typing errors when adding a year.
 *
 * Usage: node scripts/build-holidays.mjs
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = resolve(ROOT, "src/data/holidays");

/**
 * Sources:
 * - 2025: 国办发明电〔2024〕12号, published 2024-11-12
 * - 2026: 国办发明电〔2025〕7号, published 2025-11-04
 * - 2027: 国办发明电〔2026〕10号, published 2026-11-05
 *
 * `statutoryDates` are the days defined by 《全国年节及纪念日放假办法》,
 * not the whole extended break. `makeupDates` are the shifted working days.
 */
const YEARS = [
  {
    year: 2025,
    source: {
      title: "国务院办公厅关于2025年部分节假日安排的通知",
      documentNumber: "国办发明电〔2024〕12号",
      publishedAt: "2024-11-12",
      url: "https://www.gov.cn/zhengce/zhengceku/202411/content_6986383.htm",
    },
    periods: [
      {
        name: "元旦",
        startDate: "2025-01-01",
        endDate: "2025-01-01",
        statutoryDates: ["2025-01-01"],
        makeupDates: [],
        note: "1月1日放假1天，不调休。",
      },
      {
        name: "春节",
        startDate: "2025-01-28",
        endDate: "2025-02-04",
        statutoryDates: [
          "2025-01-28",
          "2025-01-29",
          "2025-01-30",
          "2025-01-31",
        ],
        makeupDates: ["2025-01-26", "2025-02-08"],
        note: "1月28日（除夕）至2月4日放假调休，共8天；1月26日、2月8日上班。",
      },
      {
        name: "清明节",
        startDate: "2025-04-04",
        endDate: "2025-04-06",
        statutoryDates: ["2025-04-04"],
        makeupDates: [],
        note: "4月4日至6日放假，共3天。",
      },
      {
        name: "劳动节",
        startDate: "2025-05-01",
        endDate: "2025-05-05",
        statutoryDates: ["2025-05-01", "2025-05-02"],
        makeupDates: ["2025-04-27"],
        note: "5月1日至5日放假调休，共5天；4月27日上班。",
      },
      {
        name: "端午节",
        startDate: "2025-05-31",
        endDate: "2025-06-02",
        statutoryDates: ["2025-05-31"],
        makeupDates: [],
        note: "5月31日至6月2日放假，共3天。",
      },
      {
        name: "国庆节、中秋节",
        startDate: "2025-10-01",
        endDate: "2025-10-08",
        statutoryDates: [
          "2025-10-01",
          "2025-10-02",
          "2025-10-03",
          "2025-10-06",
        ],
        makeupDates: ["2025-09-28", "2025-10-11"],
        note: "10月1日至8日放假调休，共8天；9月28日、10月11日上班。",
      },
    ],
  },
  {
    year: 2026,
    source: {
      title: "国务院办公厅关于2026年部分节假日安排的通知",
      documentNumber: "国办发明电〔2025〕7号",
      publishedAt: "2025-11-04",
      url: "https://www.gov.cn/zhengce/zhengceku/202511/content_7047091.htm",
    },
    periods: [
      {
        name: "元旦",
        startDate: "2026-01-01",
        endDate: "2026-01-03",
        statutoryDates: ["2026-01-01"],
        makeupDates: ["2026-01-04"],
        note: "1月1日至3日放假调休，共3天；1月4日上班。",
      },
      {
        name: "春节",
        startDate: "2026-02-15",
        endDate: "2026-02-23",
        statutoryDates: [
          "2026-02-16",
          "2026-02-17",
          "2026-02-18",
          "2026-02-19",
        ],
        makeupDates: ["2026-02-14", "2026-02-28"],
        note: "2月15日（腊月二十八）至2月23日（正月初七）放假调休，共9天；2月14日、2月28日上班。",
      },
      {
        name: "清明节",
        startDate: "2026-04-04",
        endDate: "2026-04-06",
        statutoryDates: ["2026-04-05"],
        makeupDates: [],
        note: "4月4日至6日放假，共3天。",
      },
      {
        name: "劳动节",
        startDate: "2026-05-01",
        endDate: "2026-05-05",
        statutoryDates: ["2026-05-01", "2026-05-02"],
        makeupDates: ["2026-05-09"],
        note: "5月1日至5日放假调休，共5天；5月9日上班。",
      },
      {
        name: "端午节",
        startDate: "2026-06-19",
        endDate: "2026-06-21",
        statutoryDates: ["2026-06-19"],
        makeupDates: [],
        note: "6月19日至21日放假，共3天。",
      },
      {
        name: "中秋节",
        startDate: "2026-09-25",
        endDate: "2026-09-27",
        statutoryDates: ["2026-09-25"],
        makeupDates: [],
        note: "9月25日至27日放假，共3天。",
      },
      {
        name: "国庆节",
        startDate: "2026-10-01",
        endDate: "2026-10-07",
        statutoryDates: ["2026-10-01", "2026-10-02", "2026-10-03"],
        makeupDates: ["2026-09-20", "2026-10-10"],
        note: "10月1日至7日放假调休，共7天；9月20日、10月10日上班。",
      },
    ],
  },
  {
    year: 2027,
    source: {
      title: "国务院办公厅关于2027年部分节假日安排的通知",
      documentNumber: "国办发明电〔2026〕10号",
      publishedAt: "2026-11-05",
      url: "https://www.gov.cn/zhengce/content/202611/content_7085101.htm",
    },
    periods: [
      {
        name: "元旦",
        startDate: "2027-01-01",
        endDate: "2027-01-03",
        statutoryDates: ["2027-01-01"],
        makeupDates: [],
        note: "1月1日至3日放假，共3天。",
      },
      {
        name: "春节",
        startDate: "2027-02-05",
        endDate: "2027-02-13",
        statutoryDates: [
          "2027-02-05",
          "2027-02-06",
          "2027-02-07",
          "2027-02-08",
        ],
        makeupDates: ["2027-01-31", "2027-02-14"],
        note: "2月5日（除夕）至13日（正月初八）放假调休，共9天；1月31日、2月14日上班。",
      },
      {
        name: "清明节",
        startDate: "2027-04-03",
        endDate: "2027-04-05",
        statutoryDates: ["2027-04-05"],
        makeupDates: [],
        note: "4月3日至5日放假，共3天。",
      },
      {
        name: "劳动节",
        startDate: "2027-05-01",
        endDate: "2027-05-05",
        statutoryDates: ["2027-05-01", "2027-05-02"],
        makeupDates: ["2027-05-08"],
        note: "5月1日至5日放假调休，共5天；5月8日上班。",
      },
      {
        name: "端午节",
        startDate: "2027-06-09",
        endDate: "2027-06-09",
        statutoryDates: ["2027-06-09"],
        makeupDates: [],
        note: "6月9日放假1天，不调休。",
      },
      {
        name: "中秋节",
        startDate: "2027-09-15",
        endDate: "2027-09-15",
        statutoryDates: ["2027-09-15"],
        makeupDates: [],
        note: "9月15日放假1天，不调休。",
      },
      {
        name: "国庆节",
        startDate: "2027-10-01",
        endDate: "2027-10-07",
        statutoryDates: ["2027-10-01", "2027-10-02", "2027-10-03"],
        makeupDates: ["2027-09-26", "2027-10-09"],
        note: "10月1日至7日放假调休，共7天；9月26日、10月9日上班。",
      },
    ],
  },
];

function pad(value) {
  return String(value).padStart(2, "0");
}

function* datesBetween(startDate, endDate) {
  const cursor = new Date(`${startDate}T00:00:00.000Z`);
  const end = new Date(`${endDate}T00:00:00.000Z`);
  if (cursor > end) {
    throw new Error(`Invalid range: ${startDate} > ${endDate}`);
  }
  while (cursor <= end) {
    yield cursor.toISOString().slice(0, 10);
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
}

function buildYear(definition) {
  const days = new Map();
  const periods = [];

  const addDay = (entry) => {
    if (days.has(entry.date)) {
      throw new Error(`Duplicate holiday date: ${entry.date}`);
    }
    days.set(entry.date, entry);
  };

  for (const period of definition.periods) {
    const periodDates = [...datesBetween(period.startDate, period.endDate)];
    const statutory = new Set(period.statutoryDates);

    for (const date of periodDates) {
      const isStatutory = statutory.has(date);
      addDay({
        date,
        name: period.name,
        isHoliday: true,
        isStatutory,
        isMakeupWorkday: false,
        note: isStatutory
          ? `${period.name}（法定节假日）`
          : `${period.name}假期`,
      });
    }

    for (const date of period.statutoryDates) {
      if (!periodDates.includes(date)) {
        throw new Error(
          `${definition.year} ${period.name}: statutory date ${date} outside the break`,
        );
      }
    }

    for (const date of period.makeupDates) {
      if (periodDates.includes(date)) {
        throw new Error(
          `${definition.year} ${period.name}: makeup date ${date} is also a holiday`,
        );
      }
      addDay({
        date,
        name: period.name,
        isHoliday: false,
        isStatutory: false,
        isMakeupWorkday: true,
        note: `${period.name}调休上班`,
      });
    }

    periods.push({
      name: period.name,
      startDate: period.startDate,
      endDate: period.endDate,
      days: periodDates.length,
      statutoryDates: period.statutoryDates,
      makeupDates: period.makeupDates,
      note: period.note,
    });
  }

  const sortedDays = [...days.values()].sort((a, b) =>
    a.date.localeCompare(b.date),
  );

  for (const day of sortedDays) {
    if (!day.date.startsWith(`${definition.year}-`)) {
      throw new Error(
        `${definition.year}: entry ${day.date} does not belong to the year`,
      );
    }
  }

  return {
    year: definition.year,
    source: definition.source,
    periods,
    days: sortedDays,
  };
}

mkdirSync(OUT_DIR, { recursive: true });

for (const definition of YEARS) {
  const data = buildYear(definition);
  const file = resolve(OUT_DIR, `${definition.year}.json`);
  writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`, "utf8");
  console.log(
    `wrote ${definition.year}.json: ${data.days.length} days, ${data.periods.length} periods`,
  );
}

// Keep the TypeScript side honest about which years are available.
console.log(
  `holiday years: ${YEARS.map((item) => item.year).join(", ")} (${pad(YEARS.length)} files)`,
);
