const BASE_URL = "https://sandbox.safaricom.co.ke";

const getMpesaEnv = () => {
  const consumerKey = process.env.MPESA_CONSUMER_KEY?.trim();
  const consumerSecret = process.env.MPESA_CONSUMER_SECRET?.trim();
  const shortcode = process.env.MPESA_SHORTCODE?.trim();
  const passkey = process.env.MPESA_PASSKEY?.trim();
  const callbackUrl = process.env.MPESA_CALLBACK_URL?.trim();

  if (!consumerKey || !consumerSecret || !shortcode || !passkey || !callbackUrl) {
    throw new Error("Missing required M-Pesa environment values");
  }

  return { consumerKey, consumerSecret, shortcode, passkey, callbackUrl };
};

async function getAccessToken(): Promise<string> {
  const { consumerKey, consumerSecret } = getMpesaEnv();
  const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64");

  const res = await fetch(`${BASE_URL}/oauth/v1/generate?grant_type=client_credentials`, {
    headers: { Authorization: `Basic ${auth}` },
  });

  if (!res.ok) {
    throw new Error("Failed to get M-Pesa access token");
  }

  const data = (await res.json()) as { access_token?: string };
  if (!data.access_token) {
    throw new Error("M-Pesa access token missing from response");
  }

  return data.access_token;
}

function getTimestamp(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    now.getFullYear().toString() +
    pad(now.getMonth() + 1) +
    pad(now.getDate()) +
    pad(now.getHours()) +
    pad(now.getMinutes()) +
    pad(now.getSeconds())
  );
}

type StkPushParams = {
  phone: string;
  amount: number;
  orderId: number;
};

export async function initiateStkPush({ phone, amount, orderId }: StkPushParams) {
  const { shortcode, passkey, callbackUrl } = getMpesaEnv();
  const token = await getAccessToken();
  const timestamp = getTimestamp();

  const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString("base64");

  const res = await fetch(`${BASE_URL}/mpesa/stkpush/v1/processrequest`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      BusinessShortCode: shortcode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: Math.round(amount),
      PartyA: phone,
      PartyB: shortcode,
      PhoneNumber: phone,
      CallBackURL: callbackUrl,
      AccountReference: `ORDER-${orderId}`,
      TransactionDesc: `Payment for order #${orderId}`,
    }),
  });

  const data = (await res.json()) as {
    ResponseCode?: string;
    errorMessage?: string;
    CheckoutRequestID?: string;
  };

  if (!res.ok || data.ResponseCode !== "0") {
    throw new Error(data.errorMessage || "STK push failed");
  }

  if (!data.CheckoutRequestID) {
    throw new Error("M-Pesa did not return a checkout request ID");
  }

  return data.CheckoutRequestID;
}