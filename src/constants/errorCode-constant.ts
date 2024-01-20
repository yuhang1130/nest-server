export enum ErrorCode {
	// 系统 0 - 10101
	Success = 0,
	Param = 10001,
	TokenInvalid,
	NoLogin,
	NameExisted,
	AccessDenied,
	NotAuth,

	// user
	UserParam = 20001,
	UserExisted,
	UserNotExist,
	UserNotExistWithId,
	UserUnavailable,
	UserOrPsw,
	CaptchaInvalid,
	CaptchaError,
}

export const ErrorMessage = {
	[ErrorCode.Success]: '成功',
	[ErrorCode.Param]: '参数错误',
	[ErrorCode.TokenInvalid]: 'Token Invalid',
	[ErrorCode.NoLogin]: '未登录',
	[ErrorCode.NameExisted]: '"{$0}"名称已存在',
	[ErrorCode.AccessDenied]: 'Access Denied',
	[ErrorCode.NotAuth]: '无权访问',

	// user 用户
	[ErrorCode.UserParam]: '缺少参数({$0})',
	[ErrorCode.UserExisted]: '该账号已存在',
	[ErrorCode.UserNotExist]: '该账号不存在',
	[ErrorCode.UserNotExistWithId]: '该账号不存在, id:{$0}',
	[ErrorCode.UserUnavailable]: '该账号不可用',
	[ErrorCode.UserOrPsw]: '账号或密码错误',
	[ErrorCode.CaptchaInvalid]: '验证码已过期',
	[ErrorCode.CaptchaError]: '验证码错误',
};
