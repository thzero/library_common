import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import '../utility/string.js';
import Utility from '../utility/index.js';

// Each test here corresponds to a defect found in the audit. They exist to stop
// the same mistake coming back, so the comment names what went wrong.

describe('Utility.isNull / isNotNull', () => {
	it('reports null and undefined, and nothing else', () => {
		assert.equal(Utility.isNull(null), true);
		assert.equal(Utility.isNull(undefined), true);
		for (const value of [0, '', false, NaN, 'x', 1, {}, [1]])
			assert.equal(Utility.isNull(value), false, `isNull(${JSON.stringify(value)})`);
	});

	// Regression: isNull([]) used to return true, so isNotNull([]) was false and the
	// helper could not be used anywhere a value might legitimately be an empty array.
	it('does not report an empty array as null', () => {
		assert.equal(Utility.isNull([]), false);
		assert.equal(Utility.isNotNull([]), true);
	});

	it('isNotNull is the exact inverse', () => {
		for (const value of [null, undefined, 0, '', false, NaN, 'x', 1, {}, [], [1]])
			assert.equal(Utility.isNotNull(value), !Utility.isNull(value));
	});
});

describe('Utility.distinctArray', () => {
	it('keeps the first occurrence of each key, in order', () => {
		const result = Utility.distinctArray(
			[{ id: 'a' }, { id: 'b' }, { id: 'a' }, { id: 'c' }, { id: 'b' }], 'id');
		assert.deepEqual(result.map(l => l.id), ['a', 'b', 'c']);
	});

	it('handles falsy keys as distinct values', () => {
		const result = Utility.distinctArray(
			[{ id: 0 }, { id: false }, { id: '' }, { id: 0 }], 'id');
		assert.equal(result.length, 3);
	});

	// Regression: the old filter/findIndex form compared NaN with ===, which never
	// matches, so every element failed the index check and the result was empty.
	it('does not drop everything when the key is NaN', () => {
		const result = Utility.distinctArray([{ id: NaN }, { id: NaN }], 'id');
		assert.equal(result.length, 1);
	});

	it('returns null for a missing array or field', () => {
		assert.equal(Utility.distinctArray(null, 'id'), null);
		assert.equal(Utility.distinctArray([{ id: 'a' }], null), null);
	});

	it('is linear, not quadratic', () => {
		// 20k items took ~225ms with the old O(n^2) form and ~1.4ms with a Set.
		const input = Array.from({ length: 20000 }, (_, i) => ({ id: i % 5000 }));
		const started = process.hrtime.bigint();
		const result = Utility.distinctArray(input, 'id');
		const ms = Number(process.hrtime.bigint() - started) / 1e6;
		assert.equal(result.length, 5000);
		assert.ok(ms < 100, `took ${ms.toFixed(1)}ms — expected well under 100ms`);
	});
});

describe('Utility.deleteArrayById', () => {
	it('removes the matching entry in place', () => {
		const array = [{ id: 'a' }, { id: 'b' }, { id: 'c' }];
		Utility.deleteArrayById(array, 'b');
		assert.deepEqual(array.map(l => l.id), ['a', 'c']);
	});

	it('leaves the array alone when there is no match', () => {
		const array = [{ id: 'a' }];
		Utility.deleteArrayById(array, 'zz');
		assert.deepEqual(array.map(l => l.id), ['a']);
	});

	it('honours a custom key name', () => {
		const array = [{ key: 'a' }, { key: 'b' }];
		Utility.deleteArrayById(array, 'a', 'key');
		assert.deepEqual(array.map(l => l.key), ['b']);
	});
});

describe('Utility.tagToUrl', () => {
	// Known defect, not yet fixed: replace() without /g changes only the first
	// occurrence. This test documents current behaviour - flip it when fixed.
	it('currently replaces only the first = (known defect)', () => {
		assert.equal(Utility.tagToUrl(null, 'a=b=c'), 'a-b=c');
	});
});

describe('Utility.promiseTimeout', () => {
	it('resolves when the inner promise wins', async () => {
		const result = await Utility.promiseTimeout(Promise.resolve('done'), 1000);
		assert.equal(result, 'done');
	});

	it('rejects with a failed Response when the timeout wins', async () => {
		// unref so the pending timer does not hold the test runner open
		const slow = new Promise(resolve => setTimeout(resolve, 5000).unref());
		await assert.rejects(() => Utility.promiseTimeout(slow, 10));
	});
});
