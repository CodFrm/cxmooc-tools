package persistence

import (
	"github.com/CodFrm/cxmooc-tools/server/domain/entity"
	"github.com/CodFrm/cxmooc-tools/server/domain/repository"
)

type integral struct {
}

func NewIntegralRepository() *integral {
	return &integral{}
}

func (i *integral) GetIntegral(token string) (*entity.IntegralEntity, error) {

	return &entity.IntegralEntity{}, nil
}

func (i *integral) Update(integral *entity.IntegralEntity) error {
	return nil
}

func (i *integral) Create(integral *entity.IntegralEntity) error {

	return nil
}

func (i *integral) Transaction() repository.IntegerTransactionRepository {

	return nil
}
