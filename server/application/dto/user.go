package dto

import "github.com/CodFrm/cxmooc-tools/server/domain/entity"

type User struct {
	User  string
	Token string
}

type TokenTransaction struct {
	Token  string
	Num    int
	AddNum int
}

func ToUser(e *entity.UserEntity) *User {
	return &User{
		User:  e.User,
		Token: e.Token,
	}
}
