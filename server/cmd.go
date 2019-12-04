package main

import (
	"github.com/CodFrm/cxmooc-tools/server/interface/handler"
	"log"
	"net"
	"net/http"
)

var listen net.Listener

func main() {
	var err error
	listen, err = net.Listen("tcp", ":8080")
	if err != nil {
		log.Fatal("listen tcp error: ", err)
	}
	httpServer := http.Server{
		Handler: handler.NewApi(),
	}
	if err := httpServer.Serve(listen); err != nil {
		log.Fatal("server start error: ", err)
	}
}
