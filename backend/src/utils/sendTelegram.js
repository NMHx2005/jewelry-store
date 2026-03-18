/**
 * Gửi tin nhắn đến Telegram bot.
 * Dùng fetch native (Node 18+).
 * Nếu chưa cấu hình token/chatId thì bỏ qua (không throw).
 */
const sendTelegram = async (message) => {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) return;

  try {
    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML',
      }),
    });
  } catch (err) {
    // Không throw để không ảnh hưởng luồng chính
    console.error('[Telegram] Gửi thông báo thất bại:', err.message);
  }
};

export default sendTelegram;
