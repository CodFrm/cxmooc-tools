package vcode

import (
	"github.com/CodFrm/cxmooc-tools/server/infrastructure/config"
	"net"
	"time"
)

type callback chan interface{}

type pack struct {
	callback callback
	image    []byte
}

var vcode chan *pack

func init() {
	vcode = make(chan *pack, 100)
	go func() {
		for {
			p := <-vcode
			go func(pkg *pack) {
				conn, err := net.Dial("tcp", config.AppConfig.VCodeServer)
				if err != nil {
					p.callback <- err
					return
				}
				defer conn.Close()
				if err := conn.SetWriteDeadline(time.Now().Add(time.Second * 10)); err != nil {
					p.callback <- err
					return
				}
				if _, err := conn.Write(packData(pkg.image)); err != nil {
					p.callback <- err
					return
				}
				if err := conn.SetReadDeadline(time.Now().Add(time.Second * 10)); err != nil {
					p.callback <- err
					return
				}
				buf := make([]byte, 4096)
				if n, err := conn.Read(buf); err != nil {
					p.callback <- err
				} else {
					p.callback <- unpackData(buf[0:n])
				}
			}(p)
		}
	}()
}

func SendImage(image []byte) (string, error) {
	pkg := &pack{
		callback: make(chan interface{}),
		image:    image,
	}
	vcode <- pkg
	//接收
	data := <-pkg.callback
	switch data.(type) {
	case error:
		return "", data.(error)
	case string:
		return data.(string), nil
	}
	return "", nil
}

func packData(data []byte) []byte {
	//TODO: 打包数据发送
	return nil
}

func unpackData(data []byte) string {
	//TODO: 解码接收数据,返回验证码
	return ""
}
