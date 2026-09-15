import assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';

import '../utility/string.js';
import MomentUtility from '../utility/moment.js';
import BaseSettings from '../data/baseSettingsUser.js';
import openSource from '../openSource.js';

// dayjs.utc() does not exist until the plugins are registered. The framework's
// boot calls initDateTime once; anything outside boot - a test, a script, a
// one-off - has to call it itself or every timestamp call throws
// "dayjs.utc is not a function".
before(() => MomentUtility.initDateTime());

describe('getTimestamp', () => {
	it('returns epoch milliseconds', () => {
		const now = MomentUtility.getTimestamp();
		assert.equal(typeof now, 'number');
		assert.ok(Math.abs(now - Date.now()) < 5000, `got ${now}`);
	});

	it('converts a supplied date rather than reading the clock', () => {
		const timestamp = MomentUtility.getTimestamp('2020-01-02T03:04:05Z');
		assert.equal(timestamp, Date.UTC(2020, 0, 2, 3, 4, 5));
	});

	it('getTimestampSeconds is the same instant in seconds', () => {
		const seconds = MomentUtility.getTimestampSeconds();
		assert.ok(Math.abs(seconds - Math.floor(Date.now() / 1000)) < 5, `got ${seconds}`);
	});
});

describe('getTimestampHighRes', () => {
	// process.hrtime() is neither an epoch timestamp nor, on its own, a delta -
	// the responseTime plugin reported ~172,000,000ms of "elapsed" time by
	// treating an absolute hrtime reading as one. These are real epoch values.
	it('is a real epoch millisecond value, not an arbitrary origin', () => {
		const highRes = MomentUtility.getTimestampHighRes();
		assert.ok(Math.abs(highRes - Date.now()) < 5000, `got ${highRes}`);
	});

	it('moves forward between calls', () => {
		const first = MomentUtility.getTimestampHighRes();
		const started = Date.now();
		while (Date.now() - started < 5) { /* burn a few ms */ }
		assert.ok(MomentUtility.getTimestampHighRes() > first);
	});

	it('getTimestampHighResNs is the nanosecond form of the same idea', () => {
		const ns = MomentUtility.getTimestampHighResNs();
		assert.equal(typeof ns, 'number');
		assert.ok(ns > 0);
	});
});

describe('date helpers', () => {
	it('parses and formats without throwing', () => {
		const date = MomentUtility.getDate('2020-01-02T03:04:05Z');
		assert.ok(date);
		for (const member of [ 'getDateFormat', 'getTimeFormat' ])
			assert.doesNotThrow(() => MomentUtility[member](), member);
	});

	it('getDateHumanFromUnix and getDateTimeHumanFromUnix take seconds', () => {
		const seconds = Math.floor(Date.UTC(2020, 0, 2, 3, 4, 5) / 1000);
		assert.equal(typeof MomentUtility.getDateHumanFromUnix(seconds), 'string');
		assert.equal(typeof MomentUtility.getDateTimeHumanFromUnix(seconds), 'string');
	});
});

describe('BaseSettings', () => {
	it('starts with an empty settings shape', () => {
		const settings = new BaseSettings();
		assert.equal(settings.gamerTag, null);
		assert.equal(settings.gamerTagSearch, null);
		assert.deepEqual(settings.home, {});
	});

	it('gives each instance its own home object', () => {
		const first = new BaseSettings();
		const second = new BaseSettings();
		first.home.widget = true;
		assert.deepEqual(second.home, {}, 'home is per instance, not shared on the prototype');
	});
});

describe('openSource', () => {
	it('gives every entry a category, name, url and licence', () => {
		const entries = openSource();
		assert.ok(entries.length > 0);
		for (const entry of entries) {
			assert.ok([ 'client', 'server' ].includes(entry.category), entry.name);
			assert.ok(entry.name);
			assert.ok(entry.url, entry.name);
			assert.ok(entry.licenseName, entry.name);
			assert.ok(entry.licenseUrl, entry.name);
		}
	});

	it('lists this package under both categories', () => {
		const mine = openSource().filter(e => e.name === '@thzero/library_common');
		assert.deepEqual(mine.map(e => e.category).sort(), [ 'client', 'server' ]);
	});
});
