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
		integral: service.NewIntegralService(persistence.NewUserRepository(), persistence.NewIntegralRepository()),
	}
}

func (u *User) GenToken(usr string) (*dto.User, error) {
	if user, err := u.user.CreateUser(usr); err != nil {
		return nil, err
	} else {
		_, _ = u.integral.UserAddIntegral(usr, 100)
		return user, nil
	}
}

func (u *User) CheckIn(user string) (*dto.TokenTransaction, error) {
	if _, err := u.user.CreateUser(user); err != nil && err != errs.UserIsExist {
		return nil, err
	}
	num := int(rand.Int31n(20))
	if tt, err := u.integral.UserAddIntegral(user, num); err != nil {
		return nil, err
	} else {
		return tt, nil
	}
}
