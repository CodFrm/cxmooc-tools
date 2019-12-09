package main

import (
	"github.com/CodFrm/cxmooc-tools/server/application/event/subscribe"
	"log"
	"net"
	"net/http"

	"github.com/CodFrm/cxmooc-tools/server/domain/repository/persistence"
	"github.com/CodFrm/cxmooc-tools/server/infrastructure/config"
	"github.com/CodFrm/cxmooc-tools/server/interface/handler"
	"github.com/CodFrm/cxmooc-tools/server/internal/mq"
	"github.com/asaskevich/EventBus"
)

var listen net.Listener

func main() {
	var err error
	err = config.Init("config.yaml")
	if err != nil {
		log.Fatalf("config error: %v", err)
	}

	persistence.Init()
	mq.Init(EventBus.New())
	subscribe.Init()

	listen, err = net.Listen("tcp", ":8080")
	if err != nil {
		log.Fatalf("listen tcp error: %v", err)
	}
	httpServer := http.Server{
		Handler: handler.NewApi(),
	}
	if err := httpServer.Serve(listen); err != nil {
		log.Fatalf("server start error: %v", err)
	}
}
