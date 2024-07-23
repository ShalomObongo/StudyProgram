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