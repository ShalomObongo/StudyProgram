import { marked } from "marked";

export async function* streamGeminiResponse(prompt: string): AsyncGenerator<string> {
  const response = await fetch('/api/gemini', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ prompt }),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch from Gemini API');
  }

  const data = await response.json();
  const text = data.text;
  
  // Split the text into chunks and yield each chunk
  const chunkSize = 10; // Adjust this value to control the streaming speed
  for (let i = 0; i < text.length; i += chunkSize) {
    yield text.slice(i, i + chunkSize);
    await new Promise(resolve => setTimeout(resolve, 10)); // Add a small delay between chunks
  }
}

export async function generateAnswer(question: string): Promise<{ answer: string; youtubeQuery: string }> {
  const prompt = `Generate a concise answer for the following question and provide a YouTube search query to help understand the topic better:

Question: ${question}

Answer:
YouTube Search Query:`;

  const response = await fetch('/api/gemini', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ prompt }),
  });

  if (!response.ok) {
    if (response.status === 429) {
      throw new Error('API limit reached');
    }
    throw new Error('Failed to generate answer');
  }

  const data = await response.json();
  const [rawAnswer, rawYoutubeQuery] = data.text.split('YouTube Search Query:');

  // Extract and format the YouTube query
  const formattedYoutubeQuery = rawYoutubeQuery
    .trim()
    .replace(/^\*\*/, '') // Remove leading asterisks
    .replace(/\*\*$/, '') // Remove trailing asterisks
    .replace(/^["']|["']$/g, '') // Remove leading/trailing quotes
    .split(/\s*(?:\.|\n)/, 1)[0] // Split at first period or newline, take first part
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .trim();

  console.log('Raw YouTube Query:', rawYoutubeQuery);
  console.log('Formatted YouTube Query:', formattedYoutubeQuery);

  return {
    answer: rawAnswer.trim(),
    youtubeQuery: formattedYoutubeQuery,
  };
}

function decodeHTMLEntities(text: string): string {
  const textarea = document.createElement('textarea');
  textarea.innerHTML = text;
  return textarea.value;
}

export async function generateQuestions(text: string, numQuestions: number = 5): Promise<string[]> {
  const prompt = `Generate ${numQuestions} questions based on the following text:\n\n${text}\n\nQuestions:`;
  const response = await fetch('/api/gemini', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ prompt }),
  });

  if (!response.ok) {
    throw new Error('Failed to generate questions');
  }

  const data = await response.json();
  const generatedText = data.text;
  
  // Extract questions from the generated text
  const questions = generatedText.split('\n').filter((line: string) => line.trim().endsWith('?'));
  
  return questions.slice(0, numQuestions);
}