import { prisma } from "./prisma";

async function seedCourses() {
  console.log("🌱 Seeding 10 additional courses...");

  const teacherIds = [
    "6d023c32-c1a3-45ce-8964-abd2e10f3f94",
    "36dd3acf-40a3-430d-94a8-490a42855ebe",
    "0d614bf9-916c-4575-9d0d-fc4c8d61ad00",
    "f5b34ec0-e355-416a-a722-cea34e76d46b",
    "2f08b9cf-cdf5-4056-a897-9828fdb74307",
  ];

  const coursesData = [
    {
      title: "JavaScript Mastery",
      shortDescription: "Master JavaScript with modern ES6+ features and best practices.",
      level: "intermediate" as const,
      status: "published" as const,
      price: 300000,
      capacity: 60,
      typeId: 3,
      categoryIds: [3, 9, 19], // Programming, JavaScript, React
      fullDescription:
        "Learn JavaScript fundamentals, closures, promises, async/await, and modern ES6+ features. Perfect for building interactive web applications.",
      slug: "javascript-mastery",
      duration: "16 hours",
      language: "en",
      certificateAvailable: true,
      demoVideoUrl: "https://example.com/demo/js",
    },
    {
      title: "SEO & Analytics Expert",
      shortDescription: "Become an SEO expert with Google Analytics and Search Console.",
      level: "intermediate" as const,
      status: "published" as const,
      price: 220000,
      capacity: 45,
      typeId: 4,
      categoryIds: [6, 14, 15], // Marketing, Digital Marketing, SEO
      fullDescription:
        "Learn SEO strategies, keyword research, on-page and off-page optimization, and how to use Google Analytics and Search Console to track performance.",
      slug: "seo-analytics-expert",
      duration: "12 hours",
      language: "en",
      certificateAvailable: true,
      demoVideoUrl: "https://example.com/demo/seo-analytics",
    },
    {
      title: "React Advanced Patterns",
      shortDescription: "Master advanced React patterns like HOCs, Render Props, and Hooks.",
      level: "advanced" as const,
      status: "published" as const,
      price: 380000,
      capacity: 40,
      typeId: 3,
      categoryIds: [3, 19, 1], // Programming, React, react
      fullDescription:
        "Deep dive into React advanced patterns: Higher-Order Components, Render Props, custom Hooks, Context API, and performance optimization with memo and useCallback.",
      slug: "react-advanced-patterns",
      duration: "14 hours",
      language: "en",
      certificateAvailable: true,
      demoVideoUrl: "https://example.com/demo/react-advanced",
    },
    {
      title: "Data Visualization with Python",
      shortDescription: "Learn to visualize data using Matplotlib, Seaborn, and Plotly.",
      level: "intermediate" as const,
      status: "published" as const,
      price: 320000,
      capacity: 50,
      typeId: 5,
      categoryIds: [3, 10], // Programming, Python
      fullDescription:
        "Create stunning data visualizations using Matplotlib, Seaborn, and Plotly. Learn to present data effectively for business and research.",
      slug: "data-visualization-python",
      duration: "10 hours",
      language: "en",
      certificateAvailable: true,
      demoVideoUrl: "https://example.com/demo/data-viz",
    },
    {
      title: "Graphic Design Essentials",
      shortDescription: "Learn the fundamentals of graphic design, typography, and color theory.",
      level: "beginner" as const,
      status: "published" as const,
      price: 160000,
      capacity: 30,
      typeId: 4,
      categoryIds: [4, 11], // Design, UI/UX
      fullDescription:
        "This course covers design principles, typography, color theory, and layout techniques. Ideal for beginners looking to start a career in design.",
      slug: "graphic-design-essentials",
      duration: "8 hours",
      language: "en",
      certificateAvailable: false,
      demoVideoUrl: "https://example.com/demo/design-essentials",
    },
    {
      title: "Mobile App Development with Flutter",
      shortDescription: "Build cross-platform mobile apps with Flutter and Dart.",
      level: "intermediate" as const,
      status: "published" as const,
      price: 400000,
      capacity: 35,
      typeId: 3,
      categoryIds: [3, 19], // Programming, React
      fullDescription:
        "Learn Flutter framework and Dart language to build high-performance, cross-platform mobile applications for iOS and Android.",
      slug: "flutter-mobile-apps",
      duration: "20 hours",
      language: "en",
      certificateAvailable: true,
      demoVideoUrl: "https://example.com/demo/flutter",
    },
    {
      title: "Digital Marketing Fundamentals",
      shortDescription: "A complete guide to digital marketing for beginners.",
      level: "beginner" as const,
      status: "published" as const,
      price: 150000,
      capacity: 80,
      typeId: 4,
      categoryIds: [6, 14, 15], // Marketing, Digital Marketing, SEO
      fullDescription:
        "Learn the basics of digital marketing: SEO, social media, email marketing, and paid advertising. Perfect for entrepreneurs and small business owners.",
      slug: "digital-marketing-fundamentals",
      duration: "6 hours",
      language: "en",
      certificateAvailable: true,
      demoVideoUrl: "https://example.com/demo/digital-marketing",
    },
    {
      title: "Machine Learning Deployment",
      shortDescription: "Learn to deploy ML models using FastAPI, Docker, and AWS.",
      level: "advanced" as const,
      status: "published" as const,
      price: 550000,
      capacity: 25,
      typeId: 5,
      categoryIds: [3, 10], // Programming, Python
      fullDescription:
        "Deploy machine learning models as REST APIs using FastAPI, containerize with Docker, and deploy to AWS. Includes CI/CD pipelines and monitoring.",
      slug: "ml-deployment",
      duration: "18 hours",
      language: "en",
      certificateAvailable: true,
      demoVideoUrl: "https://example.com/demo/ml-deploy",
    },
    {
      title: "Photography & Editing",
      shortDescription: "Master photography techniques and post-processing with Lightroom.",
      level: "intermediate" as const,
      status: "published" as const,
      price: 190000,
      capacity: 40,
      typeId: 4,
      categoryIds: [7, 16], // Photography, Portrait Photography
      fullDescription:
        "Learn advanced photography techniques including composition, lighting, and post-processing using Adobe Lightroom. Includes practical shooting assignments.",
      slug: "photography-editing",
      duration: "12 hours",
      language: "en",
      certificateAvailable: true,
      demoVideoUrl: "https://example.com/demo/photography-editing",
    },
    {
      title: "Node.js Microservices",
      shortDescription: "Build scalable microservices with Node.js and Docker.",
      level: "advanced" as const,
      status: "draft" as const,
      price: 420000,
      capacity: 30,
      typeId: 2,
      categoryIds: [3, 20, 9], // Programming, Node.js, JavaScript
      fullDescription:
        "Learn to build microservices architecture using Node.js, Express, Docker, and Kubernetes. Covers service discovery, API gateways, and message brokers.",
      slug: "nodejs-microservices",
      duration: "22 hours",
      language: "en",
      certificateAvailable: false,
      demoVideoUrl: "https://example.com/demo/microservices",
    },
  ];

  try {
    await prisma.$transaction(async (tx) => {
      for (const data of coursesData) {
        const randomTeacherId = teacherIds[Math.floor(Math.random() * teacherIds.length)];

        const course = await tx.course.create({
          data: {
            title: data.title,
            shortDescription: data.shortDescription,
            isFree: false,
            level: data.level,
            status: data.status,
            teacherId: randomTeacherId,
            typeId: data.typeId,
          },
        });

        console.log(`✅ Created course: ${data.title} (ID: ${course.id})`);

        await tx.coursePrice.create({
          data: {
            courseId: course.id,
            price: data.price,
            isActive: true,
          },
        });

        for (const catId of data.categoryIds) {
          await tx.courseCategoryList.create({
            data: {
              courseId: course.id,
              categoryId: catId,
            },
          });
        }

        await tx.courseDetail.create({
          data: {
            courseId: course.id,
            fullDescription: data.fullDescription,
            language: data.language || "fa",
            certificateAvailable: data.certificateAvailable || false,
            demoVideoUrl: data.demoVideoUrl || null,
            capacity: data.capacity,
            slug: data.slug || `${data.title.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}`,
            duration: data.duration || "0 hours",
          },
        });
      }
    });

    console.log("🎉 Seeding completed! 10 additional courses added.");
  } catch (error) {
    console.error("❌ Error seeding courses:", error);
    throw error;
  }
}

seedCourses()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });