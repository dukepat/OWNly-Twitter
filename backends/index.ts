import express, { Express, Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";
dotenv.config();

const app: Express = express();
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());

app.get("/", (req: Request, res: Response) => {
  res.send("Express + TypeScript Server");
});
app.get("/tweetMedia", async (req: Request, res: Response) => {
  const { id } = req.query;
  const headers = {
    Authorization: `Bearer ${process.env.TWITTER_BEARER_TOKEN}`,
  };
  try {
    const response = await axios.get(
      `https://api.twitter.com/2/tweets/${id}?expansions=author_id,attachments.media_keys&user.fields=profile_image_url,verified&tweet.fields=created_at,attachments,public_metrics,entities,source&media.fields=preview_image_url,url`,
      { headers }
    );
    console.log({ data: response.data, status: response.status });
    res.status(200).json({ data: response.data, status: response.status });
  } catch (e) {
    res.send({ message: "Something went wrong, please try again" });
  }
});
// export default app;
app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at https://localhost:${port}`);
});
