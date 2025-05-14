/*
  Warnings:

  - You are about to drop the column `hideRatings` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `joinDate` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `privateProfile` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `profilePicture` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `profileTheme` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Badge` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_FeaturedMovies` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Badge" DROP CONSTRAINT "Badge_userId_fkey";

-- DropForeignKey
ALTER TABLE "_FeaturedMovies" DROP CONSTRAINT "_FeaturedMovies_A_fkey";

-- DropForeignKey
ALTER TABLE "_FeaturedMovies" DROP CONSTRAINT "_FeaturedMovies_B_fkey";

-- AlterTable
ALTER TABLE "Movie" ADD COLUMN     "isFavorite" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isPublic" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "hideRatings",
DROP COLUMN "joinDate",
DROP COLUMN "privateProfile",
DROP COLUMN "profilePicture",
DROP COLUMN "profileTheme",
ADD COLUMN     "isProfilePublic" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "profileImage" TEXT,
ADD COLUMN     "themeColor" TEXT,
ALTER COLUMN "favoriteGenres" DROP DEFAULT;

-- DropTable
DROP TABLE "Badge";

-- DropTable
DROP TABLE "_FeaturedMovies";
