import {object, string} from "yup";
import {Message} from "./message";

export class NewPageMessage extends Message {
    get schema() {
        return object({
            body: string().required(),
        });
    }
}
