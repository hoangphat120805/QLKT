const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const cron = require("node-cron");
require("dotenv").config();
const { PORT } = require("./configs");
const { prisma } = require("./models");
const profileService = require("./services/profile.service");
const app = express();

// Cấu hình CORS chi tiết để cho phép Frontend truy cập
const corsOptions = {
  origin: function (origin, callback) {
    // Cho phép requests không có origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      "https://qlhv.vercel.app",
      "https://fe-student-manager.vercel.app",
      "https://fe-qlhv-ahnzq9nap-tran-ducs-projects-6b0bdbb3.vercel.app", // Domain mới của Vercel
      "http://localhost:3000",
      "http://localhost:3002",
    ];

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true, // Cho phép gửi cookies
  optionsSuccessStatus: 200,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "token",
    "x-access-token",
    "Cookie",
  ],
  exposedHeaders: ["Set-Cookie"], // Cho phép frontend đọc Set-Cookie header
  preflightContinue: false, // Pass preflight response to next handler
  maxAge: 86400, // Cache preflight for 24 hours
};

// Apply CORS globally
app.use(cors(corsOptions));

// Explicitly handle all OPTIONS requests for preflight
app.options("*", cors(corsOptions));

// Add additional CORS headers middleware as backup
app.use((req, res, next) => {
  const origin = req.headers.origin;
  const allowedOrigins = [
    "https://qlhv.vercel.app",
    "https://fe-student-manager.vercel.app",
    "https://fe-qlhv-ahnzq9nap-tran-ducs-projects-6b0bdbb3.vercel.app",
    "http://localhost:3000",
    "http://localhost:3002",
  ];

  if (allowedOrigins.includes(origin) || !origin) {
    res.header("Access-Control-Allow-Origin", origin || "*");
    res.header("Access-Control-Allow-Credentials", "true");
    res.header(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, PATCH, OPTIONS"
    );
    res.header(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, token, x-access-token, Cookie"
    );
    res.header("Access-Control-Expose-Headers", "Set-Cookie");
  }

  // Handle preflight
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});

// Trust proxy for production deployment (Render.com, Heroku, etc.)
app.set("trust proxy", 1);
console.log("🔧 Trust proxy enabled for production deployment");

app.use(express.json());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Test Prisma connection
async function testDatabaseConnection() {
  try {
    await prisma.$connect();
    console.log('✅ Kết nối database thành công');
  } catch (error) {
    console.error('❌ Không thể kết nối database:', error);
    process.exit(1);
  }
}

testDatabaseConnection();

// Cron job: Tự động cập nhật hồ sơ hàng tháng
// Chạy vào ngày 1 hàng tháng lúc 01:00 sáng
cron.schedule('0 1 1 * *', async () => {
  console.log('\n📅 [CRON JOB] Bắt đầu cập nhật hồ sơ định kỳ hàng tháng...');
  console.log(`📅 Thời gian: ${new Date().toLocaleString('vi-VN')}`);

  try {
    const result = await profileService.recalculateAll();
    console.log(`✅ [CRON JOB] Hoàn thành cập nhật hồ sơ định kỳ`);
    console.log(`   - Thành công: ${result.success} quân nhân`);
    console.log(`   - Thất bại: ${result.errors.length} quân nhân`);

    if (result.errors.length > 0) {
      console.log('⚠️  [CRON JOB] Danh sách lỗi:');
      result.errors.forEach(err => {
        console.log(`   - ID ${err.personnelId}: ${err.error}`);
      });
    }
  } catch (error) {
    console.error('❌ [CRON JOB] Lỗi khi cập nhật hồ sơ định kỳ:', error.message);
  }

  console.log('📅 [CRON JOB] Kết thúc\n');
});

console.log('⏰ Cron job đã được kích hoạt: Cập nhật hồ sơ vào 01:00 ngày 1 hàng tháng');

app.use(require("./routes/index"));

app.listen(PORT, () => {
  console.log(`🚀 Server đang chạy trên cổng ${PORT}`);
  console.log(`📍 API endpoint: http://localhost:${PORT}/api`);
  console.log(`💚 Health check: http://localhost:${PORT}/health`);
  console.log(`🔍 Prisma Studio: npx prisma studio`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Đang đóng server...');
  await prisma.$disconnect();
  process.exit(0);
});
