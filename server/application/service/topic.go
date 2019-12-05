package service

import (
	"github.com/CodFrm/cxmooc-tools/server/application/dto"
	"github.com/CodFrm/cxmooc-tools/server/domain/repository/persistence"
	domain "github.com/CodFrm/cxmooc-tools/server/domain/service"
)

type Topic struct {
	topic *domain.Topic
}

func NewTopicService() *Topic {
	return &Topic{
		topic: domain.NewTopicDomainService(persistence.NewTopicRepository()),
	}
}

func (t *Topic) SearchTopicList(topic []string) []dto.TopicSet {
	for _, v := range topic {
		if v == "" {
			return nil
		}
	}
	return t.topic.SearchTopicList(topic)
}

func (t *Topic) SubmitTopic(topic []dto.SubmitTopic, ip, platform string) ([]dto.TopicHash, error) {
	return t.topic.SubmitTopic(topic, ip, platform)
}
