-- CreateTable
CREATE TABLE "CourseDisLike" (
    "courseId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    PRIMARY KEY ("courseId", "userId"),
    CONSTRAINT "CourseDisLike_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CourseDisLike_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
