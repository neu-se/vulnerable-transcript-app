import React from 'react';
import {Flex, Spacer, Text} from '@chakra-ui/react';
import {Course, Grade} from '../types/transcript';

export type CourseGradeProps = {
    course : Course;
    grade : Grade;
}

export const CourseGrade : React.FunctionComponent<CourseGradeProps> = props => {
    return <Flex>
        <Text>Course: {props.course} :</Text>
        <Spacer/>
        <Text>Grade: {props.grade}</Text>
    </Flex>
}