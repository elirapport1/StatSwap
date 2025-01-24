import axios from 'axios';
import * as cheerio from 'cheerio';
import * as fs from 'fs';
import { openai } from './openai-config.js';

export async function scrapeStatFromStatmuse(query: string): Promise<number | null> {
  try {
    const formattedQuery = query.trim().replace(/\s+/g, '-');
    const url = `https://www.statmuse.com/nba/ask/${formattedQuery}`;    

    const { data } = await axios.get(url);
    fs.writeFileSync('scraped_data.html', data);

    const $ = cheerio.load(data);
    const resultSpan = $('span.text-pretty').first();
    console.log("resultSpan: ", resultSpan);
    // console. 

    if (!resultSpan || resultSpan.length === 0) {
      console.error('Could not find the result span.');

      return null;
    }

    const text = resultSpan.text().trim();

    // Use OpenAI to extract the correct statistic
    const prompt = `Given the query "${query}" and the following text: "${text}", what is the specific numerical statistic that answers the query? Please respond with only the number, without any additional text or explanation.`;

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
    return null;
  }
}

  


