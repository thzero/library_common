import os from 'os';

import dayjs from 'dayjs';
import localeData from 'dayjs/plugin/localeData';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import utc from 'dayjs/plugin/utc';
import 'dayjs/locale/en'; // load on demand
import shortUUID from 'short-uuid';
import { v4 as uuidv4 } from 'uuid';
import _cloneDeep from 'lodash/cloneDeep';
import _debounce from 'lodash/debounce';
import _merge from 'lodash/merge';

import Response from '../response/index';

const uuidTranslator = shortUUID();

class Utility {
	static initDateTime() {
		dayjs.locale('en'); // use English locale globally
		dayjs.extend(localeData);
		dayjs.extend(localizedFormat);
		dayjs.extend(utc);
	}

	static async checksumUpdateCheck(crypto, state, commit, name, params) {
		const internal = {};
		internal.name = name;
		internal.params = params;
		const checksum = await crypto.checksum(internal);

		const temp = state.checksumLastUpdate[checksum];
		if (!temp) {
			// state.checksumLastUpdate[checksum] = Utility.getTimestamp()
			// commit('setCheckumLastUpdate', state.checksumLastUpdate)
			return false;
		}

		const now = Utility.getTimestamp();
		const delta = now - temp;
		const max = 5 * 1000 * 60;
		if (delta > max) {
			// state.checksumLastUpdate[checksum] = Utility.getTimestamp()
			// commit('setCheckumLastUpdate', state.checksumLastUpdate)
			return false;
		}

		return true;
	}

	static checksumUpdateComplete(crypto, state, commit, name, params) {
		const internal = {};
		internal.name = name;
		internal.params = params;
		const checksum = crypto.checksum(internal);
		state.checksumLastUpdate[checksum] = Utility.getTimestamp();
		commit('setCheckumLastUpdate', state.checksumLastUpdate);
	}

	static cloneDeep(value) {
		return _cloneDeep(value);
	}

	static convertTimestampToLocal(value) {
		const temp = dayjs(value);
		temp.locale(navigator.language);
		return temp.valueOf();
	}

	static convertTimestampFromLocal(value) {
		const temp = dayjs(value).utc();
		return temp.valueOf();
	}

	static convertTimestampSecondsToLocal(value) {
		const temp = dayjs.unix(value);
		temp.locale(navigator.language);
		return temp.valueOf();
	}
	static convertTimestampSecondsFromLocal(value) {
		const temp = dayjs.unix(value).utc();
		return temp.valueOf();
	}

	static debounce(func, ttl) {
		return _debounce(func, ttl);
	}

	static deleteArrayById(array, id) {
		if (!array)
			return;
		if (!id)
			return;

		const i = array.map(item => item.id).indexOf(id)
		if (i === -1)
			return;
		array.splice(i, 1);
	}

	static formatUrl(url) {
		let urlF = url;
		if (!(typeof url === 'string' || url instanceof String))
			urlF = Utility.formatUrlParams(url.url, url.params);
		return urlF;
	}

	static formatUrlParams(url, params) {
		if (!Array.isArray(params))
			params = params ? [ params ] : [];
		params.unshift(url);
		return params.join('/');
	}

	static generateId() {
		// return uuidv4();
		return Utility.generateShortId();
	}

	static generateLongId() {
		return uuidv4();
	}

	static generateShortId() {
		return uuidTranslator.fromUUID(uuidv4());
	}

	static getDate(date) {
		if (date)
			return dayjs.utc(date);

		return dayjs.utc();
	}

	static getDateFormat() {
		const localeData = dayjs().localeData();
		return localeData.longDateFormat('L');
	}

	static getDateLocal() {
		const temp = dayjs();
		return temp;
	}

	static getDateHuman(date) {
		return dayjs(date).locale(navigator.language).format(`${Utility.getDateFormat()} ${Utility.getTimeFormat()}`);
	}

	static getDateHumanFromUnix(date) {
		return dayjs.unix(date).locale(navigator.language).format(`${Utility.getDateFormat()} ${Utility.getTimeFormat()}`);
	}

	static getDateParse(value) {
		return dayjs(value);
	}

	static getTimeFormat() {
		const localeData = dayjs().localeData();
		return localeData.longDateFormat('LT');
	}

	static getTimestamp(date) {
		if (date)
			return dayjs.utc(date).valueOf();

		return dayjs.utc().valueOf();
	}

	static getTimestampLocal() {
		const temp = dayjs();
		temp.locale(navigator.locale);
		return temp.valueOf();
	}

	static getTimestampSeconds() {
		const temp = dayjs().unix();
		return temp.valueOf();
	}

	static getTimestampSecondsLocal() {
		const temp = dayjs().unix();
		temp.locale(navigator.locale);
		return temp.valueOf();
	}

