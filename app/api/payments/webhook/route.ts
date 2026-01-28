import { NextResponse } from "next/server"
import Stripe from "stripe"
import prisma from "@/lib/db"
import { logAudit } from "@/lib/audit"

const stripeSecretKey = process.env.STRIPE_SECRET_KEY
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

const stripe = stripeSecretKey
  ? new Stripe(stripeSecretKey, { apiVersion: "2024-06-20" })
  : null

export async function POST(req: Request) {
  if (!stripe || !webhookSecret) {
    return new NextResponse("Webhook not configured", { status: 500 })
  }

  const signature = req.headers.get("stripe-signature")
  if (!signature) {
    return new NextResponse("Missing signature", { status: 400 })
  }

  const body = await req.text()

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch {
    return new NextResponse("Invalid payload", { status: 400 })
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session
      const reference = session.id

      if (reference) {
        const updateArgs: unknown = {
          where: { reference },
          data: { status: "Received" },
        }

        await prisma.donation.updateMany(
          updateArgs as Parameters<(typeof prisma.donation)["updateMany"]>[0],
        )
      }
    } else if (event.type === "checkout.session.expired") {
      const session = event.data.object as Stripe.Checkout.Session
      const reference = session.id

      if (reference) {
        const updateArgs: unknown = {
          where: { reference, status: "Pending" },
          data: { status: "Failed" },
        }

        await prisma.donation.updateMany(
          updateArgs as Parameters<(typeof prisma.donation)["updateMany"]>[0],
        )
      }
    }
  } catch {
    await logAudit({
      route: "/api/payments/webhook",
      method: "POST",
      status: 500,
      ip: null,
      details: "Webhook handler error",
    })
    return new NextResponse("Webhook handler error", { status: 500 })
  }

  await logAudit({
    route: "/api/payments/webhook",
    method: "POST",
    status: 200,
    ip: null,
    details: event.type,
  })

  return new NextResponse("ok", { status: 200 })
}
