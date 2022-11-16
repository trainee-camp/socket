import {DataSource} from "typeorm";
import {ChatSchema} from "./schema/chat.schema";
import {MessageSchema} from "./schema/message.schema";

require('dotenv').config()
const {
    PSQL_USER,
    PSQL_HOST,
    PSQL_PORT,
    PSQL_PASSWORD,
    PSQL_NAME
} = process.env

export default new DataSource({
    type: "postgres",
    username: PSQL_USER,
    database: PSQL_NAME,
    host: PSQL_HOST,
    port: Number(PSQL_PORT),
    password: PSQL_PASSWORD,
    entities: [ChatSchema, MessageSchema],
    synchronize: true
})