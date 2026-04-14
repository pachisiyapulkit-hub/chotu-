import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface GenerationResult {
  imageUrl: string;
  text?: string;
}

export async function generateBrandImage(
  productDescription: string,
  medium: "billboard" | "newspaper" | "social post",
  aspectRatio: "1:1" | "3:4" | "4:3" | "9:16" | "16:9" = "1:1"
): Promise<GenerationResult> {
  const mediumPrompts = {
    billboard: "A high-impact outdoor billboard advertisement. The product is the central focus. The background is a clean city skyline or a simple studio setting. Professional lighting, high contrast, wide shot.",
    newspaper: "A classic black and white or slightly desaturated newspaper print advertisement. Grainy texture, bold typography, vintage or traditional layout. The product is clearly visible.",
    "social post": "A modern, vibrant social media lifestyle post (like Instagram). High-quality photography, trendy aesthetic, natural lighting. The product is integrated into a stylish, clean environment."
  };

  const prompt = `
    Product Description: ${productDescription}
    Medium: ${mediumPrompts[medium]}
    
    STRICT CONSTRAINTS:
    - DO NOT include any people or human figures in the image.
    - Maintain strict product consistency. The product should look identical to the description in every shot.
    - Focus on the product's design, texture, and branding.
    - No text or gibberish on the product unless specified in the description.
    - High-quality, professional photography style.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            text: prompt,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio,
        },
      },
    });

    if (response.candidates?.[0]?.finishReason === "SAFETY") {
      throw new Error("The image generation was blocked by safety filters. Please try a different description.");
    }

    let imageUrl = "";
    let text = "";

    if (response.candidates && response.candidates[0].content.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          const base64EncodeString = part.inlineData.data;
          imageUrl = `data:image/png;base64,${base64EncodeString}`;
        } else if (part.text) {
          text += part.text;
        }
      }
    }

    if (!imageUrl) {
      throw new Error("The model did not return an image. This might be due to a complex prompt or temporary service issue.");
    }

    return { imageUrl, text };
  } catch (error: any) {
    console.error("Error generating brand image:", error);
    
    if (error.message?.includes("quota")) {
      throw new Error("API quota exceeded. Please wait a moment before trying again.");
    }
    
    if (error.message?.includes("blocked")) {
      throw new Error("The request was blocked. Please check your product description for any sensitive content.");
    }

    if (error.message?.includes("API key")) {
      throw new Error("Invalid API key. Please check your environment configuration.");
    }

    throw error;
  }
}
