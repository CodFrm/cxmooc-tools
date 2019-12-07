package dto

type User struct {
	User  string
	Token string
}

type TokenTransaction struct {
	Token  string
	Num    int
	AddNum int
}
