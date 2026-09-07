import nodemailer from "nodemailer";

const emailPort = Number(process.env.EMAIL_PORT ?? 587);

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: emailPort,
  secure: emailPort === 465,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

type OrderStatusEmail = {
  email: string;
  customerName: string;
  orderId: string;
  status: string;
  total: string | number;
};

export async function sendOrderStatusEmail(order: OrderStatusEmail) {
  const from = process.env.EMAIL_FROM ?? process.env.EMAIL_USER;
  if (!from || !process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error("Email SMTP configuration is incomplete");
  }

  await transporter.sendMail({
    from,
    to: order.email,
    subject: `Order #${order.orderId} status updated`,
    text: [
      `Hello ${order.customerName},`,
      "",
      `Your order #${order.orderId} is now ${order.status}.`,
      `Order total: KES ${order.total}`,
      "",
      "Thank you for shopping with AgTech Store.",
    ].join("\n"),
  });
}
