package persistence

import (
	"encoding/json"
	"github.com/CodFrm/cxmooc-tools/server/domain/entity"
	"github.com/CodFrm/cxmooc-tools/server/internal/utils"
)

type topic struct {
}

func NewTopicRepository() *topic {
	return &topic{}
}

type topicDO struct {
	ID         int64  `gorm:"column:id" json:"id" form:"id"`
	Topic      string `gorm:"column:topic" json:"topic" form:"topic"`
	Hash       string `gorm:"column:hash" json:"hash" form:"hash"`
	Type       int32  `gorm:"column:type" json:"type" form:"type"`
	Answer     string `gorm:"column:answer" json:"answer" form:"answer"`
	Correct    string `gorm:"column:correct" json:"correct" form:"correct"`
	Ip         string `gorm:"column:ip" json:"ip" form:"ip"`
	Createtime int64  `gorm:"column:createtime" json:"createtime" form:"createtime"`
	Updatetime int64  `gorm:"column:updatetime" json:"updatetime" form:"updatetime"`
	Platform   string `gorm:"column:platform" json:"platform" form:"platform"`
	Token      string `gorm:"column:token" json:"token" form:"token"`
}

func (t *topicDO) TableName() string {
	return "topic"
}

func (t *topic) SearchTopic(topic *entity.TopicEntity) ([]*entity.TopicEntity, error) {
	topicDO := make([]topicDO, 0)
	if err := mysql.Raw("select * from topic where topic like ? limit 4", topic.GetTopic()+"%").
		Scan(&topicDO).Error; err != nil {
		return nil, err
	}
	ret := make([]*entity.TopicEntity, 0)
	for _, v := range topicDO {
		ret = append(ret, t.doToEntity(&v))
	}
	return ret, nil
}

func (t *topic) doToEntity(do *topicDO) *entity.TopicEntity {
	answer := make([]*entity.Answer, 0)
	json.Unmarshal([]byte(do.Answer), &answer)
	correct := make([]*entity.Answer, 0)
	json.Unmarshal([]byte(do.Correct), &correct)
	tmp := &entity.TopicEntity{
		Id:         do.ID,
		Type:       do.Type,
		Answer:     answer,
		Correct:    correct,
		Ip:         do.Ip,
		CreateTime: do.Createtime,
		UpdateTime: do.Updatetime,
		Platform:   do.Platform,
		Token:      do.Token,
	}
	tmp.SetTopic(do.Topic)
	tmp.SetHash(do.Hash)
	return tmp
}

func (t *topic) Save(topicEntity *entity.TopicEntity) error {
	do := &topicDO{
		ID:         topicEntity.Id,
		Topic:      topicEntity.GetTopic(),
		Hash:       topicEntity.GetHash(),
		Type:       topicEntity.Type,
		Answer:     utils.Json(topicEntity.Answer),
		Correct:    utils.Json(topicEntity.Correct),
		Ip:         topicEntity.Ip,
		Createtime: topicEntity.CreateTime,
		Updatetime: topicEntity.UpdateTime,
		Platform:   topicEntity.Platform,
		Token:      topicEntity.Token,
	}
	if do.ID > 0 {
		return mysql.Model(do).Update(do).Error
	}
	return mysql.Save(do).Error
}

func (t *topic) Exist(topicEntity *entity.TopicEntity) (bool, error) {
	count := 0
	err := mysql.Model(&topicDO{}).Where("hash=?", topicEntity.GetHash()).Count(&count).Error
	if err != nil {
		return false, err
	}
	return count > 0, nil
}

func (t *topic) FindByHash(hash string) (*entity.TopicEntity, error) {
	do := &topicDO{}
	err := mysql.Model(&topicDO{}).Where("hash=?", hash).Limit(1).Scan(do).Error
	if err != nil {
		return nil, err
	}
	return t.doToEntity(do), nil
}
