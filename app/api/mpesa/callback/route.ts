// app/api/mpesa/callback/route.ts
import { NextRequest, NextResponse } from "next/server";
import db from "../../../_lib/db";

type CallbackMetadataItem = {
  Name?: string;
  Value?: string | number;
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const callback = body?.Body?.stkCallback;
    if (!callback) {
      return NextResponse.json({ error: "Malformed callback" }, { status: 400 });
    }

    const checkoutRequestId = callback.CheckoutRequestID;
    const resultCode = callback.ResultCode; // 0 = success
    const status = resultCode === 0 ? "paid" : "failed";

    const receiptNumber =
      callback.CallbackMetadata?.Item?.find(
        (item: CallbackMetadataItem) => item.Name === "MpesaReceiptNumber"
      )?.Value ?? null;

    await db.query(
      `UPDATE orders
       SET status = $1, mpesa_receipt_number = $2
       WHERE mpesa_checkout_request_id = $3`,
      [status, receiptNumber, checkoutRequestId]
    );

    // Safaricom expects a 200 with this exact shape regardless of outcome
    return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
  } catch (err) {
    console.error("mpesa callback failed:", err);
    // Still 200 — a non-200 makes Safaricom retry, which won't fix a bug
    // on our end and can cause duplicate-processing noise. Log and fix instead.
    return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
  }
}
