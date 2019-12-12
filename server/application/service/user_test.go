package service

import (
	"github.com/CodFrm/cxmooc-tools/server/domain/entity"
	"github.com/CodFrm/cxmooc-tools/server/domain/repository/mocks"
	domain "github.com/CodFrm/cxmooc-tools/server/domain/service"
	"github.com/stretchr/testify/assert"
	"testing"
)

func TestNewUserService(t *testing.T) {
	user := NewUserService()
	assert.IsType(t, &User{}, user)
}

func TestUser_CheckIn(t *testing.T) {
	mock := &mocks.UserRepository{}
	mocki := &mocks.IntegralRepository{}
	mockt := &mocks.IntegerTransactionRepository{}
	user := &User{user: domain.NewUserDomainService(mock), integral: domain.NewIntegralService(mocki)}

	mock.On("FindByUser", "qq").Return(&entity.UserEntity{
		Token: "tk",
		User:  "qq",
	}, nil)
	mocki.On("Transaction").Return(mockt)

	mockt.On("Update", "tk").Return(nil)
	mockt.On("LockIntegral", "tk").Return(&entity.IntegralEntity{
		Token: "tk",
		Num:   20,
	}, nil)
	mockt.On("Commit").Return()
	mockt.On("Close").Return()

	token, err := user.CheckIn("qq")
	assert.Nil(t, err)
	assert.True(t, token.Num > 20)
	assert.Equal(t, "tk", token.Token)
}

func TestUser_GenToken(t *testing.T) {

}
