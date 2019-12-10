package errs

var (
	IntegralInsufficient = New(200, -2, `超出限制,<a href="https://github.com/CodFrm/cxmooc-tools/issues/74" target="_blank">请点击查看详情</a>或者复制: https://github.com/CodFrm/cxmooc-tools/issues/74 访问`)
	UserIsExist          = New(200, -2, `用户已存在`)
	TokenNotExist        = New(200, -2, `Token不存在,<a href="https://github.com/CodFrm/cxmooc-tools/issues/74" target="_blank">请点击查看详情</a>或者复制: https://github.com/CodFrm/cxmooc-tools/issues/74 访问`)
)

func VCodeServerException(err error) error {
	return New(200, -2, "打码服务器异常", err.Error())
}
