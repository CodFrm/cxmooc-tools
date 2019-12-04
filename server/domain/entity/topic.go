package entity

type TopicEntity struct {
	Entity
	Hash       string
	Topic      string
	Type       int32
	Answer     []Answer
	Correct    []Answer
	Ip         string
	User       UserEntity
	CreateTime int64
	UpdateTime int64
}

type Answer struct {
	Option  string
	Content string
}

func (t *TopicEntity) CreateTopic() {

}

func (t *TopicEntity) SearchTopicAnswer() *TopicEntity {

	return nil
}
