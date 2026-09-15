import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import '../utility/string.js';
import MomentUtility from '../utility/moment.js';
import Data from '../data/index.js';
import NamedData from '../data/named.js';
import BaseNewsData from '../data/baseNews.js';
import BaseUserData from '../data/baseUser.js';

MomentUtility.initDateTime();

// Concrete subclasses: the base classes throw from the abstract hooks by design.
class TestUser extends BaseUserData {
	_initUserSettings() { return {}; }
}
class TestNews extends BaseNewsData {
	_defaultStatus() { return 'active'; }
	_defaultType() { return 'general'; }
}

describe('Data', () => {
	it('assigns an id and the four audit fields', () => {
		const data = new Data();
		assert.ok(data.id);
		assert.equal(typeof data.createdTimestamp, 'number');
		assert.equal(typeof data.updatedTimestamp, 'number');
		assert.equal(data.createdUserId, null);
		assert.equal(data.updatedUserId, null);
	});

	// Regression: getTimestamp() used to be called twice, so a freshly constructed
	// record could straddle a millisecond and look as though it had been updated
	// after it was created.
	it('uses one timestamp reading for created and updated', () => {
		for (let i = 0; i < 2000; i++) {
			const data = new Data();
			assert.equal(data.createdTimestamp, data.updatedTimestamp);
		}
	});

	it('map copies identity and audit fields', () => {
		const data = new Data();
		data.map({ id: 'i', createdTimestamp: 1, createdUserId: 'cu', updatedTimestamp: 2, updatedUserId: 'uu' });
		assert.deepEqual(
			[data.id, data.createdTimestamp, data.createdUserId, data.updatedTimestamp, data.updatedUserId],
			['i', 1, 'cu', 2, 'uu']);
	});
});

// Regression: BaseUserData.map and BaseNewsData.map did not call super.map, so id
// and all four audit fields were silently dropped on every map.
describe('map() calls super.map()', () => {
	it('NamedData', () => {
		const named = new NamedData();
		named.map({ id: 'i', createdTimestamp: 1, updatedTimestamp: 2, name: 'n' });
		assert.equal(named.id, 'i');
		assert.equal(named.name, 'n');
	});

	it('BaseUserData', () => {
		const user = new TestUser();
		user.map({ id: 'i', createdTimestamp: 1, createdUserId: 'cu', updatedTimestamp: 2, updatedUserId: 'uu',
			email: 'e@x', planId: 'p', roles: ['user'] });
		assert.equal(user.id, 'i', 'id must survive map()');
		assert.equal(user.createdTimestamp, 1);
		assert.equal(user.updatedUserId, 'uu');
		assert.equal(user.email, 'e@x');
		assert.deepEqual(user.roles, ['user']);
	});

	it('BaseNewsData', () => {
		const news = new TestNews();
		news.map({ id: 'i', createdTimestamp: 1, updatedTimestamp: 2, article: 'a',
			sticky: true, title: 't', timestamp: 9, status: 'active', type: 'general' });
		assert.equal(news.id, 'i', 'id must survive map()');
		assert.equal(news.createdTimestamp, 1);
		assert.equal(news.article, 'a');
		assert.equal(news.title, 't');
	});

	// Regression: baseNews.map hardcoded `this.sticky = false` instead of reading
	// requested.sticky, so the flag was lost on every map.
	it('BaseNewsData carries sticky through rather than hardcoding false', () => {
		const news = new TestNews();
		news.map({ sticky: true });
		assert.equal(news.sticky, true);
	});
});

describe('abstract hooks', () => {
	it('throw rather than returning an Error object', () => {
		assert.throws(() => new BaseUserData(), /Not Implemented/);
		assert.throws(() => new BaseNewsData(), /Not Implemented/);
	});
});
