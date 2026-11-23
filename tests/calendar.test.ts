import assert from "node:assert/strict";
import test from "node:test";
import { allDates, dateKey, daysInMonth, isDateKey, shiftDate, today } from "../src/lib/calendar.ts";
import { discovery } from "../src/lib/discovery.ts";

test("the evergreen calendar contains every unique Gregorian month/day including leap day", () => {
  assert.equal(new Set(allDates).size, 366);
  assert.equal(allDates[0], "01-01");
  assert.equal(allDates.at(-1), "12-31");
  assert.ok(allDates.every(isDateKey));
  for (const invalid of ["04-31", "02-30", "1-01", "00-02", "13-03", "01-00"]) assert.equal(isDateKey(invalid), false);
});

test("calendar handles common years, century leap exceptions, and year boundaries", () => {
  for (const year of [1900, 2026, 2100]) assert.equal(daysInMonth(year, 2), 28);
  for (const year of [2000, 2028]) assert.equal(daysInMonth(year, 2), 29);
  assert.equal(dateKey(1, 3), "01-03");
  assert.deepEqual(shiftDate(2028, "02-28", 1), { year: 2028, key: "02-29" });
  assert.deepEqual(shiftDate(2026, "02-28", 1), { year: 2026, key: "03-01" });
  assert.deepEqual(shiftDate(2026, "12-31", 1), { year: 2027, key: "01-01" });
  assert.deepEqual(shiftDate(2026, "01-01", -1), { year: 2025, key: "12-31" });
});

test("today uses the selected timezone and discoveries support both languages", () => {
  const now = new Date("2026-11-23T20:01:00Z");
  assert.equal(today("UTC", now).key, "11-23");
  assert.equal(today("Asia/Dhaka", now).key, "11-24");
  for (const key of allDates) {
    assert.ok(discovery("en", key).prompt);
    assert.notEqual(discovery("en", key).title, discovery("bn", key).title);
  }
  assert.match(discovery("en", "02-29").source ?? "", /^https:/);
});