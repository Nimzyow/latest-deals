import { APIGatewayProxyResult, APIGatewayProxyEvent, Context } from "aws-lambda"
import { DynamoDBClient } from "@aws-sdk/client-dynamodb"

export const lambdaHandler = async (
    event: APIGatewayProxyEvent,
    context: Context
): Promise<APIGatewayProxyResult> => {
    const client = new DynamoDBClient({ region: context.invokedFunctionArn.split(":")[3] })

    let response: APIGatewayProxyResult
    try {
        response = {
            statusCode: 200,
            body: JSON.stringify({
                message: "hello world!!!!!!!!",
            }),
        }
    } catch (err: unknown) {
        console.log(err)
        response = {
            statusCode: 500,
            body: JSON.stringify({
                message: err instanceof Error ? err.message : "some error happened",
            }),
        }
    }

    return response
}
