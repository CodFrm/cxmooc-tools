package handler

import "net/http"

type api struct {
}

func NewApi() http.Handler {
	r := http.NewServeMux()

	v2 := http.NewServeMux()
	r.Handle("/v2", v2)

	newTopicHandler(v2)

	return r
}
