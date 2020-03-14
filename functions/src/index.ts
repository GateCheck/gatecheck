import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as express from 'express';

admin.initializeApp();
const app = express();

app.get('/students', (req, res) => {
    admin.firestore().collection('students').get().then(studentsCollection => {
        const students: any[] = [];
        studentsCollection.forEach(studentDoc => {
            const student = studentDoc.data();
            const parents = student.parents;
            const instructors = student.instructors;
            delete student.parents;
            delete student.instructors;
            student.parentIDs = parents.map((parent: any) => 'parents/' + parent.id);
            student.instructorIDs = instructors.map((instructor: any) => 'instructors/' + instructor.id);
            students.push(student);
        });
        return res.json(students);
    }).catch(err => console.error(err));
});


export const api = functions.https.onRequest(app);
