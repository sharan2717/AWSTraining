var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import * as AWS from 'aws-sdk';
import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
export const handler = (event) => __awaiter(void 0, void 0, void 0, function* () {
    const client = new S3Client({});
    const bucketName = event.Records[0].s3.bucket.name;
    const s3ObjectKey = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, ' '));
    let csvContent = "";
    const command = new GetObjectCommand({
        Bucket: "test-bucket",
        Key: "hello-s3.txt",
    });
    try {
        const response = yield client.send(command);
        // The Body object also has 'transformToByteArray' and 'transformToWebStream' methods.
        if (response.Body) {
            const csvContent = yield response.Body.transformToString();
        }
    }
    catch (err) {
        console.error(err);
    }
    calculateresults(csvContent);
    return {
        StatusCode: "200",
        Body: { "Message": "Results Calculated" }
    };
});
const calculateGrade = (mark) => {
    if (mark >= 90)
        return 'A+';
    else if (mark >= 80)
        return 'A';
    else if (mark >= 70)
        return 'B+';
    else if (mark >= 60)
        return 'B';
    else if (mark >= 40)
        return 'C';
    else
        return 'D';
};
function calculateGPA(marks) {
    const creditPoints = {
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
function calculateresults(csvContent) {
    return __awaiter(this, void 0, void 0, function* () {
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
        yield AWSaddDocument(data);
        return data;
    });
}
function AWSaddDocument(data) {
    return __awaiter(this, void 0, void 0, function* () {
        const ddb = new AWS.DynamoDB.DocumentClient();
        const params = {
            TableName: "Results",
            Item: data,
        };
        try {
            yield ddb.put(params).promise();
            return params.Item;
        }
        catch (error) {
            console.error('Error adding document:', error);
            throw error;
        }
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUzNIYW5kbGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiUzNIYW5kbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQUFBLE9BQU8sS0FBSyxHQUFHLE1BQU0sU0FBUyxDQUFDO0FBSy9CLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxRQUFRLEVBQUUsTUFBTSxvQkFBb0IsQ0FBQztBQUVoRSxNQUFNLENBQUMsTUFBTSxPQUFPLEdBQUMsQ0FBTyxLQUFhLEVBQUMsRUFBRTtJQUN4QyxNQUFNLE1BQU0sR0FBRyxJQUFJLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUVoQyxNQUFNLFVBQVUsR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDO0lBQ25ELE1BQU0sV0FBVyxHQUFHLGtCQUFrQixDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO0lBQzVGLElBQUksVUFBVSxHQUFVLEVBQUUsQ0FBQTtJQUN6QixNQUFNLE9BQU8sR0FBRyxJQUFJLGdCQUFnQixDQUFDO1FBQ2pDLE1BQU0sRUFBRSxhQUFhO1FBQ3JCLEdBQUcsRUFBRSxjQUFjO0tBQ3BCLENBQUMsQ0FBQztJQUNMLElBQUksQ0FBQztRQUNELE1BQU0sUUFBUSxHQUFHLE1BQU0sTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUM1QyxzRkFBc0Y7UUFDdEYsSUFBRyxRQUFRLENBQUMsSUFBSSxFQUFDLENBQUM7WUFDZCxNQUFNLFVBQVUsR0FBRyxNQUFNLFFBQVEsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztRQUMvRCxDQUFDO0lBQ0gsQ0FBQztJQUFDLE9BQU8sR0FBRyxFQUFFLENBQUM7UUFDYixPQUFPLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ3JCLENBQUM7SUFFUCxnQkFBZ0IsQ0FBQyxVQUFVLENBQUMsQ0FBQTtJQUV6QixPQUFPO1FBQ04sVUFBVSxFQUFHLEtBQUs7UUFDbEIsSUFBSSxFQUFDLEVBQUMsU0FBUyxFQUFHLG9CQUFvQixFQUFDO0tBQ3ZDLENBQUM7QUFHTCxDQUFDLENBQUEsQ0FBQTtBQUVELE1BQU0sY0FBYyxHQUFHLENBQUMsSUFBWSxFQUFFLEVBQUU7SUFDcEMsSUFBSSxJQUFJLElBQUksRUFBRTtRQUFFLE9BQU8sSUFBSSxDQUFDO1NBQ3ZCLElBQUksSUFBSSxJQUFJLEVBQUU7UUFBRSxPQUFPLEdBQUcsQ0FBQztTQUMzQixJQUFJLElBQUksSUFBSSxFQUFFO1FBQUUsT0FBTyxJQUFJLENBQUM7U0FDNUIsSUFBSSxJQUFJLElBQUksRUFBRTtRQUFFLE9BQU8sR0FBRyxDQUFDO1NBQzNCLElBQUksSUFBSSxJQUFJLEVBQUU7UUFBRSxPQUFPLEdBQUcsQ0FBQzs7UUFDM0IsT0FBTyxHQUFHLENBQUM7QUFDbEIsQ0FBQyxDQUFDO0FBSUYsU0FBUyxZQUFZLENBQUMsS0FBUztJQUM3QixNQUFNLFlBQVksR0FBTztRQUNyQixLQUFLLEVBQUUsQ0FBQztRQUNSLE9BQU8sRUFBRSxDQUFDO1FBQ1YsS0FBSyxFQUFFLENBQUM7UUFDUCxPQUFPLEVBQUUsQ0FBQztRQUNULE1BQU0sRUFBRSxDQUFDO0tBQ1QsQ0FBQztJQUNQLE1BQU0sV0FBVyxHQUFHLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLElBQUksRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQztJQUMxRSxJQUFJLGlCQUFpQixHQUFHLENBQUMsQ0FBQztJQUMxQixJQUFJLGdCQUFnQixHQUFHLENBQUMsQ0FBQztJQUV6QixLQUFLLE1BQU0sT0FBTyxJQUFJLEtBQUssRUFBRSxDQUFDO1FBQzFCLE1BQU0sS0FBSyxHQUFHLGNBQWMsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztRQUM3QyxNQUFNLFdBQVcsR0FBRyxZQUFZLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDMUMsTUFBTSxVQUFVLEdBQUcsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBRXRDLGlCQUFpQixJQUFJLFdBQVcsQ0FBQztRQUNqQyxnQkFBZ0IsSUFBSSxVQUFVLEdBQUcsV0FBVyxDQUFDO0lBQ2pELENBQUM7SUFFRCxPQUFPLGdCQUFnQixHQUFHLGlCQUFpQixDQUFDO0FBQ2hELENBQUM7QUFJRCxTQUFlLGdCQUFnQixDQUFDLFVBQWlCOztRQUM3QyxNQUFNLElBQUksR0FBRyxVQUFVLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUM3QyxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFO1lBQ3hCLE1BQU0sQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLE1BQU0sQ0FBQyxHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUM7WUFDL0YsTUFBTSxHQUFHLEdBQUcsWUFBWSxDQUFDLEVBQUUsS0FBSyxFQUFFLENBQUMsS0FBSyxFQUFFLE9BQU8sRUFBRSxDQUFDLE9BQU8sRUFBRSxLQUFLLEVBQUUsQ0FBQyxLQUFLLEVBQUUsT0FBTyxFQUFFLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUM7WUFFbEgsT0FBTztnQkFDSCxJQUFJO2dCQUNKLEtBQUssRUFBRSxjQUFjLENBQUMsQ0FBQyxLQUFLLENBQUM7Z0JBQzdCLE9BQU8sRUFBRSxjQUFjLENBQUMsQ0FBQyxPQUFPLENBQUM7Z0JBQ2pDLEtBQUssRUFBRSxjQUFjLENBQUMsQ0FBQyxLQUFLLENBQUM7Z0JBQzdCLE9BQU8sRUFBRSxjQUFjLENBQUMsQ0FBQyxPQUFPLENBQUM7Z0JBQ2pDLE1BQU0sRUFBRSxjQUFjLENBQUMsQ0FBQyxNQUFNLENBQUM7Z0JBQy9CLEdBQUcsRUFBRSxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQzthQUN0QixDQUFDO1FBQ04sQ0FBQyxDQUFDLENBQUM7UUFDSCxNQUFNLGNBQWMsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUM1QixPQUFPLElBQUksQ0FBRTtJQUNoQixDQUFDO0NBQUE7QUFFQSxTQUFlLGNBQWMsQ0FBQyxJQUFXOztRQUN0QyxNQUFNLEdBQUcsR0FBRyxJQUFJLEdBQUcsQ0FBQyxRQUFRLENBQUMsY0FBYyxFQUFFLENBQUM7UUFDOUMsTUFBTSxNQUFNLEdBQWdCO1lBQzFCLFNBQVMsRUFBRSxTQUFTO1lBQ3BCLElBQUksRUFBRyxJQUFnQztTQUMxQyxDQUFDO1FBQ0MsSUFBRyxDQUFDO1lBQ0QsTUFBTSxHQUFHLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFBO1lBQy9CLE9BQU8sTUFBTSxDQUFDLElBQUksQ0FBQztRQUN0QixDQUFDO1FBQUEsT0FBTyxLQUFLLEVBQUMsQ0FBQztZQUNkLE9BQU8sQ0FBQyxLQUFLLENBQUMsd0JBQXdCLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDL0MsTUFBTSxLQUFLLENBQUM7UUFDaEIsQ0FBQztJQUNELENBQUM7Q0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIEFXUyBmcm9tICdhd3Mtc2RrJztcclxuaW1wb3J0IHsgRGVsZXRlSXRlbU91dHB1dCwgR2V0SXRlbUlucHV0LCBQdXRJdGVtSW5wdXQsIFB1dEl0ZW1JbnB1dEF0dHJpYnV0ZU1hcCB9IGZyb20gJ2F3cy1zZGsvY2xpZW50cy9keW5hbW9kYic7XHJcbmltcG9ydCB7IFMzRXZlbnRTb3VyY2UgfSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtbGFtYmRhLWV2ZW50LXNvdXJjZXMnO1xyXG5pbXBvcnQgeyBTM0V2ZW50LCBTM0hhbmRsZXIgfSBmcm9tICdhd3MtbGFtYmRhJztcclxuaW1wb3J0IHthd3NfczMgYXMgczMgfSBmcm9tICdhd3MtY2RrLWxpYic7XHJcbmltcG9ydCB7IEdldE9iamVjdENvbW1hbmQsIFMzQ2xpZW50IH0gZnJvbSBcIkBhd3Mtc2RrL2NsaWVudC1zM1wiO1xyXG5cclxuZXhwb3J0IGNvbnN0IGhhbmRsZXI9YXN5bmMgKGV2ZW50OlMzRXZlbnQpPT57XHJcbiAgICBjb25zdCBjbGllbnQgPSBuZXcgUzNDbGllbnQoe30pO1xyXG5cclxuICAgIGNvbnN0IGJ1Y2tldE5hbWUgPSBldmVudC5SZWNvcmRzWzBdLnMzLmJ1Y2tldC5uYW1lO1xyXG4gICAgY29uc3QgczNPYmplY3RLZXkgPSBkZWNvZGVVUklDb21wb25lbnQoZXZlbnQuUmVjb3Jkc1swXS5zMy5vYmplY3Qua2V5LnJlcGxhY2UoL1xcKy9nLCAnICcpKTtcclxuICAgbGV0IGNzdkNvbnRlbnQgOnN0cmluZz0gXCJcIlxyXG4gICAgY29uc3QgY29tbWFuZCA9IG5ldyBHZXRPYmplY3RDb21tYW5kKHtcclxuICAgICAgICBCdWNrZXQ6IFwidGVzdC1idWNrZXRcIixcclxuICAgICAgICBLZXk6IFwiaGVsbG8tczMudHh0XCIsXHJcbiAgICAgIH0pO1xyXG4gICAgdHJ5IHtcclxuICAgICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGNsaWVudC5zZW5kKGNvbW1hbmQpO1xyXG4gICAgICAgIC8vIFRoZSBCb2R5IG9iamVjdCBhbHNvIGhhcyAndHJhbnNmb3JtVG9CeXRlQXJyYXknIGFuZCAndHJhbnNmb3JtVG9XZWJTdHJlYW0nIG1ldGhvZHMuXHJcbiAgICAgICAgaWYocmVzcG9uc2UuQm9keSl7XHJcbiAgICAgICAgICAgIGNvbnN0IGNzdkNvbnRlbnQgPSBhd2FpdCByZXNwb25zZS5Cb2R5LnRyYW5zZm9ybVRvU3RyaW5nKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9IGNhdGNoIChlcnIpIHtcclxuICAgICAgICBjb25zb2xlLmVycm9yKGVycik7XHJcbiAgICAgIH0gXHJcblxyXG5jYWxjdWxhdGVyZXN1bHRzKGNzdkNvbnRlbnQpXHJcblxyXG4gICByZXR1cm4ge1xyXG4gICAgU3RhdHVzQ29kZSA6IFwiMjAwXCIsXHJcbiAgICBCb2R5OntcIk1lc3NhZ2VcIiA6IFwiUmVzdWx0cyBDYWxjdWxhdGVkXCJ9XHJcbiAgIH07XHJcblxyXG4gICAgICBcclxufVxyXG5cclxuY29uc3QgY2FsY3VsYXRlR3JhZGUgPSAobWFyazogbnVtYmVyKSA9PiB7XHJcbiAgICBpZiAobWFyayA+PSA5MCkgcmV0dXJuICdBKyc7XHJcbiAgICBlbHNlIGlmIChtYXJrID49IDgwKSByZXR1cm4gJ0EnO1xyXG4gICAgZWxzZSBpZiAobWFyayA+PSA3MCkgcmV0dXJuICdCKyc7XHJcbiAgICBlbHNlIGlmIChtYXJrID49IDYwKSByZXR1cm4gJ0InO1xyXG4gICAgZWxzZSBpZiAobWFyayA+PSA0MCkgcmV0dXJuICdDJztcclxuICAgIGVsc2UgcmV0dXJuICdEJztcclxuICB9O1xyXG5cclxuXHJcblxyXG4gIGZ1bmN0aW9uIGNhbGN1bGF0ZUdQQShtYXJrczphbnkpIHtcclxuICAgIGNvbnN0IGNyZWRpdFBvaW50czphbnkgPSB7IFxyXG4gICAgICAgIFRhbWlsOiAxLCBcclxuICAgICAgICBFbmdsaXNoOiAyLCBcclxuICAgICAgICBNYXRoczogMyxcclxuICAgICAgICAgU2NpZW5jZTogMixcclxuICAgICAgICAgIFNvY2lhbDogMlxyXG4gICAgICAgICB9O1xyXG4gICAgY29uc3QgZ3JhZGVWYWx1ZXMgPSB7ICdBKyc6IDEwLCAnQSc6IDksICdCKyc6IDgsICdCJzogNywgJ0MnOiA2LCAnRCc6IDUgfTtcclxuICAgIGxldCB0b3RhbENyZWRpdFBvaW50cyA9IDA7XHJcbiAgICBsZXQgdG90YWxHcmFkZVBvaW50cyA9IDA7XHJcblxyXG4gICAgZm9yIChjb25zdCBzdWJqZWN0IGluIG1hcmtzKSB7XHJcbiAgICAgICAgY29uc3QgZ3JhZGUgPSBjYWxjdWxhdGVHcmFkZShtYXJrc1tzdWJqZWN0XSk7XHJcbiAgICAgICAgY29uc3QgY3JlZGl0UG9pbnQgPSBjcmVkaXRQb2ludHNbc3ViamVjdF07XHJcbiAgICAgICAgY29uc3QgZ3JhZGVWYWx1ZSA9IGdyYWRlVmFsdWVzW2dyYWRlXTtcclxuXHJcbiAgICAgICAgdG90YWxDcmVkaXRQb2ludHMgKz0gY3JlZGl0UG9pbnQ7XHJcbiAgICAgICAgdG90YWxHcmFkZVBvaW50cyArPSBncmFkZVZhbHVlICogY3JlZGl0UG9pbnQ7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHRvdGFsR3JhZGVQb2ludHMgLyB0b3RhbENyZWRpdFBvaW50cztcclxufVxyXG5cclxuXHJcblxyXG5hc3luYyBmdW5jdGlvbiBjYWxjdWxhdGVyZXN1bHRzKGNzdkNvbnRlbnQ6c3RyaW5nKXtcclxuICAgIGNvbnN0IHJvd3MgPSBjc3ZDb250ZW50LnNwbGl0KCdcXG4nKS5zbGljZSgxKTtcclxuICAgIGNvbnN0IGRhdGEgPSByb3dzLm1hcChyb3cgPT4ge1xyXG4gICAgICAgIGNvbnN0IFtOYW1lLCBUYW1pbCwgRW5nbGlzaCwgTWF0aHMsIFNjaWVuY2UsIFNvY2lhbF0gPSByb3cuc3BsaXQoJywnKS5tYXAoaXRlbSA9PiBpdGVtLnRyaW0oKSk7XHJcbiAgICAgICAgY29uc3QgR1BBID0gY2FsY3VsYXRlR1BBKHsgVGFtaWw6ICtUYW1pbCwgRW5nbGlzaDogK0VuZ2xpc2gsIE1hdGhzOiArTWF0aHMsIFNjaWVuY2U6ICtTY2llbmNlLCBTb2NpYWw6ICtTb2NpYWwgfSk7XHJcbiAgICBcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICBOYW1lLFxyXG4gICAgICAgICAgICBUYW1pbDogY2FsY3VsYXRlR3JhZGUoK1RhbWlsKSxcclxuICAgICAgICAgICAgRW5nbGlzaDogY2FsY3VsYXRlR3JhZGUoK0VuZ2xpc2gpLFxyXG4gICAgICAgICAgICBNYXRoczogY2FsY3VsYXRlR3JhZGUoK01hdGhzKSxcclxuICAgICAgICAgICAgU2NpZW5jZTogY2FsY3VsYXRlR3JhZGUoK1NjaWVuY2UpLFxyXG4gICAgICAgICAgICBTb2NpYWw6IGNhbGN1bGF0ZUdyYWRlKCtTb2NpYWwpLFxyXG4gICAgICAgICAgICBHUEE6IEdQQS50b0ZpeGVkKDIpXHJcbiAgICAgICAgfTtcclxuICAgIH0pO1xyXG4gICAgYXdhaXQgQVdTYWRkRG9jdW1lbnQoZGF0YSk7XHJcbiAgIHJldHVybiBkYXRhIDtcclxufVxyXG5cclxuIGFzeW5jIGZ1bmN0aW9uIEFXU2FkZERvY3VtZW50KGRhdGE6b2JqZWN0KXtcclxuICAgIGNvbnN0IGRkYiA9IG5ldyBBV1MuRHluYW1vREIuRG9jdW1lbnRDbGllbnQoKTtcclxuICAgIGNvbnN0IHBhcmFtczpQdXRJdGVtSW5wdXQgPSB7XHJcbiAgICAgIFRhYmxlTmFtZTogXCJSZXN1bHRzXCIsXHJcbiAgICAgIEl0ZW06ICBkYXRhIGFzIFB1dEl0ZW1JbnB1dEF0dHJpYnV0ZU1hcCxcclxuICB9O1xyXG4gICAgIHRyeXtcclxuICAgICAgICBhd2FpdCBkZGIucHV0KHBhcmFtcykucHJvbWlzZSgpXHJcbiAgICAgICAgcmV0dXJuIHBhcmFtcy5JdGVtO1xyXG4gICAgIH1jYXRjaCAoZXJyb3Ipe1xyXG4gICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBhZGRpbmcgZG9jdW1lbnQ6JywgZXJyb3IpO1xyXG4gICAgICB0aHJvdyBlcnJvcjtcclxuICB9XHJcbiAgfSJdfQ==