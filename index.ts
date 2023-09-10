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

        return res.json({ message: userName + " " + "has been added to the database" });
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
        return res.status(200).json({ message: "authenticated" });
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
            return res.sendStatus(401).json({ message: "wrong username or password" });
        }
    } catch (err) {
        return res.sendStatus(401).json({ message: "email or password in incorrect format" });
    }
})

app.get('/blogs', deserializeUser, async (req, res) => {
    //@ts-ignore
    //@ts-ignore
    if (req.user) {
        try {
            const allBlogs = await NewBlogSchema.find()
            return res.status(200).json(allBlogs);
        } catch (err) {
            return res.status(500).json(err);
        }
    } else {
        return res.json({ "message": "Not Authorized to view this blog" });
    }
});

app.get('/logout', deserializeUser, async (req, res) => {
    //@ts-ignore
    const { accessToken, refreshToken } = req.cookies;
    if (!refreshToken) return res.status(403).json({ "message": "User is not currently logged in" });
    //@ts-ignore
    let user = await UserModel.findOne({ email: req.user.email });
    if (user) {
        user.refreshToken = "";
        user.save();
        res.cookie('refreshToken', "", { httpOnly: true, sameSite: "none", secure: true, maxAge: 0 });
        res.cookie('accessToken', "", { httpOnly: true, sameSite: "none", secure: true, maxAge: 0 });
        return res.status(200).json({ "message": "successfully logged out" });
    } else {
        return res.status(403).json({ "message": "user does not exist" });
    }
})

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// const uploadImagesFolder = path.join(__dirname, "public", "images");

app.post('/newblogentry', deserializeUser, (req, res, next) => {
    //@ts-ignore
    const form = formidable({});
    form.parse(req, (err, fields, files) => {
        if (err) return res.status(400).json(err);
        if (Object.keys(files).length === 0) {
            const newBlog = new NewBlogSchema({
                //@ts-ignore
                email: req.user.email,
                blogTitle: fields.blogTitle[0],
                blogBody: fields.blogBody[0],
            });
            newBlog.save();
            return res.status(200).json({ "message": "blog successfully saved" });
        } else {
            const origName = files.blogImage[0].originalFilename;
            const origNameDateStamped = Date.now() + origName!;
            const oldPath = files.blogImage[0].filepath;
            const newPath = path.resolve("images", origNameDateStamped!);
            fs.rename(oldPath, newPath, (err) => {
                if (err) return console.log(err);
            });
            const newBlog = new NewBlogSchema({
                //@ts-ignore
                email: req.user.email,
                blogTitle: fields.blogTitle[0],
                blogBody: fields.blogBody[0],
                blogImageName: origNameDateStamped
            })
            newBlog.save();
            return res.status(200).json({ "message": "blog successfully saved" });

        }
    });

});

app.get('/images/:name', (req, res) => {
    let imageName = req.params.name;
    const joinedPath = path.join(__dirname, "..", "images", imageName);
    return res.sendFile(joinedPath);
})

app.get('/auth', deserializeUser, async (req, res) => {
    //@ts-ignore
    if (req.user) {
        return res.json({ authenticated: true })
    } else {
        return res.status(401).json({ authenticated: false });
    }
});


app.listen(3000, () => {
    console.log('listening on port 3000');
})