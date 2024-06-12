import * as cdk from 'aws-cdk-lib';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import path = require('path');
import {Duration,aws_s3, aws_lambda as lambda} from 'aws-cdk-lib';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3n from 'aws-cdk-lib/aws-s3-notifications';
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";

// import * as sqs from 'aws-cdk-lib/aws-sqs';
import { Asset } from 'aws-cdk-lib/aws-s3-assets';



export class AwsTrainingStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    
const lambdaLayer = new lambda.LayerVersion(this, 'SampleLayer', {
  code: lambda.Code.fromAsset('layer'),
  compatibleRuntimes: [lambda.Runtime.NODEJS_18_X, lambda.Runtime.NODEJS_16_X],
});


const ResultsTable = new dynamodb.TableV2(this,"orders",{
  tableName : "Results",
   partitionKey :{
     name : "Name",
     type : dynamodb.AttributeType.STRING
   }
 })

const S3LambdaFunction = new NodejsFunction(this, "SampleFunction", {
  functionName :"S3LambdaFunction",
  runtime:lambda.Runtime.NODEJS_18_X,
  handler: 'S3Handler.handler',
  code:lambda.Code.fromAsset(path.join(__dirname,"../lambdas")),
  layers: [lambdaLayer],
  environment: {
    NODE_OPTIONS: '--experimental-modules' ,
    TABLE_NAME: ResultsTable.tableName // Pass table name as environment variable

  }
}
);


ResultsTable.grantReadWriteData(S3LambdaFunction)

const MarksCSVS3Bucket = new aws_s3.Bucket(this,"SampleBucket",{
  bucketName:"markscsv"
})
MarksCSVS3Bucket.addEventNotification(s3.EventType.OBJECT_CREATED,new s3n.LambdaDestination(S3LambdaFunction))


const csvFilePath = "C:/Users/vsharan/Desktop/AWS/AWSTraining/marks/Marks.csv";

new s3deploy.BucketDeployment(this, "DeployCsv", {
  sources: [s3deploy.Source.asset(csvFilePath)],
  destinationBucket: MarksCSVS3Bucket
});









  }
}
