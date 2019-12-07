package event

import (
	"github.com/CodFrm/cxmooc-tools/server/domain/event"
	"github.com/CodFrm/cxmooc-tools/server/domain/repository/persistence"
	"github.com/asaskevich/EventBus"
)

// 应该依靠mq来保证最终一致的,这里就简单点了
var evbus EventBus.Bus

func init() {
	evbus = EventBus.New()
	newIntegralEvent()
}

type integral struct {
	integral *event.Integral
}

func newIntegralEvent() *integral {
	i := &integral{
		integral: event.NewIntegralDomainEvent(persistence.NewIntegralRepository()),
	}
	if err := evbus.Subscribe("user:create", i.UserCreate()); err != nil {
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
