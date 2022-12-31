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
                        PK: { S: `BRANDLIKE#${brand.toUpperCase()}#${username}` },
                        SK: { S: `BRANDLIKE#${brand.toUpperCase()}#${username}` },
                    },
                    ConditionExpression: "attribute_not_exists(PK)",
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
                    UpdateExpression: "SET #likes = if_not_exists(#likes, :zero) + :increment",
                    ExpressionAttributeNames: {
                        "#likes": "Likes",
                    },
                    ExpressionAttributeValues: {
                        ":increment": { N: "1" },
                        ":zero": { N: "0" },
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
