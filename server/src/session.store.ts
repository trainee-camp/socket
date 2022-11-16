import {createClient} from "redis";

export function connect(connectionData: any) {
    const client = createClient(connectionData)
    return client
}