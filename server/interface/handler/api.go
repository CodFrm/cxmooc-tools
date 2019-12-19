package handler

import (
	"encoding/json"
	"github.com/CodFrm/cxmooc-tools/server/application/dto"
	"github.com/CodFrm/cxmooc-tools/server/internal/errs"
	"github.com/CodFrm/cxmooc-tools/server/internal/utils"
	"net/http"
)

type api struct {
}

func NewApi() http.Handler {
	r := http.NewServeMux()

	newTopicHandler(r)
	newVCodeHandler(r)
	newUserHandler(r)
	system := newSystemHandler(r)

	r.HandleFunc("/", http.FileServer(http.Dir("static")).ServeHTTP)
	return http.HandlerFunc(func(w http.ResponseWriter, req *http.Request) {
		//跨域处理
		if origin, ok := req.Header["Origin"]; ok {
			w.Header().Set("Access-Control-Allow-Origin", origin[0])
			w.Header().Set("Access-Control-Allow-Headers", "Content-Type,Content-Length,Authorization,Accept,X-Requested-With,X-Version")
			w.Header().Set("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS")
		}
		if req.Method == http.MethodOptions {
			return
		}
		system.Statistics(utils.ClientIP(req))
		r.ServeHTTP(w, req)
	})
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
	writer.Header().Add("Content-Type", "application/json; charset=utf-8")
	b, _ := json.Marshal(dto.JsonMsg{
		Code: code,
		Msg:  msg,
	})
	writer.Write(b)
}

func json_info(writer http.ResponseWriter, code int, msg string, info string) {
	writer.Header().Add("Content-Type", "application/json; charset=utf-8")
	b, _ := json.Marshal(struct {
		*dto.JsonMsg
		Info string `json:"info"`
	}{&dto.JsonMsg{
		Code: code,
		Msg:  msg,
	}, info})
	writer.Write(b)
}

func json_map(writer http.ResponseWriter, m interface{}) {
	writer.Header().Add("Content-Type", "application/json; charset=utf-8")
	b, _ := json.Marshal(m)
	writer.Write(b)
}
