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
    // Use port 465 with SSL (standard for Hostinger)
    const transporter = nodemailer.createTransport({
      host: 'smtp.hostinger.com',
      port: 465,
      secure: true, // true for 465, false for other ports
      auth: {
        user: emailUser,
        pass: emailPass,
      },
      tls: {
        // Do not fail on invalid certs (some servers have self-signed certs)
        rejectUnauthorized: false,
      },
    });

    // Verify transporter configuration
    try {
      console.log('Verifying SMTP connection...');
      await transporter.verify();
      console.log('SMTP connection verified successfully');
    } catch (verifyError: any) {
      console.error('SMTP verification failed:', {
        code: verifyError.code,
        command: verifyError.command,
        message: verifyError.message,
      });
      return NextResponse.json(
        { 
          success: false, 
          error: 'Email service configuration error. Please check your SMTP credentials.',
          details: process.env.NODE_ENV === 'development' ? verifyError.message : undefined
        },
        { status: 500 }
      );
    }

    // Email content - send to contact email
    // Note: Auto-responses typically trigger when email is received from external senders
    // The email will be delivered to your inbox, and Hostinger's auto-response should trigger
    const mailOptions = {
      from: emailUser, // Authenticated sender (required for SMTP)
      to: emailUser, // Send to contact email
      replyTo: sanitizedEmail, // Reply-to set to user's email so you can reply directly
      subject: `New Contact Form Message from ${sanitizedName}`,
      // Standard headers
      headers: {
        'X-Mailer': 'Inspired Intelligence Academy Contact Form',
      },
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
          <h2 style="color: #2A2D7C; border-bottom: 2px solid #3D7FFF; padding-bottom: 10px; margin-bottom: 20px;">
            New Contact Form Message
          </h2>
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin-bottom: 20px; border-left: 4px solid #3D7FFF;">
            <p style="margin: 10px 0; color: #333;"><strong>Name:</strong> ${sanitizedName}</p>
            <p style="margin: 10px 0; color: #333;"><strong>Email:</strong> <a href="mailto:${sanitizedEmail}" style="color: #3D7FFF;">${sanitizedEmail}</a></p>
          </div>
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin-top: 10px;">
            <p style="margin: 0 0 10px 0; color: #333; font-weight: bold;">Message:</p>
            <p style="margin: 0; white-space: pre-wrap; line-height: 1.6; color: #444;">${sanitizedMessage.replace(/\n/g, '<br>')}</p>
          </div>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
          <p style="color: #666; font-size: 12px; margin: 0;">
            This message was sent from the contact form on your website.<br>
            Reply directly to this email to respond to ${sanitizedName} at ${sanitizedEmail}
          </p>
        </body>
        </html>
      `,
      text: `
New Contact Form Message

Name: ${sanitizedName}
Email: ${sanitizedEmail}

Message:
${sanitizedMessage}

---
This message was sent from the contact form on your website.
Reply directly to this email to respond to ${sanitizedName} at ${sanitizedEmail}
      `,
    };

    // Send email
    console.log('Sending email...', {
      to: mailOptions.to,
      replyTo: mailOptions.replyTo,
      subject: mailOptions.subject,
    });

    const info = await transporter.sendMail(mailOptions);

    // Log success (without sensitive data)
    console.log('Email sent successfully:', {
      messageId: info.messageId,
      response: info.response,
      accepted: info.accepted,
      rejected: info.rejected,
    });

    // Check if email was accepted
    if (info.rejected && info.rejected.length > 0) {
      console.error('Email was rejected:', info.rejected);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Email was rejected by the server. Please check your email configuration.',
        },
        { status: 500 }
      );
    }

    if (!info.accepted || info.accepted.length === 0) {
      console.error('Email was not accepted by server');
      return NextResponse.json(
        { 
          success: false, 
          error: 'Email was not accepted by the server. Please try again.',
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, message: 'Email sent successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Contact form error:', {
      code: error.code,
      command: error.command,
      message: error.message,
      response: error.response,
      responseCode: error.responseCode,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });

    // Handle specific error types
    if (error.code === 'EAUTH') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Email authentication failed. Please check your email credentials.',
          details: process.env.NODE_ENV === 'development' ? error.message : undefined
        },
        { status: 500 }
      );
    }

    if (error.code === 'ECONNECTION' || error.code === 'ETIMEDOUT') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Connection to email server failed. Please try again later.',
          details: process.env.NODE_ENV === 'development' ? error.message : undefined
        },
        { status: 500 }
      );
    }

    if (error.code === 'EENVELOPE') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid email address. Please check the recipient email.',
          details: process.env.NODE_ENV === 'development' ? error.message : undefined
        },
        { status: 500 }
      );
    }

    // Generic error response
    return NextResponse.json(
      { 
        success: false, 
        error: 'An unexpected error occurred. Please try again later.',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

