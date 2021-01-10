const LibraryConstants = {
	InjectorKeys: {
		SERVICE_CONFIG: 'config',
		SERVICE_LOGGER: 'serviceLogger',
		SERVICE_MONITORING: 'serviceMonitoring',
		SERVICE_VALIDATION: 'serviceValidation'
	},
	ErrorCodes: {
		InvalidObject: 'invalidObject',
		InvalidPermissions: 'invalidPermissions',
		ObjectChanged: 'objectChanged',
		QuotaReached: 'quotaExceeded'
	},
	ErrorFields: {
		Generic: 'generic',
		Name: 'name',
		Number: 'number',
		Order: 'order'
	}
}

export default LibraryConstants;
