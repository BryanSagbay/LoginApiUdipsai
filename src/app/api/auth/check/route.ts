import { messages } from "@/utils/messages";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import jwt from 'jsonwebtoken';
import { connectMongoDB } from "@/libs/database";
import User from "@/models/User";

export async function GET() {
   
    try{

        const headersList = headers();
        const token = (await headersList).get('token');

        // Si no hay token, retornar un mensaje de error
        if(!token){
            return NextResponse.json(
                {
                    message: messages.error.notAutorized
                }, 
                {
                    status: 401
                }
            );
        }

        try{
            const isTokenValid = jwt.verify(token,"secreto");

            // @ts-ignore
            const {data} = isTokenValid;

            await connectMongoDB();
            const userFind = await User.findById(data._id);

            // Si no se encuentra el usuario, retornar un mensaje de error
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

            return NextResponse.json(
                {
                    isAuthorized: true, message: messages.success.authorized,
                },
                {
                    
                }
            )

        }catch(error){
            return NextResponse.json(
                {
                    message: messages.error.tokenNotValid, error
                }, 
                {
                    status: 400
                }
            );
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