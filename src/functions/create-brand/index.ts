import { APIGatewayProxyResult, APIGatewayProxyEvent, Context } from "aws-lambda"
import { DynamoDBClient, TransactWriteItemsCommand } from "@aws-sdk/client-dynamodb"

export const handler = async (
    event: APIGatewayProxyEvent,
    context: Context
): Promise<APIGatewayProxyResult> => {
    const client = new DynamoDBClient({ region: context.invokedFunctionArn.split(":")[3] })
    const { brandLogoUrl, brandName }: { brandName: unknown; brandLogoUrl: unknown } = JSON.parse(
        event.body as string
    )
    if (typeof brandName !== "string" || typeof brandLogoUrl !== "string") {
        return {
            statusCode: 400,
            body: JSON.stringify({
                message: "incorrect inputs",
            }),
        }
    }

    const createBrand = new TransactWriteItemsCommand({
        TransactItems: [
            {
                Put: {
                    TableName: "Deal",
                    Item: {
                        PK: { S: `BRAND#${brandName.toUpperCase()}` },
                        SK: { S: `BRAND#${brandName.toUpperCase()}` },
                        Entity: { S: "Brand" },
                        Brand: {
                            S: brandName.charAt(0).toUpperCase() + brandName.slice(1),
                        },
                        BrandLogoUrl: { S: brandLogoUrl },
                        Likes: { N: "0" },
                        Watches: { N: "0" },
                    },
                },
            },
            {
                Update: {
                    TableName: "Deal",
                    Key: {
                        PK: { S: "BRANDS" },
                        SK: { S: "BRANDS" },
                    },
                    UpdateExpression: "ADD #brands :brand",
                    ExpressionAttributeNames: {
                        "#brands": "Brands",
                    },
                    ExpressionAttributeValues: {
                        ":brand": { SS: [brandName.charAt(0).toUpperCase() + brandName.slice(1)] },
                    },
                },
            },
        ],
    })

    try {
        const response = await client.send(createBrand)
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
