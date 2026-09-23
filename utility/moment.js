import dayjs from 'dayjs';
import localeData from 'dayjs/plugin/localeData.js';
import localizedFormat from 'dayjs/plugin/localizedFormat.js';
import utc from 'dayjs/plugin/utc.js';
import 'dayjs/locale/en.js'; // load on demand

class MomentUtility {
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

	static getDate(date) {
		if (date)
			return dayjs.utc(date);

		return dayjs.utc();
	}

	// The locale's format strings, resolved once. Each of these used to build a
	// throwaway dayjs and ask it for the locale data on every call, and the human
	// date-time format did both, per item when formatting a list. initDateTime
	// resets them, since it is where the locale is set.
	static getDateFormat() {
		if (!MomentUtility._formatDate)
			MomentUtility._formatDate = dayjs().localeData().longDateFormat('L');
		return MomentUtility._formatDate;
	}

	static getDateLocal() {
		const temp = dayjs();
		return temp;
	}

	static getDateHuman(date) {
		return dayjs(date).locale(navigator.language).format(`${MomentUtility.getDateFormat()}`);
	}

	static getDateHumanFromUnix(date) {
		return dayjs.unix(date).locale(navigator.language).format(`${MomentUtility.getDateFormat()}`);
	}

	static getDateParse(value) {
		return dayjs(value);
	}

	static getDateTimeHuman(date) {
		return dayjs(date).locale(navigator.language).format(`${MomentUtility.getDateFormat()} ${MomentUtility.getTimeFormat()}`);
	}

	static getDateTimeHumanFromUnix(date) {
		return dayjs.unix(date).locale(navigator.language).format(`${MomentUtility.getDateFormat()} ${MomentUtility.getTimeFormat()}`);
	}

	static getTimeFormat() {
		if (!MomentUtility._formatTime)
			MomentUtility._formatTime = dayjs().localeData().longDateFormat('LT');
		return MomentUtility._formatTime;
	}

	static getTimestamp(date) {
		if (date)
			return dayjs.utc(date).valueOf();

		// Epoch milliseconds have no timezone, so this is the same number
		// dayjs.utc().valueOf() returned, without a Date, a dayjs wrapper and a
		// plugin dispatch on the way. Every Data constructor comes through here.
		return Date.now();
	}

	// process.hrtime() measures from an arbitrary origin, so it is neither an epoch
	// timestamp nor comparable to getTimestamp(). performance.timeOrigin is the
	// epoch milliseconds at process start and performance.now() the high-resolution
	// offset from it, so the sum is a real high-resolution epoch timestamp. Both
	// are globals in Node and in the browser, so one branch serves both.
	static getTimestampHighRes() {
		return Math.floor(performance.timeOrigin + performance.now()); // milliseconds
	}

	static getTimestampHighResNs() {
		return Math.round((performance.timeOrigin + performance.now()) * 1e6); // milliseconds -> nanoseconds
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

	static initDateTime() {
		dayjs.locale('en'); // use English locale globally
		dayjs.extend(localeData);
		dayjs.extend(localizedFormat);
		dayjs.extend(utc);

		MomentUtility._formatDate = null;
		MomentUtility._formatTime = null;
	}

	static _formatDate = null;
	static _formatTime = null;
}

export default MomentUtility;
