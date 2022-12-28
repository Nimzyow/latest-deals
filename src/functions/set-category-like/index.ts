import { APIGatewayProxyResult, APIGatewayProxyEvent, Context } from "aws-lambda"
import { DynamoDBClient, TransactWriteItemsCommand } from "@aws-sdk/client-dynamodb"

export const handler = async (
    event: APIGatewayProxyEvent,
    context: Context
): Promise<APIGatewayProxyResult> => {
    const client = new DynamoDBClient({ region: context.invokedFunctionArn.split(":")[3] })

    const { category, username }: { category: unknown; username: unknown } = JSON.parse(
        event.body as string
    )
    if (typeof category !== "string" || typeof username !== "string") {
        return {
            statusCode: 400,
            body: JSON.stringify({
                message: "category and username is required",
            }),
        }
    }

    const transactWriteItems = new TransactWriteItemsCommand({
        TransactItems: [
            {
                Put: {
                    TableName: "Deal",
                    Item: {
                        PK: { S: `CATEGORY#${category.toUpperCase()}#${username}` },
                        SK: { S: `CATEGORY#${category.toUpperCase()}#${username}` },
                    },
                    ConditionExpression: "attribute_not_exists(PK)",
                },
            },
            {
                Update: {
                    TableName: "Deal",
                    Key: {
                        PK: { S: `CATEGORY#${category.toUpperCase()}` },
                        SK: { S: `CATEGORY#${category.toUpperCase()}` },
                    },
                    ConditionExpression: "attribute_exists(PK)",
                    UpdateExpression: "SET #likes = #likes + :increment",
                    ExpressionAttributeNames: {
                        "#likes": "Likes",
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
