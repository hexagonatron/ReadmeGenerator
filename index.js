const inquirer = require("inquirer");
const fs = require("fs");
const chalk = require("chalk");
const fetch = require("node-fetch");
const path = require('path');


inquirer.prompt(
    [{
        name: "github_user",
        message: `What is your ${chalk.green("GitHub username")}?`,
        default: "hexagonatron",
        validate: (input) => input.trim().length > 0 ? true : "Please enter a valid github username"
    },
    {
        name: "title",
        message: `What is the ${chalk.green("title")} of your project?`
    },
    {
        name: "description",
        message: `Write a short ${chalk.green("description")} of your project:`
    },
    {
        name: "installation",
        message: `What are the ${chalk.green("installation commands")}?(press enter to skip)`,
        filter: (input) => input ? input : false
    },
    {
        name: "usage",
        message: `What are the ${chalk.green("usage instructions")} for the project? (press enter to skip)`,
        filter: (input) => input ? input : false
    },
    {
        name: "contribute",
        message: `What are the instructions to ${chalk.green("contribute")} to this project? (press enter to skip)`,
        filter: (input) => input ? input : false
    },
    {
        name: "tests",
        message: `Describe the ${chalk.green("testing")} for this project? (press enter to skip)`,
        filter: (input) => input ? input : false
    },
    {
        name: "deployed",
        type: "list",
        message: `Is your application ${chalk.green("deployed")}?`,
        choices: ["Yes, on my github.", "Yes, elsewhere on the internet.", "No."],
        filter: (input) => input === "No." ? false : input
    },
    {
        name: "deployed",
        askAnswered: true,
        message: `What is the ${chalk.green("repository name")}?`,
        when: ({ deployed }) => deployed === "Yes, on my github.",
        filter: (input, { github_user }) => `https://www.${github_user}.github.io/${input}`,
        transformer: (input, { github_user }) => `https://www.${github_user}.github.io/${input}`
    },
    {
        name: "deployed",
        askAnswered: true,
        message: `What is the ${chalk.green("URL")} of where your application is deployed?`,
        when: ({ deployed }) => deployed === "Yes, elsewhere on the internet."
    },
    {
        type: "list",
        name: "license",
        message: `Chose a ${chalk.green("licence")}`,
        default: "MIT",
        choices: [
            {
                value: "MIT"
            },
            {
                value: "GNU"
            },
            {
                value: "ISC"
            },
            {
                value: "Other"
            }

        ]
    },
    {
        name: "license",
        message: `Please type the ${chalk.green("license")} you'd like:`,
        askAnswered: true,
        when: ({ license }) => license === "Other"
    }
    ])
    .then(ans => {
        let titleMarkdwn = '';
        let contentMarkdwn = '\n\n';
        let tableOfContents = '\n\n## Table of Contents \n\n';


        //Title
        if (ans.deployed) {
            titleMarkdwn += `# [${ans.title}](${ans.deployed})`
        } else {
            titleMarkdwn += `# ${ans.title}`
        }

        const licenseURL = `https://img.shields.io/badge/Licence-${encodeURIComponent(ans.license)}-blue`;

        titleMarkdwn += `\n![License](${licenseURL})\n\n`

        //Desc
        if (ans.description) {
            titleMarkdwn += ans.description + "\n"
        }

        //Installation
        if (ans.installation) {
            tableOfContents += `* [Installation](#Installation)\n`
            contentMarkdwn += `## Installation
            
Use these commands to install this project
\`\`\`\`
${ans.installation}
\`\`\`\`

`
        }

        //Usage
        if (ans.usage) {
            tableOfContents += `* [Usage](#Usage)\n`
            contentMarkdwn += `## Usage
            
${ans.usage}
            
`
        }


        
        //Contributing
        if (ans.contribute) {
            tableOfContents += `* [Contributing](#Contributing)\n`
            contentMarkdwn += `## Contributing

${ans.contribute}

`
        }
        
        //Tests
        if (ans.tests) {
            tableOfContents += `* [Tests](#Tests)\n`
            contentMarkdwn += `## Tests

${ans.tests}

`
        }
        
        //License
        tableOfContents += `* [Licence](#Licence)\n`
        contentMarkdwn += `## Licence
            
This project is licenced under the ${ans.license} licence.
            
`
        //Author

        //Queries Github for some info
        return fetch(`https://api.github.com/users/${ans.github_user}`,
            {
                method: "GET",
                headers: {
                    "Accept": "application/vnd.github.v3+json"
                }
            })
            .then(res => {
                return res.json()
            })
            .then(json => {

                tableOfContents += `* [Author](#Author)\n`;
                contentMarkdwn += `## Author

![avatar](https://avatars2.githubusercontent.com/u/${json.id}?s=60&v=4)
[${ans.github_user}](${json.html_url})

${json.email ? `Email: ${json.email}` : ""}
`;

                const finalMarkdwn = titleMarkdwn + tableOfContents + contentMarkdwn

                return finalMarkdwn
            });
    })
    .then(finalMarkdwn => {
        //Write final markdown to file

        //If output dir doesn't exist then create it
        const dir = './output';

        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }

        fs.writeFile("./output/README.md", finalMarkdwn, (err) => {
            if (err) console.log(err);
            else console.log(`\n \nThanks for using the readme generator.\n\nYour readme has been saved in ${chalk.green(__dirname + "\\output\\README.md")}`);
        })
    })