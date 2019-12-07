package dto

import "github.com/CodFrm/cxmooc-tools/server/domain/entity"

type Topic struct {
	Hash       string
	Topic      string
	Type       int32
	Answer     []*Answer
	Correct    []*Answer
	Ip         string
	CreateTime int64
	UpdateTime int64
}

type Answer struct {
	Option  interface{}
	Content interface{}
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
	Correct []*Answer
	Hash    string
	Time    int64
	Topic   string
	Type    int32
}

type SubmitTopic struct {
	Answer  []map[string]interface{} //同一个字段不同类型留下的坑...
	Correct []map[string]interface{}
	Topic   string
	Type    int32
}

type TopicSet struct {
	Index  int
	Result []*SearchResult
	Topic  string
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
	Hash string
}

func ToTopicEntity(topic SubmitTopic, ip, platform, token string) *entity.TopicEntity {
	ret := &entity.TopicEntity{
		Type:     topic.Type,
		Answer:   mapToAnswerValue(topic.Answer, topic.Type),
		Correct:  mapToAnswerValue(topic.Correct, topic.Type),
		Ip:       ip,
		Platform: platform,
		Token:    token,
	}
	ret.SetTopic(topic.Topic)
	return ret
}

func mapToAnswerValue(answer []map[string]interface{}, tp int32) []*entity.Answer {
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
