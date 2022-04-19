String.capitalize = function(word) {
	if (String.isNullOrEmpty(word))
		return word;
	return word[0].toUpperCase() + word.slice(1).toLowerCase();
};

String.isNullOrEmpty = function(value) {
	// return !(typeof value === 'string' && value.length > 0)
	return !value;
}

String.isString = function(value) {
	return (typeof value === 'string' || value instanceof String);
}

String.trim = function(value) {
	if (!value || !String.isString(value))
		return value;
	return value.trim();
}
