import { isValidEmails } from "@/utils/isValidEmails";
import { messages } from "@/utils/messages";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import User, {IUserSchema} from "@/models/User";
import { connectMongoDB } from "@/libs/database";
import jwt from "jsonwebtoken";

export async function POST(request: NextRequest){
    try {
        await connectMongoDB();
        const body = await request.json();
        const { email, password, confirmPassword } = body;
       
        // Verificar si los campos están vacíos
        if(!email || !password || !confirmPassword){
            return NextResponse.json(
                {
                    message: messages.error.needProps,
                },
                {
                    status: 400
                }
            )
        }

        // Verificar el email
        if(!isValidEmails(email)){
            return NextResponse.json(
                {
                    message: messages.error.emailNotValid,
                },
                {
                    status: 400
                }
            )
        }

        // Verificar si las contraseñas coinciden
        if(password !== confirmPassword){
            return NextResponse.json(
                {
                    message: messages.error.isValidPassword,
                },
                {
                    status: 400
                }
            )
        }
        
        const userFind = await User.findOne({email});
    
        if(userFind){
            return NextResponse.json(
                {
                    message: messages.error.emailExist,
                },
                {
                    status: 400
                }
            )
        }   
        
        const hashPassword = await bcrypt.hash(password, 10);
        const newUser : IUserSchema = new User({
            email,
            password: hashPassword,
        });

        //@ts-ignore
        const {password: userPass, ...rest} = newUser;

        await newUser.save();

        const token = jwt.sign({ data: rest}, 'secreto', {expiresIn: '24h'});

        const response = NextResponse.json({
            newUser: rest,
            messages: messages.success.userCreated,
        },
        {
            status: 200,
        });

        response.cookies.set("auth_cookie", token, {
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 86400,
            path: '/',
        })

        return response;

    }catch (error) {
        return NextResponse.json(
            {
                message: messages.error.default, error
            },
            {
                status: 500
            }
        )
    }
}