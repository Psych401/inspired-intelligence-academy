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
    // Try port 465 first (SSL), fallback to 587 (STARTTLS) if needed
    let transporter: nodemailer.Transporter;
    let connectionSuccessful = false;
    let lastError: any = null;

    // Configuration for port 465 (SSL)
    const config465 = {
      host: 'smtp.hostinger.com',
      port: 465,
      secure: true,
      auth: {
        user: emailUser,
        pass: emailPass,
      },
      tls: {
        rejectUnauthorized: false,
      },
      connectionTimeout: 10000,
      socketTimeout: 10000,
      debug: process.env.NODE_ENV === 'development',
      logger: process.env.NODE_ENV === 'development',
    };

    // Configuration for port 587 (STARTTLS)
    const config587 = {
      host: 'smtp.hostinger.com',
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: emailUser,
        pass: emailPass,
      },
      tls: {
        rejectUnauthorized: false,
      },
      connectionTimeout: 10000,
      socketTimeout: 10000,
      debug: process.env.NODE_ENV === 'development',
      logger: process.env.NODE_ENV === 'development',
    };

    // Try port 465 first
    console.log('Attempting SMTP connection on port 465 (SSL)...');
    transporter = nodemailer.createTransport(config465);
    
    try {
      await transporter.verify();
      console.log('SMTP connection verified successfully on port 465');
      connectionSuccessful = true;
    } catch (verifyError: any) {
      console.warn('Port 465 connection failed, trying port 587 (STARTTLS)...', {
        code: verifyError.code,
        message: verifyError.message,
      });
      lastError = verifyError;
      
      // Try port 587 as fallback
      transporter = nodemailer.createTransport(config587);
      try {
        await transporter.verify();
        console.log('SMTP connection verified successfully on port 587');
        connectionSuccessful = true;
      } catch (verifyError587: any) {
        console.error('Both SMTP ports failed:', {
          port465: { code: lastError.code, message: lastError.message },
          port587: { code: verifyError587.code, message: verifyError587.message },
        });
        return NextResponse.json(
          { 
            success: false, 
            error: 'Email service configuration error. Please check your SMTP settings and credentials.',
            details: process.env.NODE_ENV === 'development' 
              ? `Port 465: ${lastError.message}; Port 587: ${verifyError587.message}` 
              : undefined
          },
          { status: 500 }
        );
      }
    }

    // Email content - formatted to trigger auto-responses
    const mailOptions = {
      from: `"${sanitizedName}" <${emailUser}>`, // Use name in from field
      to: emailUser, // Send to the same email address
      replyTo: sanitizedEmail, // Set reply-to to user's email
      subject: `New Contact Form Message from ${sanitizedName}`,
      // Add headers to help with auto-responses
      headers: {
        'X-Priority': '3',
        'X-MSMail-Priority': 'Normal',
        'Importance': 'normal',
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
    console.log('Attempting to send email...', {
      from: mailOptions.from,
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
      to: emailUser,
    });

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

