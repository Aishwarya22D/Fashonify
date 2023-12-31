import connectToDB from "@/database/connection";
import User from "@/models/users";
import { compare } from "bcrypt";
import Joi from "joi";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

const schema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

export const dynamic = "force-dynamic";

export async function POST(request) {
  await connectToDB();

  const { email, password } = await request.json();
    console.log(email,password);
  const { error } = schema.validate({ email, password });
  if (error) {
    return NextResponse.json({
      success: false,
      message: error.details[0].message,
    });
  }

  try {

    const checkUser = await User.findOne({email})
    if(!checkUser) {
        return NextResponse.json({
            success: false,
            message: "Account not found with this email address", 
          });
    }

    const checkPassword = await compare(password, checkUser.password)
    if(!checkPassword){
        return NextResponse.json({
            success: false,
            message: "Incorrect Password! Please try again later",
          });
    }
    
    const token = jwt.sign({
        id : checkUser._id,email : checkUser?.email , role:checkUser?.role
    },"jwt_secret_key",{expiresIn :  "1d"})

    const finalData = {
        token,
        user : {
            email : checkUser.email,
            name :  checkUser.name,
            _id : checkUser._id,
            role : checkUser.role

        }
    }


    return NextResponse.json({
        success: true,
        message : "Login successfull!",
        finalData
    })

  } catch (e) {
    console.log(`Error while Login. Please try again`);
    return NextResponse.json({
      success: false,
      message: "Something went wrong! Please try again later",
    });
  }
}
