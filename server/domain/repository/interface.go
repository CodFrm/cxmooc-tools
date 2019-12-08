package repository

import "github.com/CodFrm/cxmooc-tools/server/domain/entity"

type TopicRepository interface {
	SearchTopic(topic *entity.TopicEntity) ([]*entity.TopicEntity, error)
	Save(topicEntity *entity.TopicEntity) error
	Exist(topicEntity *entity.TopicEntity) (bool, error)
	FindByHash(hash string) (*entity.TopicEntity, error)
}

type IntegralRepository interface {
	GetIntegral(token string) (*entity.IntegralEntity, error)
	Update(integral *entity.IntegralEntity) error
	Create(integral *entity.IntegralEntity) error
	Transaction() IntegerTransactionRepository
}

type IntegerTransactionRepository interface {
	Rollback() error
	Commit() error
	Close() error
	LockIntegral(token string) (*entity.IntegralEntity, error)
	Update(integral *entity.IntegralEntity) error
}

type UserRepository interface {
	FindByUser(user string) (*entity.UserEntity, error)
	Create(userEntity *entity.UserEntity) error
}
