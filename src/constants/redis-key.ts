export enum RedisSdkKey {
	LockPrefix = `business:lock:`,
	CachePrefix = `business:cache:`,
	JsonPrefix = `business:json:`,
	SessionPrefix = `session:`,
	LoginIdMapSessionIdsPrefix = `business:loginid2sids:`,
	IdCounter = `system:IdC:`,
	SMSCodePrefix = `business:verify:code:`,
	TokenCachePrefix = 'business:token:',
}
