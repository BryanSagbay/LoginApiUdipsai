import { connectMongoDB } from "@/libs/database";
import User, { IUser } from "@/models/User";
import { messages } from "@/utils/messages";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function POST(request: NextRequest) {

    try{

        await connectMongoDB();

        const body: IUser = await request.json();
        const {email, password} = body;

        //Validamos que los campos no esten vacios
        if(!email || !password){
            return NextResponse.json(
            {
                messages: messages.error.needProps
            },
            {
                status: 400
            }
            )
        }

        const UserFind = await User.findOne({email});

        // Validamos que el usuario exista
        if(!UserFind){
            return NextResponse.json(
            {
                messages: messages.error.UserNotFound
            },
            {
                status: 400
            }
            )
        }

        const isCorret: boolean = await bcrypt.compare(password, UserFind.password);

        // Validamos que la contraseña sea correcta
        if(!isCorret){
            return NextResponse.json(
            {
                messages: messages.error.incorredPassword
            },
            {
                status: 400
            }
            )
        }

        // @ts-ignore
        const { password: userPass, ...rest} = UserFind._doc;

        const token = jwt.sign({data: rest}, 'secreto', {expiresIn: 86400});
        
        const response = NextResponse.json(
            { userLogged: rest, messages: messages.success.userLogged, token },
            { status: 200 }
        );
        response.cookies.set("auth_cookie", token, {
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 86400,
            path: "/",
        });

        return response;

    } catch (error) {
        return NextResponse.json(
            { messages: messages.error.default, error},
            { status: 500 }
        );
    }

}