package persistence

import "github.com/CodFrm/cxmooc-tools/server/domain/entity"

type topic struct {
}

func NewTopicRepository() *topic {
	return &topic{}
}

func (t *topic) SearchTopic(topic *entity.TopicEntity) []entity.TopicEntity {

	return nil
}

func (t *topic) Save(topicEntity *entity.TopicEntity) error {
	return nil
}

func (t *topic) Exist(topicEntity *entity.TopicEntity) error {

	return nil
}
