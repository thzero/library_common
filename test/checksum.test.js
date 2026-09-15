import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import MomentUtility from '../utility/moment.js';
import ChecksumUtility from '../utility/checksum.js';

MomentUtility.initDateTime();

// crypto.checksum is async in every real implementation, so the stub is too.
const crypto = { async checksum(value) { return 'sum:' + JSON.stringify(value); } };

const newState = () => ({ checksumLastUpdate: {} });

describe('ChecksumUtility.checksumUpdateComplete', () => {
	// Regression: the timestamp referenced an undeclared MomentUtility, so every
	// call threw ReferenceError.
	it('records a timestamp without throwing', async () => {
		const state = newState();
		await ChecksumUtility.checksumUpdateComplete(crypto, state, () => {}, 'n', { a: 1 });
		const keys = Object.keys(state.checksumLastUpdate);
		assert.equal(keys.length, 1);
		assert.equal(typeof state.checksumLastUpdate[keys[0]], 'number');
	});

	// Regression: crypto.checksum was not awaited, so the pending promise was used
	// as the key and every distinct input collided on "[object Promise]".
	it('keys on the resolved checksum, not a pending promise', async () => {
		const state = newState();
		await ChecksumUtility.checksumUpdateComplete(crypto, state, () => {}, 'one', { a: 1 });
		await ChecksumUtility.checksumUpdateComplete(crypto, state, () => {}, 'two', { b: 2 });

		const keys = Object.keys(state.checksumLastUpdate);
		assert.equal(keys.length, 2, 'two distinct inputs must produce two keys');
		assert.ok(!keys.includes('[object Promise]'), 'a promise must not be used as a key');
	});

	it('notifies the commit callback', async () => {
		const state = newState();
		let committed = null;
		await ChecksumUtility.checksumUpdateComplete(crypto, state, (name) => { committed = name; }, 'n', {});
		assert.equal(committed, 'setCheckumLastUpdate');
	});
});

describe('ChecksumUtility.checksumUpdateCheck', () => {
	it('is false when nothing has been recorded', async () => {
		assert.equal(await ChecksumUtility.checksumUpdateCheck(crypto, newState(), () => {}, 'n', {}), false);
	});

	it('is true immediately after a matching complete', async () => {
		const state = newState();
		await ChecksumUtility.checksumUpdateComplete(crypto, state, () => {}, 'n', { a: 1 });
		assert.equal(await ChecksumUtility.checksumUpdateCheck(crypto, state, () => {}, 'n', { a: 1 }), true);
	});

	it('is false once the recorded entry is older than the window', async () => {
		const state = newState();
		await ChecksumUtility.checksumUpdateComplete(crypto, state, () => {}, 'n', { a: 1 });
		// the window is five minutes
		for (const key of Object.keys(state.checksumLastUpdate))
			state.checksumLastUpdate[key] -= (6 * 60 * 1000);
		assert.equal(await ChecksumUtility.checksumUpdateCheck(crypto, state, () => {}, 'n', { a: 1 }), false);
	});

	it('does not match a different input', async () => {
		const state = newState();
		await ChecksumUtility.checksumUpdateComplete(crypto, state, () => {}, 'n', { a: 1 });
		assert.equal(await ChecksumUtility.checksumUpdateCheck(crypto, state, () => {}, 'other', { b: 2 }), false);
	});
});
