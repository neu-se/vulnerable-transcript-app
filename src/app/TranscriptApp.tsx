import React, {useCallback, useEffect, useState} from 'react';
import {Stack} from '@chakra-ui/react';

import {CourseGrade as GradeType, Transcript} from '../types/transcript';
import {CourseGrade} from './CourseGrade';
import {StudentView} from './StudentView';
import {remoteTranscriptManager} from "../client/client";
import {AddStudentModal} from "./AddStudentModal";
import assert from 'assert';

const emptyTranscript = {
    student: {studentName: 'No One', studentID: 0},
    grades: [{course: "CS 5500", grade: 42}],
};

function renderCourseGrade(cg: GradeType) {
    return <CourseGrade course={cg.course} grade={cg.grade} key={cg.course}/>
}
export type RefreshStudentCallbackType = (studentID: number) => Promise<void>;
export const TranscriptApp = () => {
    const [transcripts, setTranscripts] = useState<Transcript[]>([]);
    const refreshTranscript = async (studentID: number) => {
        const update = await remoteTranscriptManager.getTranscript(studentID);

        //React will decide to re-render the component when we do setTranscripts with a new array... but not if we update the old array.
        const newTranscripts = transcripts.map(transcript => transcript.student.studentID == update?.student.studentID ? update : transcript);
        setTranscripts(newTranscripts);
    };

    useEffect(() => {
        console.log('Effect triggered!');
        remoteTranscriptManager.getAll().then((loadedData) => {
            setTranscripts(loadedData);
        })
    }, [])
    // TODO: Add button
    return <Stack direction="column">
        <AddStudentModal appendTranscript={async (newStudentID: number) => {
            const update = await remoteTranscriptManager.getTranscript(newStudentID);
            assert(update);
            setTranscripts([update].concat(transcripts));
        }} />
        {transcripts.map(transcript => <StudentView key={transcript.student.studentID} transcript={transcript} refreshTranscript={refreshTranscript} />)}
    </Stack>;
}
