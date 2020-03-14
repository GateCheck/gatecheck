const db = {
    students: [
        {
            contact: {
                email: String,
                phone: Number
            },
            full_name: String,
            id_number: Number,
            instructors: [
                {

                }
            ],
            parents: [
                {

                }
            ],
            profile_picture: String,
            school: String
        }
    ],
    parents: [
        {
            children: [
                {

                }
            ],
            contact: {
                email: String,
                phone: Number
            },
            full_name: String,
            id_number: Number,
            partners: [
                {

                }
            ],
            profile_picture: String
        }
    ],
    instructors: [
        {
            contact: {
                email: String,
                phone: Number
            },
            full_name: String,
            id_number: Number,
            profile_picture: String,
            school: String,
            students: [{}]
        }
    ],
    requests: [
        {
            accepted: Boolean,
            acceptedDate: Date,
            details: String,
            issuedDate: Date,
            issuer: null,
            reason: String,
            title: String,
            type: String,
            validTill: Date
        }
    ]
}