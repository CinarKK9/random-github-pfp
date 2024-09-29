# Random GitHub Profile Picture

This tool updates your GitHub profile picture every day with a random astronomy image of the day using the NASA API.

## Features

- Automatically fetches and sets a new astronomy image as your GitHub profile picture daily.
- Simple setup and usage with TypeScript.

## Getting Started

### Prerequisites

Make sure you have [Node.js](https://nodejs.org/) installed.

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/CinarKK9/random-github-pfp
   cd random-github-pfp
   ```

2. Install the dependencies:
   ```bash
   npm install
   ```

3. Rename `cookies.example.json` to `cookies.json`.

4. Rename `config.example.json` to `config.json`.

### Usage

1. **Start the project:**
   ```bash
   npm start
   ```

### Automation

For Windows:

1. Create a bat file:
   ```bat
   @echo off
   cd path\to\this-repo
   npm start
   ```

2. Startup the bat file on Windows startup:
   - Press `Win + R`.
   - Type `shell:startup`.
   - Move the bat file to the folder that opens.

For Linux:

1. Create a new cron job:
   ```bash
   crontab -e
   ```
   Add the following line to the file:
   ```bash
   @reboot sleep 60 && cd path/to/this-repo && npm start
   ```

## Contributing

Feel free to open issues or submit pull requests for enhancements and bug fixes!

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.