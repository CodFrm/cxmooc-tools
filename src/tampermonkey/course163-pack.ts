let hook = function () {
    try {
        console.log("hook");
        var hook = (<any>window).edu.u._$$ChoiceQuestionUI.prototype;
        var original = hook.__buildQuestionInfo;
        hook.__buildQuestionInfo = function () {
            original.apply(this);
            var dtos = this.__recordDto.questionDto.optionDtos;
            var input = this.__choicebox.querySelectorAll("input");
            setTimeout(function () {
                for (var i = 0; i < dtos.length; i++) {
                    if (dtos[i].answer) {
                        input[i].click();
                    }
                }
            }, 0);
        };
    } catch (a) {
        setTimeout(hook, 0);
    }
};
window.addEventListener("load", hook);