package handler

import (
	"encoding/json"
	"github.com/CodFrm/cxmooc-tools/server/application/service"
	"net/http"
)

type topic struct {
	topic *service.Topic
}

func newTopicHandler(r *http.ServeMux) *topic {
	t := &topic{
		topic: service.NewTopicService(),
	}
	r.HandleFunc("/answer", t.SearchTopic())
	return t
}

func (t *topic) SearchTopic() func(http.ResponseWriter, *http.Request) {
	return func(writer http.ResponseWriter, request *http.Request) {
		if request.Method != "POST" {
			writer.WriteHeader(404)
			return
		}

		if topic, ok := request.URL.Query()["topic"]; !ok {
			writer.WriteHeader(400)
			return
		} else {
			w, _ := json.Marshal(t.topic.SearchTopicList(topic))
			writer.Write(w)
		}
	}
}
