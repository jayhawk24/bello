-- AlterTable
ALTER TABLE "public"."payment_orders" ALTER COLUMN "currency" SET DEFAULT 'USD';

-- AlterTable
ALTER TABLE "public"."payments" ALTER COLUMN "currency" SET DEFAULT 'USD';

-- AlterTable
ALTER TABLE "public"."subscription_plans" ALTER COLUMN "currency" SET DEFAULT 'USD';

-- AlterTable
ALTER TABLE "public"."subscriptions" ALTER COLUMN "currency" SET DEFAULT 'USD';
