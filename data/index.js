import MomentUtility from '../utility/moment.js';
import Utility from '../utility/index.js';

class Data {
	constructor() {
		this.id = Utility.generateId();
		this.createdTimestamp = MomentUtility.getTimestamp();
		this.createdUserId = null;
		this.updatedTimestamp = MomentUtility.getTimestamp();
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
