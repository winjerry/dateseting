
import { getEmailService } from '@/shared/services/email';

async function main() {
  try {
    console.log('Sending test email to weihai1233@gmail.com...');
    const emailService = await getEmailService();
    await emailService.sendEmail({
      to: 'weihai1233@gmail.com',
      subject: 'Datesetmatch E2E Test',
      html: '<h1>System Verification</h1><p>Your Datesetmatch system is ready.</p><p>This email confirms that Resend integration is working correctly.</p>'
    });
    console.log('Test email sent successfully.');
  } catch (e) {
    console.error('Failed to send email:', e);
  }
}

main().then(() => process.exit(0));
