import { APIGatewayProxyResult, APIGatewayProxyEvent, Context } from "aws-lambda"
import { DynamoDBClient, TransactWriteItemsCommand } from "@aws-sdk/client-dynamodb"

export const handler = async (
    event: APIGatewayProxyEvent,
    context: Context
): Promise<APIGatewayProxyResult> => {
    const client = new DynamoDBClient({ region: context.invokedFunctionArn.split(":")[3] })

    const { brand, username }: { brand: unknown; username: unknown } = JSON.parse(event.body as string)
    if (typeof brand !== "string" || typeof username !== "string") {
        return {
            statusCode: 400,
            body: JSON.stringify({
                message: "brand and username is required",
            }),
        }
    }

    const transactWriteItems = new TransactWriteItemsCommand({
        TransactItems: [
            {
                Put: {
                    TableName: "Deal",
                    Item: {
                        PK: { S: `BRANDWATCH#${brand.toUpperCase()}` },
                        SK: { S: `USER#${username}` },
                    },
                    ConditionExpression: "attribute_not_exists(SK)",
                },
            },
            {
                Update: {
                    TableName: "Deal",
                    Key: {
                        PK: { S: `BRAND#${brand.toUpperCase()}` },
                        SK: { S: `BRAND#${brand.toUpperCase()}` },
                    },
                    ConditionExpression: "attribute_exists(PK)",
                    UpdateExpression: "SET #watches = #watches + :increment",
                    ExpressionAttributeNames: {
                        "#watches": "Watches",
                    },
                    ExpressionAttributeValues: {
                        ":increment": { N: "1" },
                    },
                },
            },
        ],
    })

    try {
        const response = await client.send(transactWriteItems)
        return {
            statusCode: 200,
            body: JSON.stringify(response),
        }
    } catch (error) {
        console.log(error)
        return {
            statusCode: 500,
            body: JSON.stringify({
                error,
            }),
        }
    }
}
