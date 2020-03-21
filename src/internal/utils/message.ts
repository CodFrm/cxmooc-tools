type recvCallback = (data: any) => void

export interface Client {
    Recv(callback: recvCallback): void

    Send(msg: any): void
}

type serverRecvCallback = (client: Client, data: any) => void

export interface Server {
    Accept(callback: serverRecvCallback): void
}

export function NewExtensionServerMessage(port: string): extensionServerMessage {
    return new extensionServerMessage(port)
}

class extensionServerMessage implements Server {
    private port: string;
    private acceptCallback: serverRecvCallback;

    constructor(port: string) {
        this.port = port;
        this.recv();
    }

    private recv(): void {
        //监听消息
        chrome.runtime.onConnect.addListener((port) => {
            if (port.name != this.port) {
                return;
            }
            port.onMessage.addListener((request) => {
                this.acceptCallback(new extensionClientMessage(port), request);
            });
        });
    }

    public Accept(callback: serverRecvCallback): void {
        this.acceptCallback = callback
    }

}

abstract class msg {
    protected tag: string;
    protected recvCallback: recvCallback;

    constructor(tag: string) {
        this.tag = tag;
    }

    public Recv(callback: recvCallback): void {
        this.recvCallback = callback;
    }
}

// 扩展中使用
export function NewExtensionClientMessage(tag: string): Client {
    return new extensionClientMessage(tag)
}

class extensionClientMessage extends msg implements Client {
    private conn: chrome.runtime.Port;

    constructor(param: string | chrome.runtime.Port) {
        if (typeof param === 'string') {
            super(param as string);
            this.connect();
        } else {
            this.conn = param as chrome.runtime.Port;
        }
        this.recv();
    }

    private connect(): void {
        this.conn = chrome.runtime.connect({ name: this.tag });
    }

    private recv() {
        this.conn.onMessage.addListener((response) => {
            this.recvCallback(response);
        });
    }

    public Send(msg: any): void {
        this.conn.postMessage(msg);
    }
}

// 浏览器中使用
export function NewChromeServerMessage(tag: string): Server {
    return new chromeServerMessage(tag)
}

class chromeServerMessage implements Server {

    private tag: string;
    private acceptCallback: serverRecvCallback;

    constructor(tag: string) {
        this.tag = tag;
        this.recv();
    }

    private recv(): void {
        window.addEventListener('message', (event) => {
            if (event.data.tag == this.tag && event.data.conn_tag && event.data.source == "client") {
                this.acceptCallback(new chromeClientMessage(this.tag, event.data.conn_tag), event.data.msg)
            }
        });
    }

    public Accept(callback: serverRecvCallback): void {
        this.acceptCallback = callback
    }

}

export function NewChromeClientMessage(tag: string): Client {
    return new chromeClientMessage(tag)
}

class chromeClientMessage extends msg implements Client {

    private source: string;
    private connTag: number;

    constructor(tag: string, conn?: number) {
        if (conn !== undefined) {
            super(tag);
            this.connTag = conn;
            this.source = "server";
        } else {
            super(tag);
            this.connect();
            this.source = "client";
        }
    }

    private connect(): void {
        this.connTag = Math.random();
        window.addEventListener('message', (event) => {
            if (event.data.tag == this.tag && event.data.conn_tag == this.connTag && event.data.source == "server") {
                this.recvCallback && this.recvCallback(event.data.msg);
            }
        });
    }

    public Send(msg: any): void {
        window.postMessage({ tag: this.tag, conn_tag: this.connTag, msg: msg, source: this.source }, '*');
    }
}

