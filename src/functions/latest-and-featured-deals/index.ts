import { APIGatewayProxyResult, APIGatewayProxyEvent, Context } from "aws-lambda"
import { DynamoDBClient, GetItemCommand } from "@aws-sdk/client-dynamodb"

export const handler = async (
    event: APIGatewayProxyEvent,
    context: Context
): Promise<APIGatewayProxyResult> => {
    const pathParameter = event.pathParameters?.category

    const client = new DynamoDBClient({ region: context.invokedFunctionArn.split(":")[3] })

    const queryFor =
        pathParameter === undefined
            ? "FRONTPAGE"
            : pathParameter !== "editorschoice"
            ? `CATEGORY#${pathParameter.toUpperCase()}`
            : "EDITORSCHOICEPAGE"

    const getDeals = new GetItemCommand({
        TableName: "Deal",
        Key: {
            PK: {
                S: queryFor,
            },
            SK: {
                S: queryFor,
            },
        },
    })

    try {
        const response = await client.send(getDeals)
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
