import { S3Event, S3Handler } from "aws-lambda";
import {
  GetObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { Readable } from "stream";
import { DynamoDBClient, BatchWriteItemCommand, BatchWriteItemCommandInput } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const s3Client = new S3Client({ region: "ap-south-1" });
const dynamoDBClient = new DynamoDBClient({});
const dynamoDBDocClient = DynamoDBDocumentClient.from(dynamoDBClient);

export const handler: S3Handler = async (event: S3Event) => {
  const bucketName = event.Records[0].s3.bucket.name;
  const s3ObjectKey = decodeURIComponent(
    event.Records[0].s3.object.key.replace(/\+/g, " ")
  );

  try {
    const csvContent = await getCsvContent(bucketName, s3ObjectKey);
    const data = await processCsvContent(csvContent);
    await saveResultsToDynamoDB(data);
  } catch (error) {
    console.error("Error processing S3 event:", error);
    throw error;
  }
};

const getCsvContent = async (bucketName: string, objectKey: string): Promise<string> => {
  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: objectKey,
  });

  try {
    const response = await s3Client.send(command);

    if (response.Body instanceof Readable) {
      const chunks: Uint8Array[] = [];
      for await (const chunk of response.Body) {
        chunks.push(chunk);
      }
      return Buffer.concat(chunks).toString("utf-8");
    } else {
      throw new Error("Response body is not a readable stream");
    }
  } catch (error) {
    console.error("Error getting object from S3:", error);
    throw error;
  }
};

const processCsvContent = async (csvContent: string): Promise<any[]> => {
  const rows = csvContent.split("\n").slice(1);
  return rows
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
        Name,
        Tamil: calculateGrade(+Tamil),
        English: calculateGrade(+English),
        Maths: calculateGrade(+Maths),
        Science: calculateGrade(+Science),
        Social: calculateGrade(+Social),
        GPA: GPA.toFixed(2),
      };
    });
};

const calculateGrade = (mark: number): string => {
  if (mark >= 90) return "A+";
  else if (mark >= 80) return "A";
  else if (mark >= 70) return "B+";
  else if (mark >= 60) return "B";
  else if (mark >= 40) return "C";
  else return "D";
};

const calculateGPA = (marks: Record<string, number>): number => {
  const creditPoints: Record<string, number> = {
    Tamil: 1,
    English: 2,
    Maths: 3,
    Science: 2,
    Social: 2,
  };
  const gradeValues: Record<string, number> = { "A+": 10, A: 9, "B+": 8, B: 7, C: 6, D: 5 };
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
};

const saveResultsToDynamoDB = async (data: any[]): Promise<void> => {
  const putItemRequests = data.map((item) => ({
    PutRequest: {
      Item: {
        Name: { S: item.Name },
        Tamil: { S: item.Tamil },
        English: { S: item.English },
        Maths: { S: item.Maths },
        Science: { S: item.Science },
        Social: { S: item.Social },
        GPA: { S: item.GPA },
      },
    },
  }));

  const params: BatchWriteItemCommandInput = {
    RequestItems: {
      Results: putItemRequests,
    },
  };

  try {
    await dynamoDBDocClient.send(new BatchWriteItemCommand(params));
  } catch (error) {
    console.error("Error saving results to DynamoDB:", error);
    throw error;
  }
};
