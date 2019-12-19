package handler

import (
	"net/http"
	"net/http/httptest"
	"testing"
)

func Test_vcode_VCode(t *testing.T) {
	v := &vcode{}
	handler := v.VCode()

	r, _ := http.NewRequest("POST", "http://vcode", nil)
	r.Header.Set("Authorization", "user")
	w := &httptest.ResponseRecorder{}
	handler(w, r)

}
