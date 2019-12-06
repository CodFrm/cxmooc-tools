package handler

import "net/http"

type api struct {
}

func NewApi() http.Handler {
	r := http.NewServeMux()

	newTopicHandler(r)

	return r
}

func writerError(writer http.ResponseWriter, err error) {
	http.Error(writer, err.Error(), http.StatusInternalServerError)
}
