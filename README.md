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

3. Create `cookies.json` with the following structure:
   ```json
   {
     "user_session": "",
     "user_session_same_site": ""
   }
   ```

4. Create `config.json` with the following structure:
   ```json
   {
     "nasa_api_key": "",
     "github_username": "",
     "github_password": ""
   }
   ```

### Usage

1. **Build the TypeScript files:**
   ```bash
   npm run build
   ```

2. **Start the project:**
   ```bash
   npm start
   ```

### Important Note

After logging in for the first time, remember to rebuild the project so that the `config.json` and `cookies.json` changes are reflected in the build. 

3. If the application crashes on startup, simply run `npm start` again.

4. Sometimes, the browser may become unresponsive. A quick restart should resolve the issue.

5. Future updates will include automation scripts for improved stability, including crash handling.

## Contributing

Feel free to open issues or submit pull requests for enhancements and bug fixes!

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

With this tool, your GitHub profile will always feature stunning astronomy images! Enjoy!
