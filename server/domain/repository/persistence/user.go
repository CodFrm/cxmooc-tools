package persistence

import "github.com/CodFrm/cxmooc-tools/server/domain/entity"

type user struct {
}

func NewUserRepository() *user {
	return &user{}
}

func (i *user) FindByToken(token string) (*entity.UserEntity, error) {

	return nil, nil
}

func (u *user) FindByUser(mobile string) (*entity.UserEntity, error) {

	return nil, nil
}

func (u *user) Create(userEntity *entity.UserEntity) error {
	return nil
}
