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
		topic := make([]string, 0)
		for i := 0; ; i++ {
			if v := request.PostFormValue("topic[" + strconv.Itoa(i) + "]"); v == "" {
				break
			} else {
				topic = append(topic, v)
			}
		}
		if len(topic) > 20 {
			http.Error(writer, "too many topic", http.StatusBadRequest)
			return
		}
		set, err := t.topic.SearchTopicList(topic)
		if err != nil {
			serverError(writer, err)
			return
		}
		json_map(writer, set)
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
			serverError(writer, err)
			return
		} else {
			if err := json.Unmarshal(b, &submit); err != nil {
				serverError(writer, err)
				return
			}
		}
		token := request.Header.Get("Authorization")
		if hash, add, err := t.topic.SubmitTopic(submit, utils.ClientIP(request), request.URL.Query().Get("platform"), token); err != nil {
			serverError(writer, err)
			return
		} else {
			json_map(writer, struct {
				*dto.JsonMsg
				*dto.InternalAddMsg
				Result []dto.TopicHash `json:"result"`
			}{&dto.JsonMsg{Code: 0, Msg: "success"}, add, hash})
			return
		}
	}
}
