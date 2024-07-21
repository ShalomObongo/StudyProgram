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

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm, yarn, or pnpm

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/study-program-planner.git
   cd study-program-planner
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

## 🛠️ Tech Stack

- **Framework**: Next.js 14.2.5
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Custom components (Card, Button)
- **Icons**: Lucide React
- **Performance**: Vercel Speed Insights

## 📁 Project Structure

```
study-program-planner/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── StudyProgram.tsx
│   │   └── ui/
│   │       ├── button.tsx
│   │       └── card.tsx
│   └── lib/
│       └── utils.ts
├── public/
├── package.json
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

---

Built with ❤️ by Shalom