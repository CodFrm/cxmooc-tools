(<any>global).window = global;
import { removeHTML, dealHotVersion } from "@App/internal/utils/utils";

describe("remove html", () => {
    it("不包含html", () => {
        let eg = "这是一句正常的话,应该不要发送改变";
        expect(removeHTML(eg)).toEqual(eg);
        expect(removeHTML("包含一些中文符号，例如：（）？这样一些“”")).toEqual("包含一些中文符号,例如:()?这样一些\"\"");
    })
    it("包含html", () => {
        expect(removeHTML('<a href="javascript:void(0);"><p>选择3</p></a>')).toEqual("javascript:void(0);选择3");

        expect(removeHTML('<p>测试单选题<img src="https://p.ananas.chaoxing.com/star3/origin/8c1d31628eeca926c251bffd4968627e.png" title="1.png" alt="1.png" width="54" height="54" border="0" vspace="0" style="width: 54px; height: 54px;" data-original="https://p.ananas.chaoxing.com/star3/origin/8c1d31628eeca926c251bffd4968627e.png"></p></div>')).toEqual("测试单选题https://p.ananas.chaoxing.com/star3/origin/8c1d31628eeca926c251bffd4968627e.png");

        expect(removeHTML('<p><iframe data="91e555f94f1954d98dddda68d20fb2a3" height="62px" width="auto" frameborder="0" allowtransparency="true" style="background-color:transparent;border-radius: 3px;overflow: hidden;z-index: 0;" scrolling="no" src="/module/audioplay.html?objectid=91e555f94f1954d98dddda68d20fb2a3&amp;resids=439200623890747392&amp;puid=36250294" class="ans-insertaudio-module" module="_insertaudio" __idm_id__="15520769"> </iframe></p><p>单4<br></p>')).toEqual("/module/audioplay.html?objectid=91e555f94f1954d98dddda68d20fb2a3&amp;resids=439200623890747392&amp;puid=36250294单4");

        expect(removeHTML('<p>测试多选题目</p><p><iframe data="91e555f94f1954d98dddda68d20fb2a3" height="62px" width="auto" frameborder="0" allowtransparency="true" style="background-color:transparent;border-radius: 3px;overflow: hidden;z-index: 0;" scrolling="no" src="/module/audioplay.html?objectid=91e555f94f1954d98dddda68d20fb2a3&amp;resids=439200623890747392&amp;puid=36250294" class="ans-insertaudio-module" module="_insertaudio"> </iframe></p><p class="attach"><img src="/js/editor20150812/dialogs/attachment_new/fileTypeImages/icon_default.gif"><a href="/ueditorupload/read?objectId=d6671c9b4756f25d8364bc24f180216f" target="_blank" name="题库导入模板.xlsx" type="xlsx">题库导入模板.xlsx</a></p><p><br></p>')).toEqual("测试多选题目/module/audioplay.html?objectid=91e555f94f1954d98dddda68d20fb2a3&amp;resids=439200623890747392&amp;puid=36250294/js/editor20150812/dialogs/attachment_new/fileTypeImages/icon_default.gif/ueditorupload/read?objectId=d6671c9b4756f25d8364bc24f180216f");
    })
});

describe("简单方法", () => {
    it("dealHotVersion", () => {
        expect(dealHotVersion("2.12.7")).toEqual(2.127);
    });
});