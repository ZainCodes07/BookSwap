/* ==========================================================================
   BOOKSWAP - emailService.js
   Professional Email Notification Service
   - Sends email alerts to Sellers / Buyers when a message is received.
   - Smart Frequency Throttling (Anti-Spam): Sends for first message of an inquiry;
     subsequent messages during active conversation are throttled (15-min cooldown).
   - Supports Live SMTP (Gmail, Outlook, Mailtrap, etc.).
   - Auto-creates Ethereal test transporter with clickable browser view URLs if
     live SMTP is not yet configured in .env.
   ========================================================================== */

const nodemailer = require("nodemailer");
require("dotenv").config();

// Configuration
const SMTP_HOST = process.env.SMTP_HOST || (process.env.EMAIL_USER ? "smtp.gmail.com" : null);
const SMTP_PORT = parseInt(process.env.SMTP_PORT, 10) || 587;
const SMTP_USER = process.env.SMTP_USER || process.env.EMAIL_USER || null;
const SMTP_PASS = process.env.SMTP_PASS || process.env.EMAIL_PASS || null;
const SMTP_FROM = process.env.SMTP_FROM || process.env.EMAIL_FROM || '"BookSwap Notifications" <notifications@bookswap.pk>';
const FRONTEND_URL = process.env.FRONTEND_URL || "http://127.0.0.1:5500/Frontend";

// In-memory conversation throttle tracking: key -> timestamp of last email sent
const conversationEmailCooldown = new Map();
const COOLDOWN_MS = 15 * 60 * 1000; // 15 minutes cooldown between emails for the same chat

// Transporters
let liveTransporter = null;
let etherealTransporter = null;
let etherealInitializing = null;

if (SMTP_HOST && SMTP_USER && SMTP_PASS) {
    liveTransporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port: SMTP_PORT,
        secure: SMTP_PORT === 465,
        auth: {
            user: SMTP_USER,
            pass: SMTP_PASS
        }
    });
}

/**
 * Gets or initializes an active transporter (Live SMTP if configured, else Ethereal test mailer)
 */
async function getTransporter() {
    if (liveTransporter) {
        return { transporter: liveTransporter, isTest: false };
    }

    if (etherealTransporter) {
        return { transporter: etherealTransporter, isTest: true };
    }

    if (!etherealInitializing) {
        etherealInitializing = nodemailer.createTestAccount()
            .then(testAccount => {
                etherealTransporter = nodemailer.createTransport({
                    host: testAccount.smtp.host,
                    port: testAccount.smtp.port,
                    secure: testAccount.smtp.secure,
                    auth: {
                        user: testAccount.user,
                        pass: testAccount.pass
                    }
                });
                console.log(`[Email Service] Ethereal test mailer initialized (${testAccount.user}). Delivered emails can be previewed via web URL!`);
                return etherealTransporter;
            })
            .catch(err => {
                console.warn("[Email Service] Could not initialize Ethereal mailer:", err.message);
                return null;
            });
    }

    const t = await etherealInitializing;
    return { transporter: t, isTest: true };
}

/**
 * Escape HTML for safe email rendering
 */
