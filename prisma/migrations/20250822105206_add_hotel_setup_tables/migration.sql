-- CreateTable
CREATE TABLE "public"."hotel_info" (
    "id" TEXT NOT NULL,
    "hotel_id" TEXT NOT NULL,
    "reception_number" TEXT,
    "emergency_number" TEXT,
    "check_in_time" TEXT,
    "check_out_time" TEXT,
    "hotel_description" TEXT,
    "amenities" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hotel_info_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."hotel_wifi" (
    "id" TEXT NOT NULL,
    "hotel_info_id" TEXT NOT NULL,
    "network_name" TEXT NOT NULL,
    "password" TEXT,
    "description" TEXT,
    "is_public" BOOLEAN NOT NULL DEFAULT false,
    "bandwidth" TEXT,
    "coverage" TEXT,
    "instructions" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hotel_wifi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."tv_guides" (
    "id" TEXT NOT NULL,
    "hotel_info_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tv_guides_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."tv_channels" (
    "id" TEXT NOT NULL,
    "tv_guide_id" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT,
    "language" TEXT,
    "is_hd" BOOLEAN NOT NULL DEFAULT false,
    "logo" TEXT,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tv_channels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."food_menus" (
    "id" TEXT NOT NULL,
    "hotel_info_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "available_from" TEXT,
    "available_to" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "food_menus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."menu_items" (
    "id" TEXT NOT NULL,
    "menu_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" DOUBLE PRECISION,
    "category" TEXT,
    "is_vegetarian" BOOLEAN NOT NULL DEFAULT false,
    "is_vegan" BOOLEAN NOT NULL DEFAULT false,
    "allergens" TEXT[],
    "spice_level" TEXT,
    "is_available" BOOLEAN NOT NULL DEFAULT true,
    "image" TEXT,
    "prep_time" TEXT,
    "calories" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "menu_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "hotel_info_hotel_id_key" ON "public"."hotel_info"("hotel_id");

-- AddForeignKey
ALTER TABLE "public"."hotel_info" ADD CONSTRAINT "hotel_info_hotel_id_fkey" FOREIGN KEY ("hotel_id") REFERENCES "public"."hotels"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."hotel_wifi" ADD CONSTRAINT "hotel_wifi_hotel_info_id_fkey" FOREIGN KEY ("hotel_info_id") REFERENCES "public"."hotel_info"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."tv_guides" ADD CONSTRAINT "tv_guides_hotel_info_id_fkey" FOREIGN KEY ("hotel_info_id") REFERENCES "public"."hotel_info"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."tv_channels" ADD CONSTRAINT "tv_channels_tv_guide_id_fkey" FOREIGN KEY ("tv_guide_id") REFERENCES "public"."tv_guides"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."food_menus" ADD CONSTRAINT "food_menus_hotel_info_id_fkey" FOREIGN KEY ("hotel_info_id") REFERENCES "public"."hotel_info"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."menu_items" ADD CONSTRAINT "menu_items_menu_id_fkey" FOREIGN KEY ("menu_id") REFERENCES "public"."food_menus"("id") ON DELETE CASCADE ON UPDATE CASCADE;
