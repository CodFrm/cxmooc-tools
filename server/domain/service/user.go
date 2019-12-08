package service

import (
	"github.com/CodFrm/cxmooc-tools/server/application/dto"
	"github.com/CodFrm/cxmooc-tools/server/application/event/publish"
	"github.com/CodFrm/cxmooc-tools/server/domain/entity"
	"github.com/CodFrm/cxmooc-tools/server/domain/repository"
	"github.com/CodFrm/cxmooc-tools/server/internal/errs"
	"github.com/CodFrm/cxmooc-tools/server/internal/utils"
)

type User struct {
	userRepo repository.UserRepository
}

func NewUserDomainService(userRepo repository.UserRepository) *User {
	return &User{
		userRepo: userRepo,
	}
}

func (u *User) CreateUser(usr string) (*dto.User, error) {
	if m, err := u.userRepo.FindByUser(usr); err != nil {
		return nil, err
	} else if m != nil {
		return &dto.User{
			User:  m.User,
			Token: m.Token,
		}, errs.UserIsExist
	}
	user := &entity.UserEntity{
		Token: utils.RandStringRunes(16),
		User:  usr,
	}
	if err := u.userRepo.Create(user); err != nil {
		return nil, err
	}
	publish.UserCreate(user.User, user.Token)
	return &dto.User{
		Token: user.Token,
	}, nil
}
