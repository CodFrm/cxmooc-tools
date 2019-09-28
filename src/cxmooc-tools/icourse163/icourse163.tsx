import * as $ from "jquery";

export class Icourse163 {
    public Init(): void {
        $('#g-body').on('click', '.f-fl', function () {
            let topic = $('.m-choiceQuestion');
            if (topic.length > 0) {
                console.log(topic);
            }
            console.log("dj dj");
        });
    }

}
