package entity

import (
	"github.com/CodFrm/cxmooc-tools/server/internal/utils"
	"strconv"
)

type TopicEntity struct {
	Id         int64
	hash       string
	topic      string
	Type       int32
	Answer     []*Answer
	Correct    []*Answer
	Ip         string
	CreateTime int64
	UpdateTime int64
	Platform   string
	Token      string
}

type Answer struct {
	Option  string
	Content string
}

// 特殊符号处理
var symbolMap = map[string]string{
	"，": ",", "。": ".", "（": "(", "）": ")",
	"？": "?", "：": ":", "“": "\"", "”": "\"",
}

func (t *TopicEntity) dealSpecialSymbol(topic string) string {
	ret := ""
	for _, v := range topic {
		str := string(v)
		if v, ok := symbolMap[str]; ok {
			ret += v
		} else {
			ret += str
		}
	}
	return ret
}

func (t *TopicEntity) GetTopic() string {
	return t.topic
}

func (t *TopicEntity) SetTopic(topic string) *TopicEntity {
	t.topic = t.dealSpecialSymbol(topic)
	return t
}

func (t *TopicEntity) GetHash() string {
	if t.hash == "" {
		return utils.Md5(t.GetTopic() + strconv.Itoa(int(t.Type)))
	}
	return t.hash
}

func (t *TopicEntity) SetHash(hash string) {
	t.hash = hash
}
