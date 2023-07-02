import { Configuration, OpenAIApi } from "openai";
import { config } from "dotenv";
import fs from "fs";
import { nullable, number, object, string } from "zod";
config();

let apiCallAttempts = 0;

export const checkMsgContent = (msg: string, pre: string) => {
  const prefx = pre;
  return msg.toLowerCase().startsWith(prefx);
};

const aiConfig = new Configuration({
  apiKey: String(process.env.OPENAI_API_KEY),
});

const openAI = new OpenAIApi(aiConfig);

export const query = async (qry: string): Promise<string> => {
  try {
    const prompt = await new Promise((resolve, reject) => {
      fs.readFile("./prompt.txt", "utf-8", (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
    //console.log(prompt)
    if (apiCallAttempts > 10) {
      //make this configurable
      apiCallAttempts = 0;
      throw new Error("Maximum attempts reached");
    }
    const completion = await openAI.createCompletion({
      model: "text-davinci-001",
      prompt: `${await prompt} ${qry}`,
      max_tokens: 120,
      temperature: 0.7,
    });

    if (
      !completion.data.choices[0].text ||
      completion.data.choices[0].text === "."
    ) {
      apiCallAttempts++;
      console.warn(
        `Waiting for response from Open AI: ${apiCallAttempts} attempts`
      );
      query(qry);
    }
    return completion.data.choices[0].text!;
  } catch (err) {
    console.error(`OPENAI ERROR: ${err}`);
    return `(_${err}_)`;
  }
};

export const envValidate = () => {
  const env = process.env;
  const envSchema = object({
    TOKEN: string().min(1, { message: "Token cannot be empty" }),
    OPENAI_API_KEY: string().min(1, {
      message: "Open AI API key cannot be empty",
    }),
    PREFIX: string().min(1, { message: "Prefix cannot be empty" }),
    DEFAULT_MSG: string().min(1, {
      message: "Default message cannot be empty",
    }),
    //continue validation for env file throug this function
    //this function should run first before anything else
    ACTIVITY: nullable(string()),
    EXPOSE_PORT: string().min(1, { message: 'Port cannot be empty'}).or(number().min(1, {message: "Port cannot be empty"}))
  });
  const result = envSchema.safeParse(env);
  if (!result.success) {
    throw new Error(`Env variables are not valid or missing! ${result['error']}`)
  }
};
