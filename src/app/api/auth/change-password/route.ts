import { connectMongoDB } from "@/libs/database";
import { messages } from "@/utils/messages";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import jwt from 'jsonwebtoken';
import User from "@/models/User";
import bcrypt from "bcryptjs";

interface BodyProps {
    newPassword: string;
    confirmPassword: string;
}

export async function POST(request: NextRequest) {

    try{

        const body: BodyProps = await request.json();

        const {newPassword, confirmPassword} = body;

        // validamos que las contraseñas no esten vacias
        if(!newPassword || !confirmPassword){
            return NextResponse.json(
                {
                    message: messages.error.needProps
                },
                {
                    status: 400
                }
            );
        }

        await connectMongoDB();

        const headerList = headers();
        const token = (await headerList).get('token');

        // validamos que el token exista
        if(!token){
            return NextResponse.json(
                {
                    message: messages.error.notAutorized
                },
                {
                    status: 500
                }
            );
        }

        //process.env.JWT_SECRET
        try{
            
            const isTokenValid = jwt.verify(token, 'secreto'); 
            
            //@ts-ignore
            const { data } = isTokenValid;

            const userFind = await User.findById(data.userId);

            //validamos que el usuario exista
            if(!userFind){
                return NextResponse.json(
                    {
                        message: messages.error.UserNotFound
                    },
                    {
                        status: 404
                    }
                );
            }

            //validamos la nueva contraseña
            if(newPassword !== confirmPassword){
                return NextResponse.json(
                    {
                        message: messages.error.PasswordNotMatch
                    },
                    {
                        status: 400
                    }
                );
            } 

            const hashedPassword = await bcrypt.hash(newPassword, 10);

            userFind.password = hashedPassword;

            await userFind.save();

            return NextResponse.json(
                {
                    message: messages.success.passwordChanged
                },
                {
                    status: 200
                }
            )

        } catch(error){
            return NextResponse.json(
                {
                    message: messages.error.tokenNotValid, error
                },
                {
                    status: 500
                }
            )
        }  
    }catch(error){
        return NextResponse.json(
            {
                message: messages.error.default, error
            },
            {
                status: 500 
            }
        );
    }
}