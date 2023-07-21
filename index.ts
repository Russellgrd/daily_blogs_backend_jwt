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
import yup from 'yup';
import { ValidationError } from 'yup';

const app = express();



app.use(express.json());

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
        if (isUser) return res.status(400).send("user already exists");
        await userValidationSchema.validate(req.body);
        const hashedPassword = await bcrypt.hash(password, 12);
        let newUser = new UserModel({
            email: email,
            password: hashedPassword
        })
        await newUser.save();
        res.send(email + "" + "has been added to the database");
    } catch (err) {
        if (err instanceof ValidationError) {
            return res.status(400).send(err.message);
        }
    }

})

app.get('/login', (req, res) => {
    let { email, password } = req.body;
    let token = jwt.sign({ email }, "tintin");
    console.log('token is', token);
    res.cookie("token", token, { httpOnly: true });
    res.send('json cook set')
})


app.listen(3000, () => {
    console.log('listening on port 3000');
})