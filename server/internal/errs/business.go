package errs

var (
	IntegralInsufficient = New(200, -2, `超出限制,<a href="https://github.com/CodFrm/cxmooc-tools/issues/74" target="_blank">请点击查看详情</a>`)
	UserIsExist          = New(200, -2, `用户已存在`)
)

func VCodeServerException(err error) error {
	return New(200, -2, "打码服务器异常", err.Error())
}
