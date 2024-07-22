# Study Program Planner

![Next.js](https://img.shields.io/badge/Next.js-14.2.5-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-18-blue?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.1-38B2AC?style=for-the-badge&logo=tailwind-css)

A dynamic and interactive study program planner built with Next.js, React, and TypeScript. This application helps students organize their exam preparation by providing a detailed daily schedule and an overview of upcoming exams.

## 🌟 Features

- 📅 Interactive daily study planner
- 📚 Comprehensive exam schedule
- 🔄 Dynamic schedule generation based on exam dates
- 📊 Course-specific study cards
- 🎨 Sleek UI with Tailwind CSS and custom components
- 🌓 Dark mode support
- 📱 Responsive design
- 📊 Progress tracking for overall and individual courses
- 📚 Detailed study aid for specific courses (e.g., Operations Research)

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm, yarn, or pnpm

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/ShalomObongo/StudyProgram
   cd Study-Program
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## 🖥️ Usage

The Study Program Planner offers an intuitive interface for managing your exam preparation:

1. **Daily Schedule**: Navigate through dates to view a detailed study plan for each day.
2. **Exam Overview**: See all upcoming exams with dates, times, and venues.
3. **Dynamic Planning**: The schedule automatically adjusts based on proximity to exam dates.
4. **Progress Tracking**: Monitor your overall progress and individual course progress.
5. **Dark Mode**: Toggle between light and dark modes for comfortable viewing.
6. **Study Aid**: Access detailed study materials for specific courses (currently available for Operations Research).

## 🛠️ Tech Stack

- **Framework**: Next.js 14.2.5
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Custom components (Card, Button, Accordion)
- **Icons**: Lucide React
- **Performance**: Vercel Speed Insights
- **OG Image Generation**: @vercel/og

## 📁 Project Structure

```
Study-Program/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── og/
│   │   │       └── route.tsx
│   │   ├── exam-study-aid/
│   │   │   └── page.tsx
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── CalendarView.tsx
│   │   ├── CourseCard.tsx
│   │   ├── DarkModeToggle.tsx
│   │   ├── ExamStudyAid.tsx
│   │   ├── ProgressTracker.tsx
│   │   ├── StudyProgram.tsx
│   │   └── ui/
│   │       ├── accordion.tsx
│   │       ├── button.tsx
│   │       └── card.tsx
│   ├── contexts/
│   │   └── DarkModeContext.tsx
│   └── lib/
│       └── utils.ts
├── public/
├── .eslintrc.json
├── .gitignore
├── next.config.mjs
├── package.json
├── postcss.config.mjs
├── tailwind.config.ts
└── tsconfig.json
```

## 🔧 Configuration

The project uses several configuration files:

- `next.config.mjs`: Next.js configuration
- `tailwind.config.ts`: Tailwind CSS customization
- `tsconfig.json`: TypeScript compiler options
- `postcss.config.mjs`: PostCSS plugins (for Tailwind CSS)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgements

- [Next.js](https://nextjs.org/)
- [React](https://reactjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Lucide React](https://lucide.dev/)
- [Vercel](https://vercel.com/)
- [Radix UI](https://www.radix-ui.com/)

---

Built with ❤️ by Shalom