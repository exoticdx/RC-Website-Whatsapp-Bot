import type { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';

// These should be set in your Vercel Environment Variables
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 1. Webhook Verification (Meta requires this when you set up the webhook)
  if (req.method === 'GET') {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode && token) {
      if (mode === 'subscribe' && token === VERIFY_TOKEN) {
        console.log('WEBHOOK_VERIFIED');
        return res.status(200).send(challenge);
      } else {
        return res.status(403).send('Verification failed');
      }
    }
    return res.status(400).send('Missing parameters');
  }

  // 2. Handling Incoming Messages
  if (req.method === 'POST') {
    const body = req.body;

    if (body.object) {
      if (
        body.entry &&
        body.entry[0].changes &&
        body.entry[0].changes[0] &&
        body.entry[0].changes[0].value.messages &&
        body.entry[0].changes[0].value.messages[0]
      ) {
        const phoneNumber = body.entry[0].changes[0].value.messages[0].from;
        const msgBody = body.entry[0].changes[0].value.messages[0].text?.body;

        if (msgBody) {
          console.log(`Received message from ${phoneNumber}: ${msgBody}`);

          // Check if the message is a request for a collection
          if (msgBody.startsWith('REQUEST_COLLECTION_')) {
            const collectionId = msgBody.split('REQUEST_COLLECTION_')[1].trim();

            // Here we check the live stock (assuming collection-1 for now)
            if (collectionId === 'collection-1') {
              const dataPath = path.join(process.cwd(), 'src', 'data', 'collection-1.json');
              const fileContent = fs.readFileSync(dataPath, 'utf-8');
              const collection1Data = JSON.parse(fileContent);
              
              const inStockItems = collection1Data.items.filter((item: any) => item.inStock);
              
              const replyText = `Here is your requested catalog for *${collection1Data.name}*!\n\nCurrently, we have ${inStockItems.length} items in stock.\n\n` +
                                inStockItems.map(item => `- *${item.name}* (SKU: ${item.sku}) - ₹${item.price}`).join('\n') +
                                `\n\n(In a real setup, we would send the image files here or a link to a Google Drive folder containing the high-res assets.)`;

              // Send the reply back via WhatsApp API
              try {
                await axios.post(
                  `https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`,
                  {
                    messaging_product: 'whatsapp',
                    to: phoneNumber,
                    type: 'text',
                    text: { body: replyText }
                  },
                  {
                    headers: {
                      'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
                      'Content-Type': 'application/json'
                    }
                  }
                );
                console.log('Reply sent successfully!');
              } catch (error: any) {
                console.error('Error sending message:', error.response?.data || error.message);
              }
            } else {
              // Handle unknown collection
              try {
                await axios.post(
                  `https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`,
                  {
                    messaging_product: 'whatsapp',
                    to: phoneNumber,
                    type: 'text',
                    text: { body: `Sorry, we couldn't find the collection: ${collectionId}` }
                  },
                  {
                    headers: { Authorization: `Bearer ${WHATSAPP_TOKEN}` }
                  }
                );
              } catch (e) {}
            }
          }
        }
      }
      return res.status(200).send('EVENT_RECEIVED');
    } else {
      return res.status(404).send('Not Found');
    }
  }

  return res.status(405).send('Method Not Allowed');
}
