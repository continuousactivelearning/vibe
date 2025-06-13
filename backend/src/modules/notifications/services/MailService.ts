import 'reflect-metadata';
import {Service} from 'typedi';
import nodemailer from 'nodemailer';
import {Invite} from '../classes/transformers/Invite.js';
import {actionType, statusType} from 'shared/interfaces/Models';

// @Service()
// // export class MailService {
// //   private transporter;

// //   constructor() {
// //     this.transporter = nodemailer.createTransport({
// //       service: 'gmail',
// //       auth: {
// //         user: process.env.EMAIL_USER,
// //         pass: process.env.EMAIL_PASS, // app password recommended
// //       },
// //     });
// //   }

// //   async sendMail(to: string, subject: string, text: string) {
// //     const mailOptions = {
// //       from: process.env.EMAIL_USER,
// //       to,
// //       subject,
// //       text,
// //     };

// //     try {
// //       const info = await this.transporter.sendMail(mailOptions);
// //       console.log('Email sent:', info.messageId);
// //       return info;
// //     } catch (error) {
// //       console.error('Error sending email:', error);
// //       throw error;
// //     }
// //   }
// // }

@Service()
export class MailService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // use app password
      },
    });
  }

  async sendMail(invite: Invite) {
    type MailContent = {
      subject: string;
      text: string;
      html: string;
    };
    console.log('Preparing to send email for invite:', invite);

    const BASE_URL = process.env.CLIENT_BASE_URL || 'https://yourdomain.com';

    let mailContent: MailContent;

    switch (invite.action) {
      case actionType.SIGNUP:
        mailContent = {
          subject: "You're Invited to Join a Course",
          text: `You've been invited to join a course. Click: ${BASE_URL}/invites/accept?token=${invite.token}&courseId=${invite.courseId}&version=${invite.courseVersionId}`,
          html: `<p>You’ve been invited to join a course.</p>
                 <p><a href="${BASE_URL}/invites/accept?token=${invite.token}&courseId=${invite.courseId}&version=${invite.courseVersionId}">Accept Invitation</a></p>`,
        };
        break;

      case actionType.NOTIFY:
        mailContent = {
          subject: 'Course Notification',
          text: `Your course has updates: ${BASE_URL}/courses/${invite.courseId}/notifications`,
          html: `<p>Your course has new updates.</p>
                 <p><a href="${BASE_URL}/courses/${invite.courseId}/notifications">View Notifications</a></p>`,
        };
        break;

      case actionType.ENROLL:
        mailContent = {
          subject: 'You’ve Been Enrolled in a Course',
          text: `You've been enrolled. Start here: ${BASE_URL}/courses/${invite.courseId}/enroll?token=${invite.token}`,
          html: `<p>You’ve been enrolled in <b>${invite.courseId}</b>.</p>
                 <p><a href="${BASE_URL}/courses/${invite.courseId}/enroll?token=${invite.token}">Start Learning</a></p>`,
        };
        break;

      default:
        throw new Error(`Unknown action: ${invite.action}`);
    }

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: invite.email,
      subject: mailContent.subject,
      text: mailContent.text,
      html: mailContent.html,
    };
    console.log('Sending email to:', invite.email);

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('Email sent:', info.messageId);
      return info;
    } catch (error) {
      console.error('Failed to send email:', error);
      throw error;
    }
  }
}
