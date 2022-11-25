import {createClient} from "redis";

export default function connect(connectionData: {
    url: string
}) {
    return createClient(connectionData)
}