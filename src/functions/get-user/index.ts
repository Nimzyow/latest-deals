import { APIGatewayProxyResult, APIGatewayProxyEvent, Context } from "aws-lambda"
import { DynamoDBClient, GetItemCommand } from "@aws-sdk/client-dynamodb"

export const handler = async (
    event: APIGatewayProxyEvent,
    context: Context
): Promise<APIGatewayProxyResult> => {
    const user = event.pathParameters?.user

    if (user === undefined) {
        return {
            statusCode: 400,
            body: JSON.stringify({
                message: "user query parameter is required",
            }),
        }
    }

    const client = new DynamoDBClient({ region: context.invokedFunctionArn.split(":")[3] })

    const getUser = new GetItemCommand({
        TableName: "Deal",
        Key: {
            PK: { S: `USER#${user}` },
            SK: { S: `USER#${user}` },
        },
    })

    try {
        const response = await client.send(getUser)
        return {
            statusCode: 200,
            body: JSON.stringify(response),
        }
    } catch (error) {
        console.log(error)
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: "some error happened",
            }),
        }
    }
}
