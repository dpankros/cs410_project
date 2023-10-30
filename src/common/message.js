export class Message {
    constructor(body) {
        this.schema.validate(body);
        this._body = body;
    }

    get schema() {
        throw new Error("Schema property must be implemented as a Yup schema")
    }
    get json() {
        return this._body;
    }

    set json(j) {
        this.schema.validate(j);
        this._body = j
    }

    static from(json) {
        return new Message(json);
    }
}
