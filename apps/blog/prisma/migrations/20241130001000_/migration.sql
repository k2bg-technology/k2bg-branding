-- CreateTable
CREATE TABLE "Post" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "title" TEXT,
    "content" TEXT,
    "type" TEXT,
    "excerpt" TEXT,
    "image" TEXT,
    "slug" TEXT,
    "status" TEXT,
    "category" TEXT,
    "tag" TEXT,
    "releaseDate" TEXT,
    "authorId" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Author" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "Author_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Post_uuid_key" ON "Post"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "Author_uuid_key" ON "Author"("uuid");

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "Author"("uuid") ON DELETE SET NULL ON UPDATE CASCADE;
