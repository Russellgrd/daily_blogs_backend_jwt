import * as yup from 'yup';

const userValidationSchema = yup.object().shape({
    email: yup.string().email().required(),
    password: yup.string().matches(/\d+/)
        .matches(/[a-z]+/)
        .matches(/[A-Z]+/)
        .matches(/[!@#$%^&*()-+]+/).min(3).required()
})


export default userValidationSchema;

