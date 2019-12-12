package service

import (
	"errors"
	"github.com/CodFrm/cxmooc-tools/server/application/dto"
	"github.com/CodFrm/cxmooc-tools/server/domain/repository/persistence"
	domain "github.com/CodFrm/cxmooc-tools/server/domain/service"
)

type Topic struct {
	topic    *domain.Topic
	integral *domain.Integral
}

func NewTopicService() *Topic {
	return &Topic{
		topic:    domain.NewTopicDomainService(persistence.NewTopicRepository()),
		integral: domain.NewIntegralService(persistence.NewIntegralRepository()),
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

	internal, _ := t.integral.GetTokenNum(token)
	add.TokenNum = add.AddTokenNum
	if internal != nil {
		add.TokenNum += internal.Num
	}

	return topicHash, add, nil
}

func (t *Topic) Import(topic []dto.SubmitTopic, user, ip, token string) {

}
