import LibraryCommonUtility from '../utility/index.js';

class Data {
	constructor() {
		this.id = LibraryCommonUtility.generateId();
		this.createdTimestamp = LibraryCommonUtility.getTimestamp();
		this.createdUserId = null;
		this.updatedTimestamp = Utility.getTimestamp();
		this.updatedUserId = null;
	}

	map(requested) {
		if (!requested)
			return;

		this.id = requested.id;
		this.createdTimestamp = requested.createdTimestamp;
		this.createdUserId = requested.createdUserId;
		this.updatedTimestamp = requested.updatedTimestamp;
		this.updatedUserId = requested.updatedUserId;
	}
}

export default Data;
