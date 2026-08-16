"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { FaPhoneAlt, FaEnvelope, FaFacebook } from "react-icons/fa";

// ---------------------------------------------------------
// Component 1: ภาพสไลด์ (ImageSlider) - Infinite Seamless Loop
// ---------------------------------------------------------
function ImageSlider({ images, title }) {
  // หากมีรูปเดียว ไม่จำเป็นต้องทำ Infinite Loop
  if (!images || images.length === 0) return null;
  if (images.length === 1) {
    return (
      <div className="relative w-full md:w-1/2 aspect-video rounded-xl overflow-hidden shadow-lg">
        <Image
          src={images[0]}
          alt={title}
          fill
          className="object-cover"
          priority
        />
      </div>
    );
  }

  // สร้าง Array ใหม่ที่มีรูป Clone ปิดหัว-ท้าย: [รูปสุดท้าย, ...รูปทั้งหมด, รูปแรก]
  const extendedImages = [images[images.length - 1], ...images, images[0]];

  // ตั้งค่าเริ่มต้นอยู่ที่ Index 1 (ซึ่งก็คือรูปจริงรูปแรก)
  const [currentIndex, setCurrentIndex] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(true);

  const nextSlide = () => {
    if (currentIndex >= extendedImages.length - 1) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => prev + 1);
  };

  const prevSlide = () => {
    if (currentIndex <= 0) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => prev - 1);
  };

  // ตรวจจับเมื่อสไลด์ถึงรูปสำเนา (Clone) แล้วทำการ Reset แอบสลับกลับไปรูปจริงแบบเนียนๆ
  const handleTransitionEnd = () => {
    // ถ้าเลื่อนไปถึงรูป Clone ของภาพแรก (รูปสุดท้ายใน extendedImages)
    if (currentIndex === extendedImages.length - 1) {
      setIsTransitioning(false); // ปิด animation ชั่วคราว
      setCurrentIndex(1); // ย้ายกลับมาที่รูปแรกจริง
    }
    // ถ้าเลื่อนถอยหลังไปถึงรูป Clone ของภาพสุดท้าย (รูปแรกใน extendedImages)
    if (currentIndex === 0) {
      setIsTransitioning(false); // ปิด animation ชั่วคราว
      setCurrentIndex(extendedImages.length - 2); // ย้ายกลับมาที่รูปสุดท้ายจริง
    }
  };

  // Auto Play สไลด์อัตโนมัติทุกๆ 4 วินาที
  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide();
    }, 4000);
    return () => clearInterval(timer);
  }, [currentIndex]);

  // คำนวณ Index ของ Dots ด้านล่าง (เพื่อให้แสดงผลถูกต้องกับรูปจริง)
  const realIndex =
    currentIndex === 0
      ? images.length - 1
      : currentIndex === extendedImages.length - 1
        ? 0
        : currentIndex - 1;

  return (
    <div className="relative w-full md:w-1/2 aspect-video rounded-xl overflow-hidden shadow-lg group">
      {/* Container สำหรับสไลด์ภาพ */}
      <div
        className={`flex w-full h-full ${
          isTransitioning ? "transition-transform duration-700 ease-in-out" : ""
        }`}
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        onTransitionEnd={handleTransitionEnd}
      >
        {extendedImages.map((imgSrc, idx) => (
          <div key={idx} className="relative w-full h-full flex-shrink-0">
            <Image
              src={imgSrc}
              alt={`${title} - slide ${idx}`}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
              priority={idx === 1}
            />
          </div>
        ))}
      </div>

      {/* ปุ่มลูกศร ซ้าย-ขวา */}
      <button
        onClick={prevSlide}
        className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/70 text-white p-2 rounded-full transition-opacity opacity-0 group-hover:opacity-100 z-10"
      >
        &#10094;
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/70 text-white p-2 rounded-full transition-opacity opacity-0 group-hover:opacity-100 z-10"
      >
        &#10095;
      </button>

      {/* จุด Dots ด้านล่าง */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex space-x-2 z-10">
        {images.map((_, idx) => (
          <button
            key={idx}
            onClick={() => {
              setIsTransitioning(true);
              setCurrentIndex(idx + 1);
            }}
            className={`h-2.5 rounded-full transition-all duration-300 ${
              realIndex === idx ? "bg-white w-6" : "bg-white/50 w-2.5"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------
// Component 2: แอนิเมชัน Fade-Up เมื่อเลื่อนจอมาถึง (Scroll Animation)
// ---------------------------------------------------------
function FadeIn({ children, delay = 0 }) {
  const [isVisible, setIsVisible] = useState(false);
  const domRef = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(domRef.current);
        }
      });
    });
    if (domRef.current) observer.observe(domRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={domRef}
      className={`transition-all duration-1000 ease-out ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

// ---------------------------------------------------------
// Main Page Component
// ---------------------------------------------------------
export default function Portfolio() {
  const [activeTab, setActiveTab] = useState("computer");

  // ชุดข้อมูล Computer Projects (เปลี่ยน Path รูปเป็น /image/)
  const computerProjects = [
    {
      id: 1,
      title: "Bootstrap UI Design",
      description:
        "การพัฒนา Front-End ครั้งแรกในระดับเริ่มต้นด้วย Bootstrap และมีการใส่ลูกเล่น เช่น ภาพเลื่อน วิดีโอ ตัวเล่นเสียง เป็นต้น",
      tech: "Bootstrap, HTML, CSS",
      images: [
        "/image/MyProfile_01.jpg",
        "/image/MyProfile_02.jpg",
        "/image/MyProfile_03.jpg",
        "/image/MyProfile_04.jpg",
      ],
    },
    {
      id: 2,
      title: "MAUI Application",
      description:
        "การพัฒนา Application ด้วยโปรแกรม Visual Studio ด้วยภาษา XAML และ C#",
      tech: ".NET MAUI, XAML, C#, Visual Studio",
      images: [
        "/image/MyApp_01.jpg",
        "/image/MyApp_02.jpg",
        "/image/MyApp_03.jpg",
      ],
    },
    {
      id: 3,
      title: "SQL",
      description:
        "การทดลองเขียน SQL เพื่อทำความเข้าใจการทำงานเบื้องต้น สร้างและเรียกใช้ Database จาก MySQL",
      tech: "SQL, MySQL",
      images: [
        "/image/SQL_01.jpg",
        "/image/SQL_02.jpg",
        "/image/SQL_03.jpg",
        "/image/SQL_04.jpg",
      ],
    },
    {
      id: 4,
      title: "Python Programming",
      description:
        "การทดลองเขียน Python และทำโปรแกรมถ่ายภาพ ที่เมื่อแสดงนิ้วแต่ละนิ้วจะทำให้สามารถสร้างเอฟเฟคได้ พร้อมฟีเจอร์การแคปหน้าจอและอัดหน้าจอ",
      tech: "Python, PyCharm",
      images: [
        "/image/Python_01.jpg",
        "/image/Python_02.jpg",
        "/image/Python_03.jpg",
      ],
    },
    {
      id: 5,
      title: "Unity Game Development",
      description:
        "การพัฒนาเกมโดยใช้ Unity โดยสร้างขึ้นเป็นเกมแนว Obby ที่ผู้เล่นจะต้องบังคับตัวละครให้กระโดด ปีนป่าย และหลบหลบหลีกสิ่งกีดขวางต่างๆ เพื่อเดินทางจากจุดเริ่มต้นไปให้ถึงเส้นชัย โดยมีการใส่ฟีเจอร์ต่างๆ เช่น การเก็บกุญแจเพื่อเปิดทางไปต่อ กระสุนปืนใหญ่ที่เมื่อสัมผัสแล้วเกมโอเวอร์ การขึ้นแพลตฟอร์มเคลื่อนที่เพื่อไปอีกฝั่ง และฉากจบ",
      tech: "C#, Unity",
      images: [
        "/image/Unity_01.jpg",
        "/image/Unity_02.jpg",
        "/image/Unity_03.jpg",
        "/image/Unity_04.jpg",
        "/image/Unity_05.jpg",
      ],
    },
  ];

  // ชุดข้อมูล Creative Projects (เปลี่ยน Path รูปเป็น /image/)
  const creativeProjects = [
    {
      id: 1,
      title: "Digital Illustrations",
      description:
        "การวาดภาพด้วยโปรแกรม Clip Studio Paint มีการวาดเส้นและใช้สี โดยมีแรงบันดาลใจจากแนวญี่ปุ่นและจีน",
      tech: "Clip Studio Paint",
      images: [
        "/image/MyArt_01.jpg",
        "/image/MyArt_02.jpg",
        "/image/MyArt_03.jpg",
        "/image/MyArt_04.jpg",
      ],
    },
    {
      id: 2,
      title: "Music Production",
      description:
        "การแต่งและมิกส์ดนตรีด้วยโปรแกรม FL Studio มีพื้นฐานความเข้าใจการเขียนองค์ประกอบเสียง และเครื่องมือต่างๆ โดยมีแรงบันดาลใจจากแนวเพลงในเกมกดจังหวะ",
      tech: "FL Studio",
      images: [
        "/image/MyMusic_01.jpg",
        "/image/MyMusic_02.jpg",
        "/image/MyMusic_03.jpg",
        "/image/MyMusic_04.jpg",
      ],
    },
    {
      id: 3,
      title: "Animated Music Video",
      description:
        "การทำ Animation โดยใช้โปรแกรม Adobe After Effects ใช้ทั้งการเคลื่อนไหวของภาพ และการเล่นกล้อง 3D Layering เพื่อให้เกิดการเคลื่อนไหวที่ลื่น โดยใช้เพลงที่ชอบ มีการเขียนเนื้อเรื่อง Storyboard และวาดองค์ประกอบ Animation เอง",
      tech: "Adobe After Effects",
      images: [
        "/image/AfterEffect_01.jpg",
        "/image/AfterEffect_02.jpg",
        "/image/AfterEffect_03.jpg",
        "/image/AfterEffect_04.jpg",
      ],
    },
    {
      id: 4,
      title: "3D Blender",
      description:
        "การปั้น Object ต่างๆโดยใช้โปรแกรม Blender มีการปั้นรูปทรงเพือนำมาประกอบเป็นฉากและเมือง",
      tech: "Blender",
      images: [
        "/image/Blender_01.jpg",
        "/image/Blender_02.jpg",
        "/image/Blender_03.jpg",
      ],
    },
    {
      id: 5,
      title: "3D Maya",
      description:
        "การปั้น Character โดยใช้โปรแกรม Maya มีการเริ่มสร้างตั้งแต่หัวจนถึงเท้า และทำ Rigging ใส่กระดูกและการเคลื่อนไหว ทำให้ตัวละครมีชีวิต",
      tech: "Maya",
      images: [
        "/image/Maya_01.jpg",
        "/image/Maya_02.jpg",
        "/image/Maya_03.jpg",
        "/image/Maya_04.jpg",
      ],
    },
  ];

  const displayedProjects =
    activeTab === "computer" ? computerProjects : creativeProjects;

  return (
    <main className="min-h-screen bg-white text-slate-800 font-sans">
      {/* SECTION 1: HERO */}
      <section className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white px-4 text-center pb-20 pt-10">
        <FadeIn>
          {/* รูปโปรไฟล์วงกลม */}
          <div className="w-40 h-40 md:w-48 md:h-48 rounded-full overflow-hidden border-4 border-slate-700 shadow-2xl mx-auto mb-8 relative">
            <Image
              src="/image/MySelf_01.jpg"
              alt="My Profile Picture"
              fill
              className="object-cover"
            />
          </div>
        </FadeIn>

        <FadeIn delay={200}>
          <h1 className="text-5xl md:text-7xl font-bold mb-4 tracking-tight">
            My Portfolio
          </h1>
        </FadeIn>

        <FadeIn delay={400}>
          <p className="text-xl md:text-2xl text-blue-400 font-light tracking-widest uppercase">
            Computer & Creative
          </p>
        </FadeIn>
      </section>

      {/* SECTION 2: ABOUT ME & TABS */}
      <section className="pt-24 pb-12 px-6 md:px-20 max-w-5xl mx-auto text-center">
        <FadeIn>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-8 border-b-4 border-blue-400 inline-block pb-2">
            About Me
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed max-w-3xl mx-auto mb-16">
            สวัสดีครับ
            <br /> 
            ผมนายธีร์สุต ชูชัยวัฒนศักดิ์ ชื่อเล่นเรย์ครับ 
            <br />
            เป็นนักศึกษาปริญญาตรีปี 4 คณะเทคโนโลยีสารสนเทศ
            สาขาเทคโนโลยีมัลติมีเดีย
            <br /> 
            จากสถาบันเทคโนโลยีไทย-ญี่ปุ่น
            <br />
            <br />
            ผมเป็นคนชอบคิด วิเคราะห์ และค้นคว้าข้อมูลเกี่ยวกับเรื่องที่สนใจและทำความเข้าใจสิ่งต่าง ๆ
            <br />
            งานอดิเรกของผมคือการสร้างสรรค์งานวาดและดนตรีดิจิทัลรวมถึงมีความสนใจในการเขียนโปรแกรม
            <br />
            มีความชอบในการผสมผสานระหว่างตรรกะของการเขียนโปรแกรมและความคิดสร้างสรรค์
            <br />
            จึงสนใจพัฒนาทักษะและเพิ่มความชำนาญด้านการพัฒนาเว็บไซต์ ซอฟต์แวร์ และเกม
            <br />
            <br />
            Portfolio Website นี้พัฒนาโดยใช้ Next.js และ Tailwind CSS
            <br />
            เลื่อนชมผลงานด้านคอมพิวเตอร์และงานครีเอทีฟของผมด้านล่างได้เลยครับ
          </p>
        </FadeIn>

        {/* ปุ่มเลือกหมวดหมู่ (Tabs) */}
        <FadeIn delay={200}>
          <div className="flex flex-wrap justify-center gap-6 mt-4">
            <button
              onClick={() => setActiveTab("computer")}
              className={`px-10 py-4 rounded-full font-bold text-lg transition-all duration-300 w-48 ${
                activeTab === "computer"
                  ? "bg-slate-900 text-white shadow-xl scale-105"
                  : "bg-gray-100 text-slate-600 hover:bg-gray-200 hover:scale-105"
              }`}
            >
              Computer
            </button>
            <button
              onClick={() => setActiveTab("creative")}
              className={`px-10 py-4 rounded-full font-bold text-lg transition-all duration-300 w-48 ${
                activeTab === "creative"
                  ? "bg-blue-600 text-white shadow-xl scale-105"
                  : "bg-gray-100 text-slate-600 hover:bg-gray-200 hover:scale-105"
              }`}
            >
              Creative
            </button>
          </div>
        </FadeIn>
      </section>

      {/* SECTION 3: DYNAMIC PROJECTS */}

      <section className="py-16 px-6 md:px-20 bg-gray-50 min-h-200">
        <div className="max-w-6xl mx-auto">
          <div key={activeTab} className="space-y-24 pt-10">
            {displayedProjects.map((project, index) => (
              <FadeIn key={project.id} delay={index * 150}>
                <div
                  className={`flex flex-col ${index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"} items-center gap-12`}
                >
                  <ImageSlider images={project.images} title={project.title} />

                  <div className="w-full md:w-1/2">
                    <h3 className="text-3xl font-bold text-slate-800 mb-4">
                      {project.title}
                    </h3>
                    <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                      {project.description}
                    </p>
                    <span
                      className={`inline-block text-sm px-4 py-2 rounded-full font-medium ${
                        activeTab === "computer"
                          ? "bg-slate-200 text-slate-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {project.tech}
                    </span>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <FadeIn delay={400}>
        {/* คะแนน Toeic */}
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4 max-w-2xl">
            <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
              Language & Communication
            </h2>

            {/* Container หลัก: จัดเรียงแบบแนวตั้ง (Column) เต็มความกว้าง */}
            <div className="flex flex-col items-center gap-6 bg-gray-50 p-6 rounded-2xl border border-gray-100 shadow-sm">
              {/* ส่วนรูปภาพขยายเต็มกรอบ */}
              <div className="w-full overflow-hidden rounded-xl shadow-md border border-gray-200">
                <Image
                  src="/image/MyToeic_01.jpg"
                  alt="TOEIC Score"
                  width={800}
                  height={500}
                  className="object-cover w-full h-auto"
                />
              </div>

              {/* ส่วนคำอธิบายด้านล่าง */}
              <div className="w-full space-y-3 text-center md:text-left">
                <h3 className="text-xl font-semibold text-gray-700 text-center">
                  English Proficiency
                </h3>
                <p className="text-gray-600 leading-relaxed text-sm md:text-base text-center">
                  ผมมีคะแนนสอบ TOEIC โดยสอบเมื่อวันที่ 11 มีนาคม 2025
                  <br />
                  โดยแบ่งเป็นส่วนของ Listening 255 คะแนน และ Reading 405 คะแนน
                  <br />
                  รวมทั้งสิ้น 660 คะแนน
                  <br />
                  <br />
                  ผมมีประสบการณ์จากการสื่อสารจริงกับชาวต่างชาติทั้งบนโลกออนไลน์และในชีวิตจริง
                  <br />
                  ทำให้ผมมีความสามารถในการใช้ภาษาอังกฤษเพื่อการสื่อสาร
                  <br />
                  และค้นคว้าหาความรู้จากแหล่งข้อมูลต่างประเทศ
                </p>
              </div>
            </div>
          </div>
        </section>
      </FadeIn>

      {/* Contact */}

      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <FadeIn delay={200}>
            <h2 className="text-3xl font-bold text-gray-800 mb-8">
              Contact Me
            </h2>
          </FadeIn>

          <FadeIn delay={200}>
            <div className="flex flex-col md:flex-row justify-center items-center gap-6 md:gap-12">
              {/* เบอร์โทร */}

              <div className="flex items-center gap-3 text-gray-700 hover:text-blue-600 transition">
                <FaPhoneAlt className="text-2xl" />
                <span className="text-lg">092-259-9048</span>
              </div>

              {/* Gmail */}
              <div className="flex items-center gap-3 text-gray-700 hover:text-red-500 transition">
                <FaEnvelope className="text-2xl" />
                <span className="text-lg">
                  Theesud.Chuchaiwattanasak@gmail.com
                </span>
              </div>

              {/* Facebook */}
              <a
                href="https://www.facebook.com/theesud.chuchaiwattanasak/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-gray-700 hover:text-blue-700 transition"
              >
                <FaFacebook className="text-2xl" />
                <span className="text-lg">Theesud Chuchaiwattanasak</span>
              </a>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* SECTION 4: FOOTER */}

      <footer className="bg-black text-white py-10 text-center">
        <p className="text-sm text-gray-400">
          Portfolio Website by Theesud Chuchaiwattanasak (Ray).
          <br />
          Designed with Next.js & Tailwind CSS.
        </p>
      </footer>
    </main>
  );
}
