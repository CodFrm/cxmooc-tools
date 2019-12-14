package utils

import (
	"github.com/stretchr/testify/assert"
	"testing"
)

func TestNewUpLetterIterator(t *testing.T) {
	l := NewUpLetterIterator()
	assert.Equal(t, "A", l.Value())
	l = l.Next()
	assert.Equal(t, "B", l.Value())
}
