package repository

import "github.com/CodFrm/cxmooc-tools/server/domain/entity"

type TopicRepository interface {
	SearchTopic(topic *entity.TopicEntity) ([]*entity.TopicEntity, error)
	Save(topicEntity *entity.TopicEntity) error
	Exist(topicEntity *entity.TopicEntity) (bool, error)
}

type IntegralRepository interface {
	GetIntegral(user *entity.UserEntity) (*entity.IntegralEntity, error)
	Update(integral *entity.IntegralEntity) error
	Create(integral *entity.IntegralEntity) error
}

type UserRepository interface {
	FindByToken(token string) (*entity.UserEntity, error)
	FindByUser(user string) (*entity.UserEntity, error)
	Create(userEntity *entity.UserEntity) error
}
