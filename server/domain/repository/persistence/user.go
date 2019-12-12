package persistence

import (
	"github.com/CodFrm/cxmooc-tools/server/domain/entity"
	goRedis "github.com/go-redis/redis/v7"
)

type user struct {
}

func NewUserRepository() *user {
	return &user{}
}

func (u *user) FindByUser(mobile string) (*entity.UserEntity, error) {
	cmd := redis.HGet("cxmooc:genuser", mobile)
	if err := cmd.Err(); err != nil {
		if err == goRedis.Nil {
			return nil, nil
		}
		return nil, err
	}
	token := cmd.Val()
	if token == "" {
		return nil, goRedis.Nil
	}
	return &entity.UserEntity{
		Token: token,
		User:  mobile,
	}, nil
}

func (u *user) Create(userEntity *entity.UserEntity) error {
	cmd := redis.HSet("cxmooc:genuser", userEntity.User, userEntity.Token)
	if err := cmd.Err(); err != nil {
		return err
	}
	return nil
}
