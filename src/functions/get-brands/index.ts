import { APIGatewayProxyResult, APIGatewayProxyEvent, Context } from "aws-lambda"
import { DynamoDBClient, GetItemCommand } from "@aws-sdk/client-dynamodb"

export const handler = async (
    event: APIGatewayProxyEvent,
    context: Context
): Promise<APIGatewayProxyResult> => {
    const dealId = event.queryStringParameters?.name

    if (dealId === undefined) {
        return {
            statusCode: 400,
            body: JSON.stringify({
                message: "name query parameter is required",
            }),
        }
    }

    const client = new DynamoDBClient({ region: context.invokedFunctionArn.split(":")[3] })

    const getDeal = new GetItemCommand({
        TableName: "Deal",
        Key: {
            PK: { S: `DEAL#${dealId}` },
            SK: { S: `DEAL#${dealId}` },
        },
    })

    try {
        const response = client.send(getDeal)
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
