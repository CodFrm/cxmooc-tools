package handler

import (
	"encoding/json"
	"github.com/CodFrm/cxmooc-tools/server/application/dto"
	"github.com/CodFrm/cxmooc-tools/server/internal/errs"
	"net/http"
)

type api struct {
}

func NewApi() http.Handler {
	r := http.NewServeMux()

	newTopicHandler(r)
	newVCodeHandler(r)
	newUserHandler(r)

	return r
}

func serverError(writer http.ResponseWriter, err error) {
	switch err.(type) {
	case *errs.HttpError:
		{
			e := err.(*errs.HttpError)
			writer.WriteHeader(e.HttpCode)
			json_info(writer, e.Code, e.Msg, e.Info)
		}
	default:
		{
			http.Error(writer, err.Error(), http.StatusInternalServerError)
		}
	}
}

func json_msg(writer http.ResponseWriter, code int, msg string) {
	b, _ := json.Marshal(dto.JsonMsg{
		Code: code,
		Msg:  msg,
	})
	writer.Write(b)
}

func json_info(writer http.ResponseWriter, code int, msg string, info string) {
	b, _ := json.Marshal(struct {
		*dto.JsonMsg
		info string
	}{&dto.JsonMsg{
		Code: code,
		Msg:  msg,
	}, info})
	writer.Write(b)
}

func json_map(writer http.ResponseWriter, m interface{}) {
	b, _ := json.Marshal(m)
	writer.Write(b)
}
