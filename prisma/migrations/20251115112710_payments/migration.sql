/*
  Warnings:

  - Added the required column `plan_id` to the `subscriptions` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('created', 'authorized', 'captured', 'refunded', 'failed');

-- AlterTable
ALTER TABLE "subscriptions" ADD COLUMN     "plan_id" TEXT NOT NULL,
ALTER COLUMN "currency" SET DEFAULT 'USD';

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "razorpayCustomerId" TEXT;

-- CreateTable
CREATE TABLE "subscription_plans" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "period" "BillingCycle" NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "room_limit" INTEGER NOT NULL,
    "features" TEXT[],
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "razorpay_plan_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscription_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_orders" (
    "id" TEXT NOT NULL,
    "hotel_id" TEXT NOT NULL,
    "subscription_id" TEXT,
    "razorpay_order_id" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "status" "PaymentStatus" NOT NULL DEFAULT 'created',
    "receipt" TEXT,
    "notes" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "payment_order_id" TEXT NOT NULL,
    "razorpay_payment_id" TEXT NOT NULL,
    "razorpay_order_id" TEXT NOT NULL,
    "razorpay_signature" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "status" "PaymentStatus" NOT NULL,
    "method" TEXT,
    "bank" TEXT,
    "description" TEXT,
    "captured" BOOLEAN NOT NULL DEFAULT false,
    "fee" INTEGER,
    "tax" INTEGER,
    "error_code" TEXT,
    "error_description" TEXT,
    "refund_status" TEXT,
    "refund_amount" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "subscription_plans_name_key" ON "subscription_plans"("name");

-- CreateIndex
CREATE UNIQUE INDEX "payment_orders_razorpay_order_id_key" ON "payment_orders"("razorpay_order_id");

-- CreateIndex
CREATE UNIQUE INDEX "payments_razorpay_payment_id_key" ON "payments"("razorpay_payment_id");

-- AddForeignKey
ALTER TABLE "payment_orders" ADD CONSTRAINT "payment_orders_hotel_id_fkey" FOREIGN KEY ("hotel_id") REFERENCES "hotels"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_orders" ADD CONSTRAINT "payment_orders_subscription_id_fkey" FOREIGN KEY ("subscription_id") REFERENCES "subscriptions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_payment_order_id_fkey" FOREIGN KEY ("payment_order_id") REFERENCES "payment_orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
