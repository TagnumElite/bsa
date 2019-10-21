import test from "ava";
const split = require("../lib/split");

test("Test Split hex string", t => {
  const bufs = split(Buffer.from("1A2A3A001B2B", "hex"), 0);

  t.is(bufs.length, 2);
  t.is(bufs[0].toString("hex"), "1a2a3a");
  t.is(bufs[1].toString("hex"), "1b2b");
});

test("Test Split hex string 2", t => {
  const bufs = split(Buffer.from("1A2A3A1B2B", "hex"), 0);

  t.is(bufs.length, 1);
  t.is(bufs[0].toString("hex").toUpperCase(), "1A2A3A1B2B");
});

test("Test Split hex string 3", t => {
  const bufs = split(Buffer.from("1A2A3A001B2B00", "hex"), 0);

  t.is(bufs.length, 2);
  t.is(bufs[0].toString("hex"), "1a2a3a");
  t.is(bufs[1].toString("hex"), "1b2b");
});
