import { APIGatewayProxyResult, APIGatewayProxyEvent, Context } from "aws-lambda"
import { DynamoDBClient, GetItemCommand } from "@aws-sdk/client-dynamodb"

export const handler = async (
    event: APIGatewayProxyEvent,
    context: Context
): Promise<APIGatewayProxyResult> => {
    const brand = event.pathParameters?.brand

    console.log(brand)

    if (brand === undefined) {
        return {
            statusCode: 400,
            body: JSON.stringify({
                message: "brand query parameter is required",
            }),
        }
    }

    const client = new DynamoDBClient({ region: context.invokedFunctionArn.split(":")[3] })

    const getBrand = new GetItemCommand({
        TableName: "Deal",
        Key: {
            PK: { S: `BRAND#${brand.toUpperCase()}` },
            SK: { S: `BRAND#${brand.toUpperCase()}` },
        },
    })

    try {
        const response = await client.send(getBrand)
        console.log(response)
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
