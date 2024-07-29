import nlp from 'compromise';

export async function extractQuestions(text: string): Promise<{ question: string; difficulty: string }[]> {
  const lines = text.split('\n');
  const questions: { question: string; difficulty: string }[] = [];
  let currentQuestion = '';
  let currentDifficulty = 'Medium';
  let inQuestion = false;
  let examReferences: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (line.match(/^\d+\.\s/)) {
      if (currentQuestion) {
        questions.push({ 
          question: `${currentQuestion.trim()}${examReferences.length ? '\nExam references: ' + examReferences.join(', ') : ''}`, 
          difficulty: currentDifficulty 
        });
      }
      currentQuestion = line;
      currentDifficulty = estimateDifficulty(line);
      inQuestion = true;
      examReferences = [];
    } else if (inQuestion && line.match(/^o\s/)) {
      examReferences.push(line.substring(1).trim());
    } else if (inQuestion && line) {
      currentQuestion += ' ' + line;
    } else if (line.match(/^QUESTION \d+/i)) {
      inQuestion = true;
    } else if (line.match(/^FACULTY OF|^BACHELOR OF|^END OF SEMESTER EXAMINATION|^DATE:|^Time:/i)) {
      inQuestion = false;
    }
  }

  if (currentQuestion) {
    questions.push({ 
      question: `${currentQuestion.trim()}${examReferences.length ? '\nExam references: ' + examReferences.join(', ') : ''}`, 
      difficulty: currentDifficulty 
    });
  }

  return questions;
}

function estimateDifficulty(question: string): string {
  const complexityWords = ['explain', 'describe', 'analyze', 'evaluate', 'compare', 'contrast', 'design', 'draw', 'formally', 'convert', 'express'];
  const lowercaseQuestion = question.toLowerCase();

  if (complexityWords.some(word => lowercaseQuestion.includes(word))) {
    return 'Hard';
  } else if (lowercaseQuestion.includes('define') || lowercaseQuestion.includes('list')) {
    return 'Easy';
  } else {
    return 'Medium';
  }
}