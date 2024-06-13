import * as cdk from 'aws-cdk-lib';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs/lib/function';
import { Construct } from 'constructs';
import {Duration,aws_s3, aws_lambda as lambda} from 'aws-cdk-lib';
import path = require('path');

export class lambdaStack extends cdk.Stack{

 
  constructor(scope: Construct,id:string,props?:cdk.StackProps){

   super(scope,id,props)

   const CalcuteResultLambdaFn= new NodejsFunction(this,"CalaulateResult",{

    functionName :"S3LambdaFunction",
  runtime:lambda.Runtime.NODEJS_18_X,
  handler: 'S3Handler.handler',
  code:lambda.Code.fromAsset(path.join(__dirname,"../lambdas")),
  layers: [lambdaLayer],
  environment: {
    NODE_OPTIONS: '--experimental-modules' ,
    TABLE_NAME: ResultsTable.tableName 

  }
 

   })



  } 
 


}