import { NextRequest, NextResponse } from "next/server";
import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID as string;
const authToken = process.env.TWILIO_AUTH_TOKEN as string;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER as string;

export async function POST(req: NextRequest) {
  try {
    // Check environment variables
    if (!accountSid || !authToken || !twilioPhoneNumber) {
      throw new Error("Twilio environment variables are missing.");
    }

    // Initialize Twilio client
    const client = twilio(accountSid, authToken);

    const { phoneNumber } = await req.json();

    if (!phoneNumber) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
    }

    // Message to alert the user of potential heart attack risk
    const alertMessage = `ALERT: Your heart rate indicates a potential risk of a heart attack. Please seek medical attention immediately or call emergency services.`;

    // Send the alert message via Twilio
    await client.messages.create({
      body: alertMessage,
      from: twilioPhoneNumber,
      to: phoneNumber
    });

    return NextResponse.json({ message: 'Alert sent successfully' }, { status: 200 });
  } catch (error: any) {
    console.error('Error sending alert:', error.message || error);
    return NextResponse.json({ error: `Failed to send alert: ${error.message || "Unknown error"}` }, { status: 500 });
  }
}
