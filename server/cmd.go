package main

import (
	"github.com/CodFrm/cxmooc-tools/server/application/event"
	"github.com/CodFrm/cxmooc-tools/server/infrastructure/config"
	"github.com/asaskevich/EventBus"
	"log"
	"net"
	"net/http"

	"github.com/CodFrm/cxmooc-tools/server/interface/handler"
)

var listen net.Listener

func main() {
	var err error
	err = config.Init("config.yaml")
	if err != nil {
		log.Fatalf("config error: %v", err)
	}
	event.Init(EventBus.New())
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
