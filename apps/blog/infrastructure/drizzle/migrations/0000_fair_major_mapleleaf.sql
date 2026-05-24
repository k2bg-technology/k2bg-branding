CREATE TYPE "public"."Category" AS ENUM('ENGINEERING', 'DESIGN', 'DATA_SCIENCE', 'LIFE_STYLE', 'OTHER');--> statement-breakpoint
CREATE TYPE "public"."Status" AS ENUM('IDEA', 'DRAFT', 'PREVIEW', 'PUBLISHED', 'ARCHIVED');--> statement-breakpoint
CREATE TYPE "public"."Type" AS ENUM('ARTICLE', 'PAGE');--> statement-breakpoint
CREATE TABLE "Author" (
	"id" serial NOT NULL,
	"uuid" text NOT NULL,
	"name" text NOT NULL,
	"avatarUrl" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	CONSTRAINT "Author_pkey" PRIMARY KEY("id")
);
--> statement-breakpoint
CREATE TABLE "Post" (
	"id" serial NOT NULL,
	"uuid" text NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"type" "Type" DEFAULT 'ARTICLE' NOT NULL,
	"excerpt" text NOT NULL,
	"imageUrl" text NOT NULL,
	"slug" text NOT NULL,
	"status" "Status" DEFAULT 'DRAFT' NOT NULL,
	"category" "Category" DEFAULT 'OTHER' NOT NULL,
	"tags" text[],
	"releaseDate" text NOT NULL,
	"revisionDate" text NOT NULL,
	"authorId" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	CONSTRAINT "Post_pkey" PRIMARY KEY("id")
);
--> statement-breakpoint
CREATE UNIQUE INDEX "Author_uuid_key" ON "Author" USING btree ("uuid");--> statement-breakpoint
CREATE UNIQUE INDEX "Post_uuid_key" ON "Post" USING btree ("uuid");--> statement-breakpoint
ALTER TABLE "Post" ADD CONSTRAINT "Post_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "public"."Author"("uuid") ON DELETE restrict ON UPDATE cascade;