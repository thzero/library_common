import Response from './index.js';

class ExtractResponse extends Response {
	constructor(correlationId) {
		super(correlationId);

		this.count = 0;
		this.total = 0;
		this.data = null;
	}
}

export default ExtractResponse;