function escapeHtml(str) {
    if (!str) return "";
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

/**
 * Checks whether an email notification should be sent based on conversation state
 * - First message in an inquiry -> ALWAYS sends email.
 * - Follow-up messages within 15 minutes -> Throttled (No spamming).
 * - Messages after 15 minutes -> Sends a follow-up alert.
 */
function shouldSendEmailNotification(senderId, receiverId, bookId, isFirstMessage) {
    const key = `${senderId}_${receiverId}_${bookId || 0}`;
    const now = Date.now();
    const lastSent = conversationEmailCooldown.get(key) || 0;

    // 1. Very first message of an inquiry -> ALWAYS alert!
    if (isFirstMessage) {
        conversationEmailCooldown.set(key, now);
        return true;
    }

    // 2. Active chat within cooldown window (15 mins) -> Throttled
    if (now - lastSent < COOLDOWN_MS) {
        const remainingMinutes = Math.ceil((COOLDOWN_MS - (now - lastSent)) / 60000);
        console.log(`[Email Throttled] Skipping email for conversation ${key}. Alert was sent ${remainingMinutes}m ago. Active chat in progress.`);
        return false;
    }

    // 3. New message after inactivity -> Send alert & refresh cooldown
    conversationEmailCooldown.set(key, now);
    return true;
}

/**
 * Generate Responsive HTML Email Template for Chat Messages
 */
function buildChatEmailHtml({ receiverName, senderName, bookTitle, chatUrl, messageText, isFirstMessage }) {
    const safeReceiver = escapeHtml(receiverName || "BookSwap Member");
    const safeSender = escapeHtml(senderName || "A student");
    const safeBook = escapeHtml(bookTitle || "Your Book Listing");
    const safeMsg = escapeHtml(messageText || "");

    const badgeText = isFirstMessage ? "📚 New Book Inquiry" : "💬 New In-App Message";
    const headingText = isFirstMessage
        ? `<strong style="color: #0F172A;">${safeSender}</strong> wants to inquire about your book <span style="color: #6C38FF; font-weight: 600;">"${safeBook}"</span>.`
        : `<strong style="color: #0F172A;">${safeSender}</strong> sent you a new message regarding <span style="color: #6C38FF; font-weight: 600;">"${safeBook}"</span>.`;

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Message on BookSwap</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F1F5F9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1E293B;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #F1F5F9; padding: 30px 15px;">
    <tr>
      <td align="center">
        <!-- Main Container -->
        <table role="presentation" width="100%" style="max-width: 600px; background-color: #FFFFFF; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);" cellspacing="0" cellpadding="0">
          
          <!-- Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #6C38FF 0%, #4F46E5 100%); padding: 32px 30px; text-align: center;">
              <h1 style="margin: 0; color: #FFFFFF; font-size: 26px; font-weight: 800; letter-spacing: -0.5px;">Book<span style="color: #FDE68A;">Swap</span></h1>
              <p style="margin: 6px 0 0; color: #E0E7FF; font-size: 13px; letter-spacing: 0.5px;">Read &bull; Swap &bull; Grow</p>
            </td>
          </tr>

          <!-- Content Body -->
          <tr>
            <td style="padding: 36px 32px 28px;">
              
              <div style="display: inline-block; background-color: #EEF2FF; color: #4F46E5; font-size: 12px; font-weight: 700; padding: 4px 12px; border-radius: 999px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 16px;">
                ${badgeText}
              </div>

              <h2 style="margin: 0 0 16px; font-size: 20px; color: #0F172A; font-weight: 700;">
                Hello ${safeReceiver},
              </h2>

              <p style="margin: 0 0 18px; font-size: 15px; line-height: 1.6; color: #475569;">
                ${headingText}
              </p>

              <!-- Message Snippet Card -->
              <div style="background-color: #F8FAFC; border-left: 4px solid #6C38FF; border-radius: 8px; padding: 18px 20px; margin: 20px 0 28px;">
                <div style="font-size: 12px; font-weight: 600; color: #64748B; text-transform: uppercase; margin-bottom: 6px;">Message:</div>
                <p style="margin: 0; font-size: 15px; line-height: 1.6; color: #1E293B; font-style: italic;">
                  &ldquo;${safeMsg}&rdquo;
                </p>
              </div>

              <!-- CTA Button -->
              <table role="presentation" cellspacing="0" cellpadding="0" style="margin: 28px 0;">
                <tr>
                  <td align="center" style="border-radius: 8px; background-color: #6C38FF;">
                    <a href="${chatUrl}" target="_blank" style="display: inline-block; padding: 14px 32px; font-size: 15px; font-weight: 700; color: #FFFFFF; text-decoration: none; border-radius: 8px; letter-spacing: 0.3px;">
                      View Message in Chat &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Safe Trade Tip -->
              <div style="margin-top: 24px; padding: 14px 18px; background-color: #FEF3C7; border-radius: 10px; border: 1px solid #FDE68A;">
                <table role="presentation" cellspacing="0" cellpadding="0">
                  <tr>
                    <td style="font-size: 18px; vertical-align: top; padding-right: 10px;">🔒</td>
                    <td style="font-size: 12.5px; color: #92400E; line-height: 1.5;">
                      <strong>Safety Reminder:</strong> Agree on book condition and meetup locations via BookSwap chat. Never share bank passwords, PINs, or OTPs.
                    </td>
                  </tr>
                </table>
              </div>

              <!-- Fallback Link -->
              <p style="margin: 28px 0 0; font-size: 12px; color: #94A3B8; line-height: 1.5;">
                Button not working? Copy and paste this URL into your browser:<br>
                <a href="${chatUrl}" style="color: #6C38FF; word-break: break-all;">${chatUrl}</a>
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #F8FAFC; border-top: 1px solid #E2E8F0; padding: 22px 30px; text-align: center;">
              <p style="margin: 0 0 6px; font-size: 12px; color: #64748B;">
                BookSwap &middot; Student Book Exchange Platform
              </p>
              <p style="margin: 0; font-size: 11px; color: #94A3B8;">
                You received this notification because of an active book inquiry on your account.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;
}

/**
 * Send Chat Notification Email to Recipient
 */
async function sendChatMessageNotification({ receiverEmail, receiverName, senderName, bookTitle, bookId, senderId, messageText, isFirstMessage }) {
    if (!receiverEmail) {
        console.log("[Email Service] No receiver email provided, skipping.");
        return { success: false, reason: "No email" };
    }

    const chatUrl = `${FRONTEND_URL}/chat.html?book=${encodeURIComponent(bookId || "")}&user=${encodeURIComponent(senderId || "")}`;
    const subjectPrefix = isFirstMessage ? "📚 New Book Inquiry" : "📩 New Message";
    const subject = `${subjectPrefix} on BookSwap from ${senderName || "a student"}`;
    
    const htmlContent = buildChatEmailHtml({
        receiverName,
        senderName,
        bookTitle,
        chatUrl,
        messageText,
        isFirstMessage: !!isFirstMessage
    });

    const plainText = `Hello ${receiverName || "Student"},\n\n` +
        `${senderName || "A user"} sent you a message regarding "${bookTitle || "Book Listing"}":\n\n` +
        `"${messageText}"\n\n` +
        `View and reply to the message here:\n${chatUrl}\n\n` +
        `--\nBookSwap Team`;

    try {
        const { transporter: activeTransporter, isTest } = await getTransporter();

        if (activeTransporter) {
            const info = await activeTransporter.sendMail({
                from: SMTP_FROM,
                to: receiverEmail,
                subject: subject,
                text: plainText,
                html: htmlContent
            });

            console.log("\n" + "=".repeat(75));
            console.log(`📨 [BOOKSWAP EMAIL NOTIFICATION DISPATCHED]`);
            console.log(`To:        ${receiverEmail} (${receiverName || "User"})`);
            console.log(`From:      ${SMTP_FROM}`);
            console.log(`Subject:   ${subject}`);
            console.log(`MessageId: ${info.messageId}`);
            console.log(`Type:      ${isFirstMessage ? "First Inquiry Message" : "Follow-up Message"}`);

            if (isTest) {
                const previewUrl = nodemailer.getTestMessageUrl(info);
                if (previewUrl) {
                    console.log(`🔗 VIEW DELIVERED EMAIL IN BROWSER: ${previewUrl}`);
                }
            } else {
                console.log(`Status:    Delivered via Live SMTP`);
            }
            console.log("=".repeat(75) + "\n");

            return {
                success: true,
                messageId: info.messageId,
                previewUrl: isTest ? nodemailer.getTestMessageUrl(info) : null
            };
        }
    } catch (err) {
        console.error(`[Email Service] Failed to send email:`, err.message);
    }

    // Fallback console preview
    console.log("\n" + "=".repeat(75));
    console.log("📨 [BOOKSWAP EMAIL NOTIFICATION - CONSOLE PREVIEW]");
    console.log(`To:        ${receiverEmail} (${receiverName || "User"})`);
    console.log(`Subject:   ${subject}`);
    console.log(`Book:      ${bookTitle || "Book Inquiry"}`);
    console.log(`Message:   "${messageText}"`);
    console.log(`Chat Link: ${chatUrl}`);
    console.log("=".repeat(75) + "\n");

    return {
        success: true,
        devMode: true,
        to: receiverEmail,
        chatUrl: chatUrl
    };
}

module.exports = {
    sendChatMessageNotification,
    buildChatEmailHtml,
    shouldSendEmailNotification
};
