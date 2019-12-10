package event

import (
	"github.com/CodFrm/cxmooc-tools/server/domain/entity"
	"github.com/CodFrm/cxmooc-tools/server/domain/repository"
	domain "github.com/CodFrm/cxmooc-tools/server/domain/service"
)

type Integral struct {
	repo    repository.IntegralRepository
	service *domain.Integral
}

func NewIntegralDomainEvent(repo repository.IntegralRepository) *Integral {
	return &Integral{
		repo:    repo,
		service: domain.NewIntegralService(repo),
	}
}

func (i *Integral) UserCreate(user, token string) error {
	return i.repo.Create(&entity.IntegralEntity{
		Token: token,
		Num:   100,
	})
}

func (i *Integral) SubmitTopic(token string, num int) error {
	_, err := i.service.TokenAddIntegral(token, num*10)
	return err
}
