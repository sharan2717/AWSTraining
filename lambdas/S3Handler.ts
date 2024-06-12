import * as AWS from 'aws-sdk';
import { DeleteItemOutput, GetItemInput, PutItemInput, PutItemInputAttributeMap } from 'aws-sdk/clients/dynamodb';
import { S3EventSource } from 'aws-cdk-lib/aws-lambda-event-sources';
import { S3Event, S3Handler } from 'aws-lambda';
import {aws_s3 as s3 } from 'aws-cdk-lib';
import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";

export const handler=async (event:S3Event)=>{
    const client = new S3Client({});

    const bucketName = event.Records[0].s3.bucket.name;
    const s3ObjectKey = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, ' '));
   let   csvContent :string= ""
    const command = new GetObjectCommand({
        Bucket: "test-bucket",
        Key: "hello-s3.txt",
      });
    try {
        const response = await client.send(command);
        // The Body object also has 'transformToByteArray' and 'transformToWebStream' methods.
        if(response.Body){
            const csvContent = await response.Body.transformToString();
        }
      } catch (err) {
        console.error(err);
      } 

calculateresults(csvContent)

   return {
    StatusCode : "200",
    Body:{"Message" : "Results Calculated"}
   };

      
}

const calculateGrade = (mark: number) => {
    if (mark >= 90) return 'A+';
    else if (mark >= 80) return 'A';
    else if (mark >= 70) return 'B+';
    else if (mark >= 60) return 'B';
    else if (mark >= 40) return 'C';
    else return 'D';
  };



  function calculateGPA(marks:any) {
    const creditPoints:any = { 
        Tamil: 1, 
        English: 2, 
        Maths: 3,
         Science: 2,
          Social: 2
         };
    const gradeValues = { 'A+': 10, 'A': 9, 'B+': 8, 'B': 7, 'C': 6, 'D': 5 };
    let totalCreditPoints = 0;
    let totalGradePoints = 0;

    for (const subject in marks) {
        const grade = calculateGrade(marks[subject]);
        const creditPoint = creditPoints[subject];
        const gradeValue = gradeValues[grade];

        totalCreditPoints += creditPoint;
        totalGradePoints += gradeValue * creditPoint;
    }

    return totalGradePoints / totalCreditPoints;
}



async function calculateresults(csvContent:string){
    const rows = csvContent.split('\n').slice(1);
    const data = rows.map(row => {
        const [Name, Tamil, English, Maths, Science, Social] = row.split(',').map(item => item.trim());
        const GPA = calculateGPA({ Tamil: +Tamil, English: +English, Maths: +Maths, Science: +Science, Social: +Social });
    
        return {
            Name,
            Tamil: calculateGrade(+Tamil),
            English: calculateGrade(+English),
            Maths: calculateGrade(+Maths),
            Science: calculateGrade(+Science),
            Social: calculateGrade(+Social),
            GPA: GPA.toFixed(2)
        };
    });
    await AWSaddDocument(data);
   return data ;
}

 async function AWSaddDocument(data:object){
    const ddb = new AWS.DynamoDB.DocumentClient();
    const params:PutItemInput = {
      TableName: "Results",
      Item:  data as PutItemInputAttributeMap,
  };
     try{
        await ddb.put(params).promise()
        return params.Item;
     }catch (error){
      console.error('Error adding document:', error);
      throw error;
  }
  }