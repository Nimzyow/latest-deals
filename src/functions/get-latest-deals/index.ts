import { APIGatewayProxyResult, APIGatewayProxyEvent, Context } from "aws-lambda"
import { DynamoDBClient, QueryCommand } from "@aws-sdk/client-dynamodb"

export const handler = async (
    event: APIGatewayProxyEvent,
    context: Context
): Promise<APIGatewayProxyResult> => {
    const client = new DynamoDBClient({ region: context.invokedFunctionArn.split(":")[3] })
    const date = new Date()
    const getDeals = new QueryCommand({
        TableName: "Deal",
        IndexName: "GSI1",
        KeyConditionExpression: "#gsi1pk = :gsi1pk",
        ExpressionAttributeNames: {
            "#gsi1pk": "GSI1PK",
        },
        ExpressionAttributeValues: {
            ":gsi1pk": {
                S: `DEALS#${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}T00:00:00`,
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
