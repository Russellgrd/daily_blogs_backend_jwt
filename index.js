"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var dotenv_1 = require("dotenv");
if (process.env.NODE_ENV !== 'production') {
    dotenv_1.default.config();
}
var express_1 = require("express");
var jsonwebtoken_1 = require("jsonwebtoken");
var mongoose_1 = require("mongoose");
var bcryptjs_1 = require("bcryptjs");
var UserValidation_js_1 = require("./Validation/UserValidation.js");
var User_js_1 = require("./models/User.js");
var NewBlog_js_1 = require("./models/NewBlog.js");
var yup_1 = require("yup");
var cookie_parser_1 = require("cookie-parser");
var deserializeUser_js_1 = require("./middleware/deserializeUser.js");
var cors_1 = require("cors");
var mailgun_js_1 = require("mailgun.js");
var form_data_1 = require("form-data");
var mailgun = new mailgun_js_1.default(form_data_1.default);
var formidable_1 = require("formidable");
var url_1 = require("url");
var path_1 = require("path");
var fs_1 = require("fs");
var mongodb_1 = require("mongodb");
var mg = mailgun.client({ username: 'api', key: process.env.MAILGUN_API_KEY || 'key-yourkeyhere' });
var app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use((0, cors_1.default)({ credentials: true, origin: 'http://localhost:5173' }));
mongoose_1.default.connect(process.env.MONGO_DB_URL)
    .then(function (resp) {
    console.log('connected to mongoDB');
})
    .catch(function (err) {
    console.log('issue trying to connect to mongoDB', err);
});
app.post('/register', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, userName, email, password, isUser, isUserName, hashedPassword, newUser, err_1;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = req.body, userName = _a.userName, email = _a.email, password = _a.password;
                _b.label = 1;
            case 1:
                _b.trys.push([1, 7, , 8]);
                return [4 /*yield*/, User_js_1.default.findOne({ email: email })];
            case 2:
                isUser = _b.sent();
                return [4 /*yield*/, User_js_1.default.findOne({ userName: userName })];
            case 3:
                isUserName = _b.sent();
                if (isUser) {
                    return [2 /*return*/, res.status(409).json({ message: "user already exists" })];
                }
                if (isUserName) {
                    return [2 /*return*/, res.status(409).json({ message: "username already taken" })];
                }
                return [4 /*yield*/, UserValidation_js_1.default.validate(req.body)];
            case 4:
                _b.sent();
                return [4 /*yield*/, bcryptjs_1.default.hash(password, 12)];
            case 5:
                hashedPassword = _b.sent();
                newUser = new User_js_1.default({
                    userName: userName,
                    email: email,
                    password: hashedPassword
                });
                return [4 /*yield*/, newUser.save()];
            case 6:
                _b.sent();
                //implement email service.
                // mg.messages.create('sandboxb2803770d321422094759b7502246caa.mailgun.org', {
                //     from: "Excited User <mailgun@sandbox-123.mailgun.org>",
                //     to: [`${newUser.email}`],
                //     subject: "Hi there!",
                //     text: "Testing some Mailgun awesomness!",
                //     html: "<h1>Testing some Mailgun awesomness!</h1>"
                // })
                //     .then(msg => console.log(msg)) // logs response data
                //     .catch(err => console.error(err)); // logs any error
                return [2 /*return*/, res.json({ message: userName + " " + "has been added to the database" })];
            case 7:
                err_1 = _b.sent();
                if (err_1 instanceof yup_1.ValidationError) {
                    return [2 /*return*/, res.status(400).json({ message: err_1.message })];
                }
                return [3 /*break*/, 8];
            case 8: return [2 /*return*/];
        }
    });
}); });
app.post('/login', deserializeUser_js_1.deserializeUser, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, email, password, user, validPassword, accessToken, refreshToken, err_2;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                //if user already exists bypass login process
                if (req.user) {
                    return [2 /*return*/, res.status(200).json({ message: "authenticated" })];
                }
                _b.label = 1;
            case 1:
                _b.trys.push([1, 5, , 6]);
                return [4 /*yield*/, UserValidation_js_1.default.validate(req.body)];
            case 2:
                _b.sent();
                _a = req.body, email = _a.email, password = _a.password;
                return [4 /*yield*/, User_js_1.default.findOne({ email: email })];
            case 3:
                user = _b.sent();
                if (!user)
                    return [2 /*return*/, res.status(400).json({ message: "user does not exist" })];
                return [4 /*yield*/, bcryptjs_1.default.compare(password, user.password)];
            case 4:
                validPassword = _b.sent();
                if (validPassword) {
                    accessToken = jsonwebtoken_1.default.sign({ email: email }, process.env.ACCESS_TOKEN_KEY, { expiresIn: "30m" });
                    refreshToken = jsonwebtoken_1.default.sign({ email: email }, process.env.REFRESH_TOKEN_KEY, { expiresIn: "1y" });
                    user.refreshToken = refreshToken;
                    user.save();
                    res.cookie('refreshToken', refreshToken, { httpOnly: true, sameSite: "none", secure: true, maxAge: 24 * 60 * 60 * 1000 });
                    res.cookie('accessToken', accessToken, { httpOnly: true, sameSite: "none", secure: true, });
                    return [2 /*return*/, res.json({ "message": "Successfully logged in. Redirecting." })];
                }
                else {
                    return [2 /*return*/, res.sendStatus(401).json({ message: "wrong username or password" })];
                }
                return [3 /*break*/, 6];
            case 5:
                err_2 = _b.sent();
                return [2 /*return*/, res.sendStatus(401).json({ message: "email or password in incorrect format" })];
            case 6: return [2 /*return*/];
        }
    });
}); });
app.get('/blogs', deserializeUser_js_1.deserializeUser, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var allBlogs, err_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!req.user) return [3 /*break*/, 5];
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, NewBlog_js_1.default.find()];
            case 2:
                allBlogs = _a.sent();
                return [2 /*return*/, res.status(200).json(allBlogs)];
            case 3:
                err_3 = _a.sent();
                return [2 /*return*/, res.status(500).json(err_3)];
            case 4: return [3 /*break*/, 6];
            case 5: return [2 /*return*/, res.json({ "message": "Not Authorized to view this blog" })];
            case 6: return [2 /*return*/];
        }
    });
}); });
app.get('/logout', deserializeUser_js_1.deserializeUser, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, accessToken, refreshToken, user;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = req.cookies, accessToken = _a.accessToken, refreshToken = _a.refreshToken;
                if (!refreshToken)
                    return [2 /*return*/, res.status(403).json({ "message": "User is not currently logged in" })];
                if (!req.user)
                    return [2 /*return*/, res.status(403).json({ "message": "Something went wrong, please log in again" })];
                return [4 /*yield*/, User_js_1.default.findOne({ email: req.user.email })];
            case 1:
                user = _b.sent();
                if (user) {
                    user.refreshToken = "";
                    user.save();
                    res.cookie('refreshToken', "", { httpOnly: true, sameSite: "none", secure: true, maxAge: 0 });
                    res.cookie('accessToken', "", { httpOnly: true, sameSite: "none", secure: true, maxAge: 0 });
                    return [2 /*return*/, res.status(200).json({ "message": "successfully logged out" })];
                }
                else {
                    return [2 /*return*/, res.status(403).json({ "message": "user does not exist" })];
                }
                return [2 /*return*/];
        }
    });
}); });
var __filename = (0, url_1.fileURLToPath)(import.meta.url);
var __dirname = path_1.default.dirname(__filename);
// const uploadImagesFolder = path.join(__dirname, "public", "images");
app.post('/newblogentry', deserializeUser_js_1.deserializeUser, function (req, res, next) {
    var form = (0, formidable_1.default)({});
    form.parse(req, function (err, fields, files) {
        if (err)
            return res.status(400).json(err);
        if (Object.keys(files).length === 0 && req.user) {
            var newBlog = new NewBlog_js_1.default({
                email: req.user.email,
                blogTitle: fields.blogTitle[0],
                blogBody: fields.blogBody[0],
            });
            newBlog.save();
            return res.status(200).json({ "message": "blog successfully saved" });
        }
        else {
            var origName = files.blogImage[0].originalFilename;
            var origNameDateStamped = Date.now() + origName;
            var oldPath = files.blogImage[0].filepath;
            var newPath = path_1.default.resolve("images", origNameDateStamped);
            fs_1.default.rename(oldPath, newPath, function (err) {
                if (err)
                    return console.log(err);
            });
            if (req.user) {
                var newBlog = new NewBlog_js_1.default({
                    email: req.user.email,
                    blogTitle: fields.blogTitle[0],
                    blogBody: fields.blogBody[0],
                    blogImageName: origNameDateStamped
                });
                newBlog.save();
                return res.status(200).json({ "message": "blog successfully saved" });
            }
            else {
                return res.status(400).json(err);
            }
        }
    });
});
app.post('/delete', deserializeUser_js_1.deserializeUser, function (req, res) {
    console.log(req.body);
    console.log(req === null || req === void 0 ? void 0 : req.user);
    var reqEmail = req.body.email;
    var userEmail = req.body.email;
    var blogDetails = req.body;
    if (reqEmail === userEmail) {
        console.log("the blog _id is", blogDetails._id);
        User_js_1.default.find({ "_id": new mongodb_1.ObjectId(blogDetails._id) })
            .then(function (details) {
            console.log('blog found');
            console.log(details);
            res.send('all good');
        });
    }
    else {
        res.send('issues');
    }
});
app.get('/images/:name', function (req, res) {
    var imageName = req.params.name;
    var joinedPath = path_1.default.join(__dirname, "..", "images", imageName);
    return res.sendFile(joinedPath);
});
app.get('/auth', deserializeUser_js_1.deserializeUser, function (req, res) {
    if (req.user) {
        return res.json(req.user);
    }
    else {
        return res.status(401).json({ authenticated: false });
    }
});
app.listen(3000, function () {
    console.log('listening on port 3000');
});
