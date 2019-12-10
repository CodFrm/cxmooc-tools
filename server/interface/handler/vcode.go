package handler

import (
	"encoding/base64"
	"github.com/CodFrm/cxmooc-tools/server/application/service"
	"github.com/CodFrm/cxmooc-tools/server/internal/errs"
	"net/http"
)

type vcode struct {
	vcode *service.VCode
}

func newVCodeHandler(r *http.ServeMux) *vcode {
	d := &vcode{
		vcode: service.NewVCodeService(),
	}

	r.HandleFunc("/vcode", d.VCode())

	return d
}

func (d *vcode) VCode() func(http.ResponseWriter, *http.Request) {
	return func(writer http.ResponseWriter, request *http.Request) {
		if request.Method != "POST" {
			http.NotFound(writer, request)
			return
		}

		imageBase64 := request.PostFormValue("img")
		token := request.Header.Get("Authorization")
		if token == "" || token[0:5] == "user|" {
			serverError(writer, errs.TokenNotExist)
			return
		}
		if image, err := base64.StdEncoding.DecodeString(imageBase64); err != nil {
			serverError(writer, err)
		} else {
			if code, err := d.vcode.Do(token, image); err != nil {
				serverError(writer, err)
			} else {
				json_msg(writer, 0, code)
			}
		}
	}
}
