package service

import (
	"errors"
	"github.com/CodFrm/cxmooc-tools/server/application/dto"
	"github.com/CodFrm/cxmooc-tools/server/application/event"
	"github.com/CodFrm/cxmooc-tools/server/domain/repository/persistence"
	domain "github.com/CodFrm/cxmooc-tools/server/domain/service"
)

type Topic struct {
	topic *domain.Topic
	user  *domain.User
}

func NewTopicService() *Topic {
	return &Topic{
		topic: domain.NewTopicDomainService(persistence.NewTopicRepository()),
	}
}

func (t *Topic) SearchTopicList(topic []string) ([]dto.TopicSet, error) {
	for _, v := range topic {
		if v == "" {
			return nil, errors.New("list of wrong topic")
		}
	}
	return t.topic.SearchTopicList(topic)
}

func (t *Topic) SubmitTopic(topic []dto.SubmitTopic, ip, platform, token string) ([]dto.TopicHash, *dto.InternalAddMsg, error) {
	topicHash, add, err := t.topic.SubmitTopic(topic, ip, platform, token)
	if err != nil {
		return nil, nil, err
	}
	if add.AddTokenNum > 0 {
		event.SubmitTopic(token, add.AddTokenNum/10)
	}
	return topicHash, add, nil
}
