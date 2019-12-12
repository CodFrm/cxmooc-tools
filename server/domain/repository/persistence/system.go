package persistence

import (
	goRedis "github.com/go-redis/redis/v7"
	"strconv"
	"time"
)

type system struct {
}

func NewSystemRepository() *system {
	return &system{}
}

func (s *system) HotVersion(ver string) (string, error) {
	cmd := redis.Get("cxmooc:system:version:hot:" + ver)
	if err := cmd.Err(); err != nil {
		return "", err
	}
	return cmd.Val(), nil
}

func (s *system) NowVersion() (string, error) {
	cmd := redis.Get("cxmooc:system:version")
	if err := cmd.Err(); err != nil {
		return "", err
	}
	return cmd.Val(), nil
}

func (s *system) OnlineNumber() (int64, error) {
	t := time.Now().Unix()
	cmd := redis.ZCount("cxmooc:online", strconv.FormatInt(t-5*60, 10), strconv.FormatInt(t, 10))
	if err := cmd.Err(); err != nil {
		return 0, err
	}
	return cmd.Val(), nil
}

func (s *system) Statistics(ip string, time int64) error {
	cmd := redis.ZAdd("cxmooc:online", &goRedis.Z{
		Score:  float64(time),
		Member: ip,
	})
	if err := cmd.Err(); err != nil {
		return err
	}
	return nil
}

func (s *system) GetNotice() (string, error) {
	cmd := redis.Get("cxmooc:system:notice")
	if err := cmd.Err(); err != nil {
		return "", err
	}
	return cmd.Val(), nil
}

func (s *system) GetUpdateUrl() (string, error) {
	cmd := redis.Get("cxmooc:system:updateurl")
	if err := cmd.Err(); err != nil {
		return "", err
	}
	return cmd.Val(), nil
}
