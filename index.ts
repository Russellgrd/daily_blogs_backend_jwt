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
import { ValidationError } from 'yup';
import cookieParser from 'cookie-parser';
import { deserializeUser } from './middleware/deserializeUser.js';


const app = express();



app.use(express.json());
// app.use(deserializeUser);
app.use(cookieParser());



mongoose.connect(process.env.MONGO_DB_URL!)
    .then((resp) => {
        console.log('connected to mongoDB');
    })
    .catch((err) => {
        console.log('issue trying to connect to mongoDB', err);
    })



app.post('/register', async (req, res) => {
    let { email, password } = req.body;
    try {
        const isUser = await UserModel.findOne({ email })
        if (isUser) return res.status(400).json({ message: "user already exists" });
        await userValidationSchema.validate(req.body);
        const hashedPassword = await bcrypt.hash(password, 12);
        let newUser = new UserModel({
            email: email,
            password: hashedPassword
        })
        await newUser.save();
        res.json({ message: email + " " + "has been added to the database" });
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
            let accessToken = jwt.sign({ email }, process.env.ACCESS_TOKEN_KEY!, { expiresIn: "10s" });
            let refreshToken = jwt.sign({ email }, process.env.REFRESH_TOKEN_KEY!, { expiresIn: "1y" });
            user.refreshToken = refreshToken;
            user.save();
            res.cookie('refreshToken', refreshToken, { httpOnly: true, sameSite: "none", secure: true, maxAge: 24 * 60 * 60 * 1000 });
            res.cookie('accessToken', accessToken, { httpOnly: true, sameSite: "none" })
            return res.json({ accessToken, refreshToken });
        } else {
            res.sendStatus(401).json({ message: "wrong username or password" });
        }
    } catch (err) {
        res.sendStatus(401).json({ message: "email or password in incorrect format" });
    }
})

app.get('/blogs', deserializeUser, (req, res) => {
    res.json({ "blogs": "Hello there is the blogs for today." })
})

app.post('/logout', deserializeUser, async (req, res) => {
    //@ts-ignore
    if (req.user) {
        //@ts-ignore
        const { email } = req.user;
        let dbUser = await UserModel.findOne({ email });
        dbUser!.refreshToken = "";
        res.status(200).json({ "message": "successfully logged out" });
    } else {
        res.status(403).json({ "message": "already logged out" });
    }
})


app.listen(3000, () => {
    console.log('listening on port 3000');
})