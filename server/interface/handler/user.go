package handler

import (
	"github.com/CodFrm/cxmooc-tools/server/application/service"
	"github.com/CodFrm/cxmooc-tools/server/infrastructure/config"
	"github.com/CodFrm/cxmooc-tools/server/internal/errs"
	"net/http"
)

type user struct {
	user *service.User
}

func newUserHandler(r *http.ServeMux) *user {
	u := &user{
		user: service.NewUserService(),
	}
	r.HandleFunc("/gen-token", u.GenToken())
	r.HandleFunc("/check-in", u.CheckIn())
	return u
}

func (u *user) GenToken() func(http.ResponseWriter, *http.Request) {
	return func(writer http.ResponseWriter, request *http.Request) {
		if config.AppConfig.ClientToken != request.URL.Query().Get("token") {
			json_msg(writer, -1, "错误的token")
			return
		}
		user := request.URL.Query().Get("user")
		if user == "" {
			json_msg(writer, -1, "错误的用户")
			return
		}
		if user, err := u.user.GenToken(user); err != nil && err != errs.UserIsExist {
			serverError(writer, err)
		} else if user != nil {
			json_map(writer, map[string]interface{}{
				"code":  1,
				"token": user.Token,
			})
		}
	}
}

func (u *user) CheckIn() func(http.ResponseWriter, *http.Request) {
	return func(writer http.ResponseWriter, request *http.Request) {
		if config.AppConfig.ClientToken != request.URL.Query().Get("token") {
			json_msg(writer, -1, "错误的token")
			return
		}
		user := request.URL.Query().Get("user")
		if user == "" {
			json_msg(writer, -1, "错误的用户")
			return
		}
		if tt, err := u.user.CheckIn(user); err != nil {
			serverError(writer, err)
		} else if tt != nil {
			json_map(writer, map[string]interface{}{
				"code":  1,
				"token": tt.Token,
				"num":   tt.Num,
				"add":   tt.AddNum,
			})
		}
	}
}
