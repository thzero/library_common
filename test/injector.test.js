import assert from 'node:assert/strict';
import { beforeEach, describe, it } from 'node:test';

import '../utility/string.js';
import injector from '../utility/injector.js';
import NotImplementedError from '../errors/notImplemented.js';

// The module exports a frozen singleton, so there is one registry for the whole
// process. Clearing it between tests keeps them independent - the same thing an
// application never does, because it registers once at boot.
const clear = () => {
	const di = injector.getInjector();
	for (const key of Object.keys(di))
		delete di[key];
};

class Thing {
	constructor(args) {
		this.args = args;
	}
}

beforeEach(clear);

describe('addSingleton and getService', () => {
	it('hands back the very instance that was registered', () => {
		const instance = new Thing('once');
		injector.addSingleton('thing', instance);
		assert.equal(injector.getService('thing'), instance);
		assert.equal(injector.getService('thing'), injector.getService('thing'));
	});
});

describe('addService and getService', () => {
	// The distinction that matters: addService stores a constructor and builds a
	// NEW instance on every resolve, addSingleton stores an instance and returns
	// that one. Registering an instance with addService and expecting it back is
	// the mistake this pins.
	it('builds a new instance on every resolve', () => {
		injector.addService('thing', Thing);
		const first = injector.getService('thing');
		const second = injector.getService('thing');
		assert.ok(first instanceof Thing);
		assert.notEqual(first, second);
	});

	it('passes the resolve argument to the constructor', () => {
		injector.addService('thing', Thing);
		assert.equal(injector.getService('thing', 'supplied').args, 'supplied');
	});
});

describe('registration is first in wins', () => {
	// Neither add* overwrites. A second registration under the same key is
	// silently ignored, so a later boot plugin cannot replace an earlier one by
	// registering over it.
	it('ignores a second registration under the same key', () => {
		const first = new Thing('first');
		const second = new Thing('second');
		injector.addSingleton('thing', first);
		injector.addSingleton('thing', second);
		assert.equal(injector.getService('thing'), first);
	});

	it('ignores it across the two kinds too', () => {
		const instance = new Thing('singleton');
		injector.addSingleton('thing', instance);
		injector.addService('thing', Thing);
		assert.equal(injector.getService('thing'), instance);
	});
});

describe('bad input', () => {
	it('rejects an empty key on registration and resolution', () => {
		for (const key of [ null, undefined, '' ]) {
			assert.throws(() => injector.addSingleton(key, new Thing()), /Invalid injector key/);
			assert.throws(() => injector.addService(key, Thing), /Invalid injector key/);
			assert.throws(() => injector.getService(key), /Invalid injector key/);
		}
	});

	it('rejects a missing dependency', () => {
		assert.throws(() => injector.addSingleton('thing', null), /Invalid injector dependency/);
		assert.throws(() => injector.addService('thing', null), /Invalid injector dependency/);
	});

	// An unregistered key is null rather than a throw, which is what lets a service
	// treat an optional collaborator - SERVICE_DISCOVERY_RESOURCES, say - as absent.
	it('returns null for a key that was never registered', () => {
		assert.equal(injector.getService('nothing'), null);
	});
});

describe('getServices and getSingletons', () => {
	it('getSingletons returns only the singleton instances', () => {
		const instance = new Thing('s');
		injector.addSingleton('single', instance);
		injector.addService('transient', Thing);
		assert.deepEqual(injector.getSingletons(), [ instance ]);
	});

	it('getServices returns every registration, of both kinds', () => {
		injector.addSingleton('single', new Thing('s'));
		injector.addService('transient', Thing);
		assert.equal(injector.getServices().length, 2);
	});

	it('are empty when nothing is registered', () => {
		assert.deepEqual(injector.getSingletons(), []);
		assert.deepEqual(injector.getServices(), []);
	});
});

describe('NotImplementedError', () => {
	it('is an Error with a fixed message', () => {
		const error = new NotImplementedError();
		assert.ok(error instanceof Error);
		assert.equal(error.message, 'Not Implemented.');
	});

	// Worth knowing: it does not set `name`, so it reports as 'Error'. Catch it
	// with instanceof, not by comparing the name.
	it('does not set name, so instanceof is the way to catch it', () => {
		const error = new NotImplementedError();
		assert.equal(error.name, 'Error');
		assert.ok(error instanceof NotImplementedError);
	});
});
