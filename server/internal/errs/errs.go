package errs

type HttpError struct {
	HttpCode int
	Code     int
	Msg      string
	Info     string
}

func (e *HttpError) Error() string {
	return e.Msg
}

func New(httpcode int, code int, msg string, info ...string) error {
	ifo := ""
	if len(info) > 0 {
		ifo = info[0]
	}
	return &HttpError{
		HttpCode: httpcode,
		Code:     code,
		Msg:      msg,
		Info:     ifo,
	}
}
