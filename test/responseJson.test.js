import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import Response from '../response/index.js';
import LibraryCommonUtility from '../utility/index.js';

describe('Response serialization', () => {
	// Regression: err went out as it was, with a database error's fields.
	it('leaves err, clazz and method out of what is serialized', () => {
		const err = Object.assign(new Error('E11000 duplicate key'), { keyValue: { email: 'a@b.com' }, code: 11000 });
		const response = Response.error('Repo', 'create', 'Unable to create.', err, null, null, 'cid');
		const json = JSON.parse(JSON.stringify(response));
		assert.equal(json.err, undefined);
		assert.equal(json.clazz, undefined);
		assert.equal(json.method, undefined);
		assert.equal(json.message, 'Unable to create.');
		assert.equal(json.success, false);
		assert.equal(json.correlationId, 'cid');
		assert.doesNotMatch(LibraryCommonUtility.stringify(response), /a@b\.com/);
	});

	it('keeps err on the object for the server', () => {
		const err = new Error('boom');
		assert.equal(Response.error('a', 'b', null, err, null, null, 'cid').err, err);
	});

	it('still sends results and fields a caller added', () => {
		const response = Response.success('cid', { a: 1 });
		response.extra = 'x';
		assert.deepEqual(JSON.parse(JSON.stringify(response)).results, { a: 1 });
		assert.equal(JSON.parse(JSON.stringify(response)).extra, 'x');
	});
});
