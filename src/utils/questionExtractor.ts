export function extractQuestions(text: string): string[] {
  // Split the text into lines
  const lines = text.split('\n');

  // Regular expressions for different question formats
  const numberPattern = /^\d+\.\s/;
  const bulletPattern = /^[-•]\s/;

  const questions: string[] = [];
  let currentQuestion = '';

  lines.forEach((line) => {
    const trimmedLine = line.trim();
    if (numberPattern.test(trimmedLine) || bulletPattern.test(trimmedLine) || /\?$/.test(trimmedLine)) {
      if (currentQuestion) {
        questions.push(currentQuestion.trim());
      }
      currentQuestion = trimmedLine;
    } else if (trimmedLine) {
      currentQuestion += ' ' + trimmedLine;
    }
  });

  if (currentQuestion) {
    questions.push(currentQuestion.trim());
  }

  return questions;
}