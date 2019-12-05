package entity

type TopicEntity struct {
	Id          string
	Hash        string
	topic       string
	topicSource string
	Type        int32
	Answer      []Answer
	Correct     []Answer
	Ip          string
	User        UserEntity
	CreateTime  int64
	UpdateTime  int64
	Platform    string
}

type Answer struct {
	Option  string
	Content string
}

// 特殊符号处理
func (t *TopicEntity) dealSpecialSymbol(topic string) string {
	//TODO
	return topic
}

func (t *TopicEntity) GetTopic() string {
	return t.topic
}

func (t *TopicEntity) SetTopic(topic string) {
	t.SetTopicSource(topic)
}

func (t *TopicEntity) SetTopicSource(topic string) {
	t.topicSource = topic
	t.topic = t.dealSpecialSymbol(topic)
}

func (t *TopicEntity) GetTopicSource() string {
	return t.topicSource
}
