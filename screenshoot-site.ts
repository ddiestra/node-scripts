import axios from 'axios';
import captureWebsite from 'capture-website';
import { load } from 'cheerio';
import inquirer from 'inquirer';

let links: string[] = [];

const captureLinks = async (link: string, domain: string, httpsOnly: boolean, ignorePaths: string[]) => {
  const url = `http${httpsOnly ? 's' : ''}://${domain}${link}`;
  const fileName = link.replace(/\//g, '.') || 'index';
  
  console.log(`Capturing ${url}`)

  try {
    await captureWebsite.file(url, `./capture/${fileName}.jpg`, { width: 1200, fullPage: true, type: 'jpeg' });
    const response = await axios.get(url);
    const $ = load(response.data);
    const newLinks = [];

    for(const a of $('a')) {
      const href = $(a).attr('href');

      if (!href) continue;

      let path = href.replace(/^(https?:\/\/)/, '').replace(/\/$/, '');
      path = path.split('?')[0];
      const isAbsolute = href.startsWith('http');
      const isExternal = isAbsolute && !path.startsWith(domain);

      if (isExternal) continue;
      if (isAbsolute) path = path.replace(domain, '');

      if (path.startsWith('#')) continue;
      if (path.startsWith('mailto')) continue;
      if (ignorePaths.some(ignorePath => path.startsWith(ignorePath))) continue;
      if (!path) continue;

      if (links.includes(path)) continue;
      links.push(path);
      newLinks.push(path);
    }

    for(const link of newLinks) {
      await captureLinks(link, domain, httpsOnly, ignorePaths);
    }

  } catch {
    console.log(`Error with  ${url}`);
  };
};


const screenshootSite = async () => {
  const inputs = await inquirer.prompt([
    {
      type: 'input',
      name: 'domain',
      message: 'Enter the domain',
    },
    {
      type: 'confirm',
      name: 'httpsOnly',
      message: 'Only check https links?',
      default: false,
    },
    {
      type: 'confirm',
      name: 'ignorePaths',
      message: 'Do you want to enter a path to ignore?',
      default: true,
    },
  ]);

  const ignorePaths: string[] = [];
  const ignorePathQuestions = [
    {
      type: 'input',
      name: 'path',
      message: "Enter a path to ignore (e.g. '/admin')",
    },
    {
      type: 'confirm',
      name: 'askAgain',
      message: 'Do you want to enter another path to ignore?',
      default: true,
    },
  ];

  const askForPath = async () => {
    const answers = await inquirer.prompt(ignorePathQuestions);
    ignorePaths.push(answers.path);
    if (answers.askAgain) {
      await askForPath();
    }
  };

  if (inputs.ignorePaths) {
    await askForPath();
  }

  const domain = inputs.domain.replace(/^(https?:\/\/)/, '').replace(/\/$/, '');
  await captureLinks('', domain, inputs.httpsOnly, ignorePaths);
};


export default screenshootSite; 
