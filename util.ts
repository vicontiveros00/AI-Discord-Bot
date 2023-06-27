import { Configuration, OpenAIApi } from "openai";
import { config } from "dotenv";
config();

export const checkMsgContent = (msg: string, pre: string) => {
  const prefx = pre
  return msg.toLowerCase().startsWith(prefx)
};

const aiConfig = new Configuration({
  apiKey: String(process.env.OPENAI_API_KEY),
});

const openAI = new OpenAIApi(aiConfig);

export const query = async (qry: string): Promise<string> => {
  try {
    const completion = await openAI.createCompletion({
      model: "text-davinci-001",
      prompt: qry,
      max_tokens: 120,
      temperature: 0.7,
    });

    if (!completion.data.choices[0].text) {
      throw new Error("Response from Open AI is undefined");
    }
    return completion.data.choices[0].text!;
  } catch (err) {
    console.error(err);
    console.error(`OPENAI ERROR: ${err}`);
    return `(_${err}_)`;
  }
};
