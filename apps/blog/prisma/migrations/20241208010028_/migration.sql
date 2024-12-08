/*
  Warnings:

  - You are about to drop the column `image` on the `Post` table. All the data in the column will be lost.
  - You are about to drop the column `tag` on the `Post` table. All the data in the column will be lost.
  - The `type` column on the `Post` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `Post` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `category` column on the `Post` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `imageUrl` to the `Post` table without a default value. This is not possible if the table is not empty.
  - Added the required column `revisionDate` to the `Post` table without a default value. This is not possible if the table is not empty.
  - Made the column `title` on table `Post` required. This step will fail if there are existing NULL values in that column.
  - Made the column `content` on table `Post` required. This step will fail if there are existing NULL values in that column.
  - Made the column `excerpt` on table `Post` required. This step will fail if there are existing NULL values in that column.
  - Made the column `slug` on table `Post` required. This step will fail if there are existing NULL values in that column.
  - Made the column `releaseDate` on table `Post` required. This step will fail if there are existing NULL values in that column.
  - Made the column `authorId` on table `Post` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "Type" AS ENUM ('ARTICLE', 'PAGE');

-- CreateEnum
CREATE TYPE "Status" AS ENUM ('IDEA', 'DRAFT', 'PREVIEW', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "Category" AS ENUM ('ENGINEERING', 'DESIGN', 'DATA_SCIENCE', 'LIFE_STYLE', 'OTHER');

-- DropForeignKey
ALTER TABLE "Post" DROP CONSTRAINT "Post_authorId_fkey";

-- AlterTable
ALTER TABLE "Post" DROP COLUMN "image",
DROP COLUMN "tag",
ADD COLUMN     "imageUrl" TEXT NOT NULL,
ADD COLUMN     "revisionDate" TEXT NOT NULL,
ADD COLUMN     "tags" TEXT[],
ALTER COLUMN "title" SET NOT NULL,
ALTER COLUMN "content" SET NOT NULL,
DROP COLUMN "type",
ADD COLUMN     "type" "Type" NOT NULL DEFAULT 'ARTICLE',
ALTER COLUMN "excerpt" SET NOT NULL,
ALTER COLUMN "slug" SET NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "Status" NOT NULL DEFAULT 'DRAFT',
DROP COLUMN "category",
ADD COLUMN     "category" "Category" NOT NULL DEFAULT 'OTHER',
ALTER COLUMN "releaseDate" SET NOT NULL,
ALTER COLUMN "authorId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "Author"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;
