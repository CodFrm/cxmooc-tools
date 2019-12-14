package dto

import "github.com/CodFrm/cxmooc-tools/server/domain/entity"

type Topic struct {
	Hash       string    `json:"hash"`
	Topic      string    `json:"topic"`
	Type       int32     `json:"type"`
	Answer     []*Answer `json:"answer"`
	Correct    []*Answer `json:"correct"`
	Ip         string    `json:"ip"`
	CreateTime int64     `json:"create_time"`
	UpdateTime int64     `json:"update_time"`
}

type Answer struct {
	Option  interface{} `json:"option"`
	Content interface{} `json:"content"`
}

func ToTopic(topic entity.TopicEntity) Topic {
	return Topic{
		Hash:       topic.GetHash(),
		Topic:      topic.GetTopic(),
		Type:       topic.Type,
		Answer:     ToAnswers(topic.Answer, topic.Type),
		Correct:    ToAnswers(topic.Correct, topic.Type),
		Ip:         topic.Ip,
		CreateTime: topic.CreateTime,
		UpdateTime: topic.UpdateTime,
	}
}

func ToTopics(topic []entity.TopicEntity) []Topic {
	ret := make([]Topic, 0)
	for _, v := range topic {
		ret = append(ret, ToTopic(v))
	}
	return ret
}

func ToAnswer(answer *entity.Answer, t int32) *Answer {
	var ret *Answer = nil
	if t == 3 {
		//选择
		opt := false
		if answer.Option == "true" {
			opt = true
		}
		ret = &Answer{
			Option:  opt,
			Content: opt,
		}
	} else {
		ret = &Answer{
			Option:  answer.Option,
			Content: answer.Content,
		}
	}

	return ret
}

func ToAnswers(answer []*entity.Answer, t int32) []*Answer {
	ret := make([]*Answer, 0)
	for _, v := range answer {
		ret = append(ret, ToAnswer(v, t))
	}
	return ret
}

type SearchResult struct {
	Correct []*Answer `json:"correct"`
	Hash    string    `json:"hash"`
	Time    int64     `json:"time"`
	Topic   string    `json:"topic"`
	Type    int32     `json:"type"`
}

type SubmitTopic struct {
	Answers []map[string]interface{} `json:"answers"` //同一个字段不同类型留下的坑...
	Correct []map[string]interface{} `json:"correct"`
	Topic   string                   `json:"topic"`
	Type    int32                    `json:"type"`
}

type ImportTopic struct {
	*SubmitTopic
	Platform string `json:"platform"`
}

type TopicSet struct {
	Index  int             `json:"index"`
	Result []*SearchResult `json:"result"`
	Topic  string          `json:"topic"`
}

func ToSearchResult(topic *entity.TopicEntity) *SearchResult {
	return &SearchResult{
		Correct: ToAnswers(topic.Correct, topic.Type),
		Hash:    topic.GetHash(),
		Time:    topic.UpdateTime,
		Topic:   topic.GetTopic(),
		Type:    topic.Type,
	}
}

func ToSearchResults(topic []*entity.TopicEntity) []*SearchResult {
	ret := make([]*SearchResult, 0)
	for _, v := range topic {
		ret = append(ret, ToSearchResult(v))
	}
	return ret
}

type TopicHash struct {
	Hash string `json:"hash"`
}

func ToTopicEntity(topic *SubmitTopic, ip, platform, token string) *entity.TopicEntity {
	ret := &entity.TopicEntity{
		Type:     topic.Type,
		Answer:   MapToAnswerValue(topic.Answers, topic.Type),
		Correct:  MapToAnswerValue(topic.Correct, topic.Type),
		Ip:       ip,
		Platform: platForm(platform),
		Token:    token,
	}
	ret.SetTopic(topic.Topic)
	return ret
}

func platForm(p string) string {
	if p == "" {
		return "cx"
	}
	return p
}

func MapToAnswerValue(answer []map[string]interface{}, tp int32) []*entity.Answer {
	ret := make([]*entity.Answer, 0)
	for _, v := range answer {
		a := &entity.Answer{}
		if option, ok := v["option"]; ok {
			if tp == 3 {
				if option.(bool) {
					a.Option = "true"
				} else {
					a.Option = "false"
				}
			} else {
				a.Option = option.(string)
			}
		}
		if content, ok := v["content"]; ok {
			if tp == 3 {
				if content.(bool) {
					a.Content = "true"
				} else {
					a.Content = "false"
				}
			} else {
				a.Content = content.(string)
			}
		}
		ret = append(ret, a)
	}
	return ret
}
