import nodemailer from 'nodemailer';
import path from 'path';
import pug from 'pug';

export class EmailService {
    private transporter: nodemailer.Transporter;

    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.example.com',
            port: Number(process.env.SMTP_PORT) || 587,
            secure: false,
            auth: {
                user: process.env.SMTP_USER || '',
                pass: process.env.SMTP_PASS || '',
            },
        });
    }

    /**
     * Send an email using a dynamic Pug template from the root email folder
     * @param to Recipient email address
     * @param subject Email subject
     * @param templateName Name of the Pug file (without .pug extension)
     * @param templateData Data to inject into the template
     */
    async sendEmail(to: string, subject: string, templateName: string, templateData: Record<string, unknown>): Promise<void> {
        const templatePath = path.resolve(process.cwd(), 'src/utils/emailTemplate', `${templateName}.pug`);
        const html = pug.renderFile(templatePath, templateData);
        await this.transporter.sendMail({
            from: process.env.SMTP_FROM || 'noreply@example.com',
            to,
            subject,
            html,
        });
    }
}
