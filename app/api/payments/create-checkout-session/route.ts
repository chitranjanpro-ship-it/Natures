import { NextResponse } from "next/server"
import Stripe from "stripe"
import prisma from "@/lib/db"
import { buildRateLimitKey, checkRateLimit } from "@/lib/rate-limit"
import { logAudit } from "@/lib/audit"

const stripeSecretKey = process.env.STRIPE_SECRET_KEY

const stripe = stripeSecretKey
  ? new Stripe(stripeSecretKey, { apiVersion: "2024-06-20" })
  : null

export async function POST(request: Request) {
  if (!stripe) {
    return new NextResponse("Stripe not configured", { status: 500 })
  }

  const rateKey = buildRateLimitKey(request, "create-checkout")
  const allowed = checkRateLimit(rateKey, 20, 60_000)
  if (!allowed) {
    await logAudit({
      route: "/api/payments/create-checkout-session",
      method: "POST",
      status: 429,
      ip: rateKey.split(":")[1] ?? null,
      details: "Rate limit exceeded",
    })
    return new NextResponse("Too many requests", { status: 429 })
  }

  const formData = await request.formData()

  const amountRaw = formData.get("amount")?.toString().trim()
  const donorNameRaw = formData.get("donorName")?.toString().trim()
  const donorEmailRaw = formData.get("donorEmail")?.toString().trim()
  const purposeRaw = formData.get("purpose")?.toString().trim()

  if (!amountRaw || !donorNameRaw || !donorEmailRaw) {
    return new NextResponse("Invalid input", { status: 400 })
  }

  const amountNumber = Number(amountRaw)
  if (Number.isNaN(amountNumber) || amountNumber <= 0) {
    return new NextResponse("Invalid amount", { status: 400 })
  }

  const unitAmount = Math.round(amountNumber * 100)

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "inr",
          unit_amount: unitAmount,
          product_data: {
            name: "Donation to NATURE Society",
          },
        },
        quantity: 1,
      },
    ],
    customer_email: donorEmailRaw,
    success_url: `${baseUrl}/donate?success=1`,
    cancel_url: `${baseUrl}/donate?cancel=1`,
  })

  const createArgs: unknown = {
    data: {
      amount: amountNumber,
      donorName: donorNameRaw,
      donorEmail: donorEmailRaw,
      purpose: purposeRaw || null,
      isAnonymous: false,
      receiptNo: session.id,
      mode: "Gateway",
      status: "Pending",
      reference: session.id,
    },
  }

  await prisma.donation.create(
    createArgs as Parameters<(typeof prisma.donation)["create"]>[0],
  )

  if (!session.url) {
    await logAudit({
      route: "/api/payments/create-checkout-session",
      method: "POST",
      status: 500,
      ip: rateKey.split(":")[1] ?? null,
      details: "Session missing URL",
    })
    return new NextResponse("Unable to create checkout session", { status: 500 })
  }

  await logAudit({
    route: "/api/payments/create-checkout-session",
    method: "POST",
    status: 303,
    ip: rateKey.split(":")[1] ?? null,
    details: session.id,
  })

  return NextResponse.redirect(session.url, 303)
}
