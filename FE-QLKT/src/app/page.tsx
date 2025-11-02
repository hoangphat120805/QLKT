'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Trophy,
  Users,
  BarChart3,
  FileText,
  Award,
  Star,
  CheckCircle,
  ArrowRight,
  Shield,
} from 'lucide-react';
import Image from 'next/image';

export default function HomePage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const role = localStorage.getItem('role');

    if (token && role) {
      setIsLoggedIn(true);
      setUserRole(role);
    }

    setLoading(false);
  }, []);

  const handleRedirect = () => {
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }

    switch (userRole) {
      case 'SUPER_ADMIN':
        router.push('/super-admin/dashboard');
        break;
      case 'ADMIN':
        router.push('/admin/dashboard');
        break;
      case 'MANAGER':
        router.push('/manager/dashboard');
        break;
      case 'USER':
        router.push('/user/dashboard');
        break;
      default:
        router.push('/login');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen"
      style={{
        background: `linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 58, 138, 0.8) 30%, rgba(79, 70, 229, 0.7) 70%, rgba(147, 51, 234, 0.6) 100%), url('/login-bg.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 backdrop-blur-md border-b-2 border-white/30 shadow-lg">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2 hover:cursor-pointer transition-all duration-300 hover:opacity-80">
              <Image
                src="/logo-msa.png"
                alt="Logo"
                width={48}
                height={48}
                className="my-1 transition-all duration-300 hover:scale-105 hover:cursor-pointer"
                priority
              />
              <span className="text-xl font-bold text-blue-100 hover:cursor-pointer transition-all duration-300 hover:text-white drop-shadow-lg">
                HỌC VIỆN KHOA HỌC QUÂN SỰ
              </span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a
                href="#features"
                className="text-blue-100 hover:text-white transition-colors font-bold drop-shadow-md"
              >
                Tính năng
              </a>
              <a
                href="#about"
                className="text-blue-100 hover:text-white transition-colors font-bold drop-shadow-md"
              >
                Giới thiệu
              </a>
              <a
                href="#contact"
                className="text-blue-100 hover:text-white transition-colors font-bold drop-shadow-md"
              >
                Liên hệ
              </a>
              <button
                onClick={handleRedirect}
                className="bg-white text-blue-600 px-4 py-2 rounded-full font-black hover:bg-white/90 transition-colors shadow-md"
              >
                {isLoggedIn ? 'Quản lý Khen thưởng' : 'Đăng nhập'}
              </button>
            </div>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section id="about" className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-white">
              <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-6 drop-shadow-lg">
                Hệ thống
                <br />
                <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent drop-shadow-md">
                  Quản lý Khen thưởng
                </span>
              </h1>
              <p className="text-lg md:text-xl text-white mb-8 leading-relaxed drop-shadow-md font-medium">
                Giải pháp công nghệ tiên tiến cho việc quản lý khen thưởng, danh hiệu và thành tích
                khoa học toàn diện tại Học viện Khoa học Quân sự. Tối ưu hóa quy trình hành chính,
                nâng cao hiệu quả công tác khen thưởng.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleRedirect}
                  className="bg-white text-blue-600 px-8 py-4 rounded-full font-semibold hover:bg-white/90 transition-all hover:scale-105 flex items-center justify-center group shadow-lg"
                >
                  {isLoggedIn ? 'Quản lý Khen thưởng' : 'Truy cập hệ thống'}
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <a
                  href="#features"
                  className="border-2 border-white text-white px-8 py-4 rounded-full font-semibold hover:bg-white hover:text-blue-600 transition-all hover:scale-105 flex items-center justify-center backdrop-blur-sm"
                >
                  Khám phá tính năng
                </a>
              </div>
            </div>
            <div className="relative">
              <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20 shadow-2xl">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/20 rounded-2xl p-6 text-center backdrop-blur-sm">
                    <Users className="h-12 w-12 text-white mx-auto mb-2" />
                    <div className="text-2xl font-bold text-white">100+</div>
                    <div className="text-white/80 text-sm">Quân nhân</div>
                  </div>
                  <div className="bg-white/20 rounded-2xl p-6 text-center backdrop-blur-sm">
                    <Trophy className="h-12 w-12 text-white mx-auto mb-2" />
                    <div className="text-2xl font-bold text-white">500+</div>
                    <div className="text-white/80 text-sm">Khen thưởng</div>
                  </div>
                  <div className="bg-white/20 rounded-2xl p-6 text-center backdrop-blur-sm">
                    <CheckCircle className="h-12 w-12 text-white mx-auto mb-2" />
                    <div className="text-2xl font-bold text-white">99%</div>
                    <div className="text-white/80 text-sm">Độ chính xác</div>
                  </div>
                  <div className="bg-white/20 rounded-2xl p-6 text-center backdrop-blur-sm">
                    <Star className="h-12 w-12 text-white mx-auto mb-2" />
                    <div className="text-2xl font-bold text-white">24/7</div>
                    <div className="text-white/80 text-sm">Hỗ trợ</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gradient-to-br from-slate-100 via-blue-100 to-indigo-100 rounded-3xl p-8 md:p-12 border-2 border-blue-200 shadow-2xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4 !text-gray-900">
                Tính năng vượt trội
              </h2>
              <p
                className="text-base md:text-lg max-w-4xl mx-auto font-semibold"
                style={{ color: 'rgb(107, 108, 110)' }}
              >
                Khám phá hệ sinh thái tính năng toàn diện, được thiết kế để tối ưu hóa hiệu quả quản
                lý khen thưởng tại Học viện Khoa học Quân sự
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  icon: Users,
                  title: 'Quản lý quân nhân',
                  description:
                    'Hệ thống lưu trữ và quản lý thông tin quân nhân toàn diện với bảo mật cao và khả năng truy xuất nhanh chóng.',
                  color: 'bg-blue-600',
                },
                {
                  icon: Trophy,
                  title: 'Quản lý khen thưởng',
                  description:
                    'Theo dõi và quản lý các danh hiệu khen thưởng, thành tích hàng năm và lịch sử khen thưởng của quân nhân.',
                  color: 'bg-emerald-600',
                },
                {
                  icon: Award,
                  title: 'Quản lý danh hiệu hàng năm',
                  description:
                    'Quản lý các danh hiệu khen thưởng hàng năm, phân loại và đánh giá thành tích một cách khoa học.',
                  color: 'bg-violet-600',
                },
                {
                  icon: FileText,
                  title: 'Quản lý đề xuất khen thưởng',
                  description:
                    'Xử lý các đề xuất khen thưởng từ cấp đơn vị, theo dõi quy trình phê duyệt và quản lý hồ sơ đề xuất.',
                  color: 'bg-amber-600',
                },
                {
                  icon: BarChart3,
                  title: 'Thống kê & báo cáo',
                  description:
                    'Tạo lập báo cáo thống kê đa chiều về tình hình khen thưởng, thành tích và phân tích dữ liệu chuyên sâu.',
                  color: 'bg-red-600',
                },
                {
                  icon: Shield,
                  title: 'Phân quyền đa cấp',
                  description:
                    'Hệ thống phân quyền linh hoạt với Super Admin, Admin, Manager và User đảm bảo an toàn thông tin.',
                  color: 'bg-indigo-600',
                },
              ].map((feature, index) => (
                <div
                  key={index}
                  className="group bg-blue-50/80 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-blue-200/50 backdrop-blur-sm"
                >
                  <div
                    className={`${feature.color} w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg`}
                  >
                    <feature.icon className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-xl font-black text-black mb-3 !text-black">
                    {feature.title}
                  </h3>
                  <p className="leading-relaxed font-bold" style={{ color: 'rgb(107, 108, 110)' }}>
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 md:p-12 border border-white/20">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-white mb-4 drop-shadow-lg">
                Hiệu quả được chứng minh
              </h2>
              <p className="text-lg md:text-xl text-white max-w-3xl mx-auto font-semibold drop-shadow-md">
                Những chỉ số thực tế khẳng định độ tin cậy và hiệu quả vượt trội của hệ thống
              </p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  number: '100+',
                  label: 'Quân nhân được quản lý',
                  icon: Users,
                },
                {
                  number: '500+',
                  label: 'Khen thưởng đã xử lý',
                  icon: Trophy,
                },
                {
                  number: '99%',
                  label: 'Độ tin cậy hệ thống',
                  icon: CheckCircle,
                },
                { number: '24/7', label: 'Hỗ trợ kỹ thuật', icon: Star },
              ].map((stat, index) => (
                <div key={index} className="text-center group">
                  <div className="bg-white/20 rounded-2xl p-6 mb-4 group-hover:bg-white/30 transition-colors">
                    <stat.icon className="h-12 w-12 text-white mx-auto mb-4" />
                    <div className="text-4xl font-bold text-white mb-2 drop-shadow-lg">
                      {stat.number}
                    </div>
                    <div className="text-white font-semibold drop-shadow-md">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        id="contact"
        className="bg-black/30 backdrop-blur-sm border-t border-white/20 py-16 px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Image src="/logo-msa.png" alt="Logo" width={32} height={32} className="h-8 w-8" />
                <span className="text-xl font-bold text-white">Học viện Khoa học Quân sự</span>
              </div>
              <p className="text-white leading-relaxed font-medium drop-shadow-sm">
                Nền tảng quản lý khen thưởng hàng đầu, cung cấp giải pháp công nghệ toàn diện cho
                Học viện Khoa học Quân sự trong kỷ nguyên chuyển đổi số.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-bold text-white mb-4 drop-shadow-sm">Điều hướng</h3>
              <div className="space-y-2">
                {[
                  {
                    label: isLoggedIn ? 'Quản lý Khen thưởng' : 'Truy cập hệ thống',
                    href: '#',
                    onClick: handleRedirect,
                  },
                  { label: 'Tính năng', href: '#features' },
                  { label: 'Về chúng tôi', href: '#about' },
                  { label: 'Liên hệ', href: '#contact' },
                ].map((link, index) => (
                  <a
                    key={index}
                    href={link.href}
                    onClick={
                      link.onClick
                        ? e => {
                            e.preventDefault();
                            link.onClick?.();
                          }
                        : undefined
                    }
                    className="block text-white hover:text-blue-300 transition-colors font-medium drop-shadow-sm"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold text-white mb-4 drop-shadow-sm">Hỗ trợ</h3>
              <div className="space-y-2 text-white font-medium drop-shadow-sm">
                <p>Email: support@hvkhqs.edu.vn</p>
                <p>Điện thoại: (+84) 12345678</p>
                <p>
                  Địa chỉ: 322E Lê Trọng Tấn, Phường Phương Liệt, Quận Thanh Xuân, Thành phố Hà Nội
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-white/20 pt-8 text-center">
            <p className="text-white/60">
              &copy; 2025 Học viện Khoa học Quân sự. Bảo lưu mọi quyền sở hữu trí tuệ.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
