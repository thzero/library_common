import LibraryConstants from '../constants.js';

import ResponseParam from './responseParam.js';

class Response {
	constructor(correlationId, results) {
		this.success = true;
		this.code = null;
		this.err = null;
		this.message = null;
		this.errors = null;
		this.params = null;
		this.results = results !== null && results !== undefined ? results : null;
		this.correlationId = correlationId;
	}

	add(message, code, field, type, params, prefix, suffix) {
		return this._add(message, code, field, type, params, prefix, suffix);
	}

	addGeneric(message, code, params, prefix, suffix) {
		return this._add(message, code, LibraryConstants.ErrorFields.Generic, null, params, prefix, suffix);
	}

	// eslint-disable-next-line
	check(context) {
		return this;
	}

	static hasFailed(response) {
		return !response || !response.success;
	}

	static hasSucceeded(response) {
		return response && response.success;
	}

	param(value) {
		return new ResponseParam(value, false, null);
	}

	paramIl8n(value, suffix) {
		return new ResponseParam(value, true, suffix);
	}

	static error(clazz, method, message, err, code, errors, correlationId) {
		let response = new Response(correlationId);
		response.success = false;
		response.clazz = clazz;
		response.method = method;
		response.err = err;
		response.errors = errors;
		if (message || code)
			response.addGeneric(message, code);
		return response;
	}

	static success(correlationId, results) {
		return new Response(correlationId, results);
	}

	// eslint-disable-next-line
	static throw(context, response) {
		context.throw(500);
	}

	_add(message, code, field, type, params, prefix, suffix) {
		this.success = false;

		if (!this.errors)
			this.errors = [];

		const error = {
			code: code,
			field: field,
			message: message,
			type: type,
			params: params,
			prefix: prefix,
			suffix: suffix
		}

		this.errors.push(error);
		return this;
	}
}

export default Response;
