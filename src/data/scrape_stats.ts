import axios from 'axios';
import * as cheerio from 'cheerio';
import * as fs from 'fs';
export async function scrapeStatFromStatmuse(query: string): Promise<number | null> {
  try {
    // Construct URL for the Statmuse query
    // The resulting URL is something like:
    // https://www.statmuse.com/nba/ask/how-many-fouls-has-draymond-green-had-in-his-career
    const formattedQuery = query.trim().replace(/\s+/g, '-');
    const url = `https://www.statmuse.com/nba/ask/${formattedQuery}`;    

    // Fetch the HTML page
    const { data } = await axios.get(url);
    fs.writeFileSync('scraped_data.html', data); // Write the entire HTML to a file for debugging

    const $ = cheerio.load(data);

    // Select the span that contains the statistic
    const resultSpan = $('span.text-pretty').first();
    // console.log(resultSpan.html()); // See what is inside

    if (!resultSpan || resultSpan.length === 0) {
      console.error('Could not find the result span.');
      return null;
    }

    const text = resultSpan.text().trim();
    // console.log(text)

    const numberWordsMap: { [key: string]: string } = {
        'zero': '0',
        'once': '1',
        'twice': '2'
      };
      
      const numberMatch = text.match(/(\d[\d,\.]+|zero|once|twice)/i);
      if (!numberMatch) {
        console.error('Could not extract a number from the result text.');
        return null;
      }
      
      let statString = numberMatch[1];
      if (numberWordsMap[statString.toLowerCase()]) {
        statString = numberWordsMap[statString.toLowerCase()];
      } else {
        statString = statString.replace(/,/g, ''); // Remove commas
      }
      
      return parseFloat(statString);

  } catch (error) {
    console.error('Error scraping Statmuse:', error);
    return null;
  }
}


// module.exports = {
//     scrapeStatFromStatmuse,
// };
  


