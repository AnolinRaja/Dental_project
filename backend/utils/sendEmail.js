import nodemailer from 'nodemailer';

// utility to convert time string (HH:MM) to 12-hour format with AM/PM
function formatTo12Hour(timeStr) {
  // if already contains AM/PM, return as is
  if (/\b(am|pm)\b/i.test(timeStr)) return timeStr;
  const [hour, minute] = timeStr.split(':').map(Number);
  if (isNaN(hour)) return timeStr;
  const period = hour >= 12 ? 'PM' : 'AM';
  const h12 = ((hour + 11) % 12 + 1);
  return `${h12}:${minute.toString().padStart(2, '0')} ${period}`;
}

// Create a transporter for email sending
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

/**
 * Send confirmation email to patient
 * @param {string} toEmail - Patient email
 * @param {string} patientName - Patient name
 * @param {string} appointmentDate - Appointment date
 * @param {string} doctorType - Doctor type
 */
const sendPatientConfirmationEmail = async (toEmail, patientName, appointmentDate, doctorType) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: toEmail,
    subject: 'Appointment Confirmation - Dental Clinic Management',
    html: `
      <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
        <div style="background-color: white; padding: 30px; border-radius: 8px; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2c3e50; text-align: center;">Appointment Confirmation</h2>
          <p>Dear <strong>${patientName}</strong>,</p>
          <p>Thank you for registering with our Dental Clinic Management System. Your appointment has been successfully registered.</p>
          
          <div style="background-color: #ecf0f1; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #27ae60; margin-top: 0;">Appointment Details:</h3>
            <p><strong>Doctor Type:</strong> ${doctorType}</p>
            <p><strong>Appointment Date:</strong> ${new Date(appointmentDate).toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</p>
          </div>
          
          <p>A doctor will review your appointment request and confirm it shortly. You will receive a confirmation email with additional details.</p>
          
          <p style="color: #7f8c8d; font-size: 12px; margin-top: 30px;">
            If you have any questions, please contact us at ${process.env.ADMIN_EMAIL || 'admin@dentalclinic.com'}
          </p>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Confirmation email sent to ${toEmail}`);
    return true;
  } catch (error) {
    console.error('Error sending patient confirmation email:', error);
    return false;
  }
};

/**
 * Send notification email to doctor/admin
 * @param {object} patientData - Patient data
 */
const sendDoctorNotificationEmail = async (patientData) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.ADMIN_EMAIL || 'admin@dentalclinic.com',
    subject: `New Appointment Request - ${patientData.fullName}`,
    html: `
      <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
        <div style="background-color: white; padding: 30px; border-radius: 8px; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2c3e50; text-align: center;">New Appointment Request</h2>
          
          <div style="background-color: #ecf0f1; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #e74c3c; margin-top: 0;">Patient Information:</h3>
            <p><strong>Name:</strong> ${patientData.fullName}</p>
            <p><strong>Email:</strong> ${patientData.email}</p>
            <p><strong>Phone:</strong> ${patientData.phone}</p>
            <p><strong>Age:</strong> ${patientData.age}</p>
            <p><strong>Gender:</strong> ${patientData.gender}</p>
            <p><strong>Address:</strong> ${patientData.address}</p>
            <p><strong>Doctor Type Requested:</strong> ${patientData.doctorType}</p>
            <p><strong>Appointment Date:</strong> ${new Date(patientData.appointmentDate).toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</p>
          </div>

          <div style="background-color: #fef5f1; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #d35400; margin-top: 0;">Medical History & Symptoms:</h3>
            <p><strong>Symptoms:</strong> ${patientData.symptoms || 'Not specified'}</p>
            <p><strong>Medical History:</strong> ${patientData.medicalHistory || 'Not specified'}</p>
          </div>
          
          <p style="color: #7f8c8d; font-size: 12px; margin-top: 30px;">
            Please review and confirm the appointment in the admin panel.
          </p>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Doctor notification email sent to admin`);
    return true;
  } catch (error) {
    console.error('Error sending doctor notification email:', error);
    return false;
  }
};

/**
 * Send appointment confirmation email to patient after doctor confirmation
 */
