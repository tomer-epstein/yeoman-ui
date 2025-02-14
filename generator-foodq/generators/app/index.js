var Generator = require('yeoman-generator');
var chalkPipe = require('chalk-pipe');

module.exports = class extends Generator {
  constructor(args, opts) {
    super(args, opts);

    this.getPrompts = function() {
      console.log('in getPrompts()');
      return [{name:"Prompt 1"},{name: "Prompt 2"},{name: "Registration"}];
    }

    this.option('babel');
  }

  paths() {
    this.log(this.destinationRoot());
    // returns '~/projects'

    this.log(this.destinationPath('index.js'));
    // returns '~/projects/index.js'
  }

  async prompting() {
    let prompts = [
      {
        type: "confirm",
        name: "hungry",
        message: "Are you hungry?",
        store: true
      },
      {
        type: "confirm",
        name: "confirmConfirmHungry",
        message: (answers) => {
          return `You said you are ${(answers.hungry ? '': 'not ')}hungry. Is that right?`;
        },
        store: true,
        validate: (value, answers) => {
          return (value === true ? true : "It must be right");
        },
      },
      {
        when: (response) => {
          this.log(response.hungry);
          return response.hungry;
        },
        validate: (value, answers) => {
          return (value.length > 1 ? true : "Enter at least 2 characters");
        },
        type: "input",
        name: "food",
        message: "What do you want to eat",
        default: "Junk food"
      },
      {
        when: (response) => {
          this.log(response.hungry);
          return response.hungry;
        },
        type: "checkbox",
        name: "beers",
        message: "What beer would you like?",
        choices: [
          "GoldStar",
          "Polner",
          "WhineStephan",
          "Malka"
        ]
      },
      {
        type: 'input',
        name: 'fav_color',
        message: "What's your favorite napkin color",
        transformer: function(color, answers, flags) {
          const text = chalkPipe(color)(color);
          if (flags.isFinal) {
            return text + '!';
          }

          return text;
        }
      },
      {
        default: (answers) => {
          return (answers.food === "Pizza" ? "11" : "5");
        },
        validate: (value, answers) => {
          return (value > 10 ? true : "Enter a number > 10");
        },
        type: "number",
        name: "number",
        message: "How many times you have been in this resturant"
      }
    ];

    this.answers = await this.prompt(prompts);
    this.log("Food", this.answers.food);

    prompts = [
      {
        when: (response) => {
          return this.answers.confirmConfirmHungry;
        },
        type: "list",
        name: "hungerLevel",
        message: "How hungry are you?",
        default: 1,
        choices: () => [
          {name: "Very hungry"},
          {name: "A bit hungry"},
          {name: "Not hungry at all"}
        ]
      },
      {
        type: "checkbox",
        name: "dessert",
        message: "What desserts would you like?",
        validate: (answer) => {
          if (answer.length < 1) {
            return 'You must choose at least one dessert.'
          }
          return true
        },
        choices: [{
          name: "Buttery Raspberry Crumble Bars",
          value: "includeSass",
          checked: false
        }, {
          name: "Mint Oreo Cake",
          value: "includeBootstrap",
          checked: true
        }, {
          name: "Ultimate Gooey Brownies",
          value: "includeModernizr",
          checked: true
        }]
      },
      {
        type: 'list',
        name: 'enjoy',
        message: 'Did you enjoy your meal?',
        default: 'ok',
        choices: [
          { name: 'Not at all', value: 'no' },
          { name: 'It was ok', value: 'ok' },
          { name: 'Three Michelin stars', value: 'michelin' },
        ],
        validate: (answer) => {
          if (answer === 'no') {
            return "That's not a possible option."
          }
          return true
        }
      },
      {
        type: 'editor',
        name: 'comments',
        message: 'Comments.',
        validate: function(text) {
          if (!text || text.split('\n').length < 2) {
            return 'Must be at least 2 lines.';
          }
          return true;
        }
      }
    ];


    const answers = await this.prompt(prompts);
    this.answers = Object.assign({}, this.answers, answers);
    this.log("Hunger level", this.answers.hungerLevel);

    prompts = [
      {
        type: 'expand',
        message: 'Type of git repo: ',
        name: 'repotype',
        choices: [
          {
            key: 'u',
            name: 'Public',
            value: 'public'
          },
          {
            key: 'r',
            name: 'Private',
            value: 'private'
          }
        ],
        validate: (value, answers) => {
          return (value !== 'private' ? true : "private repository is not supported");
        },
      },
      {
        type: "input",
        name: "email",
        message: "What's your GitHub username",
        store: true
      },
      {
        type: "password",
        name: "password",
        message: "What's your GitHub password",
        mask: '*',
        validate: this._requireLetterAndNumber
      }
    ];


    const answers_login = await this.prompt(prompts);
    this.answers = Object.assign({}, this.answers, answers_login);
    this.log("Enail", this.answers.email);
  }

  _requireLetterAndNumber(value) {
    if (/\w/.test(value) && /\d/.test(value)) {
      return true;
    }

    return 'Password need to have at least a letter and a number';
  }

  writing() {
    this.log('in writing');
    this.fs.copyTpl(
      this.templatePath('index.html'),
      this.destinationPath('public/index.html'),
      {
        title: 'Templating with Yeoman',
        food: this.answers.food,
        hungerLevel: this.answers.hungerLevel,
        fav_color:  this.answers.fav_color
      }
    );
  }

  end() {
    this.log('in end');
  }
};
