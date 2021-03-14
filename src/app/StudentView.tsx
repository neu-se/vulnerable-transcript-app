import React from "react";

import {
    Box,
    Button,
    FormControl,
    FormLabel,
    Input,
    List,
    ListIcon,
    ListItem,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    NumberDecrementStepper,
    NumberIncrementStepper,
    NumberInput,
    NumberInputField,
    NumberInputStepper,
    Spacer,
    Text,
    useDisclosure,
    useToast
} from "@chakra-ui/react"

import {Transcript as TranscriptType} from '../types/transcript';
import {MdCheckCircle, MdRemoveCircle} from "react-icons/all";
import {remoteTranscriptManager} from "../client/client";
import {RefreshStudentCallbackType} from "./TranscriptApp";

export type TranscriptProps = {
    transcript: TranscriptType;
    refreshTranscript: RefreshStudentCallbackType;
}

function renderGrade(grade: { course: string, grade: number }) {
    let icon = MdCheckCircle;
    let iconColor = "green.500";
    if (grade.grade < 60) {
        icon = MdRemoveCircle;
        iconColor = "red.500";
    }
    return <ListItem key={grade.course + "." + grade.grade}>
        <ListIcon as={icon} color={iconColor}/>{grade.course}: {grade.grade}%</ListItem>;
}

const AddGradeOverlay: React.FunctionComponent<{ studentID: number, refreshTranscript: RefreshStudentCallbackType }> = ({studentID, refreshTranscript}) => {
    const {isOpen: addGradeOpen, onOpen: onOpenAddGrade, onClose: onCloseAddGrade} = useDisclosure()
    const toast = useToast()

    return <>
        <Button onClick={onOpenAddGrade}>Add Grade</Button>
        <Modal isOpen={addGradeOpen} onClose={onCloseAddGrade}>
            <ModalOverlay/>
            <ModalContent>
                <ModalHeader>Add a grade</ModalHeader>
                <ModalCloseButton/>
                <form onSubmit={async (event) => {
                    event.preventDefault();
                    // @ts-ignore
                    const formElements = event.target as HTMLInputElement[];
                    const courseName = formElements[0].value;
                    const grade = formElements[1].value;
                    try {
                        await remoteTranscriptManager.addGrade(studentID, courseName, Number.parseInt(grade));
                        toast({
                            title: "Grade Saved!",
                            isClosable:true,
                            duration: 1500,
                            status: "success"
                        })
                        await refreshTranscript(studentID);
                        onCloseAddGrade();
                    } catch (err) {
                        toast({
                            title: "An error occurred",
                            description: "Unable to add grade",
                            status: "error",
                            isClosable: true,
                            duration: 3000
                        })
                        console.log(err);
                    }
                    return false;
                }}>
                    <ModalBody pb={6}>
                        <FormControl isRequired>
                            <FormLabel>Course</FormLabel>
                            <Input placeholder="Course" name="course"/>
                        </FormControl>

                        <FormControl mt={4} isRequired>
                            <FormLabel>Grade</FormLabel>
                            <NumberInput defaultValue={95} name="grade">
                                <NumberInputField/>
                                <NumberInputStepper>
                                    <NumberIncrementStepper/>
                                    <NumberDecrementStepper/>
                                </NumberInputStepper>
                            </NumberInput>
                        </FormControl>
                    </ModalBody>

                    <ModalFooter>
                        <Button colorScheme="blue" mr={3} type="submit">
                            Save
                        </Button>
                        <Button onClick={onCloseAddGrade}>Cancel</Button>
                    </ModalFooter>
                </form>
            </ModalContent>
        </Modal>
    </>
}
export const StudentView: React.FunctionComponent<TranscriptProps> = ({transcript, refreshTranscript}) => {
    return <Box borderWidth="1px" borderRadius="lg">
        {/*<div dangerouslySetInnerHTML={{__html: `Name: ${transcript.student.studentName}`}}></div>*/}
        Name: {transcript.student.studentName}
        <Spacer/>
        <> <Text>ID: {transcript.student.studentID}</Text>
        </>
        Grades: <List
        fontSize="md">{transcript.grades.sort((g1, g2) => g1.course.localeCompare(g2.course)).map(grade => renderGrade(grade))}</List>
        <AddGradeOverlay refreshTranscript={refreshTranscript} studentID={transcript.student.studentID}/>
    </Box>;
}
