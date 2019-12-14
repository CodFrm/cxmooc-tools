package handler

import (
	"encoding/json"
	"github.com/360EntSecGroup-Skylar/excelize"
	"github.com/CodFrm/cxmooc-tools/server/internal/errs"
	"io/ioutil"
	"net/http"
	"regexp"
	"strconv"

	"github.com/CodFrm/cxmooc-tools/server/application/dto"
	"github.com/CodFrm/cxmooc-tools/server/application/service"
	"github.com/CodFrm/cxmooc-tools/server/internal/utils"
)

var importPlatFormMap = map[string]string{
	"超星": "cx", "超星考试": "cx", "智慧树": "zhs",
}

type topic struct {
	topic *service.Topic
}

func newTopicHandler(r *http.ServeMux) *topic {
	t := &topic{
		topic: service.NewTopicService(),
	}
	r.HandleFunc("/v2/answer", t.SearchTopic())
	r.HandleFunc("/answer", t.SubmitTopic())
	r.HandleFunc("/topic/import", t.Import())
	return t
}

func (t *topic) Import() func(http.ResponseWriter, *http.Request) {
	return func(writer http.ResponseWriter, request *http.Request) {
		if request.Method != "POST" {
			http.NotFound(writer, request)
			return
		}
		f, _, err := request.FormFile("topic")
		if err != nil {
			serverError(writer, err)
			return
		}
		excel, err := excelize.OpenReader(f)
		if err != nil {
			serverError(writer, err)
			return
		}
		var ipt = make([]*dto.ImportTopic, 0)
		rows := excel.GetRows("Sheet1")
		if len(rows) < 2 {
			json_msg(writer, -1, "excel行格式错误")
			return
		}
		if len(rows[0]) < 4 {
			json_msg(writer, -1, "内容不全(至少会有4列)")
			return
		}
		if len(rows[0]) > 10 {
			json_msg(writer, -1, "选项过多")
			return
		}
		rows = rows[1:]
		for line, row := range rows {
			topic, err := t.excelToTopic(line, row)
			if err != nil {
				serverError(writer, err)
				return
			}
			ipt = append(ipt, topic)
		}

		if err := t.topic.ImportTopic(ipt, request.PostFormValue("user"), request.PostFormValue("token"), utils.ClientIP(request)); err != nil {
			serverError(writer, err)
			return
		}
		json_msg(writer, 0, "success")
	}
}

func (t *topic) excelToTopic(line int, row []string) (*dto.ImportTopic, error) {
	platfrom, ok := importPlatFormMap[row[0]]
	if !ok {
		return nil, errs.New(200, -1, strconv.Itoa(line)+"行错误,不存在的平台")
	}

	ret := &dto.ImportTopic{
		SubmitTopic: &dto.SubmitTopic{
			Answers: nil,
			Correct: make([]map[string]interface{}, 0),
			Topic:   row[1],
		},
		Platform: platfrom,
	}
	var iter utils.Iterator
	switch row[2] {
	case "选择":
		ret.Type = 1
		if ok, _ := regexp.MatchString("[A-F]+", row[3]); ok && ((len(row) >= 5 && row[4] == "") || len(row) == 4) {
			// 选项
			if len(row[3]) > 7 {
				return nil, errs.New(200, -1, "选项过多")
			}
			for k := range row[3] {
				ret.Correct = append(ret.Correct, map[string]interface{}{
					"option":  string(row[3][k]),
					"content": "",
				})
			}
			if len(ret.Correct) > 1 {
				ret.Type = 2
			}
		} else {
			// 内容
			iter = utils.NewUpLetterIterator()
		}
	case "填空":
		ret.Type = 4
		iter = utils.NewChineseNumbersIterator()
	case "判断":
	default:
		return nil, errs.New(200, -1, strconv.Itoa(line)+"行错误,不支持的题目类型")
	}
	if row[2] == "判断" {
		ret.Type = 3
		ret.Correct = append(ret.Correct, map[string]interface{}{
			"option":  row[3] == "1",
			"content": row[3] == "1",
		})
	} else if iter != nil {
		for i := 3; i < len(row); i++ {
			if row[i] == "" {
				break
			}
			ret.Correct = append(ret.Correct, map[string]interface{}{
				"option":  iter.Value(),
				"content": row[i],
			})
			iter = iter.Next()
		}
		if ret.Type == 1 && len(ret.Correct) > 1 {
			ret.Type = 2
		}
	}

	if row[0] != "超星" {
		// 检测是否有答案内容
		for _, val := range ret.Correct {
			if v, ok := val["Content"].(string); ok && v == "" {
				return nil, errs.New(200, -1, strconv.Itoa(line)+"行错误,超星考试和智慧树要求必须有选项内容")
			}
		}
	}
	return ret, nil
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
		submit := make([]*dto.SubmitTopic, 0)
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
