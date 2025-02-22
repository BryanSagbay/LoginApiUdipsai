import { connectMongoDB } from "@/libs/database";
import User from "@/models/User";
import { messages } from "@/utils/messages";
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import jwt from "jsonwebtoken";

const resend = new Resend("re_PfHrGNtr_EoRBxHzt7dHPiM1hozAG2awe")

export async function POST(request: NextRequest) {
    try{
        const body: {email: string} = await request.json();

        const {email} = body;

        await connectMongoDB();

        const userFind = await User.findOne({email});

        // validamos que el usuario exista
        if(!userFind){
            return NextResponse.json(
                {
                    message: messages.error.UserNotFound
                },
                {
                    status: 400
                }
            )};

        const tokenData = {
            email: userFind.email,
            userId: userFind._id
        };

            // Verificamos que JWT_SECRET esté definido
        if (!process.env.JWT_SECRET) {
            return NextResponse.json(
                { message: "JWT_SECRET no está definido en las variables de entorno" },
                { status: 500 }
            );
        }
        const token = jwt.sign({data: tokenData},process.env.JWT_SECRET,{expiresIn: 86400});
        
        const forgetUrl = `http://localhost:3000/change-password?token=${token}`;

        await resend.emails.send({
            from: "onboarding@resend.dev",
            to: email,
            subject: "Recuperar contraseña",
            html: "<a href="+forgetUrl+">Recuperar contraseña</a>"
        });

        return NextResponse.json(
            {
                message: messages.success.emailSend
            },{
                status: 200
            });


    } catch (error) {
        return NextResponse.json(
            {
                message: messages.error.default, error
            },{
                status: 500
            }
        );
    }
}