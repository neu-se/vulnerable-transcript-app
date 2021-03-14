import express from 'express';
import cors from 'cors';
import sanitizeHtml from 'sanitize-html';

// app-specific packages
import { transcriptManager as db } from '../types/local-transcript-manager';

// create the server, call it app
export const app: express.Application = express();

// allow requests from any port or source.
app.use(cors());

// for parsing application/json
app.use(express.json());

// for parsing multipart/form-data
// app.use(upload.array());

// GET/ : just counts the number of GET 'requests' we've had
// so far. Just for heartbeat checking.
let ngets = 0;
app.get('/', (req: express.Request, res: express.Response) => {
  ngets++;
  console.log('Handling GET/', ngets);
  res.status(200).send(`This is GET number ${ngets} on the current server`);
});

// GET /transcripts
app.get('/transcripts', (req, res) => {
  console.log('Handling GET/transcripts');
  const data = db.getAll();
  console.log(data);
  res.status(200).send(data);
});

// POST /transcripts
// adds a new student to the database,
// returns an ID for this student.
// Requires a post parameter 'name'

app.post('/transcripts', (req, res) => {
  // use req.body.name to get the value of the post parameter (in the body)
  // don't know what happens if the info is missing.  We should fail gracefully
  const studentName: string = req.body.name;
  if(!studentName) {
    res.status(400).send(`No student name specified`);
    return;
  }
  const studentID = db.addStudent(studentName);
  console.log(`Handling POST/transcripts name=${studentName}, id=${studentID}`);
  // sending a number makes the server think the number
  // is the response status.
  res.status(200).send({studentID});
});

// GET  /transcripts/:id           --
// returns transcript for student with given ID.
// Fails with a 404 if no such student
// req.params will look like {"id": 301}

app.get('/transcripts/:id', (req, res) => {
  // req.params to get components of the path
  const id = sanitizeHtml(req.params.id);
  console.log(`Handling GET /transcripts/:id id = ${id}`);
  const theTranscript = db.getTranscript(parseInt(id));
  if (theTranscript === undefined) {
    res.status(404).send(`No student with id = ${id}`);
  } else {
    res.status(200).send(theTranscript);
  }
});

// GET  /studentids?name=string
// returns list of IDs for student with the given name
// returns empty list if none

app.get('/studentids', (req, res) => {
// use req.query to get value of the parameter
  const studentName = req.query.name as string;
  console.log(`Handling GET /studentids studentName=${studentName}`);
  const ids = db.getStudentIDs(studentName);
  console.log(`ids = ${ids}`);
  res.status(200).send(ids);
});

// POST /transcripts/:studentID/:courseNumber
// adds an entry in this student's transcript with given name and course.
// Requires a post parameter 'grade'.
// Fails with 400 (Bad Request) if there is already an entry for this course
//  in the student's transcript

app.post('/transcripts/:studentID/:course', (req, res) => {
  try {
    const studentID = parseInt(req.params.studentID);
    const course = req.params.course as string;
    const grade = parseInt(req.body.grade as string);
    if(!grade) {
      res.status(400).send(`Invalid grade, must be a number. Got ${req.body.grade}`);
      return;
    }
    console.log
    (`Handling POST studentid = ${studentID}; course = ${course}, grade = ${grade}`);
    db.addGrade(studentID, course, grade);
    res.sendStatus(200);
  } catch (e) {
    // console.trace(e);
    res.status(400).send(e);
  }
});

// GET /transcripts/:studentID/:course
// returns the student's grade in the specified course.
// Fails if student or course is missing.
// uses function getGrade(studentID:StudentID, course:Course) : number
app.get('/transcripts/:studentID/:course', (req, res) => {
  try {
    const studentID = parseInt(req.params.studentID);
    const {course} = req.params;
    console.log(`Handling GET studentID=${studentID} course = ${course}`);
    const grade = db.getGrade(studentID, course);
    if (grade == undefined) {
      res.status(400).send(`not grade for ${studentID} in ${course}`)
    }
    res
      .status(200)
      .send({studentID, course, grade});
  } catch (e) {
    res.status(400).send(e);
  }
});

// custom default actions
// helpful for debugging
// this posts to the server console so we'll know we got here
// replaces Express's default 404 catcher.
app.get('/:request*', (req, res) => {
  console.log(defaultErrorMessage('GET', req.params.request));
  res.sendStatus(404);
});

app.post('/:request*', (req, res) => {
  console.log(defaultErrorMessage('POST', req.params.request));
  res.sendStatus(404);
});

app.delete('/:request*', (req, res) => {
  console.log(defaultErrorMessage('DELETE', req.params.request));
  res.sendStatus(404);
});

app.all('/:request*', (req, res) => {
  console.log(defaultErrorMessage('(unknown method)', req.params.request));
  res.sendStatus(404);
});

// that should catch everything.  Otherwise express responds
// with some html containing its own idea of what a 404 should look like.


function defaultErrorMessage(method: string, request: string): string {
  return `unknown ${method} request "${request}"`;
}






