import { Document } from 'mongoose';
import { Request as ExpressRequest } from 'express';

export interface IUser extends Document {
    contact: Contact,
    loginUsername: string,
    password: string,
    full_name: string,
    id_number: number,
    profile_picture: string,
    administrative_level: AdministrativeLevel,
    kind: UserKind,
    comparePassword(candidatePassword: string): Promise<boolean>
}

interface Contact {
    email: string,
    phone: number
}

export interface IStudent extends IUser {
    instructors: Array<IInstructor>,
    parents: Array<IParent>,
    school: string,
    hasInstructorWithIdOf(id: string): Promise<boolean>,
    hasParentWithIdOf(id: string): Promise<boolean>
}

export interface IParent extends IUser {
    children: Array<IStudent>,
    partners: Array<IParent>,
    school: string,
    hasChildWithIdOf(id: string): Promise<boolean>,
    hasChildWithInstructorOfId(id: string): Promise<boolean>,
    getChildrenInstructors(): Promise<Array<IInstructor>>
}

export interface IInstructor extends IUser {
    students: Array<IStudent>,
    school: string,
    isInstructorOfStudentWithIdOf(id: string): Promise<boolean>,
    isInstructorOfChildWithParentIdOf(id: string): Promise<boolean>,
    findCoworkersByInstructor(): Promise<Array<IInstructor>>
}

export interface Request extends Document {
    accpeted: boolean,
    acceptedDate: Date,
    details: string,
    issuedDate: Date,
    issuer: IStudent,
    reason: string,
    title: string,
    validTill: Date,
    goLocation: string,
    backAtSchoolTime: Date
}

export interface AuthenticatedRequest<T extends IUser> extends ExpressRequest {
    userData: {
        email: T['_id'],
        fullName: T['full_name'],
        profilePicture: T['profile_picture'],
        userId: T['_id'],
        iat: Date,
        exp: Date
    },
    user: T
}


declare enum AdministrativeLevel {
    One = 1,
    Two = 2,
    Three = 3
}

declare enum UserKind {
    Instructor = "Instructor",
    Parent = "Parent",
    Student = "Student"
}
