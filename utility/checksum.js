import MomentUtility from '../utility/moment.js';

class ChecksumUtility {
	static async checksumUpdateCheck(crypto, state, commit, name, params) {
		const internal = {};
		internal.name = name;
		internal.params = params;
		const checksum = await crypto.checksum(internal);

		const temp = state.checksumLastUpdate[checksum];
		if (!temp) {
			// state.checksumLastUpdate[checksum] = MomentUtility.getTimestamp()
			// commit('setCheckumLastUpdate', state.checksumLastUpdate)
			return false;
		}

		const now = MomentUtility.getTimestamp();
		const delta = now - temp;
		const max = 5 * 1000 * 60;
		if (delta > max) {
			// state.checksumLastUpdate[checksum] = MomentUtility.getTimestamp()
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
		state.checksumLastUpdate[checksum] = MomentUtility.getTimestamp();
		commit('setCheckumLastUpdate', state.checksumLastUpdate);
	}
}

export default ChecksumUtility;
