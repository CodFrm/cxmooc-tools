package persistence

import "github.com/CodFrm/cxmooc-tools/server/domain/entity"

type topic struct {
}

func NewTopicRepository() *topic {
	return &topic{}
}

func (t *topic) SearchTopic(topic string) []entity.TopicEntity {

	return nil
}

func (t *topic) Save(topicEntity entity.TopicEntity) bool {
	return false
}

func (t *topic) Exist(topicEntity entity.Entity) bool {

	return false
}
