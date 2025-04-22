import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="flex flex-col items-center justify-center">
        <h1 className="text-4xl font-bold mb-4 text-center">
          React Handsfree Demo
        </h1>
        <p className="text-center text-lg text-gray-700 dark:text-gray-300">
          A prototype for gesture and voice-controlled web interfaces
        </p>
      </div>
    </main>
  );
}
