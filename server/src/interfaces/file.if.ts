import {Stream} from "stream";

export interface File_If {
    originalname: string,
    buffer: string | Stream,

    [key: string]: any
}