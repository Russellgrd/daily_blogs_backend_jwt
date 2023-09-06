
import mongoose from 'mongoose';

const NewBlogSchema = new mongoose.Schema({
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
},
    { timestamps: true }
)

export default mongoose.model("NewBlog", NewBlogSchema);
