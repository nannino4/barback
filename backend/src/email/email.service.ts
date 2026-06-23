import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';
import { EmailConfigurationException, EmailSendingException } from './exceptions/email.exceptions';
import { CustomLogger } from 'src/common/logger/custom.logger';
import { maskEmail } from 'src/common/utils/mask-email';
import { UserLanguage } from 'src/user/schemas/user.schema';

export interface EmailOptions
{
    to: string;
    subject: string;
    text: string;
    html?: string;
}

@Injectable()
export class EmailService
{
    private transporter: Transporter | null = null;

    private readonly emailFrom: string;
    private readonly frontendUrl: string;
    private readonly appName: string;

    constructor(
        private readonly configService: ConfigService,
        private readonly logger: CustomLogger,
    )
    {
        this.initializeTransporter();

        const frontendUrl = this.configService.get<string>('FRONTEND_URL');
        if (!frontendUrl)
        {
            throw new EmailConfigurationException('FRONTEND_URL');
        }
        this.frontendUrl = frontendUrl;

        this.appName = this.configService.get<string>('EMAIL_APP_NAME') || 'Barback';

        this.emailFrom = this.configService.get<string>('EMAIL_FROM')!;

        this.logger.log('EmailService initialized', 'EmailService#constructor');
    }

    private initializeTransporter(): void
    {
        const smtpHost = this.configService.get<string>('SMTP_HOST');
        const smtpPort = this.configService.get<number>('SMTP_PORT');
        const smtpUser = this.configService.get<string>('SMTP_USER');
        const smtpPass = this.configService.get<string>('SMTP_PASS');
        const emailFrom = this.configService.get<string>('EMAIL_FROM');

        if (!smtpHost)
        {
            throw new EmailConfigurationException('SMTP_HOST');
        }
        if (!smtpPort)
        {
            throw new EmailConfigurationException('SMTP_PORT');
        }
        if (!smtpUser)
        {
            throw new EmailConfigurationException('SMTP_USER');
        }
        if (!smtpPass)
        {
            throw new EmailConfigurationException('SMTP_PASS');
        }
        if (!emailFrom)
        {
            throw new EmailConfigurationException('EMAIL_FROM');
        }

        this.transporter = nodemailer.createTransport({
            host: smtpHost,
            port: smtpPort,
            secure: smtpPort === 465,
            auth: {
                user: smtpUser,
                pass: smtpPass,
            },
        });

        this.logger.log('Email transporter initialized', 'EmailService#initializeTransporter');
    }

    private buildEmailLayout(content: {
        locale: UserLanguage;
        title: string;
        intro: string;
        ctaLabel: string;
        ctaUrl: string;
        fallbackText: string;
        expiryText: string;
        ignoreText: string;
        preheader: string;
        accentColor: string;
    }): string
    {
        const footer = content.locale === UserLanguage.IT
            ? `Questo messaggio è stato inviato da ${this.appName}.`
            : `This message was sent by ${this.appName}.`;

        return `
            <div style="margin:0;padding:24px;background-color:#f6f8fb;font-family:Arial,'Helvetica Neue',Helvetica,sans-serif;">
                <div style="display:none;max-height:0;overflow:hidden;opacity:0;">
                    ${content.preheader}
                </div>
                <div style="max-width:640px;margin:0 auto;background:#ffffff;border-radius:12px;border:1px solid #e5e7eb;overflow:hidden;">
                    <div style="padding:24px 28px;border-bottom:1px solid #eef2f7;">
                        <h1 style="margin:0;font-size:22px;line-height:1.3;color:#0f172a;">${content.title}</h1>
                    </div>
                    <div style="padding:24px 28px;color:#334155;font-size:15px;line-height:1.6;">
                        <p style="margin:0 0 16px 0;">${content.intro}</p>
                        <div style="margin:24px 0;">
                            <a href="${content.ctaUrl}" style="display:inline-block;padding:12px 20px;border-radius:8px;background:${content.accentColor};color:#ffffff;text-decoration:none;font-weight:600;">
                                ${content.ctaLabel}
                            </a>
                        </div>
                        <p style="margin:0 0 8px 0;color:#475569;">${content.fallbackText}</p>
                        <p style="margin:0 0 20px 0;word-break:break-all;"><a href="${content.ctaUrl}" style="color:${content.accentColor};text-decoration:none;">${content.ctaUrl}</a></p>
                        <p style="margin:0 0 8px 0;">${content.expiryText}</p>
                        <p style="margin:0;">${content.ignoreText}</p>
                    </div>
                    <div style="padding:18px 28px;border-top:1px solid #eef2f7;background:#f8fafc;color:#64748b;font-size:12px;">
                        ${footer}
                    </div>
                </div>
            </div>
        `;
    }

