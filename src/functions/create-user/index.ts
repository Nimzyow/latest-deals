import { PostConfirmationConfirmSignUpTriggerEvent, Context, Callback } from "aws-lambda"
import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb"

export const handler = async (
    event: PostConfirmationConfirmSignUpTriggerEvent,
    context: Context,
    callback: Callback
) => {
    callback(null, event)
    const client = new DynamoDBClient({ region: context.invokedFunctionArn.split(":")[3] })

    const createUser = new PutItemCommand({
        TableName: "Deal",
        Item: {
            PK: { S: `USER#${event.userName.toLocaleLowerCase()}` },
            SK: { S: `USER#${event.userName.toLocaleLowerCase()}` },
            Email: { S: `${event.request.userAttributes.email}` },
            UserIndex: { S: `USER#${event.userName.toLocaleLowerCase()}` },
            Username: { S: `${event.userName}` },
        },
    })
    try {
        await client.send(createUser)
        callback(null, event)
    } catch (error) {
        console.log(error)
        callback(null, event)
    }
}
