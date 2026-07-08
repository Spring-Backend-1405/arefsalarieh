-- CreateTable
CREATE TABLE "CourseLike" (
    "courseId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    PRIMARY KEY ("courseId", "userId"),
    CONSTRAINT "CourseLike_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CourseLike_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
