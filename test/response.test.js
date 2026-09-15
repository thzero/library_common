import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import '../utility/string.js';
import LibraryConstants from '../constants.js';
import Response from '../response/index.js';
import ExtractResponse from '../response/extract.js';
import ResponseParam from '../response/responseParam.js';

describe('Response', () => {
	it('is successful by default, carrying its correlationId', () => {
		const response = new Response('cid');
		assert.equal(response.success, true);
		assert.equal(response.correlationId, 'cid');
		assert.equal(response.results, null);
		assert.equal(response.code, null);
		assert.equal(response.err, null);
		assert.equal(response.message, null);
		assert.equal(response.errors, null);
		assert.equal(response.params, null);
	});

	it('defaults results to null rather than undefined', () => {
		assert.equal(new Response('cid').results, null);
		assert.equal(new Response('cid', undefined).results, null);
		assert.equal(new Response('cid', 0).results, 0, 'but a falsy value that was supplied is kept');
		assert.equal(new Response('cid', false).results, false);
	});
});

describe('Response.success', () => {
	it('builds a successful response with results', () => {
		const response = Response.success('cid', { id: 'a' });
		assert.equal(response.success, true);
		assert.deepEqual(response.results, { id: 'a' });
		assert.equal(response.correlationId, 'cid');
	});
});

describe('Response.error', () => {
	it('builds a failed response carrying every field it was given', () => {
		const err = new Error('boom');
		const response = Response.error('Clazz', 'method', 'message', err, 'code', 'errors', 'cid');
		assert.equal(response.success, false);
		assert.equal(response.clazz, 'Clazz');
		assert.equal(response.method, 'method');
		assert.equal(response.message, 'message');
		assert.equal(response.err, err);
		assert.equal(response.correlationId, 'cid');
	});

	it('wraps a single errors value into an array', () => {
		const response = Response.error('C', 'm', null, null, null, 'one', 'cid');
		assert.deepEqual(response.errors, [ 'one' ]);
	});

	it('leaves errors null when none is given', () => {
		assert.equal(Response.error('C', 'm', 'msg', null, null, null, 'cid').errors, null);
	});

	// A failed response still defaults results to null, which is what makes the
	// framework's "not found is a failure" convention workable.
	it('has null results', () => {
		assert.equal(Response.error('C', 'm', 'msg', null, null, null, 'cid').results, null);
	});

	it('adds a generic error entry when both a message and a code are given', () => {
		const withBoth = Response.error('C', 'm', 'message', null, 'code', null, 'cid');
		assert.ok(Array.isArray(withBoth.errors) && withBoth.errors.length === 1);

		const messageOnly = Response.error('C', 'm', 'message', null, null, null, 'cid');
		assert.equal(messageOnly.errors, null, 'a message without a code adds nothing');
	});
});

describe('Response.hasFailed and hasSucceeded', () => {
	it('read the success flag', () => {
		assert.equal(Response.hasSucceeded(Response.success('cid')), true);
		assert.equal(Response.hasFailed(Response.success('cid')), false);
		assert.equal(Response.hasFailed(Response.error('C', 'm', 'x', null, null, null, 'cid')), true);
	});

	it('treat a missing response as failed', () => {
		assert.equal(Response.hasFailed(null), true);
		assert.equal(Response.hasFailed(undefined), true);
		assert.ok(!Response.hasSucceeded(null));
	});

	// This is the reason the framework never tests a response with `if (!response)`.
	// _checkUpdate in the mongo repository returned a Response and was tested that
	// way, so failed updates reported success.
	it('a Response is always truthy, including a failed one', () => {
		const failed = Response.error('C', 'm', 'x', null, null, null, 'cid');
		assert.ok(failed, 'truthy even though it failed');
		assert.equal(!failed, false);
		assert.equal(Response.hasFailed(failed), true, 'which is why hasFailed exists');
	});
});

describe('Response.add and addGeneric', () => {
	it('accumulates field errors', () => {
		const response = new Response('cid');
		response.add('message one', 'code1', 'name', 'type');
		response.add('message two', 'code2', 'number', 'type');
		assert.equal(response.errors.length, 2);
	});

	it('addGeneric files the error against the generic field', () => {
		const response = new Response('cid');
		response.addGeneric('message', 'code');
		assert.equal(response.errors.length, 1);
		assert.equal(response.errors[0].field, LibraryConstants.ErrorFields.Generic);
	});

	it('returns the response so calls chain', () => {
		const response = new Response('cid');
		assert.equal(response.add('m', 'c', 'f', 't'), response);
		assert.equal(response.addGeneric('m', 'c'), response);
	});
});

describe('Response.param and paramIl8n', () => {
	it('build a ResponseParam, translated or not', () => {
		const response = new Response('cid');
		const plain = response.param('value');
		const translated = response.paramIl8n('key', 'suffix');
		assert.ok(plain instanceof ResponseParam);
		assert.ok(translated instanceof ResponseParam);
		assert.equal(plain.value, 'value');
		assert.equal(translated.value, 'key');
		assert.notEqual(plain.il8n, translated.il8n, 'one is marked for translation, the other is not');
	});
});

describe('ExtractResponse', () => {
	it('is a Response with paging fields', () => {
		const response = new ExtractResponse('cid');
		assert.ok(response instanceof Response);
		assert.equal(response.success, true);
		assert.equal(response.correlationId, 'cid');
		for (const field of [ 'count', 'total', 'data' ])
			assert.ok(field in response, field);
	});
});
