package vcode

import (
	"bytes"
	"encoding/binary"
	"github.com/CodFrm/cxmooc-tools/server/infrastructure/config"
	"github.com/CodFrm/cxmooc-tools/server/internal/utils"
	"io"
	"net"
	"time"
)

type callback chan interface{}

type pack struct {
	callback callback
	version  [4]byte
	len      int32
	tag      [8]byte
	time     int64
	data     []byte
}

var vcode chan *pack

func init() {
	vcode = make(chan *pack, 10)
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
				b, err := packData(pkg)
				if err != nil {
					p.callback <- err
					return
				}
				if _, err := conn.Write(b); err != nil {
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
					if pkg, err := unpackData(bytes.NewReader(buf[0:n])); err != nil {
						p.callback <- err
					} else {
						p.callback <- pkg
					}
				}
			}(p)
		}
	}()
}

func SendImage(image []byte) (string, error) {
	var tag [8]byte
	for k, v := range utils.RandStringRunes(8) {
		tag[k] = byte(v)
	}
	pkg := &pack{
		version:  [4]byte{'v', '1', 0, 0},
		tag:      tag,
		callback: make(chan interface{}),
		data:     image,
	}
	vcode <- pkg
	//接收
	data := <-pkg.callback
	switch data.(type) {
	case error:
		return "", data.(error)
	case *pack:
		return string(data.(*pack).data), nil
	}
	return "", nil
}

func packData(pack *pack) ([]byte, error) {
	pack.len = int32(24 + len(pack.data))
	pack.time = time.Now().Unix()
	var ret = make([]byte, pack.len)
	var err error
	io := new(bytes.Buffer)
	err = binary.Write(io, binary.BigEndian, &pack.version)
	err = binary.Write(io, binary.BigEndian, &pack.len)
	err = binary.Write(io, binary.BigEndian, &pack.tag)
	err = binary.Write(io, binary.BigEndian, &pack.time)
	err = binary.Write(io, binary.BigEndian, &pack.data)
	_, err = io.Read(ret)
	return ret, err
}

func unpackData(io io.Reader) (*pack, error) {
	var err error
	ret := pack{}
	err = binary.Read(io, binary.BigEndian, &ret.version)
	err = binary.Read(io, binary.BigEndian, &ret.len)
	err = binary.Read(io, binary.BigEndian, &ret.tag)
	err = binary.Read(io, binary.BigEndian, &ret.time)
	ret.data = make([]byte, ret.len-24)
	err = binary.Read(io, binary.BigEndian, &ret.data)
	return &ret, err
}