const sendAppointmentConfirmedEmail = async (toEmail, patientName, appointmentDate, doctorName, doctorType, timeSlot = 'TBD') => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: toEmail,
    subject: '✓ Your Appointment Has Been Confirmed - Dental Clinic Management',
    html: `
      <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
        <div style="background-color: white; padding: 30px; border-radius: 8px; max-width: 600px; margin: 0 auto;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h2 style="color: #27ae60; margin: 0; font-size: 28px;">✓ Appointment Confirmed!</h2>
          </div>
          
          <p>Dear <strong>${patientName}</strong>,</p>
          <p>Great news! Your appointment request has been reviewed and confirmed by our medical team.</p>
          
          <div style="background-color: #d5f4e6; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #27ae60;">
            <h3 style="color: #27ae60; margin-top: 0;">📋 Confirmed Appointment Details:</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px; font-weight: bold; color: #333;">Doctor/Clinic:</td>
                <td style="padding: 8px; color: #555;">${doctorName || 'Dental Clinic Staff'}</td>
              </tr>
              <tr style="background-color: #f0f0f0;">
                <td style="padding: 8px; font-weight: bold; color: #333;">Specialization:</td>
                <td style="padding: 8px; color: #555;">${doctorType}</td>
              </tr>
              <tr>
                <td style="padding: 8px; font-weight: bold; color: #333;">📅 Date:</td>
                <td style="padding: 8px; color: #555;">${new Date(appointmentDate).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</td>
              </tr>
              <tr style="background-color: #f0f0f0;">
                <td style="padding: 8px; font-weight: bold; color: #333;">⏰ Time:</td>
                <td style="padding: 8px; color: #555;">${formatTo12Hour(timeSlot)}</td>
              </tr>
            </table>
          </div>

          <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ffc107;">
            <p style="margin: 0; color: #856404;">
              <strong>📝 Important:</strong> Please arrive 10-15 minutes before your scheduled appointment time. Bring any relevant medical documents or insurance information if applicable.
            </p>
          </div>

          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 5px 0; color: #555;"><strong>Need to reschedule?</strong></p>
            <p style="margin: 5px 0; color: #555;">If you need to reschedule or cancel, please contact us at least 24 hours in advance.</p>
          </div>
          
          <p style="color: #7f8c8d; font-size: 13px; margin-top: 30px; text-align: center;">
            <strong>Contact Information:</strong><br>
            📧 ${process.env.EMAIL_USER || 'clinic@dentalclinic.com'}<br>
            📞 +1 (555) 123-4567<br>
            📍 123 Dental Street, Healthcare City
          </p>

          <p style="color: #95a5a6; font-size: 11px; margin-top: 20px; border-top: 1px solid #ecf0f1; padding-top: 15px;">
            This is an automated confirmation email. Do not reply to this email. For queries, please use the contact information above.
          </p>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✓ Appointment confirmation email sent to ${toEmail}`);
    return true;
  } catch (error) {
    console.error('Error sending appointment confirmed email:', error);
    return false;
  }
};


/**
 * Send reminder to doctor 30 minutes before appointment
 */
const sendDoctorReminderEmail = async (toEmail, patientName, appointmentDate, timeSlot) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: toEmail,
    subject: `Reminder: Upcoming Appointment with ${patientName}`,
    html: `
      <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
        <div style="background-color: white; padding: 30px; border-radius: 8px; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2c3e50; text-align: center;">Appointment Reminder</h2>
          <p>Dear Doctor,</p>
          <p>This is a reminder that you have an upcoming appointment with <strong>${patientName}</strong>.</p>
          <div style="background-color: #ecf0f1; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #27ae60; margin-top: 0;">Appointment Details:</h3>
            <p><strong>Date:</strong> ${new Date(appointmentDate).toLocaleString()}</p>
            <p><strong>Time:</strong> ${formatTo12Hour(timeSlot)}</p>
          </div>
          <p>Please ensure you are ready to attend the appointment.</p>
          <p style="color: #7f8c8d; font-size: 12px; margin-top: 30px;">Thank you.</p>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Reminder email sent to doctor: ${toEmail}`);
    return true;
  } catch (error) {
    console.error('Error sending doctor reminder email:', error);
    return false;
  }
};

/**
 * Send appointment rejection email to patient
 */
const sendAppointmentRejectedEmail = async (toEmail, patientName, appointmentDate, rejectionReason = '') => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: toEmail,
    subject: '✗ Appointment Request Update - Dental Clinic Management',
    html: `
      <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
        <div style="background-color: white; padding: 30px; border-radius: 8px; max-width: 600px; margin: 0 auto;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h2 style="color: #e74c3c; margin: 0; font-size: 28px;">✗ Appointment Status Update</h2>
          </div>
          
          <p>Dear <strong>${patientName}</strong>,</p>
          <p>We regret to inform you that your appointment request for <strong>${new Date(appointmentDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</strong> could not be confirmed at this time.</p>
          
          <div style="background-color: #fadbd8; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #e74c3c;">
            <h3 style="color: #c0392b; margin-top: 0;">Reason for Rejection:</h3>
            <p style="margin: 0; color: #555;">${rejectionReason || 'No specific reason provided'}</p>
          </div>

          <div style="background-color: #ecf0f1; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #2c3e50; margin-top: 0;">What You Can Do Next:</h3>
            <ul style="color: #555; margin: 10px 0;">
              <li>Re-schedule your appointment for a different date</li>
              <li>Contact us to discuss alternative appointment times</li>
              <li>Provide additional medical information if needed</li>
            </ul>
          </div>

          <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ffc107;">
            <p style="margin: 0; color: #856404;">
              <strong>📞 Need Help?</strong> Please contact us directly to discuss your appointment or to schedule a new one.
            </p>
          </div>
          
          <p style="color: #7f8c8d; font-size: 13px; margin-top: 30px; text-align: center;">
            <strong>Contact Information:</strong><br>
            📧 ${process.env.EMAIL_USER || 'clinic@dentalclinic.com'}<br>
            📞 +1 (555) 123-4567<br>
            📍 123 Dental Street, Healthcare City
          </p>

          <p style="color: #95a5a6; font-size: 11px; margin-top: 20px; border-top: 1px solid #ecf0f1; padding-top: 15px;">
            This is an automated notification email. Do not reply to this email. For queries, please use the contact information above.
          </p>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✗ Appointment rejection email sent to ${toEmail}`);
    return true;
  } catch (error) {
    console.error('Error sending appointment rejection email:', error);
    return false;
  }
};

