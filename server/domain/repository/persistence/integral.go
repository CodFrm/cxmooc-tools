package persistence

import "github.com/CodFrm/cxmooc-tools/server/domain/entity"

type integral struct {
}

func NewIntegralRepository() *integral {
	return &integral{}
}

func (i *integral) GetIntegral(user *entity.UserEntity) (*entity.IntegralEntity, error) {

	return &entity.IntegralEntity{}, nil
}

func (i *integral) Update(integral *entity.IntegralEntity) error {
	return nil
}
