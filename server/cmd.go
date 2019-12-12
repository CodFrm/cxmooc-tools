package main

import (
	"github.com/CodFrm/cxmooc-tools/server/internal/middleware"
	"log"
	"net"
	"net/http"

	"github.com/CodFrm/cxmooc-tools/server/application/event/subscribe"

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
	handle := handler.NewApi()
	handle, listen, err := middleware.HotRestart(handle, config.AppConfig.Listen)
	if err != nil {
		log.Fatalf("listen tcp error: %v", err)
	}
	httpServer := http.Server{
		Handler: handle,
	}

	if err := httpServer.Serve(listen); err != nil {
		log.Fatalf("server start error: %v", err)
	}
}
