import dotenv from 'dotenv';
if (process.env.NODE_ENV !== 'production') {
    dotenv.config();
}
import express from 'express';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import userValidationSchema from './Validation/UserValidation.js';
import UserModel from './models/User.js';
import NewBlogSchema from './models/NewBlog.js';
import { ValidationError } from 'yup';
import cookieParser from 'cookie-parser';
import { deserializeUser } from './middleware/deserializeUser.js';
import cors from 'cors';
import MailGun from 'mailgun.js';
import formData from 'form-data';
const mailgun = new MailGun(formData);
import formidable from 'formidable';
import { fileURLToPath } from 'url';
import path from 'path';
import fs, { write } from 'fs';

const mg = mailgun.client({ username: 'api', key: process.env.MAILGUN_API_KEY || 'key-yourkeyhere' });
const app = express();
app.use(express.json());
// app.use(deserializeUser);
app.use(cookieParser());
app.use(cors({ credentials: true, origin: 'http://localhost:5173' }));



mongoose.connect(process.env.MONGO_DB_URL!)
    .then((resp) => {
        console.log('connected to mongoDB');
    })
    .catch((err) => {
        console.log('issue trying to connect to mongoDB', err);
    })

app.post('/register', async (req, res) => {
    console.log('hello');
    let { userName, email, password } = req.body;
    try {
        const isUser = await UserModel.findOne({ email });
        const isUserName = await UserModel.findOne({ userName });
        if (isUser) {
            return res.status(409).json({ message: "user already exists" });
        }
        if (isUserName) {
            return res.status(409).json({ message: "username already taken" });
        }
        await userValidationSchema.validate(req.body);
        const hashedPassword = await bcrypt.hash(password, 12);
        let newUser = new UserModel({
            userName: userName,
            email: email,
            password: hashedPassword
        })
        await newUser.save();

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

        res.json({ message: userName + " " + "has been added to the database" });
    } catch (err) {
        if (err instanceof ValidationError) {
            return res.status(400).json({ message: err.message });
        }
    }

})


app.post('/login', deserializeUser, async (req, res) => {
    //if user already exists bypass login process
    //@ts-ignore
    if (req.user) {
        res.status(200).json({ message: "authenticated" });
    }

    try {
        await userValidationSchema.validate(req.body);
        let { email, password } = req.body;
        const user = await UserModel.findOne({ email })
        if (!user) return res.status(400).json({ message: "user does not exist" })
        const validPassword = await bcrypt.compare(password, user.password);
        if (validPassword) {
            let accessToken = jwt.sign({ email }, process.env.ACCESS_TOKEN_KEY!, { expiresIn: "30m" });
            let refreshToken = jwt.sign({ email }, process.env.REFRESH_TOKEN_KEY!, { expiresIn: "1y" });
            user.refreshToken = refreshToken;
            user.save();
            res.cookie('refreshToken', refreshToken, { httpOnly: true, sameSite: "none", secure: true, maxAge: 24 * 60 * 60 * 1000 });
            res.cookie('accessToken', accessToken, { httpOnly: true, sameSite: "none", secure: true, })
            return res.json({ "message": "Successfully logged in. Redirecting." });
        } else {
            res.sendStatus(401).json({ message: "wrong username or password" });
        }
    } catch (err) {
        res.sendStatus(401).json({ message: "email or password in incorrect format" });
    }
})

app.get('/blogs', deserializeUser, async (req, res) => {
    //@ts-ignore
    if (req.user) {
        try {
            const allBlogs = await NewBlogSchema.find()
            res.status(200).json(allBlogs);
        } catch (err) {
            res.status(500).json(err);
        }
    } else {
        res.json({ "message": "Not Authorized to view this blog" });
    }
});

app.post('/logout', deserializeUser, async (req, res) => {
    //@ts-ignore
    const { accessToken, refreshToken } = req.cookies;
    if (!refreshToken) return res.sendStatus(403);
    //@ts-ignore
    let user = await UserModel.findOne({ email: req.user.email });
    if (user) {
        user.refreshToken = "";
        user.save();
        res.cookie('refreshToken', "", { httpOnly: true, sameSite: "none", secure: true, maxAge: 0 });
        res.cookie('accessToken', "", { httpOnly: true, sameSite: "none", secure: true, maxAge: 0 });
        res.status(200).json({ "message": "successfully logged out" });
    } else {
        res.status(403).json({ "message": "user does not exist" });
    }
})

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// const uploadImagesFolder = path.join(__dirname, "public", "images");

app.post('/newblogentry', deserializeUser, (req, res, next) => {
    //@ts-ignore

    console.log(req.user);
    const form = formidable({});
    form.parse(req, (err, fields, files) => {
        if (err) return res.status(400).json(err);
        if (files) {
            console.log('FILES', files);
            const origName = files.blogImage[0].originalFilename;
            const origNameDateStamped = Date.now() + origName!;
            const oldPath = files.blogImage[0].filepath;
            const newPath = path.resolve("images", origNameDateStamped!);
            fs.rename(oldPath, newPath, (err) => {
                if (err) return console.log(err);
            });
            console.log('file name', origNameDateStamped);
            const newBlog = new NewBlogSchema({
                //@ts-ignore
                email: req.user.email,
                blogTitle: fields.blogTitle[0],
                blogBody: fields.blogBody[0],
                blogImageName: origNameDateStamped
            })
            newBlog.save();
            res.status(200).json({ "message": "blog successfully saved" });
        }

        // fs.rename(oldPath, newPath, (err) => {
        //     if (err) return console.log("error saving file");
        //     res.json({ "message": "image successfully saved" });
        // })
    });

});

app.get('/images/:name', (req, res) => {
    console.log('image requested');
    let imageName = req.params.name;
    console.log('IMAGE NAME >>>>>>', imageName);
    const joinedPath = path.join(__dirname, "..", "images", imageName);
    console.log('JOINED PATH', joinedPath)
    res.sendFile(joinedPath);
})
// app.post('/logout', deserializeUser, async (req, res) => {
//     //@ts-ignore
//     if (req.user) {
//         //@ts-ignore
//         const { email } = req.user;
//         let dbUser = await UserModel.findOne({ email });
//         dbUser!.refreshToken = "";
//         res.status(200).json({ "message": "successfully logged out" });
//     } else {
//         res.status(403).json({ "message": "already logged out" });
//     }
// })


app.listen(3000, () => {
    console.log('listening on port 3000');
})