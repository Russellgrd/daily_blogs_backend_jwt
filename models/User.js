"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = require("mongoose");
var UserSchema = new mongoose_1.default.Schema({
    userName: {
        type: String,
        unique: true,
        required: true
    },
    email: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    refreshToken: {
        type: String,
    }
});
exports.default = mongoose_1.default.model("User", UserSchema);
