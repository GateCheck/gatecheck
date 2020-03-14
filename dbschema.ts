import { Moment } from 'moment';

export interface Student {
  contact: {
    email: string;
    phone: number;
  };
  full_name: string;
  id_number: number;
  instructors: Array<string>;
  parents: Array<string>;
  profile_picture: string;
  school: string;
}

export interface Parent {
  children: Array<string>;
  contact: {
    email: string;
    phone: number;
  };
  full_name: string;
  id_number: number;
  partners: Array<string>;
  profile_picture: string;
}

export interface Instructor {
  contact: {
    email: string;
    phone: number;
  };
  full_name: string;
  id_number: number;
  profile_picture: string;
  school: string;
  students: Array<string>;
}

export interface Request {
  accepted: boolean;
  acceptedDate: Moment;
  details: string;
  issuedDate: Moment;
  issuer: Student;
  reason: string;
  title: string;
  type: string;
  validTill: Moment;
}

