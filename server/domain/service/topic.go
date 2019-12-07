package service

import (
	"github.com/CodFrm/cxmooc-tools/server/application/dto"
	"github.com/CodFrm/cxmooc-tools/server/domain/entity"
	"github.com/CodFrm/cxmooc-tools/server/domain/repository"
)

type Topic struct {
	topicRepo    repository.TopicRepository
	integralRepo repository.IntegralRepository
	userRepo     repository.UserRepository
}

func NewTopicDomainService(topicRepo repository.TopicRepository) *Topic {
	return &Topic{
		topicRepo: topicRepo,
	}
}

func (t *Topic) SearchTopicList(topic []string) ([]dto.TopicSet, error) {
	ret := make([]dto.TopicSet, 0)
	for k, v := range topic {
		entity := new(entity.TopicEntity)
		entity.SetTopic(v)
		if entities, err := t.topicRepo.SearchTopic(entity); err != nil {
			return nil, err
		} else {
			ret = append(ret, dto.TopicSet{
				Index:  k,
				Result: dto.ToSearchResults(entities),
				Topic:  v,
			})
		}
	}
	return ret, nil
}

func (t *Topic) SubmitTopic(topic []dto.SubmitTopic, ip, platform, token string) ([]dto.TopicHash, *dto.InternalAddMsg, error) {
	ret := make([]dto.TopicHash, 0)
	addNum := &dto.InternalAddMsg{}
	for _, v := range topic {
		et := dto.ToTopicEntity(v, ip, platform, token)
		if ok, err := t.topicRepo.Exist(et); err != nil {
			return nil, nil, err
		} else if !ok {
			if err := t.topicRepo.Save(et); err != nil {
				return nil, nil, err
			}
			addNum.AddTokenNum += 10
		}
		ret = append(ret, dto.TopicHash{Hash: et.GetHash()})
	}
	return ret, addNum, nil
}
