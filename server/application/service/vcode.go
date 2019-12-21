package service

import (
	"github.com/CodFrm/cxmooc-tools/server/domain/repository/persistence"
	"github.com/CodFrm/cxmooc-tools/server/domain/service"
	"github.com/CodFrm/cxmooc-tools/server/infrastructure/vcode"
	"github.com/CodFrm/cxmooc-tools/server/internal/errs"
)

type VCode struct {
	integral *service.Integral
}

func NewVCodeService() *VCode {
	return &VCode{
		integral: service.NewIntegralService(persistence.NewIntegralRepository()),
	}
}

// 打码
func (v *VCode) Do(token string, image []byte) (string, error) {
	if err := v.integral.TokenConsumption(token, service.INTEGRAL_VCODE); err != nil {
		if err == errs.TokenNotExist {
			return "", errs.IntegralInsufficient
		}
		return "", err
	}
	code, err := vcode.SendImage(image)
	if err != nil {
		return "", errs.VCodeServerException(nil)
	}
	return code, nil
}
