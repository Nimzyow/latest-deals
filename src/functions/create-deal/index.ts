import { APIGatewayProxyResult, APIGatewayProxyEvent, Context } from "aws-lambda"
import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb"
import KSUID from "ksuid"

export const handler = async (
    event: APIGatewayProxyEvent,
    context: Context
): Promise<APIGatewayProxyResult> => {
    const client = new DynamoDBClient({ region: context.invokedFunctionArn.split(":")[3] })
    const {
        title,
        link,
        price,
        category,
        brand,
    }: { brand: unknown; category: unknown; price: unknown; link: unknown; title: unknown } = JSON.parse(
        event.body as string
    )
    if (
        typeof brand !== "string" ||
        typeof category !== "string" ||
        typeof price !== "string" ||
        typeof link !== "string" ||
        typeof title !== "string"
    ) {
        return {
            statusCode: 400,
            body: JSON.stringify({
                message: "incorrect inputs",
            }),
        }
    }

    const ksuid = await KSUID.random()
    const createdAtDate = new Date().toISOString()
    const startOfCreatedAtDate = createdAtDate.slice(0, createdAtDate.length - 13) + "00:00:00"

    const createDeal = new PutItemCommand({
        TableName: "Deal",
        Item: {
            PK: { S: `DEAL#${ksuid.string}` },
            SK: { S: `DEAL#${ksuid.string}` },
            Entity: { S: "Deal" },
            Title: { S: title.charAt(0).toUpperCase() + title.slice(1) },
            Link: { S: link },
            Price: { S: price.toString() },
            Category: { S: category.charAt(0).toUpperCase() + category.slice(1) },
            Brand: { S: brand.charAt(0).toUpperCase() + brand.slice(1) },
            DealId: { S: ksuid.string },
            CreatedAt: { S: createdAtDate.slice(0, createdAtDate.length - 5) },
            GSI1PK: { S: `DEALS#${startOfCreatedAtDate}` },
            GSI1SK: { S: `DEAL#${ksuid.string}` },
            GSI2PK: { S: `BRAND#${brand.toUpperCase()}#${startOfCreatedAtDate}` },
            GSI2SK: { S: `DEAL#${ksuid.string}` },
            GSI3PK: { S: `CATEGORY#${category.toUpperCase()}#${startOfCreatedAtDate}` },
            GSI3SK: { S: `DEAL#${ksuid.string}` },
        },
    })

    try {
        const response = await client.send(createDeal)
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
