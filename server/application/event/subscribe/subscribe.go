package subscribe

import (
	"github.com/CodFrm/cxmooc-tools/server/domain/event"
	"github.com/CodFrm/cxmooc-tools/server/domain/repository/persistence"
	"github.com/CodFrm/cxmooc-tools/server/internal/mq"
)

func Init() {
	newIntegralEvent()
}

type integral struct {
	integral *event.Integral
}

func newIntegralEvent() *integral {
	i := &integral{
		integral: event.NewIntegralDomainEvent(persistence.NewIntegralRepository()),
	}
	if err := mq.Evbus.Subscribe("user:create", i.UserCreate()); err != nil {
		panic(err)
	}

	if err := mq.Evbus.Subscribe("topic:submit_new_topic", i.SubmitTopic()); err != nil {
		panic(err)
	}

	return i
}

func (i *integral) UserCreate() func(user, token string) {
	return func(user, token string) {
		i.integral.UserCreate(user, token)
	}
}

func (i *integral) SubmitTopic() func(token string, num int) {
	return func(token string, num int) {
		i.integral.SubmitTopic(token, num)
	}
}
