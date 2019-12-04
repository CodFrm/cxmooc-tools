package entity

type Entity struct {
	Id int64
}

func (e *Entity) GetId() int64 {
	return e.Id
}
