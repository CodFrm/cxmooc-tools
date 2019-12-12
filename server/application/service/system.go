package service

import (
	"github.com/CodFrm/cxmooc-tools/server/application/dto"
	"github.com/CodFrm/cxmooc-tools/server/domain/repository/persistence"
	domain "github.com/CodFrm/cxmooc-tools/server/domain/service"
)

type System struct {
	system *domain.System
}

func NewSystemService() *System {
	return &System{
		system: domain.NewSystemDomainService(persistence.NewSystemRepository()),
	}
}

func (s *System) Update(ver string) (*dto.Update, error) {
	return s.system.Update(ver)
}

func (s *System) Statistics(ip string) {
	_ = s.system.Statistics(ip)
}
