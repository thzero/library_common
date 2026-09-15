import MomentUtility from '../utility/moment.js';
import Utility from '../utility/index.js';

class Data {
	constructor() {
		// One reading for both. Two calls can straddle a millisecond boundary, which
		// makes a newly constructed record look as though it was updated after it
		// was created.
		const timestamp = MomentUtility.getTimestamp();
		this.id = Utility.generateId();
		this.createdTimestamp = timestamp;
		this.createdUserId = null;
		this.updatedTimestamp = timestamp;
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
