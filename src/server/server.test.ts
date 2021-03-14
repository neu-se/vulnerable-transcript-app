import axios from 'axios';
import { Server } from 'http';
import { AddressInfo } from 'net';
import { randomTranscript } from '../types/gentrans';
import { app } from './server';
import { Transcript } from '../types/transcript';
import { initialize, addStudent, getTranscript, getGrade } from '../types/local-transcript-manager';

describe('TranscriptREST', () => {
  let server : Server;
  let baseurl : string;
  beforeAll( () => {
    server = app.listen();
    const address = server.address() as AddressInfo;
    baseurl = `http://127.0.0.1:${address.port}`;
    console.log(`baseuRL = ${baseurl}`);
  });
  beforeEach(() => {
    initialize(); // start with a fresh data base
  });
  afterAll( () => {
    server.close();
  });

  describe('createStudent API', () => {
    test('a new name', async () => {
      const { data } = await axios.post<{ studentID:number }>(`${baseurl}/transcripts`, { name: 'Ryan' });
      expect(data.studentID).toBeGreaterThan(4);
    });
    test('a reused name', async () => {
      const { data } = await axios.post<{ studentID:number }>(`${baseurl}/transcripts`, { name: 'avery' });
      expect(data.studentID).toBeGreaterThan(4);
    });
  });

  describe('getStudent API', () => {
    test('student present', async () => {
      const sample : Transcript = randomTranscript();
      const studentID = addStudent(sample.student.studentName, sample.grades);
      sample.student.studentID = studentID; // update
      const { data } = await axios.get(`${baseurl}/transcripts/${studentID}`);
      expect(data).toStrictEqual(sample);
    });
    test('student absent', async () => {
      await expect(axios.get(`${baseurl}/transcripts/6`)).rejects.toThrow();
    });
  });

  describe('getStudentID API', () => {
    test('not present', async () => {
      const { data } = await axios.get<number[]>(`${baseurl}/studentids?name=ryan`);
      expect(data).toStrictEqual([]);
    });
    test('present (new)', async () => {
      const sample : Transcript = randomTranscript();
      const studentID = addStudent(sample.student.studentName, sample.grades);
      const { data } = await axios.get<number[]>(`${baseurl}/studentids?name=${sample.student.studentName}`);
      expect(data).toStrictEqual([studentID]);
    });
    test('multiple', async () => {
      const { data } = await axios.get<number[]>(`${baseurl}/studentids?name=blake`);
      // 2 and 3 are the indices of 'blake' in the default/initial student database
      expect(data).toStrictEqual([2, 3]);
    });
  });

  describe('addGrade API', () => {
    test('student not present', async () => {
      await expect(axios.post(`${baseurl}/transcripts/6/cs101`, { grade: 75 })).rejects.toThrow();
    });
    test('grade already present', async () => {
      const gradeList = [{ course: 'CS 5500', grade: 89 }];
      const studentID = addStudent('ryan', gradeList);
      // also testing %20 for space:
      await expect(axios.post(`${baseurl}/transcripts/${studentID}/CS%205500`, { grade: 90 })).rejects.toThrow();
    });
    test('grade not defined', async () => {
      await expect(axios.post(`${baseurl}/transcripts/3/CS%205500`, { grad: true })).rejects.toThrow();
    });
    test('grade not numeric', async () => {
      await expect(axios.post(`${baseurl}/transcripts/3/CS%205500`, { grade: 'A-' })).rejects.toThrow();
    });
    test('grade OK', async () => {
      await axios.post(`${baseurl}/transcripts/3/CS%205500`, { grade: 89 });
      expect(getGrade(3, 'CS 5500')).toEqual(89);
    });
  });

  describe('getGrade API', () => {
    test('student not present', async () => {
      await expect(axios.get(`${baseurl}/transcripts/6/cs101`)).rejects.toThrow();
    });
    test('no grade present for this student/course', async () => {
      await expect(axios.get(`${baseurl}/transcripts/3/CS%205500`)).rejects.toThrow();
    });
    test('get grade present', async () => {
      const gradeList = [{ course: 'CS 5500', grade: 89 }];
      const studentID = addStudent('ryan', gradeList);
      const { data } = await axios.get<{ course:string, grade:number }>(`${baseurl}/transcripts/${studentID}/CS%205500`);
      expect(data.course).toBe('CS 5500');
      expect(data.grade).toEqual(89);
    });
  });

  describe('issue #1', () => {

  });
});
