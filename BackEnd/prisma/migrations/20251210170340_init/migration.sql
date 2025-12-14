-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "full_name" TEXT,
    "role" TEXT NOT NULL,
    "kelompok" TEXT,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kelompok" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "kelompok_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "laporan" (
    "id" SERIAL NOT NULL,
    "jenis" TEXT,
    "kelompok" TEXT,
    "data" JSONB,
    "tanggal" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "laporan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifikasi" (
    "id" SERIAL NOT NULL,
    "message" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifikasi_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");
