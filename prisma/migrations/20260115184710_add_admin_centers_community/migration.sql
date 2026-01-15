-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('pending', 'approved', 'rejected');

-- CreateEnum
CREATE TYPE "ModerationAction" AS ENUM ('approved', 'rejected', 'flagged');

-- CreateEnum
CREATE TYPE "EventCategory" AS ENUM ('playdate', 'support_group', 'workshop', 'social');

-- CreateEnum
CREATE TYPE "EventStatus" AS ENUM ('upcoming', 'ongoing', 'completed', 'cancelled');

-- CreateEnum
CREATE TYPE "RSVPStatus" AS ENUM ('going', 'maybe', 'not_going');

-- AlterEnum
ALTER TYPE "UserRole" ADD VALUE 'admin';

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "is_suspended" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "center_profiles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name_en" TEXT NOT NULL,
    "name_ar" TEXT,
    "description_en" TEXT,
    "description_ar" TEXT,
    "specializations" "Specialization"[] DEFAULT ARRAY[]::"Specialization"[],
    "servicesOffered" JSONB NOT NULL DEFAULT '[]',
    "logo_url" TEXT,
    "cover_image_url" TEXT,
    "location_lat" DOUBLE PRECISION,
    "location_lng" DOUBLE PRECISION,
    "city" TEXT,
    "district" TEXT,
    "address" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "website" TEXT,
    "operatingHours" JSONB NOT NULL DEFAULT '{}',
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "rating_avg" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "review_count" INTEGER NOT NULL DEFAULT 0,
    "founded_year" INTEGER,
    "license_number" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "center_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "center_teachers" (
    "id" TEXT NOT NULL,
    "center_id" TEXT NOT NULL,
    "teacher_id" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'staff',
    "employment_type" TEXT NOT NULL DEFAULT 'full_time',
    "start_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "end_date" TIMESTAMP(3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "can_manage_bookings" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "center_teachers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "center_reviews" (
    "id" TEXT NOT NULL,
    "center_id" TEXT NOT NULL,
    "parent_id" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_visible" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "center_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teacher_applications" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'pending',
    "documents" JSONB NOT NULL DEFAULT '[]',
    "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewed_at" TIMESTAMP(3),
    "reviewed_by_id" TEXT,
    "review_notes" TEXT,

    CONSTRAINT "teacher_applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "review_moderations" (
    "id" TEXT NOT NULL,
    "review_id" TEXT NOT NULL,
    "action" "ModerationAction" NOT NULL,
    "reason" TEXT,
    "moderated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "moderated_by_id" TEXT NOT NULL,

    CONSTRAINT "review_moderations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_suspensions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "suspended_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "suspended_by_id" TEXT NOT NULL,
    "unsuspended_at" TIMESTAMP(3),
    "unsuspended_by_id" TEXT,

    CONSTRAINT "user_suspensions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_activity_logs" (
    "id" TEXT NOT NULL,
    "admin_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "target_type" TEXT NOT NULL,
    "target_id" TEXT NOT NULL,
    "details" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admin_activity_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "events" (
    "id" TEXT NOT NULL,
    "organizer_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" "EventCategory" NOT NULL,
    "status" "EventStatus" NOT NULL DEFAULT 'upcoming',
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3),
    "location_name" TEXT NOT NULL,
    "address" TEXT,
    "city" TEXT NOT NULL,
    "district" TEXT,
    "location_lat" DOUBLE PRECISION,
    "location_lng" DOUBLE PRECISION,
    "is_online" BOOLEAN NOT NULL DEFAULT false,
    "online_link" TEXT,
    "max_attendees" INTEGER,
    "image_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_attendees" (
    "id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "status" "RSVPStatus" NOT NULL DEFAULT 'going',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "event_attendees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "forum_categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "name_ar" TEXT,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "forum_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "forum_posts" (
    "id" TEXT NOT NULL,
    "category_id" TEXT NOT NULL,
    "author_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "is_pinned" BOOLEAN NOT NULL DEFAULT false,
    "is_locked" BOOLEAN NOT NULL DEFAULT false,
    "view_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "forum_posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "forum_comments" (
    "id" TEXT NOT NULL,
    "post_id" TEXT NOT NULL,
    "author_id" TEXT NOT NULL,
    "parent_id" TEXT,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "forum_comments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "center_profiles_user_id_key" ON "center_profiles"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "center_teachers_center_id_teacher_id_key" ON "center_teachers"("center_id", "teacher_id");

-- CreateIndex
CREATE UNIQUE INDEX "center_reviews_center_id_parent_id_key" ON "center_reviews"("center_id", "parent_id");

-- CreateIndex
CREATE UNIQUE INDEX "review_moderations_review_id_key" ON "review_moderations"("review_id");

-- CreateIndex
CREATE UNIQUE INDEX "event_attendees_event_id_user_id_key" ON "event_attendees"("event_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "forum_categories_slug_key" ON "forum_categories"("slug");

-- AddForeignKey
ALTER TABLE "center_profiles" ADD CONSTRAINT "center_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "center_teachers" ADD CONSTRAINT "center_teachers_center_id_fkey" FOREIGN KEY ("center_id") REFERENCES "center_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "center_teachers" ADD CONSTRAINT "center_teachers_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "teacher_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "center_reviews" ADD CONSTRAINT "center_reviews_center_id_fkey" FOREIGN KEY ("center_id") REFERENCES "center_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "center_reviews" ADD CONSTRAINT "center_reviews_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teacher_applications" ADD CONSTRAINT "teacher_applications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teacher_applications" ADD CONSTRAINT "teacher_applications_reviewed_by_id_fkey" FOREIGN KEY ("reviewed_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_moderations" ADD CONSTRAINT "review_moderations_review_id_fkey" FOREIGN KEY ("review_id") REFERENCES "reviews"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_moderations" ADD CONSTRAINT "review_moderations_moderated_by_id_fkey" FOREIGN KEY ("moderated_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_suspensions" ADD CONSTRAINT "user_suspensions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_suspensions" ADD CONSTRAINT "user_suspensions_suspended_by_id_fkey" FOREIGN KEY ("suspended_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_suspensions" ADD CONSTRAINT "user_suspensions_unsuspended_by_id_fkey" FOREIGN KEY ("unsuspended_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admin_activity_logs" ADD CONSTRAINT "admin_activity_logs_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_organizer_id_fkey" FOREIGN KEY ("organizer_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_attendees" ADD CONSTRAINT "event_attendees_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_attendees" ADD CONSTRAINT "event_attendees_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "forum_posts" ADD CONSTRAINT "forum_posts_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "forum_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "forum_posts" ADD CONSTRAINT "forum_posts_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "forum_comments" ADD CONSTRAINT "forum_comments_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "forum_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "forum_comments" ADD CONSTRAINT "forum_comments_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "forum_comments" ADD CONSTRAINT "forum_comments_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "forum_comments"("id") ON DELETE SET NULL ON UPDATE CASCADE;
