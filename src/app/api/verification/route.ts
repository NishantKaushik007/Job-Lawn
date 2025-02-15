import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { MongoClient } from 'mongodb';

export async function POST(request: Request) {
  try {
    // Read the raw request body (needed to verify the signature)
    const rawBody = await request.text();

    // Get the signature from the request headers
    const receivedSignature = request.headers.get('x-razorpay-signature');
    if (!receivedSignature) {
      console.error('[Verification API] Signature missing');
      return NextResponse.json({ error: 'Signature missing' }, { status: 400 });
    }

    // Retrieve the Razorpay secret from environment variables
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!secret) {
      console.error('[Verification API] Razorpay secret not configured');
      return NextResponse.json({ error: 'Razorpay secret not configured' }, { status: 500 });
    }

    // Compute HMAC SHA256 of the raw body using your secret
    const computedSignature = crypto
      .createHmac('sha256', secret)
      .update(rawBody)
      .digest('hex');

    console.log('[Verification API] Received signature:', receivedSignature);
    console.log('[Verification API] Computed signature:', computedSignature);

    // Check if the computed signature matches the received signature
    if (computedSignature !== receivedSignature) {
      console.error('[Verification API] Signature verification failed');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Parse the JSON payload
    let payload;
    try {
      payload = JSON.parse(rawBody);
    } catch (parseError) {
      console.error('[Verification API] Error parsing JSON payload:', parseError);
      return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
    }

    // Extract the user email from the payload
    // (Assumes the email is at payload.payload.payment.entity.email)
    const userEmail = payload.payload?.payment?.entity?.email;
    if (!userEmail) {
      console.error('[Verification API] User email not found in payload');
      return NextResponse.json({ error: 'User email not found' }, { status: 400 });
    }

    // Connect to MongoDB Atlas using your MONGODB_URI
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      console.error('[Verification API] MongoDB URI not configured');
      return NextResponse.json({ error: 'MongoDB URI not configured' }, { status: 500 });
    }

    const client = new MongoClient(uri);
    await client.connect();

    // Use the default database specified in the MONGODB_URI connection string.
    // If your URI does not include a database name, uncomment and set your database name here:
    // const db = client.db('your_database_name');
    const db = client.db();

    // Use the "users" collection (change if your collection name is different)
    const usersCollection = db.collection('users');

    // Calculate the new subscription expiry date: current date + 30 days
    const currentDate = new Date();
    const subscriptionExpires = new Date(currentDate.getTime() + 30 * 24 * 60 * 60 * 1000);

    // Update the user's subscriptionExpires field
    const result = await usersCollection.updateOne(
      { email: userEmail },
      { $set: { subscriptionExpires: subscriptionExpires } }
    );

    await client.close();

    if (result.modifiedCount === 0) {
      console.warn('[Verification API] No user updated. Perhaps user not found.');
      return NextResponse.json(
        { message: 'User not found or subscription already updated' },
        { status: 404 }
      );
    }

    console.log('[Verification API] Subscription updated for user:', userEmail);

    return NextResponse.json({
      message: 'Verification successful and subscription updated',
      subscriptionExpires,
    });
  } catch (error) {
    console.error('[Verification API] Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
