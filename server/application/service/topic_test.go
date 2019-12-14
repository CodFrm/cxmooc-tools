package service

import (
	"errors"
	"testing"

	"github.com/CodFrm/cxmooc-tools/server/application/dto"
	"github.com/CodFrm/cxmooc-tools/server/domain/entity"
	"github.com/CodFrm/cxmooc-tools/server/domain/repository/mocks"
	domain "github.com/CodFrm/cxmooc-tools/server/domain/service"
	"github.com/CodFrm/cxmooc-tools/server/internal/mq"
	"github.com/CodFrm/cxmooc-tools/server/internal/utils"
	"github.com/asaskevich/EventBus"
	"github.com/stretchr/testify/assert"
)

// 屏蔽evbus
type ev struct {
	EventBus.Bus
}

func (e *ev) Publish(topic string, args ...interface{}) {
}

func TestMain(m *testing.M) {
	mq.Init(&ev{EventBus.New()})
	m.Run()
}

func TestTopic_SearchTopicList(t *testing.T) {
	mock := &mocks.TopicRepository{}
	topic := &Topic{
		topic: domain.NewTopicDomainService(mock),
	}
	mock.On("SearchTopic", "判断,他们简单地重复已证实的研究,在实验中只是改变一些实验材料、参量或影响不大的控制条件,在此基础上撰写和发表一些论文,对科学发展并无实质性贡献.()").
		Return([]*entity.TopicEntity{{
			Id: 1, Type: 3, Answer: []*entity.Answer{
				{Option: "true", Content: "true"},
			}, Correct: []*entity.Answer{
				{Option: "true", Content: "true"},
			}, Ip: "localhost", CreateTime: 1, UpdateTime: 2, Platform: "cx", Token: "tk",
		}}, nil)
	mock.On("SearchTopic", "单选").
		Return([]*entity.TopicEntity{{
			Id: 1, Type: 1, Answer: []*entity.Answer{
				{Option: "A", Content: "答案A"}, {Option: "B", Content: "答案B"},
			}, Correct: []*entity.Answer{
				{Option: "A", Content: "答案A"},
			}, Ip: "localhost", CreateTime: 1, UpdateTime: 2, Platform: "cx", Token: "tk",
		}}, nil)
	mock.On("SearchTopic", "多选").
		Return([]*entity.TopicEntity{{
			Id: 1, Type: 2, Answer: []*entity.Answer{
				{Option: "A", Content: "答案A"}, {Option: "B", Content: "答案B"}, {Option: "C", Content: "答案C"},
			}, Correct: []*entity.Answer{
				{Option: "A", Content: "答案A"}, {Option: "C", Content: "答案C"},
			}, Ip: "localhost", CreateTime: 1, UpdateTime: 2, Platform: "cx", Token: "tk",
		}}, nil)
	mock.On("SearchTopic", "填空").
		Return([]*entity.TopicEntity{{
			Id: 1, Type: 4, Answer: []*entity.Answer{
				{Option: "一", Content: "填空1"}, {Option: "二", Content: "填空2"},
			}, Correct: []*entity.Answer{
				{Option: "一", Content: "填空1"}, {Option: "二", Content: "填空2"},
			}, Ip: "localhost", CreateTime: 1, UpdateTime: 2, Platform: "cx", Token: "tk",
		}}, nil)
	set, err := topic.SearchTopicList([]string{
		"判断,他们简单地重复已证实的研究，在实验中只是改变一些实验材料、参量或影响不大的控制条件，在此基础上撰写和发表一些论文，对科学发展并无实质性贡献。（）",
		"单选", "多选", "填空",
	})
	assert.Nil(t, err)
	assert.Equal(t, 4, len(set))
	assert.Equal(t, "判断,他们简单地重复已证实的研究，在实验中只是改变一些实验材料、参量或影响不大的控制条件，在此基础上撰写和发表一些论文，对科学发展并无实质性贡献。（）", set[0].Topic)
	assert.Equal(t, 0, set[0].Index)

	assert.Equal(t, 1, len(set[0].Result))
	assert.Equal(t, int32(3), set[0].Result[0].Type)
	assert.Equal(t, int64(2), set[0].Result[0].Time)
	assert.Equal(t, true, set[0].Result[0].Correct[0].Option)
	assert.Equal(t, true, set[0].Result[0].Correct[0].Content)

	assert.Equal(t, 2, len(set[2].Result[0].Correct))
	assert.Equal(t, "A", set[2].Result[0].Correct[0].Option)
	assert.Equal(t, "答案A", set[2].Result[0].Correct[0].Content)

	mock.On("SearchTopic", "err").Return(nil, errors.New("error"))
	set, err = topic.SearchTopicList([]string{"err"})
	assert.Nil(t, set)
	assert.Error(t, err)

	set, err = topic.SearchTopicList([]string{""})
	assert.Nil(t, set)
	assert.Error(t, err)
}

func TestTopic_SubmitTopic(t *testing.T) {
	mock := &mocks.TopicRepository{}
	mocki := &mocks.IntegralRepository{}
	topic := &Topic{
		topic:    domain.NewTopicDomainService(mock),
		integral: domain.NewIntegralService(mocki),
	}

	topic1 := &dto.SubmitTopic{Answers: []map[string]interface{}{
		{"option": "A", "content": "选项A"}, {"option": "B", "content": "选项B"}, {"option": "C", "content": "选项C"},
	}, Correct: []map[string]interface{}{
		{"option": "A", "content": "选项A"}, {"option": "B", "content": "选项B"},
	}, Topic: "多选,中文标点。（）", Type: 2}

	topic2 := &dto.SubmitTopic{Answers: []map[string]interface{}{
		{"option": true, "content": true},
	}, Correct: []map[string]interface{}{
		{"option": true, "content": true},
	}, Topic: "判断，", Type: 3}

	mock.On("Exist", "多选,中文标点.()").Return(true, nil)
	mock.On("Exist", "判断,").Return(false, nil)

	mock.On("Save", "判断,").Return(nil)
	mock.On("Save", "多选,中文标点.()").Return(nil)

	mocki.On("GetIntegral", "tk").Return(&entity.IntegralEntity{
		Token: "tk",
		Num:   100,
	}, nil)

	et := &entity.TopicEntity{Type: 2}
	et.SetTopic("多选,中文标点.()")
	mock.On("FindByHash", "05d901980b216c5f8c6b8d6e1f6820b6").Return(et, nil)

	hash, add, err := topic.SubmitTopic([]*dto.SubmitTopic{topic1, topic2}, "localhost", "cx", "tk")
	assert.Nil(t, err)

	assert.Equal(t, utils.Md5("多选,中文标点.()2"), hash[0].Hash)
	assert.Equal(t, 10, add.AddTokenNum)
	assert.Equal(t, 110, add.TokenNum)

	topic2.Topic = "error"
	mock.On("Exist", "error").Return(false, errors.New("error"))
	_, _, err = topic.SubmitTopic([]*dto.SubmitTopic{topic1, topic2}, "localhost", "cx", "tk")
	assert.Error(t, err)

	topic2.Topic = "save error"
	mock.On("Exist", "save error").Return(false, nil)
	mock.On("Save", "save error").Return(errors.New("error"))
	_, _, err = topic.SubmitTopic([]*dto.SubmitTopic{topic1, topic2}, "localhost", "cx", "tk")
	assert.Error(t, err)

}

func TestNewTopicService(t *testing.T) {
	topic := NewTopicService()
	assert.IsType(t, &Topic{}, topic)
}
