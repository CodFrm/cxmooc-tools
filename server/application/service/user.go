package service

import (
	"github.com/CodFrm/cxmooc-tools/server/application/dto"
	"github.com/CodFrm/cxmooc-tools/server/domain/repository/persistence"
	"github.com/CodFrm/cxmooc-tools/server/domain/service"
	"github.com/CodFrm/cxmooc-tools/server/internal/errs"
	"math/rand"
)

type User struct {
	user     *service.User
	integral *service.Integral
}

func NewUserService() *User {
	return &User{
		user:     service.NewUserDomainService(persistence.NewUserRepository()),
		integral: service.NewIntegralService(persistence.NewIntegralRepository()),
	}
}

func (u *User) GenToken(usr string) (*dto.User, error) {
	if user, err := u.user.CreateUser(usr); err != nil && err != errs.UserIsExist {
		return nil, err
	} else {
		return user, nil
	}
}

func (u *User) CheckIn(usr string) (*dto.TokenTransaction, error) {
	var user *dto.User
	var err error
	if user, err = u.user.CreateUser(usr); err != nil && err != errs.UserIsExist {
		return nil, err
	}
	num := int(rand.Int31n(20))
	if tt, err := u.integral.TokenAddIntegral(user.Token, num); err != nil {
		return nil, err
	} else {
		return tt, nil
	}
}
