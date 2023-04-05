import inquirer from 'inquirer';
import screenshootSite from './screenshoot-site';


const main = async () => {

  const scripts = ['Screenshoot Site'];

  const anwsers = await inquirer.prompt([
    {
      type: 'list',
      name: 'script',
      message: 'What Script you want to run?',
      choices: scripts,
    }
  ]);

  if (anwsers.script === 'Screenshoot Site') {
    await screenshootSite();
  }

  switch (anwsers.script) {
    case 'Screenshoot Site':
      
      break;
  }
};

main();