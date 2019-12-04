package dto

import "github.com/CodFrm/cxmooc-tools/server/domain/entity"

type Topic struct {
	Id         int64
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
		Id:         topic.Id,
		Hash:       topic.Hash,
		Topic:      topic.Topic,
		Type:       topic.Type,
		Answer:     ToAnswers(topic.Answer),
		Correct:    ToAnswers(topic.Correct),
		Ip:         topic.Ip,
		CreateTime: topic.CreateTime,
		UpdateTime: topic.UpdateTime,
	}
}

func ToTopics(topic []entity.TopicEntity) []Topic {
	ret := make([]Topic, len(topic))
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
	ret := make([]Answer, len(answer))
	for _, v := range answer {
		ret = append(ret, ToAnswer(v))
	}
	return ret
}
