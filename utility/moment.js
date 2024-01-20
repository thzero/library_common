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

	static getDateFormat() {
		const localeData = dayjs().localeData();
		return localeData.longDateFormat('L');
	}

	static getDateLocal() {
		const temp = dayjs();
		return temp;
	}

	static getDateHuman(date) {
		return dayjs(date).locale(navigator.language).format(`${Utility.getDateFormat()}`);
	}

	static getDateHumanFromUnix(date) {
		return dayjs.unix(date).locale(navigator.language).format(`${Utility.getDateFormat()}`);
	}

	static getDateParse(value) {
		return dayjs(value);
	}

	static getDateTimeHuman(date) {
		return dayjs(date).locale(navigator.language).format(`${Utility.getDateFormat()} ${Utility.getTimeFormat()}`);
	}

	static getDateTimeHumanFromUnix(date) {
		return dayjs.unix(date).locale(navigator.language).format(`${Utility.getDateFormat()} ${Utility.getTimeFormat()}`);
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

	static initDateTime() {
		dayjs.locale('en'); // use English locale globally
		dayjs.extend(localeData);
		dayjs.extend(localizedFormat);
		dayjs.extend(utc);
	}
}

export default MomentUtility;
