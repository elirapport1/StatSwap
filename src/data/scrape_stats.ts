import axios from 'axios';
import * as cheerio from 'cheerio';
import * as fs from 'fs';
import { openai } from './openai-config.js';

export async function scrapeStatFromStatmuse(query: string): Promise<number | null> {
  try {
    console.log('Starting scrape for query:', query);
    const formattedQuery = query.trim().replace(/\s+/g, '-');
    const url = `https://www.statmuse.com/nba/ask/${formattedQuery}`;    
    console.log('Requesting URL:', url);

    const { data } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Cache-Control': 'max-age=0'
      },
      maxRedirects: 5,
      validateStatus: function (status) {
        return status >= 200 && status < 500; // Accept all responses to handle them manually
      }
    });

    console.log('Got response, writing to file...');
    fs.writeFileSync('src/data/scraped_data.html', data);

    // Check if we got redirected to the sign-up page
    if (data.includes('Sign up for StatMuse+') || data.includes('You&#39;ve used up all free prompts')) {
      console.error('Authentication required or daily limit reached');
      return null;
    }

    const $ = cheerio.load(data);
    // Try different selectors that might contain the answer
    const possibleSelectors = [
      'span.text-pretty',
      'div[data-answer-type="number"]',
      'div.answer-card',
      'div.answer-text',
      'div[class*="answer"]', // More generic selector
      'div[class*="result"]'  // More generic selector
    ];

    let resultText = null;
    for (const selector of possibleSelectors) {
      const element = $(selector).first();
      console.log(`Trying selector ${selector}:`, element.length ? 'found' : 'not found');
      if (element.length > 0) {
        resultText = element.text().trim();
        console.log('Found text:', resultText);
        break;
      }
    }

    if (!resultText) {
      // If no specific selectors work, try to find any text that looks like an answer
      const bodyText = $('body').text();
      console.log('Full body text:', bodyText.substring(0, 500) + '...');
      console.error('Could not find the result using any known selector.');
      return null;
    }

    // Use OpenAI to extract the correct statistic
    const prompt = `Given the query "${query}" and the following text: "${resultText}", what is the specific numerical statistic that answers the query? Please respond with only the number, without any additional text or explanation.`;

    const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that extracts specific numerical statistics from text. Always respond with just the number, no additional text.'
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0,
        max_tokens: 10
      });
    
      const response = completion.choices[0]?.message?.content?.trim();
      if (!response) {
        console.error('Could not get a valid response from OpenAI');
        return null;
      }

    // Convert response to number, removing any commas
    const cleanNumber = response.replace(/,/g, '');
    const result = parseFloat(cleanNumber);

    if (isNaN(result)) {
      console.error('Could not convert OpenAI response to a number');
      return null;
    }

    return result;

  } catch (error) {
    console.error('Error scraping Statmuse:', error);
    if (axios.isAxiosError(error)) {
      console.error('Response status:', error.response?.status);
      console.error('Response data:', error.response?.data);
    }
    return null;
  }
}

// Test the function when this file is run directly
if (import.meta.url === new URL(import.meta.url).href) {
  console.log('Running test query...');
  scrapeStatFromStatmuse('how many points did lebron james score in the 2020 season')
    .then(result => console.log('Result:', result))
    .catch(error => console.error('Error:', error));
}

  


