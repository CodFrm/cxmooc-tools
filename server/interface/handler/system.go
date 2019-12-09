package handler

import (
	"github.com/CodFrm/cxmooc-tools/server/application/service"
	"net/http"
)

type system struct {
	system *service.System
}

func newSystemHandler(r *http.ServeMux) *system {
	s := &system{
		system: service.NewSystemService(),
	}

	r.HandleFunc("/update", s.Update())

	return s
}

func (s *system) Update() func(w http.ResponseWriter, r *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		d, err := s.system.Update(r.URL.Query().Get("ver"))
		if err != nil {
			serverError(w, err)
			return
		}
		json_map(w, d)
	}
}

func (s *system) Statistics(ip string) {
	s.system.Statistics(ip)
}
