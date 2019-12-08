package mq

import "github.com/asaskevich/EventBus"

var Evbus EventBus.Bus

// 应该依靠mq来保证最终一致的,这里就简单点了
func Init(ev EventBus.Bus) {
	Evbus = ev
}
