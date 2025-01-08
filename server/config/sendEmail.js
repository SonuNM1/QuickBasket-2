import { Resend } from 'resend';
import dotenv from 'dotenv'
dotenv.config()

if(!process.env.RESEND_API){
   console.log('Provide RESEND_API inside the .env file') 
}

// Creating an instance of the Resend library, using the API key from the .env file

const resend = new Resend(process.env.RESEND_API);

/*
Defining a reusable function for sending emails.

It accepts an object with 3 properties: sendTo (recipient email), subject and html.
*/ 

const sendEmail = async ({ sendTo, subject, html }) => {
    try{

        // Sending the email using Resend's API 

        const { data, error } = await resend.emails.send({
            from: 'localBazaar <onboarding@resend.dev>',
            to: sendTo,
            subject: subject,
            html: html,
          });

          if (error) {
            return console.error({ error });
          }

          return data ; 

    }catch(error){
        console.log(error)
    }
}

export default sendEmail 

