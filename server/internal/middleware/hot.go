package middleware

import (
	"flag"
	"net"
	"net/http"
	"os"
	"os/exec"
	"os/signal"
	"sync"
	"syscall"
)

var (
	listener net.Listener
	isReload bool
	lock     sync.WaitGroup
	once     sync.Once
	isStop   bool
)

func init() {
	flag.BoolVar(&isReload, "reload", false, "")
}

func HotRestart(handel http.Handler, port string) (http.Handler, net.Listener, error) {
	var err error
	once.Do(func() {
		if !flag.Parsed() {
			flag.Parse()
		}
		go func() {
			ch := make(chan os.Signal, 1)
			signal.Notify(ch, syscall.SIGINT, syscall.SIGTERM, syscall.SIGUSR1)
			for {
				sign := <-ch
				switch sign {
				case syscall.SIGINT, syscall.SIGTERM:
					{
						println("stop...")
						//停止
						isStop = true
						lock.Wait()
						//结束
						signal.Stop(ch)
						println("stop")
						return
					}
				case syscall.SIGUSR1:
					{
						println("reload...")
						//热重启
						tl, _ := listener.(*net.TCPListener)
						f, _ := tl.File()
						cmd := exec.Command(os.Args[0], "--reload")
						cmd.Stdout = os.Stdout
						cmd.Stdin = os.Stdin
						cmd.Stderr = os.Stderr
						cmd.ExtraFiles = []*os.File{f}
						cmd.Start()
						signal.Stop(ch)
						println("father stop")
						return
					}
				}
			}
		}()
		if isReload {
			f := os.NewFile(3, "")
			listener, _ = net.FileListener(f)
			println("child start")
		} else {
			listener, err = net.Listen("tcp", port)
		}
	})
	//优雅重启
	return http.HandlerFunc(func(writer http.ResponseWriter, request *http.Request) {
		lock.Add(1)
		if isStop {
			//不再接收新的请求
			writer.WriteHeader(400)
			writer.Write([]byte("server is stop"))
		} else {
			handel.ServeHTTP(writer, request)
		}
		lock.Done()
	}), listener, err
}
