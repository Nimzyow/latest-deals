import { APIGatewayProxyResult, APIGatewayProxyEvent, Context } from "aws-lambda"
import { DynamoDBClient, QueryCommand } from "@aws-sdk/client-dynamodb"

export const handler = async (
    event: APIGatewayProxyEvent,
    context: Context
): Promise<APIGatewayProxyResult> => {
    const category = event.pathParameters?.category

    if (typeof category !== "string") {
        return {
            statusCode: 400,
            body: JSON.stringify({
                message: "brand is required",
            }),
        }
    }

    const client = new DynamoDBClient({ region: context.invokedFunctionArn.split(":")[3] })
    const date = new Date()
    const getDeals = new QueryCommand({
        TableName: "Deal",
        IndexName: "GSI3",
        KeyConditionExpression: "#gsi3pk = :gsi3pk",
        ExpressionAttributeNames: {
            "#gsi3pk": "GSI3PK",
        },
        ExpressionAttributeValues: {
            ":gsi3pk": {
                S: `CATEGORY#${category.toUpperCase()}#${date.getFullYear()}-${
                    date.getMonth() + 1
                }-${date.getDate()}T00:00:00`,
            },
        },
    })

    try {
        const response = await client.send(getDeals)
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
