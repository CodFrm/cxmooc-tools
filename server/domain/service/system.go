package service

import (
	"github.com/CodFrm/cxmooc-tools/server/application/dto"
	"github.com/CodFrm/cxmooc-tools/server/domain/repository"
	"time"
)

type System struct {
	repo repository.SystemRepository
}

func NewSystemDomainService(repo repository.SystemRepository) *System {
	return &System{
		repo: repo,
	}
}

func (s *System) Update(ver string) (*dto.Update, error) {
	ret := &dto.Update{}
	notice, _ := s.repo.GetNotice()
	ret.Notice = notice
	hotV, _ := s.repo.HotVersion(ver)
	v, _ := s.repo.NowVersion()
	ret.HotVersion = hotV
	if hotV == "" {
		ret.HotVersion = v
	}
	ret.Version = v
	url, _ := s.repo.GetUpdateUrl()
	ret.Url = url
	num, _ := s.repo.OnlineNumber()
	ret.OnlineNum = num
	return ret, nil
}

func (s *System) Statistics(ip string) error {
	return s.repo.Statistics(ip, time.Now().Unix())
}
