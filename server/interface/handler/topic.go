package handler

import (
	"encoding/json"
	"github.com/CodFrm/cxmooc-tools/server/application/dto"
	"github.com/CodFrm/cxmooc-tools/server/application/service"
	"github.com/CodFrm/cxmooc-tools/server/internal/utils"
	"io/ioutil"
	"net/http"
	"strconv"
)

type topic struct {
	topic *service.Topic
}

func newTopicHandler(r *http.ServeMux) *topic {
	t := &topic{
		topic: service.NewTopicService(),
	}
	r.HandleFunc("/v2/answer", t.SearchTopic())
	r.HandleFunc("/answer", t.SubmitTopic())
	return t
}

func (t *topic) SearchTopic() func(http.ResponseWriter, *http.Request) {
	return func(writer http.ResponseWriter, request *http.Request) {
		if request.Method != "POST" {
			http.NotFound(writer, request)
			return
		}

		if err := request.ParseForm(); err != nil {
			http.Error(writer, err.Error(), http.StatusInternalServerError)
			return
		}
		topic := make([]string, 0)
		for i := 0; ; i++ {
			if v, ok := request.PostForm["topic["+strconv.Itoa(i)+"]"]; ok {
				topic = append(topic, v[0])
			} else {
				break
			}
		}
		if len(topic) > 20 {
			http.Error(writer, "too many topic", http.StatusBadRequest)
			return
		}
		w, _ := json.Marshal(t.topic.SearchTopicList(topic))
		writer.Write(w)
	}
}

func (t *topic) SubmitTopic() func(http.ResponseWriter, *http.Request) {
	return func(writer http.ResponseWriter, request *http.Request) {
		if request.Method != "POST" {
			http.NotFound(writer, request)
			return
		}
		submit := make([]dto.SubmitTopic, 0)
		if b, err := ioutil.ReadAll(request.Body); err != nil {
			http.Error(writer, err.Error(), http.StatusInternalServerError)
			return
		} else {
			if err := json.Unmarshal(b, &submit); err != nil {
				http.Error(writer, err.Error(), http.StatusInternalServerError)
				return
			}
		}

		if _, err := t.topic.SubmitTopic(submit, utils.ClientIP(request), request.URL.Query().Get("platfrom")); err != nil {
			http.Error(writer, err.Error(), http.StatusInternalServerError)
			return
		} else {

		}

	}
}
