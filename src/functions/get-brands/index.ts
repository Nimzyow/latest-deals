import { APIGatewayProxyResult, APIGatewayProxyEvent, Context } from "aws-lambda"
import { DynamoDBClient, GetItemCommand } from "@aws-sdk/client-dynamodb"

export const handler = async (
    event: APIGatewayProxyEvent,
    context: Context
): Promise<APIGatewayProxyResult> => {
    const client = new DynamoDBClient({ region: context.invokedFunctionArn.split(":")[3] })

    const getBrands = new GetItemCommand({
        TableName: "Deal",
        Key: {
            PK: { S: "BRANDS" },
            SK: { S: "BRANDS" },
        },
    })

    try {
        const response = await client.send(getBrands)
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
