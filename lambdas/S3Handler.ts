import { S3Event, S3Handler } from "aws-lambda";
import {
  GetObjectCommand,
  GetObjectCommandOutput,
  S3Client,
} from "@aws-sdk/client-s3";
import { parse } from "csv-parse";
import { Readable } from "stream";
import { DynamoDBClient,BatchWriteItemCommand ,BatchWriteItemCommandInput } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";

export const handler: S3Handler = async (event: S3Event) => {
  const client = new S3Client({ region: "ap-south-1" });

  const bucketName = event.Records[0].s3.bucket.name;
  const s3ObjectKey = decodeURIComponent(
    event.Records[0].s3.object.key.replace(/\+/g, " ")
  );
  let csvContent: string = "";
  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: s3ObjectKey,
  });
  try {
    const response: GetObjectCommandOutput = await client.send(command);
    const csvStream = parse({ delimiter: "," });
    if (response.Body instanceof Readable) {
      const chunks = [];
      for await (const chunk of response.Body) {
        chunks.push(chunk);
      }
      csvContent = Buffer.concat(chunks).toString("utf-8");
    } else {
      console.log("Response Body is not a Readable stream:", response.Body);
    }
  } catch (error) {
    console.error("Error getting object from S3:", error);
    throw error;
  }

  await calculateresults(csvContent);
 
};

const calculateGrade = (mark: number) => {
  if (mark >= 90) return "A+";
  else if (mark >= 80) return "A";
  else if (mark >= 70) return "B+";
  else if (mark >= 60) return "B";
  else if (mark >= 40) return "C";
  else return "D";
};

function calculateGPA(marks: any) {
  const creditPoints: any = {
    Tamil: 1,
    English: 2,
    Maths: 3,
    Science: 2,
    Social: 2,
  };
  const gradeValues = { "A+": 10, A: 9, "B+": 8, B: 7, C: 6, D: 5 };
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

async function calculateresults(csvContent: string) {
  const rows = csvContent.split("\n").slice(1);
  const data = rows
  .map((row) => row.split(",").map((item) => item.trim())) 
  .filter((items) => items[0]) 
  .map(([Name, Tamil, English, Maths, Science, Social]) => {
    const GPA = calculateGPA({
      Tamil: +Tamil,
      English: +English,
      Maths: +Maths,
      Science: +Science,
      Social: +Social,
    });

    return {
      Name: Name,
      Tamil: calculateGrade(+Tamil),
      English: calculateGrade(+English),
      Maths: calculateGrade(+Maths),
      Science: calculateGrade(+Science),
      Social: calculateGrade(+Social),
      GPA: GPA.toFixed(2),
    };
  });
  await AWSaddDocument(data);
  return data;
}

async function AWSaddDocument(data: any) {
  const client = new DynamoDBClient({});
  const docClient = DynamoDBDocumentClient.from(client);

  const putItemCommands = data.map((item: any) => ({
    PutRequest: {
        Item: {
            Name: { S: item.Name },
            Tamil: { S: item.Tamil },
            English: { S: item.English },
            Maths: { S: item.Maths },
            Science: { S: item.Science },
            Social: { S: item.Social },
            GPA: { S: item.GPA }
          }   
         }
  }));
  const params = {
    RequestItems: {
      'Results': putItemCommands 
    }
  };
  const batchcommand = new BatchWriteItemCommand(params);
  try {
    await docClient.send(batchcommand);
  } catch (error) {
    console.error("Error adding document:", error);
    throw error;
  }
}
