-- Drop existing enum if it exists and create new one
-- DO $$ 
-- BEGIN
--     IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'subscriptiontier') THEN
--         CREATE TYPE "public"."SubscriptionTier" AS ENUM ('free', 'basic', 'premium', 'enterprise');
--     END IF;
-- END $$;
-- Add temporary column
ALTER TABLE "public"."hotels" ADD COLUMN "new_subscription_tier" "public"."SubscriptionTier";

-- Migrate data
UPDATE "public"."hotels" 
SET "new_subscription_tier" = CASE 
    WHEN "subscription_tier" = 'free' THEN 'free'::"public"."SubscriptionTier"
    WHEN "subscription_tier" = 'basic' THEN 'basic'::"public"."SubscriptionTier"
    WHEN "subscription_tier" = 'premium' THEN 'premium'::"public"."SubscriptionTier"
    WHEN "subscription_tier" = 'enterprise' THEN 'enterprise'::"public"."SubscriptionTier"
    ELSE 'basic'::"public"."SubscriptionTier"
END;

-- Make the new column required
ALTER TABLE "public"."hotels" ALTER COLUMN "new_subscription_tier" SET NOT NULL;

-- Drop old column and rename new column
ALTER TABLE "public"."hotels" DROP COLUMN "subscription_tier";
ALTER TABLE "public"."hotels" RENAME COLUMN "new_subscription_tier" TO "subscription_tier";

-- AlterTable
ALTER TABLE "public"."payment_orders" ALTER COLUMN "currency" SET DEFAULT 'INR';

-- AlterTable
ALTER TABLE "public"."payments" ALTER COLUMN "currency" SET DEFAULT 'INR';

-- AlterTable
ALTER TABLE "public"."subscription_plans" ALTER COLUMN "currency" SET DEFAULT 'INR';

-- Update subscriptions table
ALTER TABLE "public"."subscriptions" ADD COLUMN "new_plan_type" "public"."SubscriptionTier";

-- Migrate subscription data
UPDATE "public"."subscriptions" 
SET "new_plan_type" = CASE 
    WHEN "subscription_tier" = 'free' THEN 'free'::"public"."SubscriptionTier"
    WHEN "subscription_tier" = 'basic' THEN 'basic'::"public"."SubscriptionTier"
    WHEN "subscription_tier" = 'premium' THEN 'premium'::"public"."SubscriptionTier"
    WHEN "subscription_tier" = 'enterprise' THEN 'enterprise'::"public"."SubscriptionTier"
    ELSE 'basic'::"public"."SubscriptionTier"
END;

-- Make the new column required
ALTER TABLE "public"."subscriptions" ALTER COLUMN "new_plan_type" SET NOT NULL;

-- Drop old column and rename new column
ALTER TABLE "public"."subscriptions" DROP COLUMN "subscription_tier";
ALTER TABLE "public"."subscriptions" RENAME COLUMN "new_plan_type" TO "plan_type";
ALTER TABLE "public"."subscriptions" ALTER COLUMN "currency" SET DEFAULT 'INR';

-- DropEnum
DROP TYPE "public"."SubscriptionPlan";
