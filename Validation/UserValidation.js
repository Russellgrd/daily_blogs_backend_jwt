"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var yup = require("yup");
var userValidationSchema = yup.object().shape({
    email: yup.string().email().required(),
    password: yup.string().matches(/\d+/)
        .matches(/[a-z]+/)
        .matches(/[A-Z]+/)
        .matches(/[!@#$%^&*()-+]+/).min(3).required()
});
exports.default = userValidationSchema;