// Send contact notification email to doctor/admin
const sendContactNotificationEmail = async (msg) => {
  const toEmails = [];
  if (process.env.DOCTOR_EMAIL) toEmails.push(process.env.DOCTOR_EMAIL);
  if (process.env.ADMIN_EMAIL && !toEmails.includes(process.env.ADMIN_EMAIL)) toEmails.push(process.env.ADMIN_EMAIL);
  if (toEmails.length === 0) toEmails.push(process.env.EMAIL_USER);

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: toEmails.join(','),
    subject: `New Contact Message: ${msg.subject || 'Inquiry'}`,
    html: `
      <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
        <div style="background-color: white; padding: 20px; border-radius: 8px; max-width: 600px; margin: 0 auto;">
          <h2 style="color:#2c3e50;">New Contact Message</h2>
          <p><strong>Name:</strong> ${msg.name}</p>
          <p><strong>Email:</strong> ${msg.email}</p>
          <p><strong>Phone:</strong> ${msg.phone || 'N/A'}</p>
          <p><strong>Subject:</strong> ${msg.subject || 'General'}</p>
          <div style="margin-top:12px; padding:12px; background:#f8f9fa; border-radius:6px;">
            <p style="white-space:pre-wrap;">${msg.message}</p>
          </div>
          <p style="font-size:12px; color:#7f8c8d; margin-top:12px;">Received: ${new Date(msg.createdAt).toLocaleString()}</p>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Contact notification email sent to', toEmails.join(','));
    return true;
  } catch (error) {
    console.error('Error sending contact notification email:', error);
    throw error;
  }
};

// Send OTP to doctor for login verification
const sendDoctorOtpEmail = async (toEmail, otp) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: toEmail,
    subject: 'Your Doctor Login OTP',
    html: `
      <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
        <div style="background-color: white; padding: 20px; border-radius: 8px; max-width: 600px; margin: 0 auto; text-align: center;">
          <h2 style="color:#2c3e50;">Doctor Login OTP</h2>
          <p>Your one-time passcode is:</p>
          <div style="font-size: 28px; font-weight: 700; letter-spacing: 4px; margin: 12px 0;">${otp}</div>
          <p style="color:#7f8c8d; font-size:12px;">This code expires in 10 minutes. If you did not request this, please contact the clinic immediately.</p>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Doctor OTP email sent to', toEmail);
    return true;
  } catch (error) {
    console.error('Error sending doctor OTP email:', error);
    throw error;
  }
};

// Send OTP to patient for login/registration verification
const sendPatientOtpEmail = async (toEmail, otp) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: toEmail,
    subject: 'Your Patient Login OTP - Dental Clinic Management',
    html: `
      <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
        <div style="background-color: white; padding: 20px; border-radius: 8px; max-width: 600px; margin: 0 auto; text-align: center;">
          <h2 style="color:#2c3e50;">Your Appointment Portal Access Code</h2>
          <p>Your one-time passcode for secure login is:</p>
          <div style="font-size: 32px; font-weight: 700; letter-spacing: 6px; margin: 20px 0; color: #27ae60;">${otp}</div>
          <p style="color:#7f8c8d; font-size:13px;">This code expires in 10 minutes. If you did not request this, please ignore this email.</p>
          <div style="margin-top: 20px; padding: 15px; background-color: #ecf0f1; border-radius: 5px;">
            <p style="color: #555; font-size: 12px; margin: 0;">Never share your OTP with anyone. The clinic staff will never ask for it.</p>
          </div>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Patient OTP email sent to', toEmail);
    return true;
  } catch (error) {
    console.error('Error sending patient OTP email:', error);
    throw error;
  }
};

export {
  sendPatientConfirmationEmail,
  sendDoctorNotificationEmail,
  sendAppointmentConfirmedEmail,
  sendDoctorReminderEmail,
  sendAppointmentRejectedEmail,
  sendContactNotificationEmail,
  sendDoctorOtpEmail,
  sendPatientOtpEmail
};


