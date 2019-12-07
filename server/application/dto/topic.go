package dto

import "github.com/CodFrm/cxmooc-tools/server/domain/entity"

type Topic struct {
	Hash       string
	Topic      string
	Type       int32
	Answer     []Answer
	Correct    []Answer
	Ip         string
	CreateTime int64
	UpdateTime int64
}

type Answer struct {
	Option  string
	Content string
}

func ToTopic(topic entity.TopicEntity) Topic {
	return Topic{
		Hash:       topic.Hash,
		Topic:      topic.GetTopic(),
		Type:       topic.Type,
		Answer:     ToAnswers(topic.Answer),
		Correct:    ToAnswers(topic.Correct),
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

func ToAnswer(answer entity.Answer) Answer {
	return Answer{
		Option:  answer.Option,
		Content: answer.Content,
	}
}

func ToAnswers(answer []entity.Answer) []Answer {
	ret := make([]Answer, 0)
	for _, v := range answer {
		ret = append(ret, ToAnswer(v))
	}
	return ret
}

type SearchResult struct {
	Correct []Answer
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
	Result []SearchResult
	Topic  string
}

func ToSearchResult(topic *entity.TopicEntity) SearchResult {
	return SearchResult{
		Correct: ToAnswers(topic.Correct),
		Hash:    topic.Hash,
		Time:    topic.CreateTime,
		Topic:   topic.GetTopic(),
		Type:    topic.Type,
	}
}

func ToSearchResults(topic []*entity.TopicEntity) []SearchResult {
	ret := make([]SearchResult, 0)
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

func mapToAnswerValue(answer []map[string]interface{}, tp int32) []entity.Answer {
	ret := make([]entity.Answer, 0)
	for _, v := range answer {
		a := entity.Answer{}
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
			continue
		}
		if content, ok := v["content"]; ok {
			if tp == 3 {
				if content.(bool) {
					a.Option = "true"
				} else {
					a.Option = "false"
				}
			} else {
				a.Option = content.(string)
			}
			continue
		}
		ret = append(ret, a)
	}
	return ret
}
