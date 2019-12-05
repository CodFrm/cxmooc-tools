package service

import (
	"github.com/CodFrm/cxmooc-tools/server/application/dto"
	"github.com/CodFrm/cxmooc-tools/server/domain/entity"
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

func (t *Topic) SearchTopicList(topic []string) []dto.TopicSet {
	ret := make([]dto.TopicSet, 0)
	for k, v := range topic {
		entity := new(entity.TopicEntity)
		entity.SetTopic(v)
		ret = append(ret, dto.TopicSet{
			Index:  k,
			Result: dto.ToSearchResults(t.repo.SearchTopic(entity)),
			Topic:  v,
		})
	}
	return ret
}

func (t *Topic) SubmitTopic(topic []dto.SubmitTopic, ip, platform string) ([]dto.TopicHash, error) {
	ret := make([]dto.TopicHash, 0)
	for _, v := range topic {
		et := dto.ToTopicEntity(v, ip, platform)
		if err := t.repo.Save(et); err != nil {
			return nil, err
		}
	}
	return ret, nil
}
