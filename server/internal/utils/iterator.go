package utils

type Iterator interface {
	Next() Iterator
	Value() interface{}
}

type UpLetterIterator struct {
	val string
}

func NewUpLetterIterator() Iterator {
	return &UpLetterIterator{val: "A"}
}

func (u *UpLetterIterator) Next() Iterator {
	return &UpLetterIterator{val: string(u.val[0] + 1)}
}

func (u *UpLetterIterator) Value() interface{} {
	return u.val
}

type ChineseNumbersIterator struct {
	val int
}

var cn = []string{"一", "二", "三", "四", "五", "六", "七", "八", "九", "十"}

func NewChineseNumbersIterator() Iterator {
	return &ChineseNumbersIterator{val: 0}
}

func (u *ChineseNumbersIterator) Next() Iterator {
	return &ChineseNumbersIterator{val: u.val + 1}
}

func (u *ChineseNumbersIterator) Value() interface{} {
	return cn[u.val]
}

type ValueIterator struct {
	val   []interface{}
	index int
}

func NewValueIterator(val []interface{}) Iterator {
	return &ValueIterator{val: val, index: 0}
}

func (u *ValueIterator) Next() Iterator {
	return &ValueIterator{u.val, u.index + 1}
}

func (u *ValueIterator) Value() interface{} {
	return u.val[u.index]
}
