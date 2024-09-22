import * as cfg from "./config.json";
import GitPfp from "./gitpfp";
import puppeteer, { Browser } from "puppeteer";
import { access, constants, readFile } from "fs";

const gitPfp = new GitPfp(cfg.nasa_api_key);

gitPfp.getRandomPicture();

const main = async () => {
  const browser = await puppeteer.launch({
    headless: false,
    executablePath: cfg.chrome_executable_path,
    userDataDir: cfg.user_data_dir,
    args: ['--profile-directory=Profile 5'],
  });

  // access("./user_session.txt", constants.F_OK, async (err) => {
  //   if (err) {
  //     console.log(
  //       "session cookie not found... logging into github. the session cookie will be used after you login once."
  //     );
  //     gitPfp.loginToGitHub(browser, {
  //       githubUsername: cfg.github_username,
  //       githubPassword: cfg.github_password,
  //       mfa: "github_mobile",
  //     });
  //   } else {
  //     readFile("user_session.txt", "utf8", async (err, data) => {
  //       if (err) {
  //         console.log(err);
  //       }
  //       gitPfp.loginToGitHub(browser, { loginCookie: data });
  //     });
  //   }
  // });
  gitPfp.setGitHubPfp(browser);
};

main().catch((err) => {
  console.log(err);
});
