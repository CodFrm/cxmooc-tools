package dto

type JsonMsg struct {
	Code int    `json:"code"`
	Msg  string `json:"msg"`
}

type InternalAddMsg struct {
	AddTokenNum int `json:"add_token_num"`
	TokenNum    int `json:"token_num"`
}

type Update struct {
	HotVersion string `json:"hotversion"`
	Version    string `json:"version"`
	Notice     string `json:"injection"`
	Enforce    bool   `json:"enforce"`
	Url        string `json:"url"`
	OnlineNum  int64  `json:"onlinenum"`
}
