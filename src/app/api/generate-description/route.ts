import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const { name, category, currentDescription, rephrase, length = "standard" } = await request.json();

        if (!name || !category) {
            return NextResponse.json(
                { error: "Event name and category are required" },
                { status: 400 }
            );
        }

        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            console.error("GEMINI_API_KEY is not set in environment variables");
            return NextResponse.json(
                { error: "AI service is not configured. Please add GEMINI_API_KEY to your environment variables." },
                { status: 500 }
            );
        }

        // Map length to sentence count
        const lengthMap = {
            brief: "1-2 sentences",
            standard: "2-3 sentences",
            detailed: "3-4 sentences"
        };
        const sentenceCount = lengthMap[length as keyof typeof lengthMap] || "2-3 sentences";

        let prompt = "";

        if (rephrase && currentDescription) {
            prompt = `Rephrase and improve the following event description while keeping the same meaning and key information. Make it more engaging, professional, and compelling:

Event Name: ${name}
Category: ${category}
Current Description: ${currentDescription}

Keep it concise (${sentenceCount}). Provide only the rephrased description, nothing else.`;
        } else {
            prompt = `Generate a professional, engaging, and compelling event description for the following event:

Event Name: ${name}
Category: ${category}

Create a description that:
- Highlights what attendees will gain or experience
- Is professional yet inviting
- Is ${sentenceCount} long
- Includes relevant keywords for the ${category} category
- Avoids generic phrases

Provide only the description, nothing else.`;
        }

        // Use direct REST API call to Gemini
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    contents: [
                        {
                            parts: [
                                {
                                    text: prompt,
                                },
                            ],
                        },
                    ],
                    generationConfig: {
                        temperature: 0.7,
                        maxOutputTokens: 300,
                    },
                }),
            }
        );

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Gemini API Error:", errorData);
            throw new Error(errorData.error?.message || "Failed to generate content");
        }

        const data = await response.json();
        const description = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

        if (!description) {
            throw new Error("No description generated");
        }

        return NextResponse.json({ description });
    } catch (error: any) {
        console.error("AI Generation Error:", error);

        // More detailed error logging
        if (error?.message?.includes("API key") || error?.message?.includes("API_KEY")) {
            return NextResponse.json(
                { error: "Invalid API key. Please check your GEMINI_API_KEY in .env.local" },
                { status: 401 }
            );
        }

        if (error?.message?.includes("quota")) {
            return NextResponse.json(
                { error: "API quota exceeded. Please try again later." },
                { status: 429 }
            );
        }

        return NextResponse.json(
            { error: error?.message || "Failed to generate description" },
            { status: 500 }
        );
    }
}
