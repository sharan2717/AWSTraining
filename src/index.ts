import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
export const handler=(event:APIGatewayProxyEventV2):APIGatewayProxyResultV2=>{

    return {
        statusCode:200,
        body : "hi"
    }


}