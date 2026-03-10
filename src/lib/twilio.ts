import twilio from 'twilio';

if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
  throw new Error('Twilio credentials are not properly configured');
}

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export async function sendWhatsAppMessage(
  toPhoneNumber: string,
  message: string,
  mediaUrl?: string
) {
  try {
    const msgData: any = {
      from: `whatsapp:${process.env.TWILIO_PHONE_NUMBER}`,
      to: `whatsapp:${toPhoneNumber}`,
    };

    if (mediaUrl) {
      msgData.mediaUrl = [mediaUrl];
    } else {
      msgData.body = message;
    }

    const response = await client.messages.create(msgData);
    return response;
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    throw error;
  }
}

export async function sendBulkWhatsAppMessages(
  recipients: Array<{ phone: string; message: string; mediaUrl?: string }>
) {
  const results = [];
  const errors = [];

  for (const recipient of recipients) {
    try {
      const response = await sendWhatsAppMessage(
        recipient.phone,
        recipient.message,
        recipient.mediaUrl
      );
      results.push({ phone: recipient.phone, status: 'sent', sid: response.sid });
    } catch (error) {
      errors.push({ phone: recipient.phone, error: String(error) });
    }
  }

  return { results, errors };
}

export async function checkWhatsAppMessageStatus(messageSid: string) {
  try {
    const message = await client.messages(messageSid).fetch();
    return {
      status: message.status,
      sentAt: message.dateSent,
      errorMessage: message.errorMessage,
    };
  } catch (error) {
    console.error('Error checking message status:', error);
    throw error;
  }
}

export function formatPhoneNumber(phone: string): string {
  // Remove any non-digit characters except leading +
  const cleaned = phone.replace(/[^\d+]/g, '');
  
  // If it doesn't start with +, add the country code for KSA as default
  if (!cleaned.startsWith('+')) {
    return `+966${cleaned.slice(-9)}`;
  }
  
  return cleaned;
}