	static instantiate(object) {
		if (!object)
			return null;

		delete object.id;
		delete object.createdTimestamp;
		delete object.createdUserId;
		delete object.updatedUserId;
		delete object.updatedTimestamp;
		return object;
	}

	static get isDev() {
		let value = process.env.NODE_ENV;
		if (String.isNullOrEmpty(value))
			return true;

		value = value ? value.toLowerCase() : ''
		return ((value === 'dev') || (value === 'development'));
	}

	static get isLinux() {
		const type = os.type();
		return (/^linux/i.test(type) || /^freebsd/i.test(type) || /^darwin/i.test(type));
	}

	static get isMac() {
		const type = os.type();
		return (/^darwin/i.test(type));
	}

	static get isWin() {
		const type = os.type();
		return (/^win/i.test(type));
	}

	static map(obj1, obj2, resetTimestamps) {
		if (!obj1 || !obj2)
			return obj1;

		obj1.map(obj2);
		obj1.id = obj2.id;

		if (resetTimestamps) {
			obj1.createdTimestamp = obj2.createdTimestamp;
			obj1.updatedTimestamp = obj2.updatedTimestamp;
		}

		return obj1;
	}

	static merge2(x, y) {
		return _merge(x, y);
		// return Object.assign(x, y)
	}

	static merge3(x, y, z) {
		return _merge(x, y, z);
		// return Object.assign(x, y, z)
	}

	static promiseTimeout(executingPromise, ttl) {
		let id;

		// Create a promise that rejects in <ttl> milliseconds
		const timeoutPromise = new Promise((resolve, reject) => {
			id = setTimeout(() => {
				reject(Response.error(null, null, `Timed out in ${ttl}ms.`));
			}, ttl);
		});

		// Returns a race between our timeout and the passed in promise
		return Promise.race([
			executingPromise,
			timeoutPromise
		]).then((result) => {
			clearTimeout(id)
			// Pass the result back
			return result
		});
	}

	static selectBlank(array, prompt) {
		if (!array)
			return array;

		prompt = prompt ? '<' + prompt + '>' : '';

		const temp = array.slice(0);
		temp.unshift({ id: null, name: prompt });
		return temp;
	}

	static sortByName(values, ascending) {
		if (!values || !Array.isArray(values))
			return values;

		if (ascending)
			return values.sort((a, b) => Utility.sortByString(a, b, (v) => { return v ? v.name : null }));

		return values.sort((a, b) => Utility.sortByString(b, a, (v) => { return v ? v.name : null }));
	}

	static sortByNumber(a, b, field) {
		if (a && !b)
			return 1;
		if (!a && b)
			return -1;
		if (!a && !b)
			return 0;
		if (field) {
			a = field(a);
			b = field(b);
		}
		return (b - a);
	}

	static sortByNumberEx(values, field, ascending) {
		if (!values || !Array.isArray(values))
			return values;

		if (ascending)
			return values.sort((a, b) => Utility.sortByNumber(a, b, field));

		return values.sort((a, b) => Utility.sortByNumber(b, a, field));
	}

	static sortByOrder(values, ascending) {
		if (!values || !Array.isArray(values))
			return values;

		if (ascending)
			return values.sort((a, b) => Utility.sortByNumber(b, a, (v) => { return v ? v.order : null }));

		return values.sort((a, b) => Utility.sortByNumber(a, b, (v) => { return v ? v.order : null }));
	}

	static sortByString(a, b, field) {
		if (a && !b)
			return 1;
		if (!a && b)
			return -1;
		if (!a && !b)
			return 0;
		if (field) {
			a = field(a);
			b = field(b);
		}
		return (a && a.localeCompare(b));
	}

	static sortByTimestamp(values, ascending) {
		if (!values || !Array.isArray(values))
			return values;

		if (ascending)
			return values.sort((a, b) => Utility.sortByNumber(a, b, (v) => { return v ? v.timestamp : null }));

		return values.sort((a, b) => Utility.sortByNumber(b, a, (v) => { return v ? v.timestamp : null }));
	}

	static stringify(value) {
		return JSON.stringify(value, Utility._replacer);
	}

	static timerStart() {
		return process.hrtime.bigint();
	}

	static timerStop(start, output) {
		const delta = process.hrtime.bigint() - start;
		const ms = Number(delta) / 1000000;
		if (output)
			return `${delta}ns ${ms}ms`;
		return { ns: delta, ms: ms };
	}

	static translateToShortId(id) {
		return uuidTranslator.fromUUID(id);
	}

	static translateToId(id) {
		return uuidTranslator.toUUID(id);
	}

	static update(object) {
		if (!object)
			return null;

		delete object.createdTimestamp;
		delete object.createdUserId;
		delete object.updatedUserId;
		return object;
	}

	static _replacer(key, value) {
		if (value === null)
			return undefined;

		return value;
	}
}

export default Utility;
