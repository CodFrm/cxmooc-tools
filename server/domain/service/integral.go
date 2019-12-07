package service

import (
	"github.com/CodFrm/cxmooc-tools/server/application/dto"
	"github.com/CodFrm/cxmooc-tools/server/domain/repository"
	"github.com/CodFrm/cxmooc-tools/server/internal/errs"
)

const (
	INTEGRAL_VCODE = 10
)

type Integral struct {
	repo repository.IntegralRepository
}

func NewIntegralService(integralRepo repository.IntegralRepository) *Integral {
	return &Integral{
		repo: integralRepo,
	}
}

func (i *Integral) TokenConsumption(token string, rule int) error {
	tran := i.repo.Transaction()
	defer tran.Close()
	integral, err := tran.LockIntegral(token)
	if err != nil {
		return err
	}
	if integral.Num < rule {
		return errs.IntegralInsufficient
	}
	integral.Num -= rule
	if err := tran.Update(integral); err != nil {
		return err
	}
	tran.Commit()
	return nil
}

func (i *Integral) TokenAddIntegral(token string, num int) (*dto.TokenTransaction, error) {
	tran := i.repo.Transaction()
	defer tran.Close()
	integral, err := tran.LockIntegral(token)
	if err != nil {
		return nil, err
	}
	integral.Num += num
	if err := tran.Update(integral); err != nil {
		return nil, err
	}
	tran.Commit()
	return &dto.TokenTransaction{
		Token:  integral.Token,
		Num:    num,
		AddNum: integral.Num,
	}, nil
}
