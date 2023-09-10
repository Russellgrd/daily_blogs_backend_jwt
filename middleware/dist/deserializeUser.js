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
        while (_) try {
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
exports.__esModule = true;
exports.deserializeUser = void 0;
var User_js_1 = require("../models/User.js");
var jsonwebtoken_1 = require("jsonwebtoken");
exports.deserializeUser = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, accessToken, refreshToken, decoded, email, err_1, knownError, decoded, email, dbUser, newAccessToken, err_2;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = req.cookies, accessToken = _a.accessToken, refreshToken = _a.refreshToken;
                if (!accessToken)
                    return [2 /*return*/, next()];
                _b.label = 1;
            case 1:
                _b.trys.push([1, 2, , 7]);
                decoded = jsonwebtoken_1["default"].verify(accessToken, process.env.ACCESS_TOKEN_KEY);
                email = decoded.email;
                //@ts-ignore
                req.user = { email: email };
                return [2 /*return*/, next()];
            case 2:
                err_1 = _b.sent();
                knownError = err_1;
                if (knownError.message.includes("invalid signature")) {
                    return [2 /*return*/, res.status(401).json(err_1)];
                }
                ;
                if (!knownError.message.includes("jwt expired")) return [3 /*break*/, 6];
                _b.label = 3;
            case 3:
                _b.trys.push([3, 5, , 6]);
                decoded = jsonwebtoken_1["default"].verify(refreshToken, process.env.REFRESH_TOKEN_KEY);
                email = decoded.email;
                return [4 /*yield*/, User_js_1["default"].findOne({ email: email })];
            case 4:
                dbUser = _b.sent();
                if ((dbUser === null || dbUser === void 0 ? void 0 : dbUser.refreshToken) === refreshToken) {
                    console.log('issuing a new token');
                    newAccessToken = jsonwebtoken_1["default"].sign({ email: email }, process.env.ACCESS_TOKEN_KEY, { expiresIn: "30m" });
                    res.cookie('accessToken', newAccessToken, { httpOnly: true, sameSite: "none", secure: true, maxAge: 24 * 60 * 60 * 1000 });
                    return [2 /*return*/, next()];
                }
                else {
                    return [2 /*return*/, res.status(401).json({ message: "RefreshToken invalid" })];
                }
                return [3 /*break*/, 6];
            case 5:
                err_2 = _b.sent();
                return [2 /*return*/, res.status(401).json(err_2)];
            case 6: return [3 /*break*/, 7];
            case 7: return [2 /*return*/];
        }
    });
}); };
