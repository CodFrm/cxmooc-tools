package service

import (
	"errors"
	"github.com/CodFrm/cxmooc-tools/server/application/dto"
	"github.com/CodFrm/cxmooc-tools/server/domain/repository/persistence"
	domain "github.com/CodFrm/cxmooc-tools/server/domain/service"
)

type Topic struct {
	topic *domain.Topic
}

func NewTopicService() *Topic {
	return &Topic{
		topic: domain.NewTopicDomainService(
			persistence.NewTopicRepository(),
			persistence.NewIntegralRepository(),
			persistence.NewUserRepository(),
		),
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

func (t *Topic) SubmitTopic(topic []dto.SubmitTopic, ip, platform, token string) ([]dto.TopicHash, dto.InternalAddMsg, error) {
	return t.topic.SubmitTopic(topic, ip, platform, token)
}
