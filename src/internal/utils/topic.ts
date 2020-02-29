
export interface Topic {
    SetTopic(content: string, type: number): void
    AddOption(option: Option): void
}

export interface Option {
    Equal(option: string, content: string): boolean
}

export class TopicList {

    protected topic: Array<Topic>

    public AddTopic(topic: Topic) {
        this.topic.push(topic);
    }

        
}
