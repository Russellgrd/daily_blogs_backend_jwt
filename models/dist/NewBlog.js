"use strict";
exports.__esModule = true;
var mongoose_1 = require("mongoose");
var NewBlogSchema = new mongoose_1["default"].Schema({
    email: {
        type: String,
        required: true
    },
    blogTitle: {
        type: String,
        required: true
    },
    blogBody: {
        type: String,
        required: true
    },
    blogImageName: {
        type: String
    }
}, { timestamps: true });
exports["default"] = mongoose_1["default"].model("NewBlog", NewBlogSchema);
