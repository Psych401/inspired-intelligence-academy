import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// Input sanitization function
function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, ''); // Remove event handlers
}

// Validate email format
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export async function POST(req: NextRequest) {
  try {
    // Parse request body
    const body = await req.json();
    const { name, email, message } = body;

    // Validate required fields
    if (!name || !email || !message) {
      return NextResponse.json(
        { success: false, error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Validate email format
    if (!isValidEmail(email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Sanitize inputs
    const sanitizedName = sanitizeInput(name);
    const sanitizedEmail = sanitizeInput(email);
    const sanitizedMessage = sanitizeInput(message);

    // Validate sanitized inputs are not empty
    if (!sanitizedName || !sanitizedEmail || !sanitizedMessage) {
      return NextResponse.json(
        { success: false, error: 'Invalid input detected' },
        { status: 400 }
      );
    }

    // Check environment variables
    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;

    if (!emailUser || !emailPass) {
      console.error('Missing email credentials in environment variables');
      return NextResponse.json(
        { success: false, error: 'Email service is not configured. Please contact support.' },
        { status: 500 }
      );
    }

    // Create Nodemailer transporter with Hostinger SMTP
    const transporter = nodemailer.createTransport({
      host: 'smtp.hostinger.com',
      port: 465,
      secure: true, // true for 465, false for other ports
      auth: {
        user: emailUser,
        pass: emailPass,
      },
    });

    // Verify transporter configuration
    try {
      await transporter.verify();
    } catch (verifyError) {
      console.error('SMTP verification failed:', verifyError);
      return NextResponse.json(
        { success: false, error: 'Email service configuration error. Please try again later.' },
        { status: 500 }
      );
    }

    // Email content
    const mailOptions = {
      from: emailUser,
      to: emailUser, // Send to the same email address
      replyTo: sanitizedEmail,
      subject: `New Contact Form Message from ${sanitizedName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #2A2D7C; border-bottom: 2px solid #3D7FFF; padding-bottom: 10px; margin-bottom: 20px;">
            New Contact Form Message
          </h2>
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
            <p style="margin: 10px 0;"><strong>Name:</strong> ${sanitizedName}</p>
            <p style="margin: 10px 0;"><strong>Email:</strong> ${sanitizedEmail}</p>
          </div>
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin-top: 10px;">
            <p style="margin: 0 0 10px 0;"><strong>Message:</strong></p>
            <p style="margin: 0; white-space: pre-wrap; line-height: 1.6;">${sanitizedMessage.replace(/\n/g, '<br>')}</p>
          </div>
        </div>
      `,
      text: `
New Contact Form Message

Name: ${sanitizedName}
Email: ${sanitizedEmail}

Message:
${sanitizedMessage}
      `,
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);

    // Log success (without sensitive data)
    console.log('Email sent successfully:', {
      messageId: info.messageId,
      to: emailUser,
    });

    return NextResponse.json(
      { success: true, message: 'Email sent successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Contact form error:', error);

    // Handle specific error types
    if (error.code === 'EAUTH') {
      return NextResponse.json(
        { success: false, error: 'Email authentication failed. Please contact support.' },
        { status: 500 }
      );
    }

    if (error.code === 'ECONNECTION' || error.code === 'ETIMEDOUT') {
      return NextResponse.json(
        { success: false, error: 'Connection to email server failed. Please try again later.' },
        { status: 500 }
      );
    }

    // Generic error response
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred. Please try again later.' },
      { status: 500 }
    );
  }
}

