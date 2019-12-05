package repository

import "github.com/CodFrm/cxmooc-tools/server/domain/entity"

type TopicRepository interface {
	SearchTopic(topic *entity.TopicEntity) []entity.TopicEntity
	Save(topicEntity *entity.TopicEntity) error
	Exist(topicEntity *entity.TopicEntity) error
}
