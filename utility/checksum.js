import LibraryMomentUtility from '../utility/moment.js';

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

		const now = LibraryMomentUtility.getTimestamp();
		const delta = now - temp;
		const max = 5 * 1000 * 60;
		if (delta > max) {
			// state.checksumLastUpdate[checksum] = MomentUtility.getTimestamp()
			// commit('setCheckumLastUpdate', state.checksumLastUpdate)
			return false;
		}

		return true;
	}

	// async, and the checksum is awaited: crypto.checksum returns a promise, and
	// without the await the promise itself was used as the object key, so every
	// entry collided on "[object Promise]". The timestamp also referenced an
	// undeclared MomentUtility rather than the imported binding.
	static async checksumUpdateComplete(crypto, state, commit, name, params) {
		const internal = {};
		internal.name = name;
		internal.params = params;
		const checksum = await crypto.checksum(internal);
		state.checksumLastUpdate[checksum] = LibraryMomentUtility.getTimestamp();
		commit('setCheckumLastUpdate', state.checksumLastUpdate);
	}
}

export default ChecksumUtility;
