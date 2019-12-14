package publish

import "github.com/CodFrm/cxmooc-tools/server/internal/mq"

func UserCreate(user, token string) {
	mq.Evbus.Publish("user:create", user, token)
}

func SubmitTopic(token string, num int) {
	mq.Evbus.Publish("topic:submit_new_topic", token, num)
}

func ImportTopic(token string, num int) {
	mq.Evbus.Publish("topic:import_new_topic", token, num)
}
