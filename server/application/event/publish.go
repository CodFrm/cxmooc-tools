package event

func UserCreate(user, token string) {
	evbus.Publish("user:create", user, token)
}

func SubmitTopic(token string, num int) {
	evbus.Publish("topic:submit_new_topic", token, num)
}
