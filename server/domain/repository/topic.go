package repository

import "github.com/CodFrm/cxmooc-tools/server/domain/entity"

type TopicRepository interface {
	SearchTopic(topic string) []entity.TopicEntity
	Save(topicEntity entity.TopicEntity) bool
	Exist(topicEntity entity.Entity) bool
}
