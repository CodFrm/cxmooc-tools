package service

import (
	"github.com/CodFrm/cxmooc-tools/server/application/dto"
	"github.com/CodFrm/cxmooc-tools/server/domain/repository"
)

type Topic struct {
	repo repository.TopicRepository
}

func NewTopicDomainService(repository repository.TopicRepository) *Topic {
	return &Topic{
		repo: repository,
	}
}

func (t *Topic) SearchTopicList(topic []string) [][]dto.Topic {
	ret := make([][]dto.Topic, 0)
	for _, v := range topic {
		ret = append(ret, dto.ToTopics(t.repo.SearchTopic(t.dealSpecialSymbol(v))))
	}
	return ret
}

// 特殊符号处理
func (t *Topic) dealSpecialSymbol(topic string) string {
	//TODO
	return topic
}

func (t *Topic) SubmitTopic() {

}
