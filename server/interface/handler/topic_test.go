package handler

import (
	"github.com/stretchr/testify/assert"
	"testing"
)

func Test_topic_excelToTopic(t *testing.T) {
	// 超星
	tp := &topic{}
	topic, err := tp.excelToTopic(1, []string{
		"超星", "红楼梦的艺术价值体现在以下哪几项?", "选择", "ABC",
	})
	assert.Nil(t, err)
	assert.Equal(t, int32(2), topic.Type)
	assert.Equal(t, 3, len(topic.Correct))
	assert.Equal(t, "A", topic.Correct[0]["Option"])
	assert.Equal(t, "", topic.Correct[0]["Content"])

	topic, err = tp.excelToTopic(1, []string{
		"超星", "红楼梦的艺术价值体现在以下哪几项?", "选择", "C",
	})
	assert.Nil(t, err)
	assert.Equal(t, int32(1), topic.Type)
	assert.Equal(t, 1, len(topic.Correct))
	assert.Equal(t, "C", topic.Correct[0]["Option"])
	assert.Equal(t, "", topic.Correct[0]["Content"])

	topic, err = tp.excelToTopic(1, []string{
		"超星", "红楼梦的艺术价值体现在以下哪几项?", "选择", "问群",
	})
	assert.Nil(t, err)
	assert.Equal(t, int32(1), topic.Type)
	assert.Equal(t, 1, len(topic.Correct))
	assert.Equal(t, "A", topic.Correct[0]["Option"])
	assert.Equal(t, "问群", topic.Correct[0]["Content"])

	topic, err = tp.excelToTopic(1, []string{
		"超星", "红楼梦的艺术价值体现在以下哪几项?", "选择", "ABC", "",
	})
	assert.Nil(t, err)
	assert.Equal(t, int32(2), topic.Type)
	assert.Equal(t, 3, len(topic.Correct))

	//超星考试多选
	topic, err = tp.excelToTopic(1, []string{
		"超星考试", "西游记团队中,为什么只有唐僧适合当领导.()", "选择", "ABC", "",
	})
	assert.Error(t, err)
	topic, err = tp.excelToTopic(1, []string{
		"智慧树", "西游记团队中,为什么只有唐僧适合当领导.()", "选择", "ABC", "",
	})
	assert.Error(t, err)

	topic, err = tp.excelToTopic(1, []string{
		"超星考试", "西游记团队中,为什么只有唐僧适合当领导.()", "选择", "唐僧有坚定的信仰与信念。", "唐僧有坚定的目标。",
	})
	assert.Nil(t, err)
	assert.Equal(t, "B", topic.Correct[1]["Option"])
	assert.Equal(t, "唐僧有坚定的目标。", topic.Correct[1]["Content"])

	topic, err = tp.excelToTopic(1, []string{
		"超星考试", "超星慕课小工具文档地址和开源地址", "填空", "https://cx-doc.xloli.top/", "https://github.com/CodFrm/cxmooc-tools", "",
	})
	assert.Nil(t, err)
	assert.Equal(t, "一", topic.Correct[0]["Option"])
	assert.Equal(t, "https://cx-doc.xloli.top/", topic.Correct[0]["Content"])

	topic, err = tp.excelToTopic(1, []string{
		"超星考试", "红楼梦是清代世情小说的代表之作.", "判断", "1", "",
	})
	assert.Nil(t, err)
	assert.Equal(t, true, topic.Correct[0]["Option"])
	assert.Equal(t, true, topic.Correct[0]["Content"])

}