    async sendEmail(options: EmailOptions): Promise<void>
    {
        try
        {
            const info = await this.transporter!.sendMail({
                from: this.emailFrom,
                to: options.to,
                subject: options.subject,
                text: options.text,
                html: options.html,
            });

            this.logger.debug(
                `Email sent successfully to ${maskEmail(options.to)}. Message ID: ${info.messageId}`,
                'EmailService#sendEmail',
            );

            if (nodemailer.getTestMessageUrl(info))
            {
                this.logger.debug(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`, 'EmailService#sendEmail');
            }
        }
        catch (error)
        {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            this.logger.error(
                `Failed to send email to ${maskEmail(options.to)}: ${errorMessage}`,
                error instanceof Error ? error.stack : undefined,
                'EmailService#sendEmail',
            );
            throw new EmailSendingException(errorMessage);
        }
    }

    generateVerificationEmail(email: string, token: string, locale: UserLanguage): EmailOptions
    {
        const verificationUrl = `${this.frontendUrl}/auth/verify-email?token=${token}`;

        if (locale === UserLanguage.IT)
        {
            return {
                to: email,
                subject: `Verifica il tuo account ${this.appName}`,
                text: `Conferma il tuo indirizzo email aprendo questo link: ${verificationUrl}\n\nIl link scade tra 24 ore. Se non hai creato un account ${this.appName}, puoi ignorare questo messaggio.`,
                html: this.buildEmailLayout({
                    locale: locale,
                    title: `Benvenuto su ${this.appName}`,
                    intro: 'Grazie per esserti registrato. Conferma il tuo indirizzo email per attivare il tuo account.',
                    ctaLabel: 'Verifica email',
                    ctaUrl: verificationUrl,
                    fallbackText: 'Se il pulsante non funziona, copia e incolla questo link nel browser:',
                    expiryText: 'Questo link di verifica scade tra 24 ore.',
                    ignoreText: `Se non hai creato un account ${this.appName}, puoi ignorare questa email.`,
                    preheader: 'Conferma il tuo indirizzo email per completare la registrazione.',
                    accentColor: '#2563eb',
                }),
            };
        }

        return {
            to: email,
            subject: `Verify your ${this.appName} account`,
            text: `Please verify your email address by opening this link: ${verificationUrl}\n\nThis verification link expires in 24 hours. If you did not create a ${this.appName} account, you can ignore this email.`,
            html: this.buildEmailLayout({
                locale: locale,
                title: `Welcome to ${this.appName}`,
                intro: 'Thanks for signing up. Verify your email address to activate your account.',
                ctaLabel: 'Verify email',
                ctaUrl: verificationUrl,
                fallbackText: "If the button doesn't work, copy and paste this link into your browser:",
                expiryText: 'This verification link expires in 24 hours.',
                ignoreText: `If you did not create a ${this.appName} account, you can safely ignore this email.`,
                preheader: 'Verify your email to complete your account setup.',
                accentColor: '#2563eb',
            }),
        };
    }

    generatePasswordResetEmail(email: string, token: string, locale: UserLanguage): EmailOptions
    {
        const resetUrl = `${this.frontendUrl}/auth/reset-password?token=${token}`;

        if (locale === UserLanguage.IT)
        {
            return {
                to: email,
                subject: `Reimposta la password ${this.appName}`,
                text: `Hai richiesto la reimpostazione della password. Apri questo link per scegliere una nuova password: ${resetUrl}\n\nIl link scade tra 1 ora. Se non hai richiesto questa operazione, ignora questa email.`,
                html: this.buildEmailLayout({
                    locale: locale,
                    title: 'Richiesta reimpostazione password',
                    intro: `Abbiamo ricevuto una richiesta di reimpostazione della password per il tuo account ${this.appName}.`,
                    ctaLabel: 'Reimposta password',
                    ctaUrl: resetUrl,
                    fallbackText: 'Se il pulsante non funziona, copia e incolla questo link nel browser:',
                    expiryText: 'Questo link scade tra 1 ora.',
                    ignoreText: 'Se non hai richiesto questa operazione, ignora questa email. La password non verrà modificata.',
                    preheader: 'Reimposta la password del tuo account in modo sicuro.',
                    accentColor: '#dc2626',
                }),
            };
        }

        return {
            to: email,
            subject: `Reset your ${this.appName} password`,
            text: `You requested a password reset. Open this link to choose a new password: ${resetUrl}\n\nThis reset link expires in 1 hour. If you did not request this, you can ignore this email.`,
            html: this.buildEmailLayout({
                locale: locale,
                title: 'Password reset request',
                intro: `We received a request to reset the password for your ${this.appName} account.`,
                ctaLabel: 'Reset password',
                ctaUrl: resetUrl,
                fallbackText: "If the button doesn't work, copy and paste this link into your browser:",
                expiryText: 'This reset link expires in 1 hour.',
                ignoreText: 'If you did not request a password reset, you can safely ignore this email. Your password will not change.',
                preheader: 'Securely reset your account password.',
                accentColor: '#dc2626',
            }),
        };
    }

    generateOrganizationInvitationEmail(
        email: string,
        _invitationId: string,
        organizationName: string,
        role: string,
        locale: UserLanguage,
    ): EmailOptions
    {
        const invitationsPageUrl = `${this.frontendUrl}/invitations`;
        const roleDisplay = role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();

        if (locale === UserLanguage.IT)
        {
            return {
                to: email,
                subject: `Invito a ${organizationName} su ${this.appName}`,
                text: `Sei stato invitato a unirti a ${organizationName} come ${roleDisplay}. Accedi per visualizzare e gestire i tuoi inviti: ${invitationsPageUrl}`,
                html: this.buildEmailLayout({
                    locale: locale,
                    title: `Invito per ${organizationName}`,
                    intro: `Sei stato invitato a unirti a ${organizationName} come ${roleDisplay} su ${this.appName}.`,
                    ctaLabel: 'Visualizza inviti',
                    ctaUrl: invitationsPageUrl,
                    fallbackText: 'Se il pulsante non funziona, copia e incolla questo link nel browser:',
                    expiryText: 'L’invito scade tra 7 giorni.',
                    ignoreText: 'Se non ti aspettavi questo invito, puoi ignorare questa email.',
                    preheader: `Invito a collaborare su ${organizationName}.`,
                    accentColor: '#16a34a',
                }),
            };
        }

        return {
            to: email,
            subject: `You're invited to join ${organizationName} on ${this.appName}`,
            text: `You've been invited to join ${organizationName} as a ${roleDisplay}. Log in to view and act on your invitations: ${invitationsPageUrl}`,
            html: this.buildEmailLayout({
                locale: locale,
                title: `Invitation to ${organizationName}`,
                intro: `You've been invited to join ${organizationName} as ${roleDisplay} on ${this.appName}.`,
                ctaLabel: 'View invitations',
                ctaUrl: invitationsPageUrl,
                fallbackText: "If the button doesn't work, copy and paste this link into your browser:",
                expiryText: 'This invitation expires in 7 days.',
                ignoreText: "If you weren't expecting this invitation, you can ignore this email.",
                preheader: `Invitation to collaborate in ${organizationName}.`,
                accentColor: '#16a34a',
            }),
        };
    }

    /**
     * Reminder sent (via the Stripe `customer.subscription.trial_will_end` webhook)
     * a few days before a free trial ends, prompting the user to add a payment
     * method so access continues. The CTA links to the organizations page where the
     * trial banner / subscription card expose the add-payment flow.
     */
    generateTrialEndingEmail(email: string, daysRemaining: number, locale: UserLanguage): EmailOptions
    {
        const orgsPageUrl = `${this.frontendUrl}/orgs`;

        if (locale === UserLanguage.IT)
        {
            const daysText = daysRemaining === 1 ? 'tra 1 giorno' : `tra ${daysRemaining} giorni`;
            return {
                to: email,
                subject: `La tua prova gratuita ${this.appName} sta per terminare`,
                text: `La tua prova gratuita termina ${daysText}. Aggiungi un metodo di pagamento per continuare a usare ${this.appName} senza interruzioni: ${orgsPageUrl}`,
                html: this.buildEmailLayout({
                    locale: locale,
                    title: 'La tua prova gratuita sta per terminare',
                    intro: `La tua prova gratuita di ${this.appName} termina ${daysText}. Aggiungi un metodo di pagamento per continuare senza interruzioni.`,
                    ctaLabel: 'Aggiungi metodo di pagamento',
                    ctaUrl: orgsPageUrl,
                    fallbackText: 'Se il pulsante non funziona, copia e incolla questo link nel browser:',
                    expiryText: `La prova gratuita termina ${daysText}.`,
                    ignoreText: 'Se hai già aggiunto un metodo di pagamento, puoi ignorare questa email.',
                    preheader: 'Aggiungi un metodo di pagamento per continuare dopo la prova.',
                    accentColor: '#2563eb',
                }),
            };
        }

        const daysText = daysRemaining === 1 ? 'in 1 day' : `in ${daysRemaining} days`;
        return {
            to: email,
            subject: `Your ${this.appName} free trial is ending soon`,
            text: `Your free trial ends ${daysText}. Add a payment method to keep using ${this.appName} without interruption: ${orgsPageUrl}`,
            html: this.buildEmailLayout({
                locale: locale,
                title: 'Your free trial is ending soon',
                intro: `Your ${this.appName} free trial ends ${daysText}. Add a payment method to keep your access without interruption.`,
                ctaLabel: 'Add payment method',
                ctaUrl: orgsPageUrl,
                fallbackText: "If the button doesn't work, copy and paste this link into your browser:",
                expiryText: `Your free trial ends ${daysText}.`,
                ignoreText: 'If you have already added a payment method, you can ignore this email.',
                preheader: 'Add a payment method to continue after your trial.',
                accentColor: '#2563eb',
            }),
        };
    }
}
