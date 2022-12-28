import { APIGatewayProxyResult, APIGatewayProxyEvent, Context } from "aws-lambda"
import { DynamoDBClient, QueryCommand } from "@aws-sdk/client-dynamodb"

export const handler = async (
    event: APIGatewayProxyEvent,
    context: Context
): Promise<APIGatewayProxyResult> => {
    const username = event.pathParameters?.username

    const client = new DynamoDBClient({ region: context.invokedFunctionArn.split(":")[3] })

    const getMessages = new QueryCommand({
        TableName: "Deal",
        KeyConditionExpression: "#pk = :pk",
        ExpressionAttributeNames: {
            "#pk": "PK",
        },
        ExpressionAttributeValues: {
            ":pk": {
                S: `MESSAGES#${username}`,
            },
        },
        ScanIndexForward: false,
    })

    try {
        const response = await client.send(getMessages)
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
