import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

// Importing this module is what installs the helpers onto the global String.
// Nothing else in this file imports anything, which is the point: these are
// globals, and a consumer that forgets this import gets
// "String.isNullOrEmpty is not a function" from somewhere unrelated.
import '../utility/string.js';

describe('the import installs the helpers globally', () => {
	it('adds exactly four statics to String', () => {
		for (const name of [ 'capitalize', 'isNullOrEmpty', 'isString', 'trim' ])
			assert.equal(typeof String[name], 'function', name);
	});

	// Regression: library_server_service_grpc called String.url(), which has never
	// existed. no-undef cannot see it - String is a real global and the failure is
	// a missing property, so it only shows up at runtime.
	it('adds nothing else - String.url in particular does not exist', () => {
		assert.equal(String.url, undefined);
	});
});

describe('String.isNullOrEmpty', () => {
	it('is true for null, undefined and the empty string', () => {
		assert.equal(String.isNullOrEmpty(null), true);
		assert.equal(String.isNullOrEmpty(undefined), true);
		assert.equal(String.isNullOrEmpty(''), true);
	});

	// A whitespace string is not empty, which is what the name says - compare C#'s
	// String.IsNullOrEmpty, not IsNullOrWhiteSpace. Trim first if you want it to count.
	it('is false for a whitespace string, which is not empty', () => {
		assert.equal(String.isNullOrEmpty('   '), false);
		assert.equal(String.isNullOrEmpty('\t\n'), false);
	});

	it('is false for a non-empty string', () => {
		assert.equal(String.isNullOrEmpty('a'), false);
		assert.equal(String.isNullOrEmpty(' a '), false);
	});

	// The sharp edge. Because it is `!value`, a legitimate 0 or false reads as
	// empty - so _enforceNotEmpty throws on them. Nothing in the tree passes a
	// number or a boolean to that family today; if you ever do, reach for
	// _enforceNotNull instead, which tests null and undefined only.
	it('is true for 0 and false, which are not strings at all', () => {
		assert.equal(String.isNullOrEmpty(0), true);
		assert.equal(String.isNullOrEmpty(false), true);
		assert.equal(String.isNullOrEmpty(1), false);
		assert.equal(String.isNullOrEmpty('0'), false, 'the string "0" is not empty');
	});

	it('is false for an empty array or object, which are truthy', () => {
		assert.equal(String.isNullOrEmpty([]), false);
		assert.equal(String.isNullOrEmpty({}), false);
	});

	// This is what makes it safe as a guard on values that may not be strings -
	// the _enforceNotEmpty family passes it anything.
	it('does not throw on a non-string', () => {
		for (const value of [ 0, 1, true, false, {}, [], () => {} ])
			assert.doesNotThrow(() => String.isNullOrEmpty(value), String(value));
	});
});

describe('String.isString', () => {
	it('distinguishes strings from everything else', () => {
		assert.equal(String.isString('a'), true);
		assert.equal(String.isString(''), true);
		assert.equal(String.isString(1), false);
		assert.equal(String.isString(null), false);
		assert.equal(String.isString(undefined), false);
		assert.equal(String.isString({}), false);
		assert.equal(String.isString([]), false);
	});

	it('accepts a boxed String object', () => {
		assert.equal(String.isString(new String('a')), true);
	});
});

describe('String.trim', () => {
	it('trims a string', () => {
		assert.equal(String.trim('  a  '), 'a');
		assert.equal(String.trim('a'), 'a');
		assert.equal(String.trim('   '), '');
	});

	// Anything that is not a string comes back untouched rather than coerced or
	// thrown on, so it is safe to call on a value of unknown type.
	it('returns a non-string unchanged', () => {
		assert.equal(String.trim(null), null);
		assert.equal(String.trim(undefined), undefined);
		assert.equal(String.trim(1), 1);
		assert.equal(String.trim(0), 0);
		const obj = {};
		assert.equal(String.trim(obj), obj);
	});
});

describe('String.capitalize', () => {
	it('upper cases the first character', () => {
		assert.equal(String.capitalize('word'), 'Word');
		assert.equal(String.capitalize('a'), 'A');
	});

	// It lower cases the remainder, so this is title-casing a single word rather
	// than only touching the first character.
	it('lower cases the rest of the string', () => {
		assert.equal(String.capitalize('wORD'), 'Word');
		assert.equal(String.capitalize('two WORDS'), 'Two words');
	});

	it('returns null, undefined and the empty string unchanged', () => {
		assert.equal(String.capitalize(''), '');
		assert.equal(String.capitalize(null), null);
		assert.equal(String.capitalize(undefined), undefined);
	});
});
