import mongoose,{ Schema, Document, ObjectId} from "mongoose";


export interface IUser {
    _id?: ObjectId | string | undefined;
    email: string;
    password: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface IUserSchema extends Document {
    email: string;
    password: string;
    createdAt?: Date;
    updatedAt?: Date;
}

const UserSchema: Schema = new Schema(
    {
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
    },{
        versionKey: false,
        timestamps: true,
    }

);


const User = mongoose.models.User || mongoose.model("User", UserSchema)
export default User;