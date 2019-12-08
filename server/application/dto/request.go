package dto

type JsonMsg struct {
	Code int    `json:"code"`
	Msg  string `json:"msg"`
}

type InternalAddMsg struct {
	AddTokenNum int `json:"add_token_num"`
	TokenNum    int `json:"token_num"`
}
