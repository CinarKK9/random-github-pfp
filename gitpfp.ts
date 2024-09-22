import axios, { AxiosResponse } from "axios";
import { createWriteStream } from "fs";
import { resolve } from "path";
import { writeFile } from "fs";
import { Stream } from "stream";
import puppeteer, { Browser } from "puppeteer";

export default class GitPfp {
  private nasaApiKey: string;

  constructor(nasaApiKey: string) {
    this.nasaApiKey = nasaApiKey;
  }

  async getRandomPicture() {
    const metadataResponse = await axios({
      url: `https://api.nasa.gov/planetary/apod?api_key=${this.nasaApiKey}&count=1`,
      method: "GET",
    });

    const imageUrl = metadataResponse.data[0].url;

    const writer = createWriteStream(resolve(__dirname, `../images/image.jpg`));
    const imageResponse: AxiosResponse<Stream> = await axios({
      url: imageUrl,
      method: "GET",
      responseType: "stream",
    });

    imageResponse.data.pipe(writer);
    return new Promise((resolve, reject) => {
      writer.on("finish", resolve);
      writer.on("error", reject);
    });
  }
  async loginToGitHub(
    browser: Browser,
    {
      githubUsername,
      githubPassword,
      mfa,
      loginCookie,
    }: {
      githubUsername?: string;
      githubPassword?: string;
      mfa?: "github_mobile" | "no_mfa";
      loginCookie?: string;
    }
  ) {
    const page = await browser.newPage();
    await page.setViewport({
      width: 1920,
      height: 1080,
      deviceScaleFactor: 1,
    });
    if (loginCookie) {
      console.log("logging in with cookie...");
      await page.setCookie({
        name: "user_session",
        value: loginCookie,
        domain: ".github.com",
      });
      await page.goto("https://github.com");
    }
    if (githubUsername && githubPassword) {
      await page.goto("https://github.com/login");
      await page.type("#login_field", githubUsername);
      await page.type("#password", githubPassword);
      await page.click(".js-sign-in-button");

      if (mfa == "github_mobile") {
        await page.waitForSelector('a[data-test-selector="gh-mobile-link"]', {
          visible: true,
        });
        await page.click('a[data-test-selector="gh-mobile-link"]');
        await page.waitForSelector(
          'h3[data-target="sudo-credential-options.githubMobileChallengeValue"]'
        );
        const elem = await page.$(
          'h3[data-target="sudo-credential-options.githubMobileChallengeValue"]'
        );
        await page
          .evaluate((el) => el?.textContent, elem)
          .then((val) => {
            console.log(`github mobile sign in request digits: ${val?.trim()}`);
          })
          .catch((err) => {
            console.log(
              err +
                " this was either an error or the sign in request didnt require digits to approve."
            );
          });
        await page
          .waitForSelector(".logged-in")
          .then(async () => {
            console.log("successfully logged in to github. ");
            const cookies = await page.cookies();
            const sessionCookie =
              cookies.find((cookie) => cookie.name === "user_session")?.value ||
              "could not find session cookie";
            writeFile(
              resolve(__dirname, "../user_session.txt"),
              sessionCookie,
              () => {
                console.log("session cookie has been set.");
              }
            );
          })
          .catch((err) => {
            console.log(err + ": could not log in.");
          });
      }
    }
  }

  async setGitHubPfp(browser: Browser) {
    const page = await browser.newPage();
    await page.setViewport({
      width: 1920,
      height: 1080,
      deviceScaleFactor: 1,
    });
    await page.goto("https://github.com/settings/profile");
    await page.waitForSelector(".logged-in");
    await page.click(
      ".position-absolute.color-bg-default.rounded-2.color-fg-default.px-2.py-1.left-0.bottom-0.ml-2.mb-2.border"
    );
    const handle = await page.$('input[type="file"]');
    await handle?.uploadFile("./images/image.jpg");
    await page.waitForSelector('button[name="op"]');
    await page.click('button[name="op"]');
    await browser.close();
  }
}
